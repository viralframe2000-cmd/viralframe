import os
import uuid
import time
import editor
import captions
import utils

# Banco de dados de Jobs em memória
jobs_db = {}

def start_render_all_job(job_id: str, video_files: list, logo_path: str, music_path: str, user_id: str):
    """
    Roda o processamento em lote em background.
    """
    job = jobs_db.get(job_id)
    if not job:
        return
        
    job["status"] = "running"
    job["message"] = "Iniciando processamento em lote..."
    
    input_dir = os.path.join('input', user_id)
    output_dir = os.path.join('output', user_id)
    
    for filename in video_files:
        job["message"] = f"Processando vídeo: {filename}"
        
        base_name, _ = os.path.splitext(filename)
        output_video_path = os.path.join(output_dir, f"{base_name}_reel.mp4")
        output_cover_path = os.path.join(output_dir, f"{base_name}_cover.jpg")
        output_caption_path = os.path.join(output_dir, f"{base_name}_caption.txt")
        
        # Busca pov e legenda
        pov_text, caption_text = captions.get_video_config(filename, user_id)
        
        input_video_path = os.path.join(input_dir, filename)
        
        try:
            # Processa o vídeo
            editor.process_video(
                input_video_path=input_video_path,
                output_video_path=output_video_path,
                output_cover_path=output_cover_path,
                pov_text=pov_text,
                logo_path=logo_path if logo_path and os.path.exists(logo_path) else None,
                music_path=music_path if music_path and os.path.exists(music_path) else None,
                user_id=user_id
            )
            # Salva legenda
            captions.save_caption_file(output_caption_path, caption_text)
            
            job["processed"] += 1
        except Exception as e:
            print(f"[Erro no Job {job_id}] Falha ao processar {filename}: {e}")
            job["failed"] += 1
            # Limpa arquivos parciais
            for p in [output_video_path, output_cover_path, output_caption_path]:
                if os.path.exists(p):
                    try:
                        os.remove(p)
                    except:
                        pass
        finally:
            utils.clean_temp()
            
    job["status"] = "completed"
    job["message"] = "Processamento em lote concluído com sucesso!"
