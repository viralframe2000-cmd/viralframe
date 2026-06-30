import os
import subprocess
import shutil

# Diretório temporário mapeado
TEMP_DIR = os.getenv("TEMP_DIR", "/app/temp")

def get_temp_path(filename: str) -> str:
    """
    Retorna o caminho completo de um arquivo temporário de forma segura,
    sanitizando o nome do arquivo para evitar Path Traversal.
    """
    os.makedirs(TEMP_DIR, exist_ok=True)
    # Garante que o nome do arquivo seja apenas o nome base
    safe_name = os.path.basename(filename)
    return os.path.join(TEMP_DIR, safe_name)

def clean_temp_file(file_path: str):
    """Remove um arquivo temporário específico com segurança."""
    if file_path and os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            print(f"[Aviso] Falha ao remover temporário {file_path}: {e}", flush=True)

def clean_temp():
    """Limpa todos os arquivos remanescentes no diretório temporário."""
    if os.path.exists(TEMP_DIR):
        for item in os.listdir(TEMP_DIR):
            item_path = os.path.join(TEMP_DIR, item)
            try:
                if os.path.isfile(item_path) or os.path.islink(item_path):
                    os.unlink(item_path)
                elif os.path.isdir(item_path):
                    shutil.rmtree(item_path)
            except Exception as e:
                print(f"[Aviso] Falha ao limpar item {item_path} no temp: {e}", flush=True)

def validate_ffmpeg() -> bool:
    """Valida o executável do FFmpeg."""
    ffmpeg_bin = os.getenv("FFMPEG_BIN", "ffmpeg")
    try:
        result = subprocess.run([ffmpeg_bin, "-version"], capture_output=True, text=True, timeout=5)
        return result.returncode == 0
    except Exception:
        return False
