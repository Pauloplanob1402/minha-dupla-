-- ============================================================
-- DUOS — migração: denúncia e bloqueio de usuários
-- Rode isso no SQL Editor do Supabase
-- ============================================================

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references profiles(id) not null,
  reported_id uuid references profiles(id) not null,
  room_id uuid references rooms(id) on delete set null,
  reason text not null,
  created_at timestamptz not null default now()
);

alter table reports enable row level security;

create policy "Usuário só cria denúncia em seu próprio nome"
  on reports for insert
  with check (auth.uid() = reporter_id);

create policy "Usuário só vê as denúncias que ele mesmo fez"
  on reports for select
  using (auth.uid() = reporter_id);

create table if not exists blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid references profiles(id) not null,
  blocked_id uuid references profiles(id) not null,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id)
);

alter table blocks enable row level security;

create policy "Usuário só bloqueia em seu próprio nome"
  on blocks for insert
  with check (auth.uid() = blocker_id);

create policy "Usuário só vê sua própria lista de bloqueios"
  on blocks for select
  using (auth.uid() = blocker_id);

create policy "Usuário pode desfazer seus próprios bloqueios"
  on blocks for delete
  using (auth.uid() = blocker_id);
