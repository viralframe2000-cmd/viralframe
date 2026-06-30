import os
import csv
import json
import subprocess
import shutil
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

def generate_default_logo():
    """Gera uma logo de demonstração em assets/logo.png se não existir."""
    from PIL import Image, ImageDraw, ImageFont
    logo_path = os.path.join('assets', 'logo.png')
    if not os.path.exists(logo_path):
        img = Image.new("RGBA", (200, 200), (25, 30, 45, 255))
        draw = ImageDraw.Draw(img)
        draw.ellipse((10, 10, 190, 190), outline=(29, 155, 240, 255), width=5)
        
        font = None
        for fp in [r"C:\Windows\Fonts\arialbd.ttf", "arialbd.ttf"]:
            try:
                font = ImageFont.truetype(fp, 110)
                break
            except:
                continue
        if not font:
            font = ImageFont.load_default()
            
        try:
            bbox = font.getbbox("B")
            w = bbox[2] - bbox[0]
            h = bbox[3] - bbox[1]
            draw.text(((200 - w) // 2, (180 - h) // 2), "B", fill=(255, 255, 255, 255), font=font)
        except Exception:
            draw.text((80, 80), "B", fill=(255, 255, 255, 255))
            
        img.save(logo_path, "PNG")
        print("[Info] Gerada logo de demonstração em assets/logo.png")

def create_directories():
    """Cria os diretórios necessários para a aplicação."""
    dirs = ['input', 'output', 'assets', 'config', 'temp']
    for d in dirs:
        os.makedirs(d, exist_ok=True)
        if d in ['input', 'output']:
            keep_file = os.path.join(d, '.gitkeep')
            if not os.path.exists(keep_file):
                with open(keep_file, 'w') as f:
                    pass
    generate_default_logo()

def validate_ffmpeg(path: str) -> bool:
    """Valida o executável do FFmpeg executando a flag -version."""
    if not path:
        return False
    try:
        path = path.strip().strip('"').strip("'")
        result = subprocess.run([path, "-version"], capture_output=True, text=True, timeout=10)
        return result.returncode == 0
    except Exception:
        return False

def validate_ffprobe(path: str) -> bool:
    """Valida o executável do FFprobe executando a flag -version."""
    if not path:
        return False
    try:
        path = path.strip().strip('"').strip("'")
        result = subprocess.run([path, "-version"], capture_output=True, text=True, timeout=10)
        return result.returncode == 0
    except Exception:
        return False

def get_ffmpeg_path():
    """
    Verifica e valida o caminho do FFmpeg.
    """
    ffmpeg_path = os.getenv("FFMPEG_PATH")
    if ffmpeg_path:
        ffmpeg_path = ffmpeg_path.strip().strip('"').strip("'")
        if validate_ffmpeg(ffmpeg_path):
            return ffmpeg_path
            
    # Fallback
    fallback_path = shutil.which("ffmpeg")
    if fallback_path and validate_ffmpeg(fallback_path):
        return fallback_path
        
    return None

def get_ffprobe_path():
    """
    Tenta encontrar e validar o caminho do ffprobe correspondente.
    """
    ffmpeg_path = get_ffmpeg_path()
    if ffmpeg_path and os.path.isabs(ffmpeg_path):
        dir_name = os.path.dirname(ffmpeg_path)
        for name in ['ffprobe.exe', 'ffprobe']:
            ffprobe_path = os.path.join(dir_name, name)
            if validate_ffprobe(ffprobe_path):
                return ffprobe_path
                
    # Fallback para o PATH global
    sys_path = shutil.which("ffprobe") or shutil.which("ffprobe.exe")
    if sys_path and validate_ffprobe(sys_path):
        return sys_path
        
    return "ffprobe"

def init_frases_csv():
    """Gera um frases.csv padrão se não existir."""
    csv_path = os.path.join('config', 'frases.csv')
    if not os.path.exists(csv_path):
        headers = ['filename', 'pov_text', 'caption_text']
        rows = [
            [
                'produto1.mp4',
                'POV: você entrou no grupo de promoções certo',
                '🔥 Achadinho do dia! Quer receber ofertas como essa todos os dias? Entre no grupo gratuito pelo link da bio. #achadinhos #promocoes #cupons'
            ],
            [
                'produto2.mp4',
                'POV: você parou de pagar caro nas compras',
                '💸 Promoção boa acaba rápido. Entra no grupo gratuito e receba os achadinhos primeiro. #ofertas #shopee #amazon'
            ]
        ]
        with open(csv_path, mode='w', encoding='utf-8-sig', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(headers)
            writer.writerows(rows)
        print("[Info] Arquivo config/frases.csv criado automaticamente com exemplos.")

def clean_temp():
    """Limpa os arquivos da pasta temp."""
    temp_dir = 'temp'
    if os.path.exists(temp_dir):
        for file in os.listdir(temp_dir):
            file_path = os.path.join(temp_dir, file)
            try:
                if os.path.isfile(file_path):
                    os.unlink(file_path)
            except Exception as e:
                print(f"[Erro] Falha ao deletar arquivo temporário {file_path}: {e}")
