import time
import os
import sys
import logging
import re
import zipfile
import shutil
from logging.handlers import RotatingFileHandler
from dotenv import load_dotenv

# Carrega configurações do .env antes de qualquer import local
load_dotenv()

import utils
from supabase_client import supabase_client
import renderer

# Configuração de Logs em arquivo e console
LOG_DIR = os.getenv("LOG_DIR", "/app/logs")
os.makedirs(LOG_DIR, exist_ok=True)
log_file = os.path.join(LOG_DIR, "worker.log")

logger = logging.getLogger("viralframe-worker")
logger.setLevel(logging.INFO)

# Handler de arquivo rotativo (10MB, max 5 backups)
file_handler = RotatingFileHandler(log_file, maxBytes=10 * 1024 * 1024, backupCount=5, encoding="utf-8")
file_handler.setFormatter(logging.Formatter("[%(asctime)s] [%(levelname)s] %(message)s"))
logger.addHandler(file_handler)

# Handler de console para docker compose logs
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(logging.Formatter("[%(asctime)s] [%(levelname)s] %(message)s"))
logger.addHandler(console_handler)

POLL_INTERVAL = int(os.getenv("WORKER_POLL_INTERVAL", "5"))

def sanitize_filename(name: str) -> str:
    """Sanitiza o nome do arquivo para torná-lo seguro para sistemas de arquivos."""
    # Remove caracteres inválidos como: \ / : * ? " < > |
    clean_name = re.sub(r'[\\/*?:"<>|]', '', name)
    return clean_name.strip() or "video"

