==========================================================================
MAPA TÁCTIL DEL EJÉRCITO DEL PERÚ (MVP OFFLINE) - INSTRUCCIONES DE MONTAJE
==========================================================================

Este proyecto es un Producto Mínimo Viable (MVP) diseñado específicamente para 
pantallas táctiles en terminales de información o kioscos multimedia offline. 
No posee dependencias de internet y es completamente autocontenido.

--------------------------------------------------------------------------
1. ESTRUCTURA DE ARCHIVOS Y MONTAJE DE RECURSOS
--------------------------------------------------------------------------
Para cambiar los placeholders del MVP por los recursos reales, copie y reemplace
los archivos en las siguientes carpetas usando los nombres exactos:

A) MAPA DE FONDO:
   - assets/mapa_peru.jpg             (Mapa del Perú en formato 1:1, ej. 2000x2000px)

B) LOGOTIPOS DE LAS ESCUELAS (Tamaño recomendado: 200x200px con transparencia):
   - assets/logos/infanteria.png      (Logo de la Escuela de Infantería)
   - assets/logos/caballeria.png      (Logo de la Escuela de Caballería)
   - assets/logos/artilleria.png      (Logo de la Escuela de Artillería)
   - assets/logos/ingenieria.png      (Logo de la Escuela de Ingeniería)
   - assets/logos/comunicaciones.png  (Logo de la Escuela de Comunicaciones)

C) FOTOS DE HÉROES (Tamaño recomendado: 300x300px o superior, plano medio/retrato):
   - assets/heroes/caceres.jpg        (Foto del Mariscal Andrés Avelino Cáceres)
   - assets/heroes/ugarte.jpg         (Foto del Coronel Alfonso Ugarte)
   - assets/heroes/bolognesi.jpg      (Foto del Coronel Francisco Bolognesi)
   - assets/heroes/ruiz_gallo.jpg     (Foto del Teniente Coronel Pedro Ruiz Gallo)
   - assets/heroes/olaya.jpg          (Foto de José Olaya Balandra)

D) VIDEOS INSTITUCIONALES Y HOMENAJES (Formato recomendado: MP4, codec H.264, 1080p o 720p):
   - assets/videos/infanteria.mp4
   - assets/videos/caballeria.mp4
   - assets/videos/artilleria.mp4
   - assets/videos/ingenieria.mp4
   - assets/videos/comunicaciones.mp4
   - assets/videos/caceres_homenaje.mp4
   - assets/videos/ugarte_homenaje.mp4
   - assets/videos/bolognesi_homenaje.mp4
   - assets/videos/ruiz_gallo_homenaje.mp4
   - assets/videos/olaya_homenaje.mp4

* NOTA DE FALLBACK: Si algún logo, foto o video no se encuentra en las rutas locales,
  la aplicación cuenta con un sistema de renderizado automático que mostrará 
  iconos e insignias militares vectoriales generados por código, evitando pantallas vacías.

--------------------------------------------------------------------------
2. CÓMO EJECUTAR LOCALMENTE (RESOLVER CORS)
--------------------------------------------------------------------------
Los navegadores modernos bloquean la carga de archivos locales `.json` a través de
protocolo `file://` debido a políticas de seguridad (CORS). Para ejecutar la app
de manera offline en el dispositivo final:

OPCIÓN A: Con Python (Instalado por defecto en la mayoría de sistemas)
   1. Abra la consola o terminal dentro de la carpeta `/mvp_ejercito/`.
   2. Ejecute el siguiente comando:
      python -m http.server 8000
   3. Abra su navegador e ingrese a: http://localhost:8000

OPCIÓN B: Con Node.js (Si está instalado)
   1. Abra la consola en la carpeta del proyecto.
   2. Ejecute:
      npx http-server -p 8000
   3. Abra su navegador e ingrese a: http://localhost:8000

OPCIÓN C: Con la extensión Live Server de VS Code
   1. Abra la carpeta en VS Code.
   2. Haga clic derecho sobre `index.html` y seleccione "Open with Live Server".

--------------------------------------------------------------------------
3. DESPLIEGUE PROFESIONAL EN PANTALLA TÁCTIL (MODO KIOSCO)
--------------------------------------------------------------------------
Para montar la aplicación en una pantalla táctil de exhibición sin que se vea la
interfaz del sistema operativo ni del navegador, y deshabilitando gestos molestos:

1. Asegúrese de que el servidor web local esté corriendo en segundo plano (Puerto 8000).
2. Cree un acceso directo a Google Chrome y en las propiedades del acceso directo,
   añada los siguientes parámetros en el campo de "Destino" (al final de la ruta de chrome.exe):

   --kiosk --edge-touch-filtering=enabled --no-first-run --disable-pinch --overscroll-history-navigation=0 http://localhost:8000

   * Explicación de los parámetros:
     - `--kiosk`: Fuerza la pantalla completa real bloqueando salir (Alt+F4 para cerrar).
     - `--disable-pinch`: Deshabilita el zoom con dos dedos en la pantalla táctil.
     - `--overscroll-history-navigation=0`: Evita que al deslizar el dedo hacia los lados se navegue atrás/adelante en el historial.
     - `--edge-touch-filtering=enabled`: Mejora la precisión de toques en los bordes.

3. Configure Windows para que inicie la aplicación automáticamente al encenderse 
   (añadiendo el servidor y el acceso directo a la carpeta de Inicio de Windows: 
   `shell:startup`).
==========================================================================
