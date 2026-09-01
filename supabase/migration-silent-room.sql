-- ============================================================
-- DUOS — migração: Sala Silenciosa (4ª opção de intenção)
-- Rode isso no SQL Editor do Supabase
-- ============================================================

alter table intentions drop constraint if exists intentions_choice_check;
alter table intentions add constraint intentions_choice_check
  check (choice in ('jogar', 'estudar', 'projeto', 'silencio'));
