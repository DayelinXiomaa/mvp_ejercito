@echo off
REM ================================================================
REM  FASTSTART: Mover metadatos al inicio de los MP4 (sin recodificar)
REM  Esto permite reproducción instantánea sin descargar todo el archivo.
REM  Ejecución: Abrir CMD en la carpeta del video y ejecutar este .bat
REM  NOTA: Es instantáneo, no modifica la calidad del video.
REM ================================================================

setlocal enabledelayedexpansion

echo.
echo ============================================================
echo   FASTSTART - Optimizacion rapida de videos para MediaTek
echo   (No recodifica, solo reordena metadatos)
echo ============================================================
echo.

set FFMPEG=C:\ffmpeg\bin\ffmpeg.exe
set COUNT=0

REM Crear carpeta temporal
if not exist "_faststart_temp" mkdir "_faststart_temp"

for %%f in (*.mp4) do (
    echo [PROCESANDO] %%f
    "%FFMPEG%" -i "%%f" -c copy -movflags +faststart "_faststart_temp\%%f" -y -loglevel warning
    if !errorlevel! equ 0 (
        echo [OK] %%f - faststart aplicado
        move /y "_faststart_temp\%%f" "%%f" >nul
        set /a COUNT+=1
    ) else (
        echo [ERROR] No se pudo procesar %%f
    )
)

rmdir "_faststart_temp" 2>nul

echo.
echo ============================================================
echo   Completado: %COUNT% videos optimizados con faststart
echo ============================================================
echo.
pause
