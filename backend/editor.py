import os
import subprocess
import shutil
import json
from PIL import Image, ImageDraw, ImageFont
import utils

def load_profile_settings(user_id=None):
    suffix = f"_{user_id}" if user_id else ""
    profile_path = os.path.join('config', f'profile_settings{suffix}.json')
    if os.path.exists(profile_path):
        try:
            with open(profile_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
            
    return {
        "display_name": "",
        "handle": "",
        "verified": True,
        "logo_path": None
    }

# Caminhos de fontes comuns no Windows e alternativas
FONT_PATHS_BOLD = [
    r"C:\Windows\Fonts\arialbd.ttf",       # Arial Bold
    r"C:\Windows\Fonts\segoeuib.ttf",      # Segoe UI Bold
    r"C:\Windows\Fonts\trebucbd.ttf",      # Trebuchet MS Bold
    "arialbd.ttf",
    "DejaVuSans-Bold.ttf"
]

FONT_PATHS_REGULAR = [
    r"C:\Windows\Fonts\arial.ttf",         # Arial
    r"C:\Windows\Fonts\segoeui.ttf",       # Segoe UI
    r"C:\Windows\Fonts\trebuc.ttf",        # Trebuchet MS
    "arial.ttf",
    "DejaVuSans.ttf"
]

def get_font(font_list, size):
    """Tenta carregar uma fonte da lista fornecida ou retorna a fonte padrão."""
    for path in font_list:
        try:
            if os.path.exists(path) or ":" not in path: # tenta carregar se existir ou for padrão do sistema
                return ImageFont.truetype(path, size)
        except Exception:
            continue
    return ImageFont.load_default()

def wrap_text(text, font, max_width):
    """Divide o texto em várias linhas para que caiba na largura máxima."""
    words = text.split()
    lines = []
    current_line = []
    
    for word in words:
        test_line = ' '.join(current_line + [word])
        bbox = font.getbbox(test_line)
        width = bbox[2] - bbox[0]
        
        if width <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(' '.join(current_line))
            current_line = [word]
            
    if current_line:
        lines.append(' '.join(current_line))
        
    return lines

def create_circular_logo(logo_path, size):
    """Lê a logo original e gera uma versão circular redimensionada."""
    try:
        logo = Image.open(logo_path).convert("RGBA")
        logo = logo.resize((size, size), Image.Resampling.LANCZOS)
        
        mask = Image.new("L", (size, size), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, size, size), fill=255)
        
        output = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        output.paste(logo, (0, 0), mask=mask)
        return output
    except Exception as e:
        print(f"[Aviso] Falha ao processar logo {logo_path}: {e}")
        return None

