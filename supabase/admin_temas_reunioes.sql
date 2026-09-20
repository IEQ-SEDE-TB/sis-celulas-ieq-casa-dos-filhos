-- =====================================================================
-- SIS Células IEQ Casa dos Filhos - Módulo Gestão de Temas e Reuniões
-- Execute no SQL Editor do Supabase, DEPOIS de supabase/schema.sql e
-- supabase/policies_auth.sql.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Função auxiliar (SECURITY DEFINER): retorna o role do usuário logado,
-- ignorando RLS. Necessária para as policies abaixo verificarem "o
-- usuário é admin/senior?" sem cair em recursão nas policies de
-- `profiles`.
-- ---------------------------------------------------------------------
create or replace function public.current_profile_role()
returns user_role
language sql
security definer
set search_path = public
stable
as $$
  select role
  from profiles
  where auth_user_id = auth.uid()
  limit 1;
$$;

-- ---------------------------------------------------------------------
-- RLS: themes / meetings
-- Por enquanto só admin/senior enxergam e gerenciam temas e reuniões
-- (o módulo do líder, que vai LER esse conteúdo, ainda não existe —
-- quando for criado, adicionamos uma policy de select mais aberta).
-- ---------------------------------------------------------------------
create policy "themes_all_admin_senior"
  on themes for all
  to authenticated
  using (public.current_profile_role() in ('admin', 'senior'))
  with check (public.current_profile_role() in ('admin', 'senior'));

create policy "meetings_all_admin_senior"
  on meetings for all
  to authenticated
  using (public.current_profile_role() in ('admin', 'senior'))
  with check (public.current_profile_role() in ('admin', 'senior'));

-- ---------------------------------------------------------------------
-- Storage: buckets para PDF da pregação e capa do vídeo.
-- Públicos para leitura (líderes baixam o PDF depois), upload restrito
-- a admin/senior.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('meeting-pdfs', 'meeting-pdfs', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('video-thumbnails', 'video-thumbnails', true)
on conflict (id) do nothing;

create policy "meeting_pdfs_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'meeting-pdfs');

create policy "meeting_pdfs_admin_senior_write"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'meeting-pdfs'
    and public.current_profile_role() in ('admin', 'senior')
  );

create policy "meeting_pdfs_admin_senior_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'meeting-pdfs'
    and public.current_profile_role() in ('admin', 'senior')
  )
  with check (
    bucket_id = 'meeting-pdfs'
    and public.current_profile_role() in ('admin', 'senior')
  );

create policy "meeting_pdfs_admin_senior_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'meeting-pdfs'
    and public.current_profile_role() in ('admin', 'senior')
  );

create policy "video_thumbnails_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'video-thumbnails');

create policy "video_thumbnails_admin_senior_write"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'video-thumbnails'
    and public.current_profile_role() in ('admin', 'senior')
  );

create policy "video_thumbnails_admin_senior_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'video-thumbnails'
    and public.current_profile_role() in ('admin', 'senior')
  )
  with check (
    bucket_id = 'video-thumbnails'
    and public.current_profile_role() in ('admin', 'senior')
  );

create policy "video_thumbnails_admin_senior_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'video-thumbnails'
    and public.current_profile_role() in ('admin', 'senior')
  );
