-- =====================================================================
-- SIS Células IEQ Casa dos Filhos - Módulo Cadastro de Células e Membros
-- Execute no SQL Editor do Supabase, DEPOIS de supabase/schema.sql,
-- supabase/policies_auth.sql e supabase/admin_temas_reunioes.sql (usa a
-- função public.current_profile_role() criada nele).
-- =====================================================================

-- ---------------------------------------------------------------------
-- RLS: churches
-- Só precisa ser lida/criada pelo admin/senior por enquanto (é usada
-- para obter/criar a "igreja padrão" ao cadastrar uma célula).
-- ---------------------------------------------------------------------
create policy "churches_all_admin_senior"
  on churches for all
  to authenticated
  using (public.current_profile_role() in ('admin', 'senior'))
  with check (public.current_profile_role() in ('admin', 'senior'));

-- ---------------------------------------------------------------------
-- RLS: cells / members
-- admin/senior podem ler e escrever tudo.
-- ---------------------------------------------------------------------
create policy "cells_all_admin_senior"
  on cells for all
  to authenticated
  using (public.current_profile_role() in ('admin', 'senior'))
  with check (public.current_profile_role() in ('admin', 'senior'));

create policy "members_all_admin_senior"
  on members for all
  to authenticated
  using (public.current_profile_role() in ('admin', 'senior'))
  with check (public.current_profile_role() in ('admin', 'senior'));

-- ---------------------------------------------------------------------
-- Preparado para o dashboard do líder (NÃO executar ainda).
--
-- Quando o módulo do líder for construído, cada líder deve enxergar
-- (e futuramente editar) apenas a própria célula e os membros dela.
-- Descomente e rode os dois blocos abaixo nessa etapa:
--
-- create policy "cells_select_own_leader"
--   on cells for select
--   to authenticated
--   using (
--     leader_id = (
--       select id from profiles where auth_user_id = auth.uid()
--     )
--   );
--
-- create policy "members_select_own_leader"
--   on members for select
--   to authenticated
--   using (
--     cell_id in (
--       select id from cells
--       where leader_id = (
--         select id from profiles where auth_user_id = auth.uid()
--       )
--     )
--   );
-- ---------------------------------------------------------------------