def create_template_image(pov_text, logo_path, temp_img_path, user_id=None):
    """
    Cria uma imagem PNG com o layout de template.
    A área do vídeo (30, 500, 1050, 1800) será transparente com cantos arredondados e borda.
    """
    width = 1080
    height = 1920
    
    img = Image.new("RGBA", (width, height), (255, 255, 255, 255))
    
    font_title_bold = get_font(FONT_PATHS_BOLD, 46)
    font_handle = get_font(FONT_PATHS_REGULAR, 36)
    font_pov = get_font(FONT_PATHS_BOLD, 62)
    
    logo_size = 90
    logo_x = 70
    logo_y = 100
    
    draw = ImageDraw.Draw(img)
    
    profile = load_profile_settings(user_id)
    brand_name = profile.get("display_name", "").strip()
    brand_handle = profile.get("handle", "").strip()
    is_verified = profile.get("verified", True)
    
    if not brand_name:
        brand_name = "Nome do Perfil"
    if not brand_handle:
        brand_handle = "@seuperfil"
        
    active_logo_path = logo_path
    if not active_logo_path or not os.path.exists(active_logo_path):
        active_logo_path = profile.get("logo_path")
        
    text_x_offset = logo_x + logo_size + 25
    
    logo_circular = None
    if active_logo_path and os.path.exists(active_logo_path):
        logo_circular = create_circular_logo(active_logo_path, logo_size)
        
    if not logo_circular:
        neutral_logo = Image.new("RGBA", (logo_size, logo_size), (0, 0, 0, 0))
        logo_draw = ImageDraw.Draw(neutral_logo)
        logo_draw.ellipse((0, 0, logo_size - 1, logo_size - 1), fill=(226, 232, 240, 255))
        
        initial = brand_name[0].upper() if brand_name else "N"
        font_initial = get_font(FONT_PATHS_BOLD, 46)
        initial_bbox = font_initial.getbbox(initial)
        initial_w = initial_bbox[2] - initial_bbox[0]
        initial_h = initial_bbox[3] - initial_bbox[1]
        
        initial_x = (logo_size - initial_w) // 2
        initial_y = (logo_size - initial_h) // 2 - 5
        logo_draw.text((initial_x, initial_y), initial, fill=(71, 85, 105, 255), font=font_initial)
        logo_circular = neutral_logo
        
    # Quebra o nome se for muito grande
    brand_name_lines = wrap_text(brand_name, font_title_bold, 820)
        
    if logo_circular:
        img.paste(logo_circular, (logo_x, logo_y), mask=logo_circular)
        
        current_y = logo_y + 5
        line_height = 52
        for line in brand_name_lines:
            draw.text((text_x_offset, current_y), line, fill=(0, 0, 0, 255), font=font_title_bold)
            current_y += line_height
            
        if is_verified:
            try:
                last_line = brand_name_lines[-1]
                last_line_bbox = font_title_bold.getbbox(last_line)
                last_line_w = last_line_bbox[2] - last_line_bbox[0]
                check_x = text_x_offset + last_line_w + 12
                check_y = (current_y - line_height) + 10
                check_size = 28
                draw.ellipse((check_x, check_y, check_x + check_size, check_y + check_size), fill=(29, 155, 240, 255))
                draw.line((check_x + 8, check_y + 14, check_x + 13, check_y + 19), fill=(255, 255, 255, 255), width=3)
                draw.line((check_x + 13, check_y + 19, check_x + 20, check_y + 10), fill=(255, 255, 255, 255), width=3)
            except Exception:
                pass
                
        draw.text((text_x_offset, current_y + 2), brand_handle, fill=(100, 100, 100, 255), font=font_handle)
    else:
        current_y = logo_y
        line_height = 52
        for line in brand_name_lines:
            line_bbox = font_title_bold.getbbox(line)
            line_w = line_bbox[2] - line_bbox[0]
            line_x = (width - line_w) // 2
            
            if line == brand_name_lines[-1] and is_verified:
                check_size = 28
                total_w = line_w + 12 + check_size
                start_x = (width - total_w) // 2
                draw.text((start_x, current_y), line, fill=(0, 0, 0, 255), font=font_title_bold)
                
                check_x = start_x + line_w + 12
                check_y = current_y + 10
                draw.ellipse((check_x, check_y, check_x + check_size, check_y + check_size), fill=(29, 155, 240, 255))
                draw.line((check_x + 8, check_y + 14, check_x + 13, check_y + 19), fill=(255, 255, 255, 255), width=3)
                draw.line((check_x + 13, check_y + 19, check_x + 20, check_y + 10), fill=(255, 255, 255, 255), width=3)
            else:
                draw.text((line_x, current_y), line, fill=(0, 0, 0, 255), font=font_title_bold)
                
            current_y += line_height
            
        handle_bbox = font_handle.getbbox(brand_handle)
        handle_w = handle_bbox[2] - handle_bbox[0]
        draw.text(((width - handle_w) // 2, current_y + 5), brand_handle, fill=(100, 100, 100, 255), font=font_handle)
        
    pov_lines = wrap_text(pov_text, font_pov, 940)
    pov_y_start = 240
    line_height = 80
    
    for i, line in enumerate(pov_lines):
        line_bbox = font_pov.getbbox(line)
        line_w = line_bbox[2] - line_bbox[0]
        draw.text(((width - line_w) // 2, pov_y_start + (i * line_height)), line, fill=(0, 0, 0, 255), font=font_pov)
        
    video_box = [(30, 500), (1050, 1800)]
    radius = 30
    
    mask = Image.new("L", (width, height), 255)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle(video_box, radius=radius, fill=0)
    
    alpha = img.split()[3]
    new_alpha = Image.eval(alpha, lambda x: 0)
    img.putalpha(mask)
    
    border_img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    border_draw = ImageDraw.Draw(border_img)
    border_draw.rounded_rectangle(video_box, radius=radius, outline=(230, 230, 230, 255), width=3)
    
    final_img = Image.alpha_composite(img, border_img)
    
    final_img.save(temp_img_path, "PNG")
    return True

def get_video_duration(video_path, ffprobe_cmd):
    """Obtém a duração do vídeo usando ffprobe."""
    try:
        cmd = [
            ffprobe_cmd, 
            '-v', 'error', 
            '-show_entries', 'format=duration', 
            '-of', 'default=noprint_wrappers=1:nokey=1', 
            video_path
        ]
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        return float(result.stdout.strip())
    except Exception:
        return 0.0

def process_video(input_video_path, output_video_path, output_cover_path, pov_text, logo_path, music_path, user_id=None):
    """
    Processa o vídeo usando FFmpeg, aplicando redimensionamento com proporção,
    detalhes visuais premium e mixagem de áudio.
    """
    ffmpeg_cmd = utils.get_ffmpeg_path()
    ffprobe_cmd = utils.get_ffprobe_path()
    
    if not ffmpeg_cmd:
        raise FileNotFoundError("Executável FFmpeg não encontrado. Configure o FFMPEG_PATH no arquivo .env.")
        
    temp_template_img = os.path.join('temp', 'temp_template.png')
    create_template_image(pov_text, logo_path, temp_template_img, user_id)
    
    target_duration = float(os.getenv('DEFAULT_DURATION', 15))
    use_music = os.getenv('USE_BACKGROUND_MUSIC', 'false').lower() == 'true'
    music_vol = float(os.getenv('BACKGROUND_MUSIC_VOLUME', 0.12))
    orig_vol = float(os.getenv('ORIGINAL_AUDIO_VOLUME', 0.80))
    
    duration = get_video_duration(input_video_path, ffprobe_cmd)
    if duration > 0 and duration < target_duration:
        limit_duration = duration
    else:
        limit_duration = target_duration

    video_filter = (
        f"[0:v]scale=1020:1300:force_original_aspect_ratio=increase,crop=1020:1300,"
        f"eq=brightness=0.02:contrast=1.04,unsharp=3:3:0.4:3:3:0.0[prod_video];"
        f"color=c=white:s=1080x1920:d={limit_duration}[bg];"
        f"[bg][prod_video]overlay=30:500[tmp_composition];"
        f"[tmp_composition][1:v]overlay=0:0[outv]"
    )
    
    cmd = [ffmpeg_cmd, '-y']
    cmd.extend(['-t', str(limit_duration), '-i', input_video_path])
    cmd.extend(['-i', temp_template_img])
    
    has_music = use_music and music_path and os.path.exists(music_path)
    
    if has_music:
        cmd.extend(['-stream_loop', '-1', '-i', music_path])
        audio_filter = (
            f"[0:a]volume={orig_vol}[a_orig];"
            f"[2:a]volume={music_vol}[a_music];"
            f"[a_orig][a_music]amix=inputs=2:duration=first:dropout_transition=2[outa]"
        )
        cmd.extend(['-filter_complex', f"{video_filter};{audio_filter}"])
        cmd.extend(['-map', '[outv]', '-map', '[outa]'])
    else:
        audio_filter = f"[0:a]volume={orig_vol}[outa]"
        has_audio = False
        try:
            audio_check_cmd = [
                ffprobe_cmd, '-v', 'error', 
                '-select_streams', 'a', 
                '-show_entries', 'stream=codec_type', 
                '-of', 'default=noprint_wrappers=1:nokey=1', 
                input_video_path
            ]
            audio_out = subprocess.run(audio_check_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            if 'audio' in audio_out.stdout:
                has_audio = True
        except Exception:
            pass
            
        if has_audio:
            cmd.extend(['-filter_complex', f"{video_filter};{audio_filter}"])
            cmd.extend(['-map', '[outv]', '-map', '[outa]'])
        else:
            cmd.extend(['-filter_complex', video_filter])
            cmd.extend(['-map', '[outv]'])
            
    cmd.extend([
        '-c:v', 'libx264',
        '-profile:v', 'high',
        '-level:v', '4.0',
        '-pix_fmt', 'yuv420p',
        '-r', '30',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-t', str(limit_duration),
        output_video_path
    ])
    
    subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    
    cover_cmd = [
        ffmpeg_cmd, '-y',
        '-ss', '00:00:01',
        '-i', output_video_path,
        '-vframes', '1',
        '-q:v', '2',
        output_cover_path
    ]
    try:
        subprocess.run(cover_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    except Exception as e:
        print(f"[Aviso] Falha ao extrair capa para {output_cover_path}: {e}")
        shutil.copy(temp_template_img, output_cover_path)
