-- ============================================================
-- DUOS — migração: Modo Cupido (convites e bônus em dobro)
-- Rode isso no SQL Editor do Supabase (é incremental, não apaga nada)
-- ============================================================

alter table profiles add column if not exists referred_by uuid references profiles(id);
alter table profiles add column if not exists cupid_bonus_claimed boolean not null default false;

-- Credita o bônus em dobro pra quem indicou, na primeira vez que a pessoa
-- indicada forma uma dupla. Só paga uma vez por pessoa indicada (trava
-- por cupid_bonus_claimed) e é seguro rodar em paralelo (lock de linha).
create or replace function public.claim_cupid_bonus(p_user_id uuid)
returns void as $$
declare
  v_referrer uuid;
  v_claimed boolean;
begin
  select referred_by, cupid_bonus_claimed into v_referrer, v_claimed
  from profiles
  where id = p_user_id
  for update;

  if v_referrer is not null and not v_claimed then
    update profiles set cupid_bonus_claimed = true where id = p_user_id;
    perform public.add_vibe_points(
      v_referrer,
      40,
      'Bônus Modo Cupido: amigo indicado formou a primeira dupla'
    );
  end if;
end;
$$ language plpgsql security definer;
