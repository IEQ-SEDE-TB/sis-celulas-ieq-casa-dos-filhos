-- =====================================================================
-- SIS Células IEQ Casa dos Filhos - Módulo Gestão de Usuários
-- Execute no SQL Editor do Supabase, DEPOIS de supabase/schema.sql,
-- supabase/policies_auth.sql e supabase/admin_temas_reunioes.sql (usa a
-- função public.current_profile_role() criada nele).
--
-- Até aqui `profiles` só tinha as policies de policies_auth.sql
-- (cada usuário lê/cria APENAS a própria linha) — por isso o select de
-- líderes no formulário de célula não encontrava ninguém: um
-- admin/senior não tinha permissão de ler os profiles de outras
-- pessoas. As duas policies abaixo resolvem isso e habilitam a tela
-- /admin/usuarios (aprovar, bloquear, trocar role).
--
-- Um usuário comum (leader) continua só podendo ler/criar o próprio
-- perfil (policies_auth.sql) — nunca editar, e nunca ler o perfil de
-- outra pessoa.
-- =====================================================================

create policy "profiles_select_all_admin_senior"
  on profiles for select
  to authenticated
  using (public.current_profile_role() in ('admin', 'senior'));

create policy "profiles_update_admin_senior"
  on profiles for update
  to authenticated
  using (public.current_profile_role() in ('admin', 'senior'))
  with check (public.current_profile_role() in ('admin', 'senior'));
