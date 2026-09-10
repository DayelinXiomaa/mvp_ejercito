import os
import sys
import subprocess
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

def process_video(filepath):
    filename = os.path.basename(filepath)
    if "_backup" in filename.lower() or filename.startswith("_") or filename.startswith("."):
        return None
    
    size_mb = os.path.getsize(filepath) / (1024 * 1024)
    print(f"-> {filename} ({size_mb:.1f} MB)...", end=" ", flush=True)
    
    temp_path = os.path.join(os.path.dirname(filepath), "_faststart_" + filename)
    if os.path.exists(temp_path):
        try:
            os.remove(temp_path)
        except Exception:
            pass
            
    cmd = [
        FFMPEG,
        "-nostdin",
        "-y",
        "-i", filepath,
        "-c", "copy",
        "-movflags", "+faststart",
        temp_path
    ]
    
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0 or not os.path.exists(temp_path):
        err_msg = res.stderr[-200:].strip() if res.stderr else "desconocido"
        print(f"[ERROR ffmpeg: {err_msg}]")
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
        return False
        
    time.sleep(0.2)
    success = False
    for attempt in range(6):
        try:
            os.replace(temp_path, filepath)
            success = True
            break
        except Exception as e:
            time.sleep(0.4)
            
    if success:
        print("[OK faststart]")
        return True
    else:
        print("[ERROR al sobrescribir]")
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
        return False

def main():
    print("==================================================")
    print(" Aplicando faststart a los videos de mvp_ejercito ")
    print("==================================================")
    total_processed = 0
    total_ok = 0
    
    for d in TARGET_DIRS:
        if not os.path.exists(d):
            continue
        print(f"\nCarpeta: {d}")
        for item in sorted(os.listdir(d)):
            full_p = os.path.join(d, item)
            if os.path.isfile(full_p) and item.lower().endswith(".mp4"):
                res = process_video(full_p)
                if res is not None:
                    total_processed += 1
                    if res:
                        total_ok += 1
                            
    print("\n==================================================")
    print(f" Resumen: {total_ok}/{total_processed} videos optimizados con faststart")
    print("==================================================")

if __name__ == "__main__":
    main()
