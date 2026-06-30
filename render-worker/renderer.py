import os
import subprocess
import shutil
# pyrefly: ignore [missing-import]
from PIL import Image, ImageDraw, ImageFont
import utils

# Caminhos de fontes suportados no worker Linux e fallback
FONT_PATHS_BOLD = [
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "DejaVuSans-Bold.ttf"
]

FONT_PATHS_REGULAR = [
    "/usr/share/fonts/truetype/liberation/LiberationSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    "DejaVuSans.ttf"
]

def get_font(font_list, size):
    """Tenta carregar uma fonte da lista fornecida ou retorna a fonte padrão."""
    for path in font_list:
        try:
            if os.path.exists(path) or "/" not in path:
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

def create_template_image(pov_text, logo_path, temp_img_path, brand_name, brand_handle, is_verified):
    """
    Cria uma imagem PNG com o layout de template.
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
    
    brand_name = brand_name.strip() if brand_name else ""
    brand_handle = brand_handle.strip() if brand_handle else ""
    
    if not brand_name:
        brand_name = "Nome do Perfil"
    if not brand_handle:
        brand_handle = "@seuperfil"
        
    text_x_offset = logo_x + logo_size + 25
    
    logo_circular = None
    if logo_path and os.path.exists(logo_path):
        logo_circular = create_circular_logo(logo_path, logo_size)
        
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
    
    img.putalpha(mask)
    
    border_img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    border_draw = ImageDraw.Draw(border_img)
    border_draw.rounded_rectangle(video_box, radius=radius, outline=(230, 230, 230, 255), width=3)
    
    final_img = Image.alpha_composite(img, border_img)
    final_img.save(temp_img_path, "PNG")
    return True

def get_video_duration(video_path):
    """Obtém a duração do vídeo usando ffprobe configurado."""
    ffmpeg_bin = os.getenv("FFMPEG_BIN", "ffmpeg")
    ffprobe_bin = os.getenv("FFPROBE_BIN") or ffmpeg_bin.replace("ffmpeg", "ffprobe")
    try:
        cmd = [
            ffprobe_bin, 
            '-v', 'error', 
            '-show_entries', 'format=duration', 
            '-of', 'default=noprint_wrappers=1:nokey=1', 
            video_path
        ]
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        return float(result.stdout.strip())
    except Exception:
        return 0.0

def process_video(input_video_path, output_video_path, output_cover_path, pov_text, logo_path, display_name, handle, is_verified):
    """
    Renderiza o vídeo usando FFmpeg no contêiner Linux.
    """
    temp_template_img = utils.get_temp_path("temp_template.png")
    create_template_image(pov_text, logo_path, temp_template_img, display_name, handle, is_verified)
    
    ffmpeg_bin = os.getenv("FFMPEG_BIN", "ffmpeg")
    ffprobe_bin = os.getenv("FFPROBE_BIN") or ffmpeg_bin.replace("ffmpeg", "ffprobe")
    
    target_duration = 15.0
    
    duration = get_video_duration(input_video_path)
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
    
    cmd = [ffmpeg_bin, '-y']
    cmd.extend(['-t', str(limit_duration), '-i', input_video_path])
    cmd.extend(['-i', temp_template_img])
    
    audio_filter = "[0:a]volume=0.80[outa]"
    has_audio = False
    try:
        audio_check_cmd = [
            ffprobe_bin, '-v', 'error', 
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
    
    # Extrai capa
    cover_cmd = [
        ffmpeg_bin, '-y',
        '-ss', '00:00:01',
        '-i', output_video_path,
        '-vframes', '1',
        '-q:v', '2',
        output_cover_path
    ]
    try:
        subprocess.run(cover_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    except Exception as e:
        print(f"[Aviso] Falha ao extrair capa: {e}")
        shutil.copy(temp_template_img, output_cover_path)
        
    if os.path.exists(temp_template_img):
        os.remove(temp_template_img)
