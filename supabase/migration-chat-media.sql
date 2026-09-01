-- ============================================================
-- DUOS — migração: fotos e vídeos no chat da sala
-- Rode isso no SQL Editor do Supabase
-- ============================================================

-- Marca o tipo de cada mensagem, pra saber se renderiza como texto,
-- imagem ou vídeo.
alter table messages add column if not exists message_type text not null default 'text'
  check (message_type in ('text', 'image', 'video'));

-- Cria o bucket de armazenamento pras mídias do chat (público pra leitura,
-- já que é conteúdo de uma conversa temporária de 15 min, sem necessidade
-- de link assinado).
insert into storage.buckets (id, name, public)
values ('chat-media', 'chat-media', true)
on conflict (id) do nothing;

-- Só quem participa da sala pode enviar arquivo pra ela.
-- (os arquivos são salvos com o caminho "room_id/nome-do-arquivo")
drop policy if exists "Participantes podem enviar mídia da própria sala" on storage.objects;
create policy "Participantes podem enviar mídia da própria sala"
  on storage.objects for insert
  with check (
    bucket_id = 'chat-media'
    and exists (
      select 1 from rooms
      where rooms.id::text = (storage.foldername(name))[1]
      and (rooms.user_a = auth.uid() or rooms.user_b = auth.uid())
    )
  );

-- Bucket é público, então qualquer um com o link vê a mídia (necessário
-- pra renderizar a imagem/vídeo na tela sem precisar de token).
drop policy if exists "Mídia do chat é pública pra leitura" on storage.objects;
create policy "Mídia do chat é pública pra leitura"
  on storage.objects for select
  using (bucket_id = 'chat-media');
