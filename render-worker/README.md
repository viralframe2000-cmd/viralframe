# ViralFrame Studio - Render Worker 🎥

Este componente é um daemon worker externo baseado em Docker e FFmpeg para processar as renderizações de vídeos de forma assíncrona, segura e escalável, sem consumir recursos da Vercel ou do servidor do frontend.

---

## 🛠️ Como Funciona
1. O usuário aciona a renderização de vídeos na interface do ViralFrame Studio.
2. O job de renderização é enfileirado na tabela `render_jobs` com status `queued`.
3. O worker busca na fila de processamento o job mais antigo pendente.
4. Baixa os vídeos originais correspondentes de forma segura do bucket privado `user-uploads` no Supabase Storage.
5. Renderiza cada vídeo individualmente aplicando a moldura, foto de perfil, selo verificado, nome exibido, @ arroba e o texto da frase POV usando FFmpeg e Pillow.
6. Envia os arquivos gerados (vídeo renderizado, imagem de capa e arquivo de legenda `.txt` para postagem) de volta para o bucket privado `rendered-videos`.
7. Atualiza os status dos registros de mídias e do job correspondente na tabela, permitindo o acompanhamento de progresso em tempo real no frontend do usuário.
8. Limpa todos os arquivos temporários locais.
9. Os logs de processamento são gravados em tempo real no arquivo `/app/logs/worker.log` e também exibidos no console do Docker.

---

## 🚀 Como Implantar no Servidor Ubuntu Server LTS

Siga estes passos para configurar e executar o worker no seu servidor SSH próprio:

### 1. Criar e Configurar Diretórios de Produção
No terminal do seu servidor Ubuntu, crie o diretório de destino sob o `/opt/` e configure as permissões para o seu usuário (ex: `kaik`):

```bash
sudo mkdir -p /opt/viralframe-studio/render-worker
sudo chown -R $USER:$USER /opt/viralframe-studio
```

### 2. Copiar os Arquivos
Envie os arquivos da pasta `render-worker/` do seu repositório local para a pasta `/opt/viralframe-studio/render-worker/` no servidor via SCP, SFTP ou Git.

### 3. Acessar a Pasta do Projeto
Acesse o diretório no servidor:

```bash
cd /opt/viralframe-studio/render-worker
```

### 4. Configurar as Variáveis de Ambiente
Crie o arquivo `.env` de produção:

```bash
cp .env.example .env
nano .env
```

Edite as credenciais do Supabase. Use obrigatoriamente a chave secreta `SUPABASE_SERVICE_ROLE_KEY` (service key) para que o contêiner possa ler e atualizar dados no banco de dados e nos buckets privados.
```env
SUPABASE_URL=https://mcijpeogqkyqleiamdmi.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-secreta
WORKER_POLL_INTERVAL=5
MAX_CONCURRENT_JOBS=1
TEMP_DIR=/app/temp
FFMPEG_BIN=ffmpeg
```

### 5. Compilar os Contêineres Docker
Compile a imagem localmente no servidor:

```bash
docker compose build
```

### 6. Executar o Worker em Segundo Plano
Inicialize o serviço com reinicialização automática configurada:

```bash
docker compose up -d
```

### 7. Monitorar logs do Worker
Você pode monitorar os logs do contêiner diretamente pelo console do Docker:

```bash
docker compose logs -f
```

Ou ler o arquivo de log persistido e rotacionado mapeado localmente no volume:

```bash
tail -f logs/worker.log
```

### 8. Parar a Execução do Contêiner
Para interromper a execução do worker com segurança:

```bash
docker compose down
```

---

## 🔒 Boas Práticas e Segurança
- **Isolamento de Dados**: Os arquivos baixados e renderizados localmente usam identificadores UUIDs exclusivos nos diretórios mapeados no volume `/app/temp/`, evitando colisão e mantendo os arquivos de usuários e projetos totalmente separados.
- **Limpeza Sistemática**: Arquivos temporários brutos e renderizados locais são deletados imediatamente após o upload de volta ao Supabase Storage.
- **Sem Portas Expostas**: O contêiner do worker não expõe nenhuma porta de rede pública ao mundo exterior (não contém mapeamento de portas), pois funciona exclusivamente puxando dados (pull) via API do Supabase e subindo resultados.