def process_job(job):
    job_id = job["id"]
    user_id = job["user_id"]
    project_id = job.get("project_id")
    
    logger.info(f"🔍 Render Job encontrado: {job_id} do usuário {user_id}. Iniciando processamento...")
    
    # Atualiza status do job para processing com timestamp ISO 8601
    try:
        supabase_client.table("render_jobs").update({
            "status": "processing",
            "started_at": utils.get_iso_now()
        }).eq("id", job_id).execute()
        logger.info(f"🚀 Job {job_id} marcado como 'processing' no banco.")
    except Exception as e:
        logger.error(f"Erro ao atualizar status do job {job_id} para processing: {e}")
    
    # Busca vídeos associados a este job de renderização específico usando render_job_id
    try:
        logger.info(f"Buscando vídeos associados ao Job {job_id}...")
        query = supabase_client.table("videos").select("*").eq("render_job_id", job_id)
        if project_id:
            query = query.eq("project_id", project_id)
            
        videos = query.execute().data
    except Exception as e:
        logger.error(f"Erro ao buscar vídeos da fila para o usuário {user_id}: {e}")
        videos = []
    
    total = len(videos)
    processed = 0
    failed = 0
    
    # Atualiza total de vídeos no job
    try:
        supabase_client.table("render_jobs").update({"total": total}).eq("id", job_id).execute()
    except Exception as e:
        logger.error(f"Erro ao atualizar total de vídeos do job {job_id}: {e}")
    
    if total == 0:
        logger.info(f"Nenhum vídeo associado encontrado para o Job {job_id}.")
        try:
            supabase_client.table("render_jobs").update({
                "status": "completed",
                "finished_at": utils.get_iso_now()
            }).eq("id", job_id).execute()
            logger.info(f"Job {job_id} finalizado sem vídeos.")
        except Exception as e:
            logger.error(f"Erro ao marcar job sem vídeos como concluído: {e}")
        return

    # Carrega dados do perfil do usuário para o cabeçalho
    try:
        profile_res = supabase_client.table("profiles").select("*").eq("id", user_id).execute()
        profile = profile_res.data[0] if profile_res.data else {}
    except Exception as e:
        logger.error(f"Falha ao carregar perfil do usuário {user_id}: {e}")
        profile = {}
    
    display_name = profile.get("display_name", "")
    handle = profile.get("instagram_handle", "")
    is_verified = profile.get("verified", True)
    
    # Baixa a logo do usuário se existir
    logo_path = None
    if profile.get("avatar_path"):
        logo_path = utils.get_temp_path(f"logo_{user_id}.png")
        logger.info(f"Baixando logo de perfil {profile['avatar_path']}...")
        try:
            res_logo = supabase_client.storage.from_("user-logos").download(profile["avatar_path"])
            with open(logo_path, "wb") as f:
                f.write(res_logo)
            logger.info("Logo de perfil baixada com sucesso.")
        except Exception as e:
            logger.error(f"Erro ao baixar logo {profile['avatar_path']} do Storage: {e}")
            logo_path = None

    for video in videos:
        video_id = video["id"]
        # Atualiza status do vídeo para processing
        try:
            supabase_client.table("videos").update({"status": "processing"}).eq("id", video_id).execute()
            logger.info(f"Vídeo {video_id} alterado para status 'processing'.")
        except Exception as e:
            logger.error(f"Erro ao atualizar status do vídeo {video_id} para processing: {e}")
        
        # Cria caminhos locais temporários seguros dentro da pasta TEMP_DIR
        local_input = utils.get_temp_path(f"{video_id}_input.mp4")
        local_output = utils.get_temp_path(f"{video_id}_output.mp4")
        local_cover = utils.get_temp_path(f"{video_id}_cover.jpg")
        local_caption = utils.get_temp_path(f"{video_id}_caption.txt")
        
        try:
            # 1. Baixa o vídeo original do Supabase Storage (bucket user-uploads)
            input_path = video["input_storage_path"]
            logger.info(f"📥 Baixando vídeo original do storage: {input_path}")
            res_video = supabase_client.storage.from_("user-uploads").download(input_path)
            with open(local_input, "wb") as f:
                f.write(res_video)
            logger.info(f"Download do input de {video_id} concluído.")
                
            # 2. Renderiza com FFmpeg
            logger.info(f"🎬 Iniciando execução do FFmpeg para {video_id}...")
            renderer.process_video(
                input_video_path=local_input,
                output_video_path=local_output,
                output_cover_path=local_cover,
                pov_text=video.get("pov_text", ""),
                logo_path=logo_path,
                display_name=display_name,
                handle=handle,
                is_verified=is_verified
            )
            logger.info(f"Execução do FFmpeg finalizada com sucesso para {video_id}.")
            
            # 3. Cria arquivo de legenda temporário
            with open(local_caption, "w", encoding="utf-8") as f:
                f.write(video.get("caption_text", "") or "")
                
            # 4. Sobe os arquivos resultantes para o bucket rendered-videos
            user_proj_path = f"{user_id}/{project_id or 'default'}/{video_id}"
            out_video_path = f"{user_proj_path}/reel.mp4"
            out_cover_path = f"{user_proj_path}/cover.jpg"
            out_caption_path = f"{user_proj_path}/caption.txt"
            
            logger.info(f"📤 Enviando arquivos renderizados de {video_id} ao Supabase Storage...")
            # Faz upload/update dos arquivos gerados no Storage
            for remote_p, local_p, content_type in [
                (out_video_path, local_output, "video/mp4"),
                (out_cover_path, local_cover, "image/jpeg"),
                (out_caption_path, local_caption, "text/plain")
            ]:
                try:
                    supabase_client.storage.from_("rendered-videos").upload(remote_p, local_p, {"content-type": content_type})
                except Exception:
                    supabase_client.storage.from_("rendered-videos").update(remote_p, local_p, {"content-type": content_type})
            logger.info(f"Upload dos arquivos físicos de {video_id} finalizado.")
                
            # 5. Atualiza registro do vídeo para rendered (padronizado)
            supabase_client.table("videos").update({
                "status": "rendered",
                "output_storage_path": out_video_path,
                "cover_storage_path": out_cover_path,
                "caption_storage_path": out_caption_path,
                "error_message": None
            }).eq("id", video_id).execute()
            
            processed += 1
            logger.info(f"✅ Vídeo {video_id} processado com sucesso. Status alterado para 'rendered'.")
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Erro ao processar vídeo {video_id}: {error_msg}")
            try:
                supabase_client.table("videos").update({
                    "status": "failed",
                    "error_message": error_msg
                }).eq("id", video_id).execute()
                logger.info(f"Status do vídeo {video_id} alterado para 'failed'.")
            except Exception as se:
                logger.error(f"Erro ao atualizar status de falha no vídeo {video_id}: {se}")
            failed += 1
            
        finally:
            # Limpa os temporários locais deste vídeo imediatamente
            for temp_f in [local_input, local_output, local_cover, local_caption]:
                utils.clean_temp_file(temp_f)
                    
        # Atualiza progresso parcial do job no banco
        try:
            supabase_client.table("render_jobs").update({
                "processed": processed,
                "failed": failed
            }).eq("id", job_id).execute()
        except Exception as e:
            logger.error(f"Erro ao atualizar progresso parcial do job {job_id}: {e}")
        
    # Finaliza o status do job
    if failed == 0:
        final_status = "completed"
    elif processed > 0:
        final_status = "partial"
    else:
        final_status = "failed"
        
    try:
        supabase_client.table("render_jobs").update({
            "status": final_status,
            "finished_at": utils.get_iso_now(),
            "error_message": f"{failed} de {total} vídeos falharam no processamento." if failed > 0 else None
        }).eq("id", job_id).execute()
        logger.info(f"🏁 Render Job {job_id} marcado como '{final_status}' no banco.")
    except Exception as e:
        logger.error(f"Erro ao atualizar finalização do job {job_id}: {e}")
    
    # Remove a logo temporária
    utils.clean_temp_file(logo_path)
    logger.info(f"🏁 Processamento do Render Job {job_id} finalizado. (Sucessos: {processed}, Falhas: {failed})")

