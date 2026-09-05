-- =====================================================================
-- SIS Células IEQ Casa dos Filhos - Schema inicial
-- Execute este script no SQL Editor do Supabase (Project > SQL Editor).
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type user_role as enum ('admin', 'senior', 'leader');
create type profile_status as enum ('pending', 'approved', 'blocked');
create type meeting_record_status as enum ('done', 'pending', 'late');

-- ---------------------------------------------------------------------
-- churches: igrejas
-- ---------------------------------------------------------------------
create table if not exists churches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  state text not null
);

-- ---------------------------------------------------------------------
-- profiles: usuários do sistema (vinculados a auth.users)
-- ---------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role user_role not null default 'leader',
  status profile_status not null default 'pending',
  church_id uuid references churches (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- cells: células
-- ---------------------------------------------------------------------
create table if not exists cells (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  leader_id uuid references profiles (id) on delete set null,
  location text,
  address text,
  church_id uuid not null references churches (id) on delete cascade,
  member_count integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- members: membros da célula
-- ---------------------------------------------------------------------
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  cell_id uuid not null references cells (id) on delete cascade,
  name text not null,
  phone text,
  is_visitor boolean not null default false,
  active boolean not null default true,
  joined_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- themes: temas (trimestres/ciclos de estudo)
-- ---------------------------------------------------------------------
create table if not exists themes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_date date,
  end_date date,
  active boolean not null default true,
  created_by uuid references profiles (id) on delete set null
);

-- ---------------------------------------------------------------------
-- meetings: reuniões (conteúdo de cada encontro dentro de um tema)
-- ---------------------------------------------------------------------
create table if not exists meetings (
  id uuid primary key default gen_random_uuid(),
  theme_id uuid not null references themes (id) on delete cascade,
  meeting_number integer not null,
  pdf_url text,
  checklist jsonb not null default '[]'::jsonb,
  verses jsonb not null default '[]'::jsonb,
  dynamic_idea text,
  key_questions jsonb not null default '[]'::jsonb,
  video_url text,
  video_thumbnail_url text,
  unique (theme_id, meeting_number)
);

-- ---------------------------------------------------------------------
-- meeting_records: registro de reunião realizada por uma célula
-- ---------------------------------------------------------------------
create table if not exists meeting_records (
  id uuid primary key default gen_random_uuid(),
  cell_id uuid not null references cells (id) on delete cascade,
  meeting_id uuid not null references meetings (id) on delete cascade,
  occurred_at timestamptz,
  status meeting_record_status not null default 'pending',
  attendees_count integer not null default 0,
  visitors_count integer not null default 0,
  notes text
);

-- ---------------------------------------------------------------------
-- general_manual: manual geral fixo (um único PDF vigente)
-- ---------------------------------------------------------------------
create table if not exists general_manual (
  id uuid primary key default gen_random_uuid(),
  pdf_url text not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Índices auxiliares
-- ---------------------------------------------------------------------
create index if not exists idx_profiles_church_id on profiles (church_id);
create index if not exists idx_cells_church_id on cells (church_id);
create index if not exists idx_cells_leader_id on cells (leader_id);
create index if not exists idx_members_cell_id on members (cell_id);
create index if not exists idx_meetings_theme_id on meetings (theme_id);
create index if not exists idx_meeting_records_cell_id on meeting_records (cell_id);
create index if not exists idx_meeting_records_meeting_id on meeting_records (meeting_id);

-- ---------------------------------------------------------------------
-- Row Level Security
-- Habilitado desde já por segurança; as policies de acesso (quem pode
-- ler/escrever o quê, por role/church) serão criadas em uma etapa futura,
-- junto com a lógica de negócio.
-- ---------------------------------------------------------------------
alter table churches enable row level security;
alter table profiles enable row level security;
alter table cells enable row level security;
alter table members enable row level security;
alter table themes enable row level security;
alter table meetings enable row level security;
alter table meeting_records enable row level security;
alter table general_manual enable row level security;
