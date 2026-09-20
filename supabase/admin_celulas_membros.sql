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
-- O acesso de leitura do líder à própria célula/membros (rascunhado
-- aqui como comentário) foi ativado em supabase/lider_dashboard.sql,
-- junto com o restante das policies do módulo do líder.
-- ---------------------------------------------------------------------
