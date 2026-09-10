# 🇵🇪 Museo Virtual e Interactivo del Ejército del Perú

Suite de aplicaciones web interactivas diseñadas específicamente para terminales y kioscos táctiles de alta definición (Full HD / 4K) en el Museo del Ejército del Perú.

---

## 📱 Pantallas Interactivas del Sistema

El proyecto consta de **4 módulos táctiles independientes** optimizados para interacción táctil fluida, accesibilidad, alto contraste y operación offline:

```
mvp_ejercito/
├── pantalla_1_timeline/       # 01. Línea de Tiempo Histórica Multilingüe
├── pantalla_2_armas/          # 02. Armas y Servicios del Ejército
├── pantalla_3_terrorismo/     # 03. Lucha Contra el Terrorismo y Pacificación
├── pantalla_4_divisiones/     # 04. Divisiones y Jurisdicciones del Perú (Mapa)
└── _legacy_mvp/               # Versión prototipo inicial (referencia)
```

---

### 1️⃣ Pantalla 1: Línea de Tiempo Histórica (`pantalla_1_timeline`)
- **Descripción:** Cronología histórica completa del Ejército del Perú desde sus orígenes hasta la era moderna contemporánea.
- **Características principales:**
  - 🌐 **Soporte Multilingüe:** Español (ES), Inglés (EN) y Quechua (QU).
  - 🔍 **Búsqueda en tiempo real** por personajes, batallas, eventos y lugares.
  - 📅 **Filtros por periodos históricos:** Época Prehispánica, Virreinato e Independencia, República Temprana, Siglo XX y Siglo XXI.
  - 🖼️ **Visor multimedia de alta resolución:** Galería fotográfica con gestos táctiles y ampliación.
  - ⏱️ **Modo Attract:** Salvapantallas interactivo con reinicio automático por inactividad.
  - ♿ **Accesibilidad:** Modo de alto contraste para visibilidad óptima.

---

### 2️⃣ Pantalla 2: Armas y Servicios (`pantalla_2_armas`)
- **Descripción:** Presentación institucional interactiva de las distintas Armas combatientes y Servicios de apoyo del Ejército del Perú.
- **Contenido cubierto:**
  - **Armas:** Infantería, Caballería, Artillería, Ingeniería, Comunicaciones, Inteligencia.
  - **Servicios:** Material de Guerra, Intendencia, Sanidad, Jurídico Militar, Ciencia y Tecnología.
  - 🎖️ **Héroes Patronos:** Historia y legado (Cáceres, Bolognesi, Ugarte, Ruiz Gallo, Olaya, etc.).
  - 📖 **Doctrina, lemas y misiones** de cada arma y servicio.

---

### 3️⃣ Pantalla 3: Lucha Contra el Terrorismo (`pantalla_3_terrorismo`)
- **Descripción:** Módulo histórico dedicado a la Pacificación Nacional y el combate contra las organizaciones terroristas (Sendero Luminoso y MRTA).
- **Características principales:**
  - 🇵🇪 **Operaciones Militares Históricas:** Operación Chavín de Huántar, Plan Victoria, Cerco Ayacucho, operaciones en el VRAEM.
  - 🏅 **Héroes de la Democracia y Pacificación:** Reconocimiento a los comandos y combatientes caídos en acción.
  - 📚 **Archivo fotográfico y documental:** Fotografías restauradas y categorizadas por etapas de la pacificación.

---

### 4️⃣ Pantalla 4: Divisiones y Jurisdicciones (`pantalla_4_divisiones`)
- **Descripción:** Mapa interactivo vectorial de la República del Perú con el despliegue territorial y la estructura orgánica del Ejército.
- **Características principales:**
  - 🗺️ **Mapa interactivo del Perú:** Navegación por departamentos y regiones militares.
  - 🛡️ **Grandes Unidades y Divisiones:**
    - I División de Ejército (Norte - Piura)
    - II División de Ejército (Centro - Lima)
    - III División de Ejército (Sur - Arequipa)
    - IV División de Ejército (VRAEM - Pichari)
    - V División de Ejército (Oriente - Iquitos)
    - Aviación del Ejército del Perú (AE)
  - 📍 Detalle de brigadas, batallones, cuarteles y misiones de desarrollo e integración fronteriza.

---

## 🚀 Requisitos Previos e Instalación

### Requisitos
- **Node.js** 20+ o 22+ (LTS recomendado)
- **npm** 10+
- Navegador moderno (Google Chrome / Microsoft Edge recomendado para modo Kiosko)

### Instalación de dependencias
Para instalar las dependencias de cada pantalla, ingrese al directorio respectivo:

```bash
# Pantalla 1: Timeline
cd pantalla_1_timeline
npm install

# Pantalla 2: Armas y Servicios
cd ../pantalla_2_armas
npm install

# Pantalla 3: Terrorismo
cd ../pantalla_3_terrorismo
npm install

# Pantalla 4: Divisiones
cd ../pantalla_4_divisiones
npm install
```

---

## 💻 Ejecución en Desarrollo

Para ejecutar cualquiera de las pantallas en modo de desarrollo local con recarga en vivo:

```bash
# Iniciar Pantalla 1 (Puerto default: 5173)
cd pantalla_1_timeline
npm run dev

# Iniciar Pantalla 2 (Puerto default: 5174 o dinámico)
cd pantalla_2_armas
npm run dev

# Iniciar Pantalla 3
cd pantalla_3_terrorismo
npm run dev

# Iniciar Pantalla 4
cd pantalla_4_divisiones
npm run dev
```

---

## 🏗️ Compilación para Producción (Build)

Para generar la versión optimizada estática de cada pantalla:

```bash
cd pantalla_1_timeline && npm run build
cd ../pantalla_2_armas && npm run build
cd ../pantalla_3_terrorismo && npm run build
cd ../pantalla_4_divisiones && npm run build
```

Los artefactos listos para servir se generarán en la carpeta `dist/` de cada módulo.

---

## 🖥️ Configuración para Pantallas Táctiles y Modo Kiosko

Para desplegar la aplicación en terminales táctiles de exhibición permanente sin mostrar controles del sistema operativo ni del navegador:

### Parámetros de Google Chrome recomendados:
```bash
chrome.exe --kiosk --edge-touch-filtering=enabled --no-first-run --disable-pinch --overscroll-history-navigation=0 http://localhost:5173
```

- `--kiosk`: Inicia a pantalla completa real y bloquea barras de dirección y botones de navegación.
- `--disable-pinch`: Deshabilita gestos de pellizco/zoom accidentales del usuario.
- `--overscroll-history-navigation=0`: Evita gestos de retroceso/avance por deslizamiento lateral.
- `--edge-touch-filtering=enabled`: Mejora la precisión táctil en los bordes del display.

---

## 🛠️ Tecnologías Utilizadas

- **Framework UI:** [React 18](https://react.dev/)
- **Empaquetador y Dev Server:** [Vite](https://vite.dev/)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Iconografía:** [Lucide React](https://lucide.dev/)
- **Audio & Táctil:** Custom touch event listeners & Web Audio API

---

## 📄 Licencia y Créditos

Desarrollado para el **Ejército del Perú** • Sistema Interactivo de Información y Museo Virtual. Todos los derechos reservados.
