-- =====================================================================
-- SIS Células IEQ Casa dos Filhos - Líder gerencia membros + Meu perfil
-- Execute no SQL Editor do Supabase, DEPOIS de supabase/schema.sql,
-- supabase/policies_auth.sql, supabase/admin_temas_reunioes.sql,
-- supabase/admin_celulas_membros.sql e supabase/lider_dashboard.sql
-- (usa as funções public.current_profile_id() e
-- public.is_approved_leader() criadas nele).
-- =====================================================================

-- ---------------------------------------------------------------------
-- members: líder aprovado pode CRIAR/ATUALIZAR membros da PRÓPRIA
-- célula (a policy de SELECT, members_select_own_leader, já existia
-- desde lider_dashboard.sql). Editar membros de outras células nunca é
-- permitido — a condição confere sempre contra a célula do próprio
-- líder logado.
-- ---------------------------------------------------------------------
create policy "members_insert_own_cell_leader"
  on members for insert
  to authenticated
  with check (
    public.is_approved_leader()
    and cell_id in (
      select id from cells where leader_id = public.current_profile_id()
    )
  );

create policy "members_update_own_cell_leader"
  on members for update
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
-- recalculate_cell_member_count: recalcula cells.member_count (membros
-- ativos e não-visitantes) para UMA célula. Como o líder só tem policy
-- de SELECT em `cells` (não pode dar UPDATE direto na própria célula),
-- essa função roda como SECURITY DEFINER e confere ela mesma se quem
-- chamou é admin/senior OU o líder daquela célula específica —
-- funciona para os dois módulos de membros (admin e líder) sem abrir
-- uma policy de UPDATE genérica em `cells` para o líder.
-- ---------------------------------------------------------------------
create or replace function public.recalculate_cell_member_count(target_cell_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (
    public.current_profile_role() in ('admin', 'senior')
    or exists (
      select 1 from cells
      where id = target_cell_id and leader_id = public.current_profile_id()
    )
  ) then
    raise exception 'not authorized';
  end if;

  update cells
  set member_count = (
    select count(*) from members
    where cell_id = target_cell_id
      and active = true
      and is_visitor = false
  )
  where id = target_cell_id;
end;
$$;

-- ---------------------------------------------------------------------
-- update_own_full_name: atualiza full_name do PRÓPRIO usuário logado.
-- Não criamos uma policy "dono do registro pode atualizar profiles",
-- porque RLS não restringe por coluna — isso deixaria qualquer usuário
-- livre para também tentar mudar o próprio role/status via API direta
-- (ex: se autopromover a admin). A função só aceita o novo nome como
-- argumento, então não há como mandar mais nada além disso.
-- ---------------------------------------------------------------------
create or replace function public.update_own_full_name(new_full_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if new_full_name is null or btrim(new_full_name) = '' then
    raise exception 'Nome não pode ser vazio';
  end if;

  update profiles
  set full_name = btrim(new_full_name)
  where auth_user_id = auth.uid();
end;
$$;
