import os
import subprocess
import shutil
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent / "backend"
print("BASE_DIR:", BASE_DIR)
load_dotenv(BASE_DIR / ".env", override=True)

ffmpeg_env = os.getenv('FFMPEG_PATH', '')
print("FFMPEG_PATH from env:", ffmpeg_env)

def validate_ffmpeg(path):
    if not path:
        return False
    try:
        path = os.path.normpath(path.strip('\'" '))
        print("Normalized path:", path)
        result = subprocess.run([path, "-version"], capture_output=True, text=True, timeout=10)
        print("Return code:", result.returncode)
        print("Output (first 100 chars):", result.stdout[:100])
        return result.returncode == 0
    except Exception as e:
        print("Validation error:", e)
        return False

print("Validation result:", validate_ffmpeg(ffmpeg_env))
