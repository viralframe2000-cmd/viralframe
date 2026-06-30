-- ====================================================================
-- VIRALFRAME STUDIO - SCHEMA DO BANCO DE DADOS & POLÍTICAS DE RLS
-- ====================================================================

-- Habilita a extensão uuid-ossp para geração de IDs automáticos
create extension if not exists "uuid-ossp";

-- 1. Tabela de Perfis de Usuário (profiles)
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    display_name text default '',
    instagram_handle text default '',
    avatar_path text,
    plan text default 'free',
    video_limit_monthly integer default 30,
    storage_limit_mb integer default 500,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Trigger para criar perfil automaticamente quando um usuário se cadastra no Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, instagram_handle, avatar_path)
  values (new.id, '', '', null);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Tabela de Projetos (projects)
create table public.projects (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    settings jsonb default '{}'::jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 3. Tabela de Vídeos da Fila (videos)
create table public.videos (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    project_id uuid references public.projects(id) on delete cascade,
    original_filename text not null,
    input_storage_path text,
    output_storage_path text,
    cover_storage_path text,
    caption_storage_path text,
    pov_text text default '',
    caption_text text default '',
    status text default 'uploaded',
    error_message text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 4. Tabela de Bancos de Frases (phrase_banks)
create table public.phrase_banks (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    name text default 'Banco de Frases',
    created_at timestamptz default now()
);

-- 5. Tabela de Frases Individuais (phrases)
create table public.phrases (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    phrase_bank_id uuid references public.phrase_banks(id) on delete cascade,
    pov_text text not null,
    caption_text text not null,
    categoria text default 'Geral',
    tom text default 'Neutro',
    ativo boolean default true,
    created_at timestamptz default now()
);

-- 6. Tabela de Jobs de Processamento em Lote (render_jobs)
create table public.render_jobs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    project_id uuid references public.projects(id) on delete cascade,
    status text default 'queued',
    total integer default 0,
    processed integer default 0,
    failed integer default 0,
    error_message text,
    started_at timestamptz,
    finished_at timestamptz,
    created_at timestamptz default now()
);

-- 7. Tabela de Consentimento de Cookies (cookie_consents)
create table public.cookie_consents (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete set null,
    anonymous_id text,
    necessary boolean default true,
    analytics boolean default false,
    marketing boolean default false,
    preferences boolean default false,
    policy_version text default '1.0',
    created_at timestamptz default now()
);

-- 8. Tabela de Aceitação dos Termos e Políticas (legal_acceptances)
create table public.legal_acceptances (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    terms_version text default '1.0',
    privacy_version text default '1.0',
    cookies_version text default '1.0',
    accepted_at timestamptz default now()
);

-- 9. Tabela de Solicitações de Privacidade e Exclusão LGPD (data_requests)
create table public.data_requests (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    type text not null, -- 'export' ou 'delete'
    status text default 'pending',
    requested_at timestamptz default now(),
    completed_at timestamptz,
    notes text
);

-- ====================================================================
-- POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- ====================================================================

-- Ativando RLS em todas as tabelas
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.videos enable row level security;
alter table public.phrase_banks enable row level security;
alter table public.phrases enable row level security;
alter table public.render_jobs enable row level security;
alter table public.cookie_consents enable row level security;
alter table public.legal_acceptances enable row level security;
alter table public.data_requests enable row level security;

-- 1. Políticas da tabela profiles
create policy "Usuários acessam seu próprio perfil" on public.profiles
  for all using (auth.uid() = id);

-- 2. Políticas da tabela projects
create policy "Usuários acessam seus próprios projetos" on public.projects
  for all using (auth.uid() = user_id);

-- 3. Políticas da tabela videos
create policy "Usuários acessam seus próprios vídeos" on public.videos
  for all using (auth.uid() = user_id);

-- 4. Políticas da tabela phrase_banks
create policy "Usuários acessam seus próprios bancos de frases" on public.phrase_banks
  for all using (auth.uid() = user_id);

-- 5. Políticas da tabela phrases
create policy "Usuários acessam suas próprias frases" on public.phrases
  for all using (auth.uid() = user_id);

-- 6. Políticas da tabela render_jobs
create policy "Usuários acessam seus próprios jobs de render" on public.render_jobs
  for all using (auth.uid() = user_id);

-- 7. Políticas da tabela cookie_consents
create policy "Permitir inserções anônimas de consentimento de cookies" on public.cookie_consents
  for insert with check (true);

create policy "Usuários veem seus próprios consentimentos de cookies" on public.cookie_consents
  for select using (auth.uid() = user_id or anonymous_id is not null);

-- 8. Políticas da tabela legal_acceptances
create policy "Usuários veem seus próprios aceites legais" on public.legal_acceptances
  for all using (auth.uid() = user_id);

-- 9. Políticas da tabela data_requests
create policy "Usuários acessam suas próprias solicitações LGPD" on public.data_requests
  for all using (auth.uid() = user_id);
