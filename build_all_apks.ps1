# Script para compilar los 4 APKs de las pantallas del Ejército del Perú
$ErrorActionPreference = "Stop"

$baseDir = $PSScriptRoot
$apksDir = Join-Path $baseDir "apks"
if (!(Test-Path $apksDir)) {
    New-Item -ItemType Directory -Path $apksDir -Force | Out-Null
}

# Configurar variables de entorno para compilación Android
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "C:\Users\coord\AppData\Local\Android\Sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

$screens = @(
    @{ Name = "pantalla_1_timeline"; Apk = "pantalla_1_timeline.apk" },
    @{ Name = "pantalla_2_armas"; Apk = "pantalla_2_armas.apk" },
    @{ Name = "pantalla_3_terrorismo"; Apk = "pantalla_3_terrorismo.apk" },
    @{ Name = "pantalla_4_divisiones"; Apk = "pantalla_4_divisiones.apk" }
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host " INICIANDO COMPILACIÓN DE 4 APKS CON CAPACITOR " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

foreach ($screen in $screens) {
    $screenDir = Join-Path $baseDir $screen.Name
    $androidDir = Join-Path $screenDir "android"
    $targetApk = Join-Path $apksDir $screen.Apk

    Write-Host "`n>>> [1/3] Compilando Web en $($screen.Name)..." -ForegroundColor Yellow
    npm run build --prefix $screenDir

    Write-Host ">>> [2/3] Sincronizando Capacitor en $($screen.Name)..." -ForegroundColor Yellow
    cmd.exe /c "cd $screenDir && npx cap sync"

    Write-Host ">>> [3/3] Generando APK en $($screen.Name)..." -ForegroundColor Yellow
    cmd.exe /c "cd $androidDir && gradlew.bat assembleDebug"

    $builtApk = Join-Path $androidDir "app\build\outputs\apk\debug\app-debug.apk"
    if (Test-Path $builtApk) {
        Copy-Item -Force $builtApk $targetApk
        $sizeMB = [math]::round((Get-Item $targetApk).Length / 1MB, 2)
        Write-Host "✔ APK generado con éxito: $($screen.Apk) ($sizeMB MB)" -ForegroundColor Green
    } else {
        Write-Host "❌ Error: No se encontró el APK generado en $builtApk" -ForegroundColor Red
    }
}

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host " COMPILACIÓN COMPLETADA - APKS EN: $apksDir " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Get-ChildItem -Path $apksDir -Filter "*.apk" | Select-Object Name, @{Name="Tamanio_MB";Expression={[math]::round($_.Length/1MB, 2)}}, LastWriteTime | Format-Table -AutoSize
