FROM python:3.12-slim

# Instala FFmpeg e dependências de fontes para renderização de textos e emojis
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia e instala dependências de bibliotecas
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código fonte do worker
COPY . .

# Cria diretórios temporários e de logs
RUN mkdir -p /app/temp /app/logs

# Variáveis de ambiente padrão
ENV SUPABASE_URL=""
ENV SUPABASE_SERVICE_ROLE_KEY=""
ENV WORKER_POLL_INTERVAL="5"
ENV MAX_CONCURRENT_JOBS="1"
ENV TEMP_DIR="/app/temp"
ENV FFMPEG_BIN="ffmpeg"
ENV FFPROBE_BIN="ffprobe"

CMD ["python", "worker.py"]
