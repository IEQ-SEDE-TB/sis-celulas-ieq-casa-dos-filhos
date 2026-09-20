-- =====================================================================
-- SIS Células IEQ Casa dos Filhos - Líder cadastra a própria célula
-- Execute no SQL Editor do Supabase, DEPOIS de supabase/schema.sql,
-- supabase/policies_auth.sql, supabase/admin_temas_reunioes.sql,
-- supabase/admin_celulas_membros.sql e supabase/lider_dashboard.sql
-- (usa as funções public.current_profile_id() e
-- public.is_approved_leader() criadas nele).
-- =====================================================================

-- ---------------------------------------------------------------------
-- churches: até aqui só admin/senior liam essa tabela
-- (churches_all_admin_senior, em admin_celulas_membros.sql). O
-- cadastro de célula pelo líder usa getDefaultChurchId(), que precisa
-- LER a igreja padrão — sem esta policy a leitura vinha vazia (RLS
-- bloqueando) e a função tentava criar uma igreja duplicada, o que
-- também falharia por falta de policy de insert para o líder.
-- Leitura é liberada para qualquer usuário aprovado (não é dado
-- sensível); criar/editar igreja continua exclusivo de admin/senior.
-- ---------------------------------------------------------------------
create policy "churches_select_approved"
  on churches for select
  to authenticated
  using (
    exists (
      select 1 from profiles
      where auth_user_id = auth.uid() and status = 'approved'
    )
  );

-- ---------------------------------------------------------------------
-- cells: líder aprovado pode CRIAR a própria célula (leader_id = ele
-- mesmo), uma única vez — o "not exists" barra uma segunda célula para
-- o mesmo líder mesmo que a Server Action seja contornada. Editar
-- continua exclusivo de admin/senior (cells_all_admin_senior).
-- ---------------------------------------------------------------------
create policy "cells_insert_own_leader"
  on cells for insert
  to authenticated
  with check (
    public.is_approved_leader()
    and leader_id = public.current_profile_id()
    and not exists (
      select 1 from cells where leader_id = public.current_profile_id()
    )
  );
