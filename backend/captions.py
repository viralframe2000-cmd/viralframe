import os
import csv
import json
import random

DEFAULT_CAPTION_TEMPLATE = (
    "🔥 Achadinho do dia!\n\n"
    "Quer receber promoções, cupons e ofertas como essa todos os dias?\n\n"
    "Entre agora no nosso grupo gratuito pelo link da bio.\n\n"
    "#achadinhos #promocoes #ofertas #cupons #shopee #amazon #mercadolivre #descontos"
)

def load_templates():
    """Carrega as frases padrão do templates.json."""
    templates_path = os.path.join('config', 'templates.json')
    if os.path.exists(templates_path):
        try:
            with open(templates_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"[Erro] Não foi possível ler templates.json: {e}")
    
    return {
        "pov_texts": ["POV: você entrou no grupo de promoções certo"],
        "caption_texts": [DEFAULT_CAPTION_TEMPLATE]
    }

def get_video_config(video_filename, user_id=None):
    """
    Retorna pov_text e caption_text correspondentes ao vídeo.
    Se não existirem no CSV, obtém valores aleatórios/padrão do templates.json.
    """
    suffix = f"_{user_id}" if user_id else ""
    csv_path = os.path.join('config', f'frases{suffix}.csv')
    pov_text = None
    caption_text = None

    if os.path.exists(csv_path):
        try:
            with open(csv_path, mode='r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if row.get('filename', '').strip().lower() == video_filename.strip().lower():
                        pov_text = row.get('pov_text', '').strip()
                        caption_text = row.get('caption_text', '').strip()
                        break
        except Exception as e:
            print(f"[Erro] Falha ao ler frases.csv: {e}")

    templates = load_templates()

    # Fallback se não encontrou no CSV
    if not pov_text:
        pov_texts = templates.get('pov_texts', ["POV: você entrou no grupo de promoções certo"])
        pov_text = random.choice(pov_texts)
        
    if not caption_text:
        caption_texts = templates.get('caption_texts', [DEFAULT_CAPTION_TEMPLATE])
        caption_text = random.choice(caption_texts)

    return pov_text, caption_text

def save_caption_file(output_path, caption_text):
    """Salva a legenda em um arquivo .txt correspondente."""
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(caption_text)
        return True
    except Exception as e:
        print(f"[Erro] Não foi possível salvar a legenda em {output_path}: {e}")
        return False
