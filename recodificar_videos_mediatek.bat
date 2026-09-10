@echo off
REM ================================================================
REM  RECODIFICAR VIDEOS PARA MEDIATEK MT9679
REM  
REM  Perfil: H.264 Baseline Level 3.1 (maxima compatibilidad HW decoder)
REM  Resolucion: max 720p (suficiente para kiosko tactil)
REM  Bitrate: max 800 Kbps video + 96 Kbps audio = ~900 Kbps total
REM  Esto permite streaming fluido incluso con WiFi de 2-3 Mbps
REM  
REM  USO: Copiar este .bat a la carpeta con los .mp4 y ejecutar.
REM       Los originales se guardan en _backup_originales/
REM       Los optimizados reemplazan los archivos originales.
REM ================================================================

setlocal enabledelayedexpansion

echo.
echo ============================================================
echo   RECODIFICADOR DE VIDEOS PARA MEDIATEK
echo   Perfil: H.264 Baseline L3.1 / 720p / 800Kbps max
echo ============================================================
echo.

set FFMPEG=C:\ffmpeg\bin\ffmpeg.exe
set COUNT=0
set ERRORS=0

REM Verificar que ffmpeg existe
if not exist "%FFMPEG%" (
    echo [ERROR] No se encontro ffmpeg en %FFMPEG%
    echo         Instale ffmpeg o ajuste la ruta en este script.
    pause
    exit /b 1
)

REM Crear carpeta de backups
if not exist "_backup_originales" mkdir "_backup_originales"
if not exist "_temp_recodificados" mkdir "_temp_recodificados"

echo.
echo Escaneando archivos MP4...
echo.

for %%f in (*.mp4) do (
    REM Saltar archivos que ya son backup
    echo %%f | findstr /i "_backup" >nul
    if !errorlevel! neq 0 (
        echo ────────────────────────────────────────
        echo [PROCESANDO] %%f
        echo.
        
        REM Recodificar con perfil optimizado para MediaTek
        "%FFMPEG%" -i "%%f" ^
            -c:v libx264 ^
            -profile:v baseline ^
            -level:v 3.1 ^
            -preset slow ^
            -crf 26 ^
            -maxrate 800k ^
            -bufsize 1200k ^
            -vf "scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease,pad=ceil(iw/2)*2:ceil(ih/2)*2" ^
            -pix_fmt yuv420p ^
            -movflags +faststart ^
            -c:a aac ^
            -b:a 96k ^
            -ar 44100 ^
            -ac 2 ^
            -y "_temp_recodificados\%%f" ^
            -loglevel warning -stats
        
        if !errorlevel! equ 0 (
            echo.
            
            REM Mostrar comparacion de tamano
            for %%o in ("%%f") do set ORIG_SIZE=%%~zo
            for %%n in ("_temp_recodificados\%%f") do set NEW_SIZE=%%~zn
            
            echo [OK] Original: !ORIG_SIZE! bytes
            echo [OK] Optimizado: !NEW_SIZE! bytes
            
            REM Mover original a backup y reemplazar
            copy /y "%%f" "_backup_originales\%%f" >nul
            move /y "_temp_recodificados\%%f" "%%f" >nul
            
            set /a COUNT+=1
        ) else (
            echo [ERROR] Fallo al recodificar %%f
            set /a ERRORS+=1
        )
        echo.
    )
)

rmdir "_temp_recodificados" 2>nul

echo.
echo ============================================================
echo   RESULTADO
echo   Videos recodificados: %COUNT%
echo   Errores: %ERRORS%
echo   Backups guardados en: _backup_originales\
echo ============================================================
echo.
echo Los videos originales estan respaldados en _backup_originales\
echo Si algo salio mal, puede restaurarlos desde esa carpeta.
echo.
pause
