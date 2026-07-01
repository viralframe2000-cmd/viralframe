-- =====================================================================
-- SCRIPT DE CORREÇÃO DE POLÍTICAS DE RLS E STORAGE — VIRALFRAME STUDIO
-- =====================================================================

-- 1. GARANTIR A CRIAÇÃO DOS BUCKETS PRIVADOS DE STORAGE
-- (Nota: se já existirem, essas inserções serão ignoradas ou tratadas com segurança)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('user-uploads', 'user-uploads', false, 104857600, ARRAY['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm']), -- 100MB
  ('rendered-videos', 'rendered-videos', false, 104857600, ARRAY['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm', 'image/png', 'image/jpeg', 'text/vtt', 'text/srt']), -- 100MB
  ('user-logos', 'user-logos', false, 5242880, ARRAY['image/png', 'image/jpg', 'image/jpeg', 'image/webp']), -- 5MB
  ('exports', 'exports', false, 524288000, ARRAY['application/zip']) -- 500MB
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;


-- 2. RESETAR POLÍTICAS DE STORAGE DO STORAGE.OBJECTS PARA OS BUCKETS CITADOS
DROP POLICY IF EXISTS "Permitir leitura dos próprios arquivos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir inserção dos próprios arquivos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização dos próprios arquivos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão dos próprios arquivos" ON storage.objects;

-- Criando políticas integradas baseadas na subpasta que corresponde ao ID do usuário autenticado: {user_id}/...
CREATE POLICY "Permitir leitura dos próprios arquivos" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id IN ('user-uploads', 'rendered-videos', 'user-logos', 'exports') AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Permitir inserção dos próprios arquivos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('user-uploads', 'rendered-videos', 'user-logos', 'exports') AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Permitir atualização dos próprios arquivos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id IN ('user-uploads', 'rendered-videos', 'user-logos', 'exports') AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Permitir exclusão dos próprios arquivos" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id IN ('user-uploads', 'rendered-videos', 'user-logos', 'exports') AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );


-- 3. HABILITAR ROW LEVEL SECURITY (RLS) NAS TABELAS DO BANCO DE DADOS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phrase_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.render_jobs ENABLE ROW LEVEL SECURITY;


-- 4. CRIAR POLÍTICAS DE RLS PARA TABELAS DO PROJETO (ISOLAMENTO POR USUÁRIO)

-- Profiles (id = auth.uid())
DROP POLICY IF EXISTS "Usuários podem ver o próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar o próprio perfil" ON public.profiles;

CREATE POLICY "Usuários podem ver o próprio perfil" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "Usuários podem atualizar o próprio perfil" ON public.profiles
  FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());


-- Projects (user_id = auth.uid())
DROP POLICY IF EXISTS "Acesso total aos próprios projetos" ON public.projects;
CREATE POLICY "Acesso total aos próprios projetos" ON public.projects
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());


-- Videos (user_id = auth.uid())
DROP POLICY IF EXISTS "Acesso total aos próprios vídeos" ON public.videos;
CREATE POLICY "Acesso total aos próprios vídeos" ON public.videos
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());


-- Phrase Banks (user_id = auth.uid())
DROP POLICY IF EXISTS "Acesso total aos próprios bancos de frases" ON public.phrase_banks;
CREATE POLICY "Acesso total aos próprios bancos de frases" ON public.phrase_banks
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());


-- Phrases (user_id = auth.uid())
DROP POLICY IF EXISTS "Acesso total às próprias frases" ON public.phrases;
CREATE POLICY "Acesso total às próprias frases" ON public.phrases
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());


-- Render Jobs (user_id = auth.uid())
DROP POLICY IF EXISTS "Acesso total aos próprios render jobs" ON public.render_jobs;
CREATE POLICY "Acesso total aos próprios render jobs" ON public.render_jobs
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
