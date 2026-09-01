-- Rode isso pra resolver o erro "policy already exists"
-- (apaga a política antiga e recria do zero, sem duplicar)

drop policy if exists "Participantes podem enviar mídia da própria sala" on storage.objects;
drop policy if exists "Mídia do chat é pública pra leitura" on storage.objects;

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

create policy "Mídia do chat é pública pra leitura"
  on storage.objects for select
  using (bucket_id = 'chat-media');
