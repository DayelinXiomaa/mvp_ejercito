import os
import sys
import subprocess
import shutil
import time

FFMPEG = r"C:\ffmpeg\bin\ffmpeg.exe"
if not os.path.exists(FFMPEG):
    FFMPEG = "ffmpeg"

TARGET_DIRS = [
    r"c:\Proyectos\Interactivo\mvp_ejercito\pantalla_1_timeline\public\assets\timeline",
    r"c:\Proyectos\Interactivo\mvp_ejercito\pantalla_2_armas\public\assets\multimedia\videos",
    r"c:\Proyectos\Interactivo\mvp_ejercito\pantalla_3_terrorismo\public\assets\terrorismo",
    r"c:\Proyectos\Interactivo\mvp_ejercito\pantalla_4_divisiones\public\assets\videos",
    r"c:\Proyectos\Interactivo\mvp_ejercito\pantalla_4_divisiones\public\assets\videos\divisiones",
]

def recode_video(filepath, max_bitrate="800k", max_height=720):
    folder = os.path.dirname(filepath)
    filename = os.path.basename(filepath)
    
    if "_backup" in filename.lower() or filename.startswith("_"):
        return None
        
    orig_size = os.path.getsize(filepath)
    orig_mb = orig_size / (1024 * 1024)
    
    print(f"\n=======================================================", flush=True)
    print(f"Procesando: {filename} ({orig_mb:.1f} MB)", flush=True)
    print(f"=======================================================", flush=True)
    
    backup_dir = os.path.join(folder, "_backup_originales")
    os.makedirs(backup_dir, exist_ok=True)
    backup_path = os.path.join(backup_dir, filename)
    
    if not os.path.exists(backup_path):
        print(f"  [1/3] Creando respaldo original en _backup_originales/{filename}...", flush=True)
        shutil.copy2(filepath, backup_path)
    else:
        print(f"  [1/3] Respaldo previo ya existe.", flush=True)
        
    temp_output = os.path.join(folder, "_recoded_" + filename)
    if os.path.exists(temp_output):
        try:
            os.remove(temp_output)
        except Exception:
            pass
            
    print(f"  [2/3] Recodificando a H.264 Baseline L3.1 (max {max_height}p, {max_bitrate}ps)...", flush=True)
    
    vf_filter = f"scale='min(1280,iw)':'min({max_height},ih)':force_original_aspect_ratio=decrease,pad=ceil(iw/2)*2:ceil(ih/2)*2"
    
    cmd = [
        FFMPEG,
        "-nostdin",
        "-y",
        "-i", filepath,
        "-c:v", "libx264",
        "-profile:v", "baseline",
        "-level:v", "3.1",
        "-preset", "faster",
        "-crf", "25",
        "-maxrate", max_bitrate,
        "-bufsize", "1200k",
        "-vf", vf_filter,
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        "-c:a", "aac",
        "-b:a", "96k",
        "-ar", "44100",
        "-ac", "2",
        temp_output
    ]
    
    t0 = time.time()
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    dur = time.time() - t0
    
    if res.returncode != 0 or not os.path.exists(temp_output):
        err = res.stderr[-250:].strip() if res.stderr else "Error desconocido"
        print(f"  [ERROR] Falló recodificación: {err}", flush=True)
        if os.path.exists(temp_output):
            try:
                os.remove(temp_output)
            except Exception:
                pass
        return False
        
    new_size = os.path.getsize(temp_output)
    new_mb = new_size / (1024 * 1024)
    reduction = (1 - (new_size / orig_size)) * 100
    
    print(f"  [3/3] Reemplazando archivo ({orig_mb:.1f} MB -> {new_mb:.1f} MB, {reduction:+.1f}% en {dur:.1f}s)...", flush=True)
    
    time.sleep(0.2)
    success = False
    for _ in range(6):
        try:
            os.replace(temp_output, filepath)
            success = True
            break
        except Exception:
            time.sleep(0.4)
            
    if success:
        print(f"  [COMPLETADO] {filename} optimizado con éxito.", flush=True)
        return True
    else:
        print(f"  [ERROR] No se pudo sobrescribir el archivo original.", flush=True)
        return False

def main():
    print("****************************************************************", flush=True)
    print("  OPTIMIZADOR / RECODIFICADOR DE VIDEOS PARA MEDIATEK MT9679   ", flush=True)
    print("  Perfil: H.264 Baseline L3.1 / 720p / ~800k bitrate           ", flush=True)
    print("****************************************************************", flush=True)
    
    all_files = []
    for d in TARGET_DIRS:
        if not os.path.exists(d):
            continue
        for item in sorted(os.listdir(d)):
            full_p = os.path.join(d, item)
            if os.path.isfile(full_p) and item.lower().endswith(".mp4"):
                if "_backup" not in item.lower() and not item.startswith("_"):
                    all_files.append(full_p)
                    
    print(f"\nTotal videos encontrados: {len(all_files)}", flush=True)
    
    threshold_mb = 0
    if len(sys.argv) > 1 and sys.argv[1] == "--only-heavy":
        threshold_mb = 20
        print("Modo: Solo videos pesados (> 20 MB)", flush=True)
    else:
        print("Modo: Todos los videos", flush=True)
        
    ok = 0
    total = 0
    for f in all_files:
        size_mb = os.path.getsize(f) / (1024 * 1024)
        if size_mb >= threshold_mb:
            total += 1
            res = recode_video(f)
            if res:
                ok += 1
                
    print("\n****************************************************************", flush=True)
    print(f"  Finalizado: {ok}/{total} videos recodificados exitosamente", flush=True)
    print("  Los originales intactos están en sus respectivas carpetas '_backup_originales'", flush=True)
    print("****************************************************************\n", flush=True)

if __name__ == "__main__":
    main()
