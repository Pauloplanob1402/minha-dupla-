-- ============================================================
-- DUOS — migração: chat de texto dentro da sala
-- Rode isso no SQL Editor do Supabase (é incremental, não apaga nada)
-- ============================================================

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade not null,
  user_id uuid references profiles(id) not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table messages enable row level security;

create policy "Participantes da sala veem as mensagens"
  on messages for select
  using (
    exists (
      select 1 from rooms
      where rooms.id = messages.room_id
      and (rooms.user_a = auth.uid() or rooms.user_b = auth.uid())
    )
  );

create policy "Participantes da sala podem enviar mensagens"
  on messages for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from rooms
      where rooms.id = messages.room_id
      and (rooms.user_a = auth.uid() or rooms.user_b = auth.uid())
    )
  );

-- Habilita Realtime nessa tabela (necessário pro chat ao vivo)
alter publication supabase_realtime add table messages;
