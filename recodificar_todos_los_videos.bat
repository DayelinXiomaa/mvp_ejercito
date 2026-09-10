@echo off
title Recodificador de Videos para Kiosko MediaTek
echo ================================================================
echo  RECODIFICADOR DE VIDEOS PARA PANTALLAS TACTILES MEDIATEK
echo ================================================================
echo.
echo Seleccione una opcion:
echo  [1] Recodificar SOLO videos pesados (mas de 20 MB - Recomendado)
echo  [2] Recodificar TODOS los videos de mvp_ejercito
echo  [3] Solo aplicar faststart (sin recodificar)
echo  [4] Salir
echo.
set /p OPCION="Ingrese opcion (1-4): "

if "%OPCION%"=="1" (
    python recodificar_videos.py --only-heavy
)
if "%OPCION%"=="2" (
    python recodificar_videos.py
)
if "%OPCION%"=="3" (
    python faststart_all.py
)
if "%OPCION%"=="4" (
    exit /b 0
)

echo.
pause
