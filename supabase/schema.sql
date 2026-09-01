-- ============================================================
-- DUOS — schema inicial do Supabase
-- Rode isso no SQL Editor do seu projeto Supabase (supabase.com/dashboard)
-- ============================================================

-- Extensão pra gerar UUIDs
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- PROFILES — estende auth.users com dados do app
-- ------------------------------------------------------------
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null default 'Sem nome',
  city text,
  vibe_points int not null default 0,
  streak_count int not null default 0,
  last_connection_date date,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Perfis são visíveis por todos"
  on profiles for select
  using (true);

create policy "Usuário edita apenas o próprio perfil"
  on profiles for update
  using (auth.uid() = id);

create policy "Usuário cria apenas o próprio perfil"
  on profiles for insert
  with check (auth.uid() = id);

-- Cria o profile automaticamente quando um usuário se registra
-- (inclui login anônimo do Supabase Auth)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, 'Visitante');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- INTENTIONS — os pedidos do Mural ao vivo
-- (display_name/city ficam duplicados aqui de propósito: o Realtime
-- do Supabase entrega a linha crua da tabela, sem joins, então
-- denormalizar evita uma query extra a cada novo item do mural)
-- ------------------------------------------------------------
create table if not exists intentions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  choice text not null check (choice in ('jogar', 'estudar', 'projeto')),
  message text not null,
  display_name text not null,
  city text,
  status text not null default 'open' check (status in ('open', 'matched', 'expired')),
  created_at timestamptz not null default now()
);

alter table intentions enable row level security;

create policy "Intenções abertas são visíveis por todos"
  on intentions for select
  using (true);

create policy "Usuário cria apenas suas próprias intenções"
  on intentions for insert
  with check (auth.uid() = user_id);

create policy "Usuário atualiza apenas suas próprias intenções"
  on intentions for update
  using (auth.uid() = user_id);

-- Habilita Realtime nessa tabela (necessário pro mural ao vivo)
alter publication supabase_realtime add table intentions;

-- ------------------------------------------------------------
-- ROOMS — a sala de conexão de 15 min quando alguém "topa" a dupla
-- ------------------------------------------------------------
create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  intention_id uuid references intentions(id) on delete set null,
  user_a uuid references profiles(id) not null,
  user_b uuid references profiles(id) not null,
  started_at timestamptz not null default now(),
  ends_at timestamptz not null default (now() + interval '15 minutes'),
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled'))
);

alter table rooms enable row level security;

create policy "Participantes veem suas próprias salas"
  on rooms for select
  using (auth.uid() = user_a or auth.uid() = user_b);

create policy "Qualquer usuário autenticado pode criar sala ao topar dupla"
  on rooms for insert
  with check (auth.uid() = user_a or auth.uid() = user_b);

-- ------------------------------------------------------------
-- POINTS_TRANSACTIONS — histórico de Vibe Points
-- ------------------------------------------------------------
create table if not exists points_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  amount int not null,
  reason text not null,
  created_at timestamptz not null default now()
);

alter table points_transactions enable row level security;

create policy "Usuário vê apenas suas próprias transações"
  on points_transactions for select
  using (auth.uid() = user_id);

create policy "Usuário cria apenas suas próprias transações"
  on points_transactions for insert
  with check (auth.uid() = user_id);

-- Função utilitária: credita pontos e atualiza o saldo do perfil
create or replace function public.add_vibe_points(p_user_id uuid, p_amount int, p_reason text)
returns void as $$
begin
  insert into points_transactions (user_id, amount, reason)
  values (p_user_id, p_amount, p_reason);

  update profiles
  set vibe_points = vibe_points + p_amount
  where id = p_user_id;
end;
$$ language plpgsql security definer;
