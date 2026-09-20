-- =====================================================================
-- SIS Células IEQ Casa dos Filhos - Dashboard do Líder
-- Execute no SQL Editor do Supabase, DEPOIS de supabase/schema.sql,
-- supabase/policies_auth.sql, supabase/admin_temas_reunioes.sql (usa a
-- função public.current_profile_role() criada nele) e
-- supabase/admin_celulas_membros.sql.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Funções auxiliares (SECURITY DEFINER): identificam o usuário logado
-- ignorando RLS, para usar nas policies abaixo sem cair em recursão.
-- ---------------------------------------------------------------------
create or replace function public.current_profile_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id
  from profiles
  where auth_user_id = auth.uid()
  limit 1;
$$;

create or replace function public.is_approved_leader()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from profiles
    where auth_user_id = auth.uid()
      and role = 'leader'
      and status = 'approved'
  );
$$;

-- ---------------------------------------------------------------------
-- cells / members: líder só LÊ a própria célula e os próprios membros
-- (editar continua sendo só admin/senior, por enquanto).
-- ---------------------------------------------------------------------
create policy "cells_select_own_leader"
  on cells for select
  to authenticated
  using (
    public.is_approved_leader()
    and leader_id = public.current_profile_id()
  );

create policy "members_select_own_leader"
  on members for select
  to authenticated
  using (
    public.is_approved_leader()
    and cell_id in (
      select id from cells where leader_id = public.current_profile_id()
    )
  );

-- ---------------------------------------------------------------------
-- themes / meetings: líder pode LER temas ativos e as reuniões deles
-- (para consumir o conteúdo). Igual ao módulo admin, não pode escrever.
-- ---------------------------------------------------------------------
create policy "themes_select_active_leader"
  on themes for select
  to authenticated
  using (
    public.is_approved_leader()
    and active = true
  );

create policy "meetings_select_active_theme_leader"
  on meetings for select
  to authenticated
  using (
    public.is_approved_leader()
    and exists (
      select 1 from themes
      where themes.id = meetings.theme_id and themes.active = true
    )
  );

-- ---------------------------------------------------------------------
-- meeting_records: cada reunião realizada por uma célula. admin/senior
-- têm acesso completo (essa tabela ainda não tinha nenhuma policy);
-- líder só pode ler/criar/atualizar os registros da PRÓPRIA célula.
-- ---------------------------------------------------------------------
create policy "meeting_records_all_admin_senior"
  on meeting_records for all
  to authenticated
  using (public.current_profile_role() in ('admin', 'senior'))
  with check (public.current_profile_role() in ('admin', 'senior'));

create policy "meeting_records_select_own_cell_leader"
  on meeting_records for select
  to authenticated
  using (
    public.is_approved_leader()
    and cell_id in (
      select id from cells where leader_id = public.current_profile_id()
    )
  );

create policy "meeting_records_insert_own_cell_leader"
  on meeting_records for insert
  to authenticated
  with check (
    public.is_approved_leader()
    and cell_id in (
      select id from cells where leader_id = public.current_profile_id()
    )
  );

create policy "meeting_records_update_own_cell_leader"
  on meeting_records for update
  to authenticated
  using (
    public.is_approved_leader()
    and cell_id in (
      select id from cells where leader_id = public.current_profile_id()
    )
  )
  with check (
    public.is_approved_leader()
    and cell_id in (
      select id from cells where leader_id = public.current_profile_id()
    )
  );

-- ---------------------------------------------------------------------
-- Garante no máximo um meeting_record por célula+reunião, para o
-- "criar ou atualizar" da tela do líder poder usar upsert.
-- ---------------------------------------------------------------------
alter table meeting_records
  add constraint meeting_records_cell_meeting_unique unique (cell_id, meeting_id);
