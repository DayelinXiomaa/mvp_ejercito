/**
 * ==========================================================================
 * LÓGICA DE INTERACCIÓN TÁCTIL - MAPA DEL EJÉRCITO (MODO OFFLINE)
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- ELEMENTOS DEL DOM ---
  const markersContainer = document.getElementById('markers-container');
  const quickPopup = document.getElementById('quick-popup');
  const popupTitle = document.getElementById('popup-title');
  const popupBtn = document.getElementById('popup-btn');
  
  const detailsModal = document.getElementById('details-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  
  // Modal Content Elements
  const modalSchoolName = document.getElementById('modal-school-name');
  const modalSchoolSede = document.getElementById('modal-school-sede');
  const modalSchoolMision = document.getElementById('modal-school-mision');
  const schoolLogoContainer = document.getElementById('school-logo-container');
  
  // Video Elements
  const mainVideoPlayer = document.getElementById('main-video-player');
  const videoSource = document.getElementById('video-source');
  const videoBadge = document.getElementById('video-badge');
  const videoBadgeText = document.getElementById('video-badge-text');
  const restoreVideoBtn = document.getElementById('restore-video-btn');
  
  // Heroes Container
  const heroesContainer = document.getElementById('heroes-container');

  // --- VARIABLES DE ESTADO ---
  let appData = null;
  let activeSchool = null;

  // --- INICIALIZACIÓN ---
  // Carga el archivo data.json local
  fetch('data.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al cargar data.json. Asegúrese de ejecutar bajo un servidor local.');
      }
      return response.json();
    })
    .then(data => {
      appData = data;
      renderMarkers(data.escuelas);
    })
    .catch(error => {
      console.error(error);
      mostrarErrorCarga();
    });

  // --- COMPORTAMIENTO DEL MAPA Y MARCADORES ---

  /**
   * Dibuja los marcadores absolutos sobre el mapa usando los porcentajes del JSON
   */
  function renderMarkers(escuelas) {
    markersContainer.innerHTML = ''; // Limpia el contenedor
    
    escuelas.forEach(school => {
      // Crear div del marcador
      const marker = document.createElement('div');
      marker.className = 'marker';
      marker.style.left = `${school.x}%`;
      marker.style.top = `${school.y}%`;
      marker.setAttribute('data-id', school.id);
      marker.setAttribute('role', 'button');
      marker.setAttribute('aria-label', school.nombre);

      // Logotipo interior o fallback SVG
      const img = document.createElement('img');
      img.src = school.logo;
      img.alt = `Logo ${school.nombre}`;
      img.className = 'marker-icon';
      
      // Fallback si la imagen no existe localmente
      img.onerror = () => {
        img.style.display = 'none';
        const fallbackSvg = createCrestFallback(school.nombre);
        marker.appendChild(fallbackSvg);
      };

      marker.appendChild(img);

      // Eventos Táctiles y de Click
      const handleTrigger = (e) => {
        e.stopPropagation();
        selectMarker(school, marker);
      };

      marker.addEventListener('click', handleTrigger);
      marker.addEventListener('touchstart', handleTrigger, { passive: true });

      markersContainer.appendChild(marker);
    });
  }

  /**
   * Resalta un marcador y abre el popup rápido táctico
   */
  function selectMarker(school, markerElement) {
    // Quitar clase activa de otros marcadores
    document.querySelectorAll('.marker').forEach(m => m.classList.remove('active'));
    markerElement.classList.add('active');

    activeSchool = school;

    // Configurar información del popup
    popupTitle.textContent = school.nombre;
    
    // Posicionar el popup exactamente encima del marcador usando porcentajes
    quickPopup.style.left = `${school.x}%`;
    quickPopup.style.top = `${school.y}%`;
    
    // Mostrar popup
    quickPopup.classList.remove('hidden');
  }

  // Cerrar popup al tocar fuera en el mapa
  document.addEventListener('click', (e) => {
    if (!quickPopup.contains(e.target) && !e.target.closest('.marker')) {
      closeQuickPopup();
    }
  });

  document.addEventListener('touchstart', (e) => {
    if (!quickPopup.contains(e.target) && !e.target.closest('.marker')) {
      closeQuickPopup();
    }
  }, { passive: true });

  function closeQuickPopup() {
    quickPopup.classList.add('hidden');
    document.querySelectorAll('.marker').forEach(m => m.classList.remove('active'));
  }

  // --- APERTURA Y GESTIÓN DE MODALES ---

  // Botón Ver Detalles en el Popup
  const openDetails = () => {
    if (activeSchool) {
      openModal(activeSchool);
      closeQuickPopup();
    }
  };
  popupBtn.addEventListener('click', openDetails);
  popupBtn.addEventListener('touchstart', openDetails, { passive: true });

  /**
   * Llena de datos y abre el modal de detalles de la escuela
   */
  function openModal(school) {
    // Configura Textos
    modalSchoolName.textContent = school.nombre;
    modalSchoolSede.textContent = `Sede: ${school.sede}`;
    modalSchoolMision.textContent = school.mision;

    // Carga de Logotipo con fallback
    schoolLogoContainer.innerHTML = '';
    const logoImg = document.createElement('img');
    logoImg.src = school.logo;
    logoImg.className = 'school-logo-img';
    logoImg.alt = `Escudo de la ${school.nombre}`;
    logoImg.onerror = () => {
      logoImg.style.display = 'none';
      const fallbackSvg = createCrestFallback(school.nombre);
      schoolLogoContainer.appendChild(fallbackSvg);
    };
    schoolLogoContainer.appendChild(logoImg);

    // Carga de Video de Escuela
    setVideoPlayer(school.video_escuela, 'Escuela');

    // Carga de Héroes
    renderHeroes(school.heroes_ids);

    // Mostrar modal
    detailsModal.classList.remove('hidden');
  }

  /**
   * Cierra el modal y limpia reproducción de videos
   */
  function closeModal() {
    detailsModal.classList.add('hidden');
    // Detiene el video para que no siga sonando de fondo
    mainVideoPlayer.pause();
    mainVideoPlayer.src = '';
    videoSource.src = '';
    videoBadge.classList.add('hidden');
    restoreVideoBtn.classList.add('hidden');
  }

  closeModalBtn.addEventListener('click', closeModal);
  closeModalBtn.addEventListener('touchstart', closeModal, { passive: true });

  // Cerrar modal tocando el fondo oscuro exterior
  detailsModal.addEventListener('click', (e) => {
    if (e.target === detailsModal) {
      closeModal();
    }
  });

  // --- REPRODUCTOR DE VIDEO ---

  /**
   * Configura el reproductor de video con la ruta local y maneja fallos de carga
   */
  function setVideoPlayer(src, type, name = '') {
    mainVideoPlayer.pause();
    
    // Quita avisos previos de error
    const oldError = document.getElementById('video-error-overlay');
    if (oldError) oldError.remove();

    videoSource.src = src;
    mainVideoPlayer.src = src; // Necesario para forzar la recarga en algunos navegadores
    mainVideoPlayer.load();

    // Actualiza la etiqueta del video
    if (type === 'Homenaje') {
      videoBadgeText.textContent = `Homenaje: ${name}`;
      videoBadge.classList.remove('hidden');
      restoreVideoBtn.classList.remove('hidden');
      mainVideoPlayer.play().catch(() => {
        console.log("Auto-play prevenido por el navegador. El usuario puede tocar Play.");
      });
    } else {
      videoBadge.classList.add('hidden');
      restoreVideoBtn.classList.add('hidden');
    }
  }

  // Si el video de homenaje termina, vuelve al video principal de la escuela
  mainVideoPlayer.addEventListener('ended', () => {
    if (restoreVideoBtn.classList.contains('hidden') === false) {
      restoreDefaultSchoolVideo();
    }
  });

  // Manejo de error cuando el video local (.mp4) no existe físicamente
  mainVideoPlayer.addEventListener('error', () => {
    // Evita duplicar el cartel
    if (document.getElementById('video-error-overlay')) return;

    const errorOverlay = document.createElement('div');
    errorOverlay.id = 'video-error-overlay';
    errorOverlay.style.position = 'absolute';
    errorOverlay.style.top = '0';
    errorOverlay.style.left = '0';
    errorOverlay.style.width = '100%';
    errorOverlay.style.height = '100%';
    errorOverlay.style.backgroundColor = 'rgba(10, 20, 12, 0.95)';
    errorOverlay.style.border = '2px dashed var(--color-gold)';
    errorOverlay.style.borderRadius = '12px';
    errorOverlay.style.display = 'flex';
    errorOverlay.style.flexDirection = 'column';
    errorOverlay.style.alignItems = 'center';
    errorOverlay.style.justifyContent = 'center';
    errorOverlay.style.padding = '20px';
    errorOverlay.style.textAlign = 'center';
    errorOverlay.style.zIndex = '5';

    errorOverlay.innerHTML = `
      <svg viewBox="0 0 24 24" width="48" height="48" stroke="var(--color-gold)" stroke-width="2" fill="none" style="margin-bottom: 12px;">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <line x1="12" y1="2" x2="12" y2="22"/>
      </svg>
      <h4 style="color: var(--color-gold-light); font-size: 15px; margin-bottom: 6px; text-transform: uppercase;">Video Offline no Detectado</h4>
      <p style="color: var(--color-text-muted); font-size: 12px; line-height: 1.4;">
        Ruta requerida:<br><code style="background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 4px; color: #fff;">${videoSource.getAttribute('src')}</code>
      </p>
    `;

    mainVideoPlayer.parentNode.appendChild(errorOverlay);
  });

  // Restaurar video principal
  const restoreDefaultSchoolVideo = () => {
    if (activeSchool) {
      setVideoPlayer(activeSchool.video_escuela, 'Escuela');
    }
  };
  restoreVideoBtn.addEventListener('click', restoreDefaultSchoolVideo);
  restoreVideoBtn.addEventListener('touchstart', restoreDefaultSchoolVideo, { passive: true });


  // --- GESTIÓN DE HÉROES ---

  /**
   * Renderiza los héroes relacionados con la escuela
   */
  function renderHeroes(heroesIds) {
    heroesContainer.innerHTML = '';

    if (!appData || !appData.heroes) return;

    // Buscar los objetos héroe correspondientes
    const relatedHeroes = appData.heroes.filter(h => heroesIds.includes(h.id));

    relatedHeroes.forEach(hero => {
      const card = document.createElement('div');
      card.className = 'hero-card';

      // Estructura de imagen con cargador y fallback
      const photoContainer = document.createElement('div');
      photoContainer.className = 'hero-photo-container';

      const img = document.createElement('img');
      img.src = hero.foto;
      img.alt = hero.nombre;
      img.className = 'hero-photo';
      img.onerror = () => {
        img.style.display = 'none';
        const fallbackAvatar = createAvatarFallback(hero.nombre);
        photoContainer.appendChild(fallbackAvatar);
      };
      photoContainer.appendChild(img);

      // Información de texto
      const info = document.createElement('div');
      info.className = 'hero-info';
      info.innerHTML = `
        <h4 class="hero-name">${hero.nombre}</h4>
        <p class="hero-resena">${hero.resena}</p>
      `;

      // Botón homenaje
      const tributeBtn = document.createElement('button');
      tributeBtn.className = 'tactical-btn-outline';
      tributeBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--color-gold)" stroke="var(--color-gold)" stroke-width="1">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        Video Homenaje
      `;

      const playTribute = (e) => {
        e.stopPropagation();
        setVideoPlayer(hero.video_homenaje, 'Homenaje', hero.nombre);
      };

      tributeBtn.addEventListener('click', playTribute);
      tributeBtn.addEventListener('touchstart', playTribute, { passive: true });

      card.appendChild(photoContainer);
      card.appendChild(info);
      card.appendChild(tributeBtn);

      heroesContainer.appendChild(card);
    });
  }

  // --- MÉTODOS DE FALLBACK GRÁFICO (PARA OFFLINE TOTAL) ---

  /**
   * Crea un escudo o logotipo SVG dinámico si el archivo .png no existe
   */
  function createCrestFallback(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('class', 'marker-svg-fallback');
    
    // Tomar la primera letra del nombre de la escuela
    const initial = name.replace("Escuela de ", "").charAt(0).toUpperCase();

    svg.innerHTML = `
      <polygon points="50,5 90,25 90,70 50,95 10,70 10,25" fill="rgba(20, 35, 23, 0.9)" stroke="var(--color-gold)" stroke-width="4"/>
      <text x="50" y="60" font-family="monospace, sans-serif" font-weight="900" font-size="34" fill="var(--color-gold)" text-anchor="middle" dominant-baseline="middle">${initial}</text>
    `;
    return svg;
  }

  /**
   * Crea un retrato SVG de militar si el archivo de foto no existe
   */
  function createAvatarFallback(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.backgroundColor = 'var(--color-olive-darkest)';
    
    // Dibujo de silueta de militar con gorra militar
    svg.innerHTML = `
      <!-- Gorra Militar / Képis -->
      <path d="M25,28 C25,28 50,15 75,28 L78,35 L22,35 Z" fill="var(--color-olive-light)" stroke="var(--color-gold)" stroke-width="1.5"/>
      <rect x="25" y="32" width="50" height="4" fill="var(--color-gold)"/>
      <!-- Rostro -->
      <circle cx="50" cy="50" r="18" fill="var(--color-text-muted)"/>
      <!-- Hombros y Uniforme -->
      <path d="M20,85 C20,70 35,68 50,68 C65,68 80,70 80,85 Z" fill="var(--color-olive-med)" stroke="var(--color-gold)" stroke-width="1"/>
      <!-- Charreteras doradas -->
      <rect x="22" y="70" width="12" height="4" fill="var(--color-gold)"/>
      <rect x="66" y="70" width="12" height="4" fill="var(--color-gold)"/>
    `;
    return svg;
  }

  /**
   * Muestra un aviso en pantalla si el archivo data.json falla al cargarse
   */
  function mostrarErrorCarga() {
    const errDiv = document.createElement('div');
    errDiv.style.position = 'fixed';
    errDiv.style.top = '0';
    errDiv.style.left = '0';
    errDiv.style.width = '100vw';
    errDiv.style.height = '100vh';
    errDiv.style.background = 'rgba(10, 15, 10, 0.95)';
    errDiv.style.zIndex = '9999';
    errDiv.style.display = 'flex';
    errDiv.style.flexDirection = 'column';
    errDiv.style.alignItems = 'center';
    errDiv.style.justifyContent = 'center';
    errDiv.style.padding = '30px';
    errDiv.style.textAlign = 'center';

    errDiv.innerHTML = `
      <div style="border: 2px solid var(--color-gold); background: var(--color-olive-darkest); padding: 40px; border-radius: 20px; max-width: 600px; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
        <svg viewBox="0 0 24 24" width="60" height="60" stroke="var(--color-red)" stroke-width="2" fill="none" style="margin-bottom: 20px;">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <h2 style="color: var(--color-gold); text-transform: uppercase; margin-bottom: 15px; font-size: 22px;">Error de Ejecución Local</h2>
        <p style="color: var(--color-text-light); font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
          Para que la aplicación pueda cargar los datos desde <code style="background: rgba(255,255,255,0.08); padding: 3px 6px; border-radius: 4px;">data.json</code> de manera offline, el navegador requiere ejecutarse bajo un servidor web local (debido a la política de CORS en el protocolo <code style="color:var(--color-gold-light)">file://</code>).
        </p>
        <div style="text-align: left; background: rgba(0,0,0,0.3); padding: 15px 20px; border-left: 4px solid var(--color-gold); border-radius: 4px; font-size: 13px; line-height: 1.5; color: var(--color-text-muted);">
          <strong>¿Cómo solucionarlo?</strong><br>
          1. Abra la consola en la carpeta del proyecto.<br>
          2. Ejecute un servidor rápido de Python: <code style="color: #fff; background: #000; padding: 1px 5px; border-radius: 2px;">python -m http.server 8080</code><br>
          3. Acceda en su navegador a: <a href="http://localhost:8080" style="color: var(--color-gold-light); text-decoration: underline;">http://localhost:8080</a>
        </div>
      </div>
    `;
    document.body.appendChild(errDiv);
  }
});
