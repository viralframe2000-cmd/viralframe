import os
import csv
import uuid
import shutil
import json
import random
import zipfile
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException, Response, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from typing import List

from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env", override=True)

import utils
import captions
import editor
import jobs
import schemas

app = FastAPI(title="ViralFrame Studio API")
app.mount("/assets", StaticFiles(directory="assets"), name="assets")

# Ativa CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção deve ser restrito, mas local pode ser "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer(auto_error=False)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), token: str = None):
    jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
    if not jwt_secret:
        return {"id": "dev-user-id", "email": "dev@viralframe.com"}
        
    actual_token = None
    if credentials:
        actual_token = credentials.credentials
    elif token:
        actual_token = token
        
    if not actual_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Cabeçalho de autorização ou token ausente."
        )
        
    try:
        payload = jwt.decode(actual_token, jwt_secret, algorithms=["HS256"], audience="authenticated")
        return {
            "id": payload.get("sub"),
            "email": payload.get("email")
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expirado.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido.")
@app.on_event("startup")
def startup_event():
    utils.create_directories()
    utils.init_frases_csv()

@app.get("/health")
def health():
    ffmpeg_cmd = utils.get_ffmpeg_path()
    if ffmpeg_cmd:
        return {
            "status": "healthy",
            "ffmpeg_installed": True,
            "ffmpeg_path": ffmpeg_cmd
        }
    else:
        return {
            "status": "healthy",
            "ffmpeg_installed": False,
            "ffmpeg_path": None,
            "message": "FFmpeg não encontrado. Configure FFMPEG_PATH no backend/.env"
        }

@app.get("/api/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@app.post("/api/phrases/upload", response_model=schemas.UploadPhrasesResponse)
def upload_phrases(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Formato de arquivo inválido. Apenas arquivos .csv são suportados.")
        
    try:
        content_bytes = file.file.read()
        
        # Tenta decodificar como UTF-8, UTF-8-sig (para BOM) ou Latin-1
        decoded_content = None
        for encoding in ['utf-8-sig', 'utf-8', 'latin-1', 'iso-8859-1']:
            try:
                decoded_content = content_bytes.decode(encoding)
                break
            except Exception:
                continue
                
        if decoded_content is None:
            raise HTTPException(status_code=400, detail="Não foi possível decodificar o arquivo CSV. Verifique a codificação (UTF-8 recomendado).")
            
        # Detectar delimitador: ponto e vírgula ou vírgula
        lines = [line.strip() for line in decoded_content.splitlines() if line.strip()]
        if not lines:
            raise HTTPException(status_code=400, detail="Arquivo CSV vazio.")
            
        header_line = lines[0]
        delimiter = ';' if ';' in header_line else ','
        
        # Faz parsing do CSV
        import io
        csv_file = io.StringIO(decoded_content)
        reader = csv.DictReader(csv_file, delimiter=delimiter)
        
        # Limpar espaços das chaves de cabeçalho
        if reader.fieldnames:
            reader.fieldnames = [name.strip().strip('"').strip("'").lower() for name in reader.fieldnames]
        else:
            raise HTTPException(status_code=400, detail="O cabeçalho do arquivo CSV está ausente ou inválido.")
            
        # Validar colunas obrigatórias
        required_cols = ['pov_text', 'caption_text']
        for col in required_cols:
            if col not in reader.fieldnames:
                raise HTTPException(status_code=400, detail=f"Coluna obrigatória '{col}' ausente no arquivo CSV.")
                
        phrases = []
        phrase_id = 1
        for row in reader:
            pov = (row.get('pov_text') or '').strip()
            caption = (row.get('caption_text') or '').strip()
            
            # Se for uma linha vazia (sem pov e sem legenda), ignoramos
            if not pov and not caption:
                continue
                
            categoria = (row.get('categoria') or '').strip()
            tom = (row.get('tom') or '').strip()
            ativo_val = (row.get('ativo') or '').strip()
            
            # Se a coluna 'ativo' não existir ou estiver vazia
            if 'ativo' not in row or not ativo_val:
                ativo = "Sim"
            else:
                if ativo_val.lower() in ['sim', 's', 'yes', 'y', 'true', '1']:
                    ativo = "Sim"
                else:
                    ativo = "Não"
                    
            phrases.append({
                "id": phrase_id,
                "pov_text": pov,
                "caption_text": caption,
                "categoria": categoria if categoria else None,
                "tom": tom if tom else None,
                "ativo": ativo
            })
            phrase_id += 1
            
        # Salva em config/banco_frases.json
        config_dir = os.path.join('config')
        os.makedirs(config_dir, exist_ok=True)
        banco_path = os.path.join(config_dir, 'banco_frases.json')
        
        with open(banco_path, 'w', encoding='utf-8') as f:
            json.dump(phrases, f, ensure_ascii=False, indent=2)
            
        total = len(phrases)
        active = sum(1 for p in phrases if p['ativo'] == "Sim")
        
        return {
            "success": True,
            "total": total,
            "active": active
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar o arquivo CSV: {str(e)}")

@app.get("/api/phrases", response_model=schemas.PhraseListResponse)
def get_phrases():
    banco_path = os.path.join('config', 'banco_frases.json')
    if not os.path.exists(banco_path):
        return {
            "phrases": [],
            "total": 0,
            "active": 0
        }
        
    try:
        with open(banco_path, 'r', encoding='utf-8') as f:
            phrases = json.load(f)
            
        total = len(phrases)
        active = sum(1 for p in phrases if p.get('ativo') == "Sim")
        
        return {
            "phrases": phrases,
            "total": total,
            "active": active
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao carregar o banco de frases: {str(e)}")

@app.get("/api/phrases/template")
def get_phrase_template():
    csv_content = (
        "id,pov_text,caption_text,categoria,tom,ativo\n"
        '1,"POV: você entrou no grupo de promoções certo","🔥 Achadinho do dia! Quer receber ofertas como essa todos os dias? Entre no grupo gratuito pelo link da bio. #achadinhos","Geral","Economia","Sim"\n'
        '2,"POV: você parou de pagar caro nas compras","💸 Promoção boa acaba rápido. Entra no grupo gratuito e receba os achadinhos primeiro. #ofertas","Economia","Urgência","Sim"\n'
    )
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=modelo_frases.csv",
            "Content-Type": "text/csv; charset=utf-8"
        }
    )

@app.post("/api/phrases/apply-random", response_model=List[schemas.VideoStatus])
def apply_random_phrases(req: schemas.ApplyRandomRequest):
    banco_path = os.path.join('config', 'banco_frases.json')
    if not os.path.exists(banco_path):
        raise HTTPException(status_code=400, detail="Banco de frases vazio. Faça upload de um arquivo CSV de frases primeiro.")
        
    try:
        with open(banco_path, 'r', encoding='utf-8') as f:
            all_phrases = json.load(f)
            
        active_phrases = [p for p in all_phrases if p.get('ativo') == "Sim"]
        if not active_phrases:
            raise HTTPException(status_code=400, detail="Nenhuma frase ativa encontrada no banco de frases.")
            
        input_dir = 'input'
        supported_extensions = ('.mp4', '.mov', '.mkv', '.webm')
        if not os.path.exists(input_dir):
            return []
            
        files = os.listdir(input_dir)
        video_files = [f for f in files if f.lower().endswith(supported_extensions)]
        
        # Carregar metadados atuais do frases.csv
        existing_records = {}
        csv_path = os.path.join('config', 'frases.csv')
        if os.path.exists(csv_path):
            with open(csv_path, mode='r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if row.get('filename'):
                        existing_records[row['filename']] = row
                        
        # Preparar pool de frases ativas
        phrase_pool = list(active_phrases)
        random.shuffle(phrase_pool)
        phrase_index = 0
        
        # Atualizar metadados
        for filename in video_files:
            meta = existing_records.get(filename, {})
            pov = meta.get('pov_text', '').strip()
            caption = meta.get('caption_text', '').strip()
            
            needs_fill = req.overwrite or (not pov and not caption)
            
            if needs_fill:
                if phrase_index >= len(phrase_pool):
                    random.shuffle(phrase_pool)
                    phrase_index = 0
                    
                selected_phrase = phrase_pool[phrase_index]
                phrase_index += 1
                
                existing_records[filename] = {
                    "filename": filename,
                    "pov_text": selected_phrase["pov_text"],
                    "caption_text": selected_phrase["caption_text"]
                }
                
        # Gravar no frases.csv
        headers = ['filename', 'pov_text', 'caption_text']
        with open(csv_path, mode='w', encoding='utf-8-sig', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            for rec in existing_records.values():
                writer.writerow({
                    "filename": rec.get("filename"),
                    "pov_text": rec.get("pov_text", ""),
                    "caption_text": rec.get("caption_text", "")
                })
                
        return list_videos()
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao aplicar frases aleatórias: {str(e)}")

@app.get("/api/profile", response_model=schemas.ProfileSettings)
def get_profile(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    profile_path = os.path.join('config', f'profile_settings_{user_id}.json')
    if not os.path.exists(profile_path):
        return {
            "display_name": "",
            "handle": "",
            "verified": True,
            "logo_path": None,
            "has_custom_profile": False
        }
    try:
        with open(profile_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        display_name = data.get("display_name", "").strip()
        handle = data.get("handle", "").strip()
        has_custom_profile = bool(display_name and handle)
        
        # URL da logo dinâmica por usuário
        logo_path = data.get("logo_path")
        if logo_path and os.path.exists(logo_path):
            logo_url = f"/api/assets/logo/{user_id}"
        else:
            logo_url = None
            
        return {
            "display_name": display_name,
            "handle": handle,
            "verified": data.get("verified", True),
            "logo_path": logo_url,
            "has_custom_profile": has_custom_profile
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao carregar configurações do perfil: {str(e)}")

@app.post("/api/profile", response_model=schemas.ProfileSettings)
def save_profile(profile: schemas.ProfileSettings, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    try:
        config_dir = os.path.join('config')
        os.makedirs(config_dir, exist_ok=True)
        profile_path = os.path.join(config_dir, f'profile_settings_{user_id}.json')
        
        display_name = profile.display_name.strip()
        handle = profile.handle.strip()
        
        if handle and not handle.startswith('@'):
            handle = f"@{handle}"
            
        has_custom_profile = bool(display_name and handle)
        
        # Preserva o logo_path atual do JSON
        existing_logo = None
        if os.path.exists(profile_path):
            try:
                with open(profile_path, 'r', encoding='utf-8') as f:
                    old_data = json.load(f)
                    existing_logo = old_data.get("logo_path")
            except:
                pass
                
        data = {
            "display_name": display_name,
            "handle": handle,
            "verified": profile.verified,
            "logo_path": existing_logo,
            "has_custom_profile": has_custom_profile
        }
        
        with open(profile_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        if existing_logo:
            data["logo_path"] = f"/api/assets/logo/{user_id}"
            
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar configurações do perfil: {str(e)}")

@app.post("/api/upload/videos")
def upload_videos(files: List[UploadFile] = File(...), current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    uploaded_files = []
    failed_files = []
    supported_extensions = ('.mp4', '.mov', '.mkv', '.webm')
    
    input_dir = os.path.join('input', user_id)
    os.makedirs(input_dir, exist_ok=True)
    
    for file in files:
        filename = file.filename
        _, ext = os.path.splitext(filename)
        if ext.lower() not in supported_extensions:
            failed_files.append({
                "filename": filename,
                "reason": "Formato de vídeo não suportado. Use MP4, MOV, MKV ou WEBM."
            })
            continue
            
        base, ext = os.path.splitext(filename)
        counter = 1
        target_filename = filename
        target_path = os.path.join(input_dir, target_filename)
        while os.path.exists(target_path):
            target_filename = f"{base}_{counter}{ext}"
            target_path = os.path.join(input_dir, target_filename)
            counter += 1
            
        try:
            with open(target_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            uploaded_files.append({
                "filename": target_filename,
                "status": "uploaded"
            })
        except Exception as e:
            print(f"[Erro] Falha ao fazer upload de {filename}: {e}")
            failed_files.append({
                "filename": filename,
                "reason": f"Erro interno ao salvar arquivo: {str(e)}"
            })
            
    return {
        "success": True,
        "uploaded": uploaded_files,
        "failed": failed_files
    }

@app.post("/api/upload/logo")
def upload_logo(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    supported_extensions = ('.png', '.jpg', '.jpeg')
    _, ext = os.path.splitext(file.filename)
    if ext.lower() not in supported_extensions:
        raise HTTPException(status_code=400, detail="Formato de logo inválido. Use PNG ou JPG.")
        
    assets_dir = os.path.join('assets')
    os.makedirs(assets_dir, exist_ok=True)
    
    target_filename = f"logo_{user_id}.png"
    target_path = os.path.join(assets_dir, target_filename)
    try:
        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Salva o caminho no JSON de configurações do perfil
        profile_path = os.path.join('config', f'profile_settings_{user_id}.json')
        profile_data = {
            "display_name": "",
            "handle": "",
            "verified": True,
            "logo_path": target_path,
            "has_custom_profile": False
        }
        if os.path.exists(profile_path):
            try:
                with open(profile_path, 'r', encoding='utf-8') as f:
                    profile_data = json.load(f)
            except:
                pass
        profile_data["logo_path"] = target_path
        with open(profile_path, 'w', encoding='utf-8') as f:
            json.dump(profile_data, f, ensure_ascii=False, indent=2)
            
        return {"status": "success", "message": "Logo atualizada com sucesso!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar logo: {str(e)}")

# Rota dinâmica para expor a logo circular de forma privada por ID de usuário
@app.get("/api/assets/logo/{user_id}")
def get_user_logo(user_id: str):
    logo_path = os.path.join('assets', f'logo_{user_id}.png')
    if not os.path.exists(logo_path):
        raise HTTPException(status_code=404, detail="Logo não encontrada.")
    return FileResponse(logo_path, media_type="image/png")

@app.get("/api/profile/logo-redirect")
def get_profile_logo_redirect(token: str = None):
    user_id = "dev-user-id"
    if token:
        try:
            jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
            if jwt_secret:
                payload = jwt.decode(token, jwt_secret, algorithms=["HS256"], audience="authenticated")
                user_id = payload.get("sub")
        except Exception:
            pass
            
    logo_path = os.path.join('assets', f'logo_{user_id}.png')
    if os.path.exists(logo_path):
        return FileResponse(logo_path, media_type="image/png")
        
    raise HTTPException(status_code=404, detail="Logo não encontrada.")

@app.get("/api/videos", response_model=List[schemas.VideoStatus])
def list_videos(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    input_dir = os.path.join('input', user_id)
    output_dir = os.path.join('output', user_id)
    
    os.makedirs(input_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)
    
    # Carrega metadados do frases_{user_id}.csv para associar
    metadata_map = {}
    csv_path = os.path.join('config', f'frases_{user_id}.csv')
    if os.path.exists(csv_path):
        try:
            with open(csv_path, mode='r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if row.get('filename'):
                        metadata_map[row['filename'].lower()] = row
        except Exception as e:
            print(f"[Erro] Falha ao ler frases do usuário {user_id}: {e}")

    supported_extensions = ('.mp4', '.mov', '.mkv', '.webm')
    if not os.path.exists(input_dir):
        return []
        
    files = os.listdir(input_dir)
    videos = []
    
    for f in files:
        if not f.lower().endswith(supported_extensions):
            continue
            
        base_name, _ = os.path.splitext(f)
        output_video_name = f"{base_name}_reel.mp4"
        exists_output = os.path.exists(os.path.join(output_dir, output_video_name))
        
        status = "pronto" if exists_output else "pendente"
        
        meta = metadata_map.get(f.lower(), {})
        
        import urllib.parse
        quoted_filename = urllib.parse.quote(f)
        
        videos.append(schemas.VideoStatus(
            filename=f,
            status=status,
            exists_output=exists_output,
            video_url=f"/api/download/video/{f}" if exists_output else None,
            caption_url=f"/api/download/caption/{f}" if exists_output else None,
            cover_url=f"/api/download/cover/{f}" if exists_output else None,
            pov_text=meta.get("pov_text", ""),
            caption_text=meta.get("caption_text", ""),
            input_preview_url=f"/api/preview/input/{quoted_filename}",
            output_preview_url=f"/api/preview/output/{quoted_filename}" if exists_output else None,
            has_output=exists_output
        ))
        
    return videos

@app.post("/api/videos/metadata")
def save_metadata(metadata: schemas.MetadataList, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    csv_path = os.path.join('config', f'frases_{user_id}.csv')
    try:
        existing_records = {}
        if os.path.exists(csv_path):
            with open(csv_path, mode='r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if row.get('filename'):
                        existing_records[row['filename']] = row
                        
        for item in metadata.items:
            existing_records[item.filename] = {
                "filename": item.filename,
                "pov_text": item.pov_text,
                "caption_text": item.caption_text
            }
            
        headers = ['filename', 'pov_text', 'caption_text']
        with open(csv_path, mode='w', encoding='utf-8-sig', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            for rec in existing_records.values():
                writer.writerow(rec)
                
        return {"status": "success", "message": "Metadados salvos com sucesso!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar metadados: {str(e)}")

@app.post("/api/render/{filename}")
def render_video(filename: str, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    input_video_path = os.path.join('input', user_id, filename)
    if not os.path.exists(input_video_path):
        raise HTTPException(status_code=404, detail="Vídeo de entrada não encontrado.")
        
    base_name, _ = os.path.splitext(filename)
    output_video_path = os.path.join('output', user_id, f"{base_name}_reel.mp4")
    output_cover_path = os.path.join('output', user_id, f"{base_name}_cover.jpg")
    output_caption_path = os.path.join('output', user_id, f"{base_name}_caption.txt")
    
    pov_text, caption_text = captions.get_video_config(filename, user_id)
    logo_path = os.path.join('assets', f"logo_{user_id}.png")
    music_path = os.path.join('assets', 'background_music.mp3')
    
    try:
        editor.process_video(
            input_video_path=input_video_path,
            output_video_path=output_video_path,
            output_cover_path=output_cover_path,
            pov_text=pov_text,
            logo_path=logo_path if os.path.exists(logo_path) else None,
            music_path=music_path if os.path.exists(music_path) else None,
            user_id=user_id
        )
        captions.save_caption_file(output_caption_path, caption_text)
        return {"status": "success", "message": f"Vídeo {filename} gerado com sucesso!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar vídeo: {str(e)}")
    finally:
        utils.clean_temp()

@app.post("/api/render-all")
def render_all(background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    input_dir = os.path.join('input', user_id)
    supported_extensions = ('.mp4', '.mov', '.mkv', '.webm')
    if not os.path.exists(input_dir):
        raise HTTPException(status_code=404, detail="Pasta input não encontrada.")
        
    files = os.listdir(input_dir)
    video_files = [f for f in files if f.lower().endswith(supported_extensions)]
    
    if not video_files:
        raise HTTPException(status_code=400, detail="Nenhum vídeo para processar na pasta input.")
        
    job_id = str(uuid.uuid4())
    jobs.jobs_db[job_id] = {
        "job_id": job_id,
        "total": len(video_files),
        "processed": 0,
        "failed": 0,
        "status": "pending",
        "message": "Fila criada. Aguardando execução..."
    }
    
    logo_path = os.path.join('assets', f"logo_{user_id}.png")
    music_path = os.path.join('assets', 'background_music.mp3')
    
    background_tasks.add_task(
        jobs.start_render_all_job,
        job_id,
        video_files,
        logo_path if os.path.exists(logo_path) else None,
        music_path if os.path.exists(music_path) else None,
        user_id
    )
    
    return {"job_id": job_id}

@app.get("/api/jobs/{job_id}", response_model=schemas.JobStatus)
def get_job(job_id: str, current_user: dict = Depends(get_current_user)):
    job = jobs.jobs_db.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job não encontrado.")
    return job

@app.get("/api/download/video/{filename}")
def download_video(filename: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    base_name, _ = os.path.splitext(filename)
    output_video_path = os.path.join('output', user_id, f"{base_name}_reel.mp4")
    if not os.path.exists(output_video_path):
        raise HTTPException(status_code=404, detail="Vídeo final não encontrado.")
    return FileResponse(output_video_path, media_type="video/mp4", filename=f"{base_name}_reel.mp4")

@app.get("/api/download/caption/{filename}")
def download_caption(filename: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    base_name, _ = os.path.splitext(filename)
    output_caption_path = os.path.join('output', user_id, f"{base_name}_caption.txt")
    if not os.path.exists(output_caption_path):
        raise HTTPException(status_code=404, detail="Legenda não encontrada.")
    return FileResponse(output_caption_path, media_type="text/plain", filename=f"{base_name}_caption.txt")

@app.get("/api/download/cover/{filename}")
def download_cover(filename: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    base_name, _ = os.path.splitext(filename)
    output_cover_path = os.path.join('output', user_id, f"{base_name}_cover.jpg")
    if not os.path.exists(output_cover_path):
        raise HTTPException(status_code=404, detail="Capa não encontrada.")
    return FileResponse(output_cover_path, media_type="image/jpeg", filename=f"{base_name}_cover.jpg")

@app.get("/api/preview/input/{filename}")
def preview_input_video(filename: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    safe_filename = os.path.basename(filename)
    allowed_exts = ('.mp4', '.mov', '.mkv', '.webm')
    if not safe_filename.lower().endswith(allowed_exts):
        raise HTTPException(status_code=400, detail="Formato de vídeo não suportado.")
        
    input_video_path = os.path.join('input', user_id, safe_filename)
    if not os.path.exists(input_video_path):
        raise HTTPException(status_code=404, detail="Vídeo original não encontrado.")
        
    ext = os.path.splitext(safe_filename)[1].lower()
    media_type = "video/mp4"
    if ext == ".mov":
        media_type = "video/quicktime"
    elif ext == ".webm":
        media_type = "video/webm"
    elif ext == ".mkv":
        media_type = "video/x-matroska"
        
    return FileResponse(input_video_path, media_type=media_type)

@app.get("/api/preview/output/{filename}")
def preview_output_video(filename: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    safe_filename = os.path.basename(filename)
    allowed_exts = ('.mp4', '.mov', '.mkv', '.webm')
    if not safe_filename.lower().endswith(allowed_exts):
        raise HTTPException(status_code=400, detail="Formato de vídeo não suportado.")
        
    base_name, _ = os.path.splitext(safe_filename)
    output_video_path = os.path.join('output', user_id, f"{base_name}_reel.mp4")
    
    if not os.path.exists(output_video_path):
        raise HTTPException(status_code=404, detail="Vídeo renderizado não encontrado.")
        
    return FileResponse(output_video_path, media_type="video/mp4")

def cleanup_temp_file(file_path: str):
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"[Aviso] Falha ao remover arquivo ZIP temporário {file_path}: {e}")

@app.get("/api/download/all")
def download_all_files(type: str = "all", background_tasks: BackgroundTasks = None, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    output_dir = os.path.join('output', user_id)
    if not os.path.exists(output_dir):
        raise HTTPException(status_code=400, detail="Nenhum vídeo renderizado encontrado para download.")
        
    all_files = os.listdir(output_dir)
    allowed_exts = ('.mp4', '.txt', '.jpg', '.jpeg', '.png')
    output_files = [f for f in all_files if f.lower().endswith(allowed_exts) and os.path.isfile(os.path.join(output_dir, f))]
    
    if not output_files:
        raise HTTPException(status_code=400, detail="Nenhum vídeo renderizado encontrado para download.")
        
    files_to_zip = []
    if type == "videos":
        files_to_zip = [f for f in output_files if f.lower().endswith('.mp4')]
    elif type == "videos-captions":
        files_to_zip = [f for f in output_files if f.lower().endswith(('.mp4', '.txt'))]
    else: # "all"
        files_to_zip = output_files
        
    if not files_to_zip:
        raise HTTPException(status_code=400, detail="Nenhum vídeo renderizado encontrado para download.")
        
    temp_dir = 'temp'
    os.makedirs(temp_dir, exist_ok=True)
    temp_zip_name = f"viralframe-videos-{uuid.uuid4()}.zip"
    temp_zip_path = os.path.join(temp_dir, temp_zip_name)
    
    try:
        with zipfile.ZipFile(temp_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for f in files_to_zip:
                safe_name = os.path.basename(f)
                file_path = os.path.join(output_dir, safe_name)
                if os.path.exists(file_path):
                    zipf.write(file_path, safe_name)
                    
        if background_tasks and background_tasks is not None:
            background_tasks.add_task(cleanup_temp_file, temp_zip_path)
            
        return FileResponse(
            temp_zip_path, 
            media_type="application/zip", 
            filename="viralframe-videos.zip"
        )
    except Exception as e:
        cleanup_temp_file(temp_zip_path)
        raise HTTPException(status_code=500, detail=f"Erro ao gerar arquivo compactado: {str(e)}")

@app.delete("/api/videos/{filename}")
def delete_video(filename: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    input_video_path = os.path.join('input', user_id, filename)
    if os.path.exists(input_video_path):
        os.remove(input_video_path)
        
    # Também apaga arquivos do output associados
    base_name, _ = os.path.splitext(filename)
    for ext in ['_reel.mp4', '_caption.txt', '_cover.jpg']:
        out_file = os.path.join('output', user_id, f"{base_name}{ext}")
        if os.path.exists(out_file):
            try:
                os.remove(out_file)
            except:
                pass
                
    return {"status": "success", "message": f"Vídeo {filename} e arquivos associados apagados com sucesso!"}
