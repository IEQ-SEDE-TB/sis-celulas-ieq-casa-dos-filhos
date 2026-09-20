-- =====================================================================
-- SIS Células IEQ Casa dos Filhos - Policies para o fluxo de autenticação
-- Execute no SQL Editor do Supabase, DEPOIS de supabase/schema.sql.
--
-- RLS já está habilitado em `profiles` (ver schema.sql) e, sem nenhuma
-- policy, bloqueia todo acesso. Para o login com Google funcionar
-- (callback cria o próprio registro; middleware lê o próprio status a
-- cada request), o usuário autenticado precisa poder ler e criar
-- APENAS a própria linha em `profiles`.
--
-- Policies de administração (admin/senior verem e aprovarem outros
-- usuários, etc.) ficam para uma etapa futura, junto da lógica de
-- negócio dos dashboards.
-- =====================================================================

create policy "profiles_select_own"
  on profiles for select
  to authenticated
  using (auth_user_id = auth.uid());

create policy "profiles_insert_own"
  on profiles for insert
  to authenticated
  with check (auth_user_id = auth.uid());
