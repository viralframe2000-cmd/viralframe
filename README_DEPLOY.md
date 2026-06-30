# Guia de Deploy - ViralFrame Studio 🚀

Siga as instruções abaixo para realizar o deploy completo em produção do ViralFrame Studio.

---

## 1. Banco de Dados & Autenticação (Supabase)

### A. Criar o Projeto
1. Acesse o [Supabase Console](https://supabase.com) e crie um novo projeto.
2. Anote a **URL do projeto** e as chaves **anon/public** e **service_role** na seção *Project Settings -> API*.
3. Anote o **JWT Secret** na mesma seção.

### B. Rodar as Migrations SQL
1. Vá na aba **SQL Editor** no painel do Supabase.
2. Clique em **New Query**.
3. Copie o conteúdo completo do arquivo [supabase_schema.sql](backend/config/supabase_schema.sql) e clique em **Run**.
4. Isso criará as 9 tabelas do SaaS, os triggers automáticos de criação de perfil e as regras de segurança RLS para isolar os dados de cada usuário.

### C. Configurar o Supabase Storage (Buckets)
1. Vá na aba **Storage** no menu lateral do Supabase.
2. Crie os seguintes 4 buckets privados (deixe desmarcada a caixa "Public bucket"):
   - `user-uploads`
   - `rendered-videos`
   - `user-logos`
   - `exports`
3. Aplique as políticas de RLS de storage para que cada usuário acesse apenas seu subdiretório:
   * Vá em *Storage -> Policies*.
   * Crie uma política para o bucket `user-uploads` permitindo leitura, escrita e exclusão apenas se o caminho do objeto começar com o ID do usuário autenticado: `(auth.uid())::text = (storage.foldername(name))[1]`.
   * Faça o mesmo para `rendered-videos`, `user-logos` e `exports`.

---

## 2. Hospedagem do Frontend (Vercel)

1. Conecte o repositório da pasta `frontend/` ao seu painel da Vercel.
2. Defina as seguintes configurações de build:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Adicione as seguintes **Variáveis de Ambiente** no painel da Vercel:
   - `VITE_SUPABASE_URL`: A URL do seu projeto Supabase.
   - `VITE_SUPABASE_ANON_KEY`: A chave anônima (anon key) do seu Supabase.
   - `VITE_API_URL`: A URL da API do backend local se estiver rodando local, ou omitida em produção (uma vez que o frontend acessa diretamente o banco e storage).
4. Clique em **Deploy**.

---

## 3. Hospedagem do Render Worker (Docker)

O renderizador do FFmpeg deve rodar em um contêiner Docker externo (ex: VPS na DigitalOcean, AWS EC2, GCP Compute Engine ou similar).

1. Clone o repositório no seu servidor externo.
2. Navegue para a pasta `render-worker/`.
3. Crie o arquivo `.env` com as variáveis de produção:
   ```env
   SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-secreta
   WORKER_POLL_INTERVAL=5
   MAX_CONCURRENT_JOBS=1
   ```
4. Construa a imagem Docker:
   ```bash
   docker build -t viralframe-render-worker .
   ```
5. Inicie o contêiner em segundo plano:
   ```bash
   docker run -d \
     --name vf-worker \
     --env-file .env \
     --restart unless-stopped \
     viralframe-render-worker
   ```
6. O worker começará a monitorar a tabela `render_jobs` e fará o download, renderização e upload dos vídeos automaticamente de forma segura!