def process_export_job(job):
    job_id = job["id"]
    user_id = job["user_id"]
    project_id = job.get("project_id")
    
    logger.info(f"📦 Export Job encontrado: {job_id} do usuário {user_id}. Iniciando geração de ZIP...")
    
    # 1. Atualiza status para processing
    try:
        supabase_client.table("export_jobs").update({
            "status": "processing",
            "started_at": utils.get_iso_now()
        }).eq("id", job_id).execute()
        logger.info(f"🚀 Export Job {job_id} marcado como 'processing' no banco.")
    except Exception as e:
        logger.error(f"Erro ao atualizar status do export_job {job_id} para processing: {e}")
        
    # 2. Busca vídeos com status 'rendered' e output_storage_path preenchido
    try:
        query = supabase_client.table("videos").select("*").eq("user_id", user_id).eq("status", "rendered").not_('output_storage_path', 'is', null)
        if project_id:
            query = query.eq("project_id", project_id)
        videos = query.execute().data
    except Exception as e:
        logger.error(f"Erro ao buscar vídeos renderizados para exportar: {e}")
        videos = []
        
    total = len(videos)
    # Atualiza o total de vídeos a serem exportados no job
    try:
        supabase_client.table("export_jobs").update({"total": total}).eq("id", job_id).execute()
    except Exception as e:
        logger.error(f"Erro ao atualizar total de export_job {job_id}: {e}")
        
    if total == 0:
        logger.info(f"Nenhum vídeo renderizado para exportar no Job {job_id}.")
        try:
            supabase_client.table("export_jobs").update({
                "status": "failed",
                "finished_at": utils.get_iso_now(),
                "error_message": "Nenhum vídeo renderizado encontrado para exportação."
            }).eq("id", job_id).execute()
            logger.info(f"Export Job {job_id} finalizado com status 'failed' por falta de vídeos.")
        except Exception as e:
            logger.error(f"Erro ao concluir export_job vazio {job_id}: {e}")
        return
        
    # 3. Cria diretório temporário para os arquivos deste export
    export_dir = utils.get_temp_path(f"export_{job_id}")
    os.makedirs(export_dir, exist_ok=True)
    zip_filename = f"viralframe_videos_{job_id}.zip"
    local_zip_path = utils.get_temp_path(zip_filename)
    
    processed = 0
    failed = 0
    
    try:
        with zipfile.ZipFile(local_zip_path, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for idx, video in enumerate(videos, 1):
                video_id = video["id"]
                orig_name = video["original_filename"] or f"video_{video_id}.mp4"
                
                # Remove extensão do nome original e sanitiza
                root, _ = os.path.splitext(orig_name)
                clean_base = sanitize_filename(root)
                
                # Nomes amigáveis e seguros dentro do ZIP (Regra 4)
                friendly_idx = f"{idx:03d}"
                friendly_video_name = f"{friendly_idx} - {clean_base}.mp4"
                friendly_caption_name = f"{friendly_idx} - {clean_base}-legenda.txt"
                
                # Baixa o vídeo renderizado de forma resiliente (Regra 5)
                local_video = os.path.join(export_dir, f"{video_id}_render.mp4")
                try:
                    logger.info(f"📥 Baixando vídeo renderizado {video['output_storage_path']} para o ZIP...")
                    res_video = supabase_client.storage.from_("rendered-videos").download(video["output_storage_path"])
                    with open(local_video, "wb") as f:
                        f.write(res_video)
                    
                    zip_file.write(local_video, friendly_video_name)
                    processed += 1
                except Exception as e:
                    # Falha de download de um arquivo físico individual: marca falha parcial e continua
                    logger.error(f"Erro ao incluir vídeo {video_id} no ZIP (pulando arquivo): {e}")
                    failed += 1
                    continue
                    
                # Baixa e adiciona legenda ao ZIP se existir de forma resiliente
                if video.get("caption_storage_path"):
                    local_caption = os.path.join(export_dir, f"{video_id}_caption.txt")
                    try:
                        res_caption = supabase_client.storage.from_("rendered-videos").download(video["caption_storage_path"])
                        with open(local_caption, "wb") as f:
                            f.write(res_caption)
                        
                        zip_file.write(local_caption, friendly_caption_name)
                    except Exception as e:
                        logger.error(f"Erro ao baixar legenda para {video_id} (pulando legenda): {e}")
                        
        # 4. Envia o arquivo ZIP para o bucket 'exports' no Supabase Storage
        remote_zip_path = f"{user_id}/{job_id}/viralframe-videos.zip"
        logger.info(f"Enviando arquivo ZIP {remote_zip_path} ao bucket 'exports'...")
        
        try:
            supabase_client.storage.from_("exports").upload(remote_zip_path, local_zip_path, {"content-type": "application/zip"})
        except Exception:
            supabase_client.storage.from_("exports").update(remote_zip_path, local_zip_path, {"content-type": "application/zip"})
            
        # 5. Atualiza o status do job
        if failed == 0:
            final_status = "completed"
        elif processed > 0:
            final_status = "partial"
        else:
            final_status = "failed"
            
        supabase_client.table("export_jobs").update({
            "status": final_status,
            "export_storage_path": remote_zip_path,
            "processed": processed,
            "failed": failed,
            "finished_at": utils.get_iso_now(),
            "error_message": f"{failed} de {total} downloads falharam." if failed > 0 else None
        }).eq("id", job_id).execute()
        
        logger.info(f"🏁 Export Job {job_id} finalizado com status '{final_status}'. (Processados: {processed}, Falhas: {failed})")
        
    except Exception as e:
        logger.error(f"Erro ao processar export_job {job_id}: {e}")
        try:
            supabase_client.table("export_jobs").update({
                "status": "failed",
                "error_message": str(e),
                "finished_at": utils.get_iso_now()
            }).eq("id", job_id).execute()
        except Exception as se:
            logger.error(f"Erro ao salvar falha no export_job {job_id}: {se}")
            
    finally:
        # Limpeza segura do ZIP local e da pasta temporária do export
        utils.clean_temp_file(local_zip_path)
        if os.path.exists(export_dir):
            shutil.rmtree(export_dir, ignore_errors=True)

def start_worker():
    logger.info("ViralFrame Studio Render Worker - Inicializando...")
    
    # 1. Valida chaves do Supabase
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not supabase_key:
        logger.error("Variáveis SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY ausentes ou vazias. Configure o arquivo .env do servidor.")
        sys.exit(1)

    # Exibe apenas status de presença da chave — nunca imprime nenhum trecho da chave real
    key_status = "configurada" if supabase_key else "ausente"
    logger.info(f"SUPABASE_URL: {supabase_url}")
    logger.info(f"SUPABASE_SERVICE_ROLE_KEY: {key_status}")
    logger.info(f"WORKER_POLL_INTERVAL: {POLL_INTERVAL}s")
    logger.info(f"TEMP_DIR: {utils.TEMP_DIR}")
    logger.info(f"LOG_DIR: {LOG_DIR}")
    
    # 2. Valida o FFmpeg
    if not utils.validate_ffmpeg():
        logger.error(f"Executável FFmpeg não encontrado ou inativo (FFMPEG_BIN: {os.getenv('FFMPEG_BIN', 'ffmpeg')})!")
        sys.exit(1)
    logger.info("FFmpeg detectado com sucesso.")
    
    # 3. Limpa a pasta temporária na inicialização
    utils.clean_temp()
    logger.info("Pasta temporária inicializada e limpa.")
    
    logger.info("Worker escutando a fila 'render_jobs' e 'export_jobs'...")
    while True:
        try:
            # 1. Prioridade Absoluta: Verifica se há render_jobs pendentes (status = 'queued')
            res_render = supabase_client.table("render_jobs").select("*").eq("status", "queued").order("created_at").limit(1).execute()
            render_jobs = res_render.data
            
            if render_jobs:
                process_job(render_jobs[0])
                continue # Volta imediatamente ao topo do loop para priorizar novas renderizações
                
            # 2. Prioridade Secundária: Verifica se há export_jobs pendentes se a fila de renderização estiver vazia
            res_export = supabase_client.table("export_jobs").select("*").eq("status", "queued").order("created_at").limit(1).execute()
            export_jobs = res_export.data
            
            if export_jobs:
                process_export_job(export_jobs[0])
                continue # Volta imediatamente ao topo do loop
                
            time.sleep(POLL_INTERVAL)
        except Exception as e:
            logger.error(f"Erro no Loop: {e}")
            time.sleep(POLL_INTERVAL)

if __name__ == "__main__":
    start_worker()
