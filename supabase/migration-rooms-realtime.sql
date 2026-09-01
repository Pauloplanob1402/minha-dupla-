-- ============================================================
-- DUOS — migração: habilita Realtime na tabela rooms
-- Necessário pro RoomRedirector avisar quem postou o pedido
-- assim que alguém topa a dupla dele.
-- Rode isso no SQL Editor do Supabase.
-- ============================================================

alter publication supabase_realtime add table rooms;
