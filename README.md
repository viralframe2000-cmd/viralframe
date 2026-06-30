# ViralFrame Studio 🎥

ViralFrame Studio é um SaaS profissional de criação e edição automática de vídeos curtos em lote (para Reels, TikTok e Shorts). Ele permite que criadores automatizem seus vídeos de ofertas ou conteúdo, inserindo um layout profissional de perfil verificado, frases POV sobrepostas e legendas geradas automaticamente.

Este repositório contém a arquitetura completa do sistema dividida em:
- **`frontend/`**: Aplicação React + Vite + TypeScript preparada para deploy na Vercel, com integração direta ao Supabase.
- **`backend/`**: Servidor FastAPI leve para gerenciamento de metadados e renderização em modo de desenvolvimento local.
- **`render-worker/`**: Daemon worker externo baseado em Docker para processamento de renderizações de vídeo pesadas com FFmpeg na nuvem de forma assíncrona.

---

## 🛠️ Arquitetura de Produção e Deploy

O ViralFrame Studio foi projetado para rodar com escalabilidade multiusuário:
1. **Frontend**: Hospedado na **Vercel** com conexões ao Supabase.
2. **Banco de Dados & Auth**: Executado no **Supabase** (PostgreSQL, Row Level Security e Supabase Auth).
3. **Storage**: **Supabase Storage** gerenciando arquivos de forma privada e segura por ID de usuário.
4. **Renderização de Vídeo**: Um **Render Worker Docker** externo em uma VPS que escuta a fila de renderização no banco e executa o processamento FFmpeg pesado de forma isolada, enviando de volta os resultados ao Supabase Storage.

Para instruções completas de implantação em nuvem, consulte o [README_DEPLOY.md](README_DEPLOY.md).

---

## 💻 Instalação e Desenvolvimento Local

### 1. Requisitos do Sistema
* Python 3.10+
* Node.js v18+ e npm
* FFmpeg (Instalado localmente)

### 2. Configurando o Backend (FastAPI)
1. Navegue para a pasta `backend`:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   py -m pip install -r requirements.txt
   ```
3. Configure o `.env` local. Preencha `RENDER_MODE=local` para habilitar renderizações locais do FFmpeg e indique o caminho exato do `FFMPEG_PATH`.
4. Inicie o servidor local:
   ```bash
   py -m uvicorn main:app --reload --port 8000
   ```

### 3. Configurando o Frontend (React)
1. Navegue para a pasta `frontend`:
   ```bash
   cd frontend
   ```
2. Instale as dependências npm:
   ```bash
   npm install
   ```
3. Inicie o Vite em modo desenvolvimento:
   ```bash
   npm run dev
   ```
