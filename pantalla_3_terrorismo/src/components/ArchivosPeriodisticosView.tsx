import React, { useState, useMemo } from 'react';
import { useTerrorismo } from '../context/TerrorismoContext';
import { useI18n } from '../context/I18nContext';
import {
  ArrowLeft,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Newspaper
} from 'lucide-react';

export const ArchivosPeriodisticosView: React.FC = () => {
  const {
    archivosPeriodisticos,
    setCurrentSection,
    selectedArchivoPeriodistico,
    setSelectedArchivoPeriodistico
  } = useTerrorismo();
  const { t, language } = useI18n();

  const [search, setSearch] = useState('');
  const [activeCollection, setActiveCollection] = useState<'TODOS' | 'ARCHIVOS' | 'PRENSA'>('TODOS');

  const getTitulo = (item: (typeof archivosPeriodisticos)[0] | null | undefined): string => {
    if (!item) return '';
    if (item.language && item.language[language]?.titulo) return item.language[language]!.titulo!;
    if (item.titulos && item.titulos[language]) return item.titulos[language];
    if (item.title && item.title[language]) return item.title[language];
    return item.titulo;
  };

  const getColeccionBadge = (item: (typeof archivosPeriodisticos)[0] | null | undefined): string => {
    if (!item) return '';
    const isTerrorismo = item.coleccion.includes('Terrorismo');
    if (language === 'en') {
      return isTerrorismo ? 'Archive' : 'Press';
    }
    if (language === 'qu') {
      return isTerrorismo ? 'Panqa' : 'Willakuy';
    }
    return isTerrorismo ? 'Archivo' : 'Prensa';
  };

  // Filter items
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (archivosPeriodisticos || []).filter((item) => {
      // Collection filter
      if (activeCollection === 'ARCHIVOS' && !item.coleccion.includes('Terrorismo')) return false;
      if (activeCollection === 'PRENSA' && !item.coleccion.includes('Prensa')) return false;

      if (!q) return true;
      const localizedTitle = getTitulo(item).toLowerCase();
      const spanishTitle = (item.titulo || '').toLowerCase();
      return (
        localizedTitle.includes(q) ||
        spanishTitle.includes(q) ||
        item.descripcion.toLowerCase().includes(q) ||
        `#${item.numero}`.includes(q)
      );
    });
  }, [archivosPeriodisticos, search, activeCollection, language]);

  // Zoom & Pan state
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Refs for tracking gestures
  const isPinchingRef = React.useRef<boolean>(false);
  const startPinchDistRef = React.useRef<number>(0);
  const startScaleRef = React.useRef<number>(1);
  const isPanningRef = React.useRef<boolean>(false);
  const startPanRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartXRef = React.useRef<number | null>(null);
  const touchStartYRef = React.useRef<number | null>(null);
  const lastTapTimeRef = React.useRef<number>(0);

  // Navigate in modal and reset zoom
  const handleNavigateModal = (direction: 'prev' | 'next') => {
    if (!selectedArchivoPeriodistico || !filteredItems.length) return;
    setScale(1);
    setPosition({ x: 0, y: 0 });
    const currentIndex = filteredItems.findIndex((x) => x.id === selectedArchivoPeriodistico.id);
    if (currentIndex === -1) return;

    if (direction === 'next') {
      const nextIndex = (currentIndex + 1) % filteredItems.length;
      setSelectedArchivoPeriodistico(filteredItems[nextIndex]);
    } else {
      const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
      setSelectedArchivoPeriodistico(filteredItems[prevIndex]);
    }
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(Number((prev + 0.3).toFixed(2)), 4));
  };

  const zoomOut = () => {
    setScale((prev) => {
      const next = Math.max(Number((prev - 0.3).toFixed(2)), 0.5);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  // Touch Start: maneja 1 dedo (swipe / pan) y 2 dedos (pinch-to-zoom)
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // 2 dedos: pellizcar para zoom
      isPinchingRef.current = true;
      isPanningRef.current = false;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      startPinchDistRef.current = dist;
      startScaleRef.current = scale;
    } else if (e.touches.length === 1) {
      isPinchingRef.current = false;
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;

      if (scale > 1) {
        // Arrastrar para mover la imagen si tiene zoom
        isPanningRef.current = true;
        startPanRef.current = {
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y
        };
      } else {
        isPanningRef.current = false;
      }
    }
  };

  // Touch Move: actualización dinámica en tiempo real
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && isPinchingRef.current && startPinchDistRef.current > 0) {
      // Zoom dinámico con dos dedos
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / startPinchDistRef.current;
      const nextScale = Math.min(Math.max(startScaleRef.current * factor, 1), 4);
      setScale(nextScale);
      if (nextScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && isPanningRef.current && scale > 1) {
      // Desplazamiento panorámico de la foto ampliada
      const nextX = e.touches[0].clientX - startPanRef.current.x;
      const nextY = e.touches[0].clientY - startPanRef.current.y;
      setPosition({ x: nextX, y: nextY });
    }
  };

  // Touch End: detecta doble toque o swipe horizontal
  const onTouchEnd = (e: React.TouchEvent) => {
    if (isPinchingRef.current) {
      if (e.touches.length < 2) {
        isPinchingRef.current = false;
        if (scale < 1.05) {
          resetZoom();
        }
      }
      return;
    }

    // Doble toque táctil (acercar / restablecer)
    const now = Date.now();
    if (now - lastTapTimeRef.current < 300) {
      if (scale > 1) {
        resetZoom();
      } else {
        setScale(2.5);
      }
      lastTapTimeRef.current = 0;
      return;
    }
    lastTapTimeRef.current = now;

    // Deslizar con 1 dedo cuando no hay zoom activo
    if (scale <= 1.05 && touchStartXRef.current !== null && e.changedTouches.length > 0) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchStartXRef.current - touchEndX;
      const diffY = (touchStartYRef.current || 0) - touchEndY;

      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
          handleNavigateModal('next'); // Izquierda -> Siguiente foto
        } else {
          handleNavigateModal('prev'); // Derecha -> Foto anterior
        }
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
    isPanningRef.current = false;
  };

  // Mouse drag handlers for desktop
  const isMouseDownRef = React.useRef<boolean>(false);
  const mouseStartXRef = React.useRef<number>(0);
  const mouseStartYRef = React.useRef<number>(0);
  const mouseStartPanRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    isMouseDownRef.current = true;
    mouseStartXRef.current = e.clientX;
    mouseStartYRef.current = e.clientY;
    mouseStartPanRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    if (scale > 1) {
      setPosition({
        x: e.clientX - mouseStartPanRef.current.x,
        y: e.clientY - mouseStartPanRef.current.y
      });
    }
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    if (scale <= 1.05) {
      const diffX = mouseStartXRef.current - e.clientX;
      if (Math.abs(diffX) > 50) {
        if (diffX > 0) handleNavigateModal('next');
        else handleNavigateModal('prev');
      }
    }
  };

  // Zoom con rueda de ratón o trackpad
  const onWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const factor = e.deltaY < 0 ? 1.15 : 0.85;
    setScale((prev) => {
      const next = Math.min(Math.max(prev * factor, 1), 4);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  // Soporte de teclado (flechas y escape)
  React.useEffect(() => {
    if (!selectedArchivoPeriodistico) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNavigateModal('next');
      if (e.key === 'ArrowLeft') handleNavigateModal('prev');
      if (e.key === 'Escape') setSelectedArchivoPeriodistico(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedArchivoPeriodistico, filteredItems]);

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 md:p-6 lg:p-8 select-none animate-fade-in overflow-hidden">
      {/* ================= HEADER BAR ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-amber-500/20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentSection('HUB')}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/90 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-slate-950 font-black text-xs transition-all shadow-lg touch-active"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.btn_back || 'Volver al Menú'}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-300 shadow">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-white leading-tight">
                {t.press_header_title || 'Archivos Periodísticos y Hemeroteca Histórica'}
              </h2>
              <span className="text-[10px] font-bold text-amber-400/90 uppercase tracking-wider">
                {filteredItems.length}{' '}
                {t.press_count_badge || (language === 'en' ? 'clippings and front pages' : language === 'qu' ? 'panqakuna qhawasqa' : 'recortes y portadas documentadas')}
              </span>
            </div>
          </div>
        </div>

        {/* Controles de Búsqueda y Filtros de Colección */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveCollection('TODOS')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                activeCollection === 'TODOS'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {(t.press_tab_all || (language === 'en' ? 'All' : language === 'qu' ? 'Tukuy' : 'Todos')) + ` (${archivosPeriodisticos?.length || 0})`}
            </button>
            <button
              onClick={() => setActiveCollection('ARCHIVOS')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                activeCollection === 'ARCHIVOS'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.press_tab_archives || (language === 'en' ? 'Terrorism Dossiers' : language === 'qu' ? 'Terrorismo Panqakuna' : 'Archivos Terrorismo')}
            </button>
            <button
              onClick={() => setActiveCollection('PRENSA')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                activeCollection === 'PRENSA'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.press_tab_press || (language === 'en' ? 'National Press' : language === 'qu' ? 'Mamallakta Willakuy' : 'Prensa Nacional')}
            </button>
          </div>

          <div className="relative w-48 sm:w-64">
            <Search className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.press_search_placeholder || 'Buscar titular, hecho...'}
              className="w-full bg-slate-900/90 border border-amber-500/30 rounded-2xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 shadow-inner"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= GRID DE CARDS MINIATURA ================= */}
      <div className="flex-1 min-h-0 overflow-y-auto kiosk-scroll pt-4 pb-6">
        {filteredItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <Newspaper className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-base font-bold text-slate-400">
              {t.press_empty_text || (language === 'en'
                ? 'No newspaper records found matching your search.'
                : 'No se encontraron recortes que coincidan con la búsqueda.')}
            </p>
            <button
              onClick={() => {
                setSearch('');
                setActiveCollection('TODOS');
              }}
              className="mt-3 px-4 py-2 rounded-xl bg-slate-800 text-amber-300 text-xs font-bold hover:bg-slate-700"
            >
              {t.press_clear_filters || (language === 'en' ? 'Clear Filters' : 'Limpiar Filtros')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedArchivoPeriodistico(item)}
                className="group relative bg-slate-900/90 hover:bg-slate-850 border border-amber-500/25 hover:border-amber-400 rounded-2xl p-2 flex flex-col justify-between shadow-lg hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-all cursor-pointer overflow-hidden touch-active hover:scale-[1.03]"
              >
                {/* Badge con Número */}
                <div className="flex items-center justify-between gap-1 mb-1.5 px-0.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-950/80 border border-amber-500/30 px-2 py-0.5 rounded-md">
                    #{item.numero}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 truncate max-w-[110px]">
                    {getColeccionBadge(item)}
                  </span>
                </div>

                {/* Miniatura de la Portada/Recorte */}
                <div className="relative w-full aspect-[3/4] bg-black/95 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center group-hover:border-amber-500/60 transition-colors p-1">
                  <img
                    src={item.imagen}
                    alt={getTitulo(item)}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[11px] font-black text-amber-300 bg-black/80 px-3 py-1 rounded-full border border-amber-500/50 flex items-center gap-1.5 shadow-lg">
                      <ZoomIn className="w-3.5 h-3.5" />
                      {t.press_fullscreen_badge || (language === 'en' ? 'Fullscreen' : language === 'qu' ? "Hunt'asqa Pantalla" : 'Pantalla Completa')}
                    </span>
                  </div>
                </div>

                {/* Título Oficial del Archivo Periodístico */}
                <div className="mt-2 px-1 pb-0.5">
                  <h4
                    className="text-[11px] font-black text-slate-200 line-clamp-2 leading-tight group-hover:text-amber-300 transition-colors uppercase tracking-tight"
                    title={getTitulo(item)}
                  >
                    {getTitulo(item)}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= VISOR A PANTALLA COMPLETA PARA TELEVISOR TÁCTIL (80") ================= */}
      {selectedArchivoPeriodistico && (
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onWheel={onWheel}
          className="fixed inset-0 z-50 w-screen h-screen bg-black/95 backdrop-blur-2xl flex items-center justify-center overflow-hidden select-none animate-fade-in"
        >
          {/* Barra Superior Flotante Fija */}
          <div className="fixed top-4 md:top-6 left-6 right-6 z-50 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-3 pointer-events-auto max-w-[80vw]">
              <span className="text-xs md:text-sm font-black text-amber-400 uppercase tracking-widest bg-slate-900/95 px-5 py-2.5 rounded-2xl border-2 border-amber-500/50 shadow-2xl backdrop-blur-md flex items-center gap-2.5 truncate">
                <span className="text-amber-300 bg-amber-950/90 px-2 py-0.5 rounded-md border border-amber-500/40 flex-shrink-0">
                  #{selectedArchivoPeriodistico.numero}
                </span>
                <span className="truncate text-white font-bold">{getTitulo(selectedArchivoPeriodistico)}</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-amber-300 bg-slate-900/90 px-4 py-2 rounded-2xl border border-amber-500/40 shadow-lg backdrop-blur-md flex-shrink-0">
                <span>{scale === 1 ? (t.press_fit_page || 'Ajuste a Página (100%)') : `${t.press_zoom || 'Zoom:'} ${(scale * 100).toFixed(0)}%`}</span>
                <span className="text-slate-400">{t.press_double_tap || '• Doble toque para ampliar'}</span>
              </span>
            </div>

            <button
              onClick={() => setSelectedArchivoPeriodistico(null)}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-slate-900/90 hover:bg-red-600 text-white border-2 border-slate-700 hover:border-red-500 flex items-center justify-center shadow-2xl transition-all touch-active cursor-pointer pointer-events-auto backdrop-blur-md"
              title={t.close || 'Cerrar'}
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          {/* Controles Flotantes de Zoom para Pantalla Táctil (80") */}
          <div className="fixed top-24 md:top-28 right-6 z-50 flex flex-col items-center gap-2.5 pointer-events-auto bg-slate-900/95 p-2.5 rounded-3xl border-2 border-amber-500/50 shadow-2xl backdrop-blur-md">
            {/* Botón Zoom In (+) */}
            <button
              onClick={zoomIn}
              disabled={scale >= 4}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all touch-active cursor-pointer ${
                scale < 4
                  ? 'bg-slate-800 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 hover:scale-105 shadow-lg'
                  : 'bg-slate-900/50 text-slate-600 border border-slate-800 cursor-not-allowed'
              }`}
              title={t.press_btn_zoom_in || 'Acercar (Zoom In +)'}
            >
              <ZoomIn className="w-6 h-6 md:w-7 md:h-7" />
            </button>

            {/* Botón Zoom Out (-) */}
            <button
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all touch-active cursor-pointer ${
                scale > 0.5
                  ? 'bg-slate-800 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 hover:scale-105 shadow-lg'
                  : 'bg-slate-900/50 text-slate-600 border border-slate-800 cursor-not-allowed'
              }`}
              title={t.press_btn_zoom_out || 'Alejar (Zoom Out -)'}
            >
              <ZoomOut className="w-6 h-6 md:w-7 md:h-7" />
            </button>

            {/* Botón Fit to Page / Ajustar a Pantalla */}
            <button
              onClick={resetZoom}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex flex-col items-center justify-center transition-all touch-active cursor-pointer ${
                scale === 1 && position.x === 0 && position.y === 0
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg'
                  : 'bg-slate-800 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40'
              }`}
              title={t.press_btn_fit || 'Ajustar a Página (Fit to Page - 100%)'}
            >
              <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-[8px] font-black uppercase mt-0.5 tracking-tighter">{t.press_adjust_label || 'Ajustar'}</span>
            </button>

            {/* Indicador de porcentaje */}
            <div className="text-[10px] font-black text-amber-400 py-0.5 text-center select-none">
              {(scale * 100).toFixed(0)}%
            </div>
          </div>

          {/* Botón Lateral Izquierdo Fijo (Anterior) - Gran Objetivo Táctil */}
          <button
            onClick={() => handleNavigateModal('prev')}
            className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-900/90 hover:bg-amber-500 text-white hover:text-slate-950 border-2 border-amber-500/60 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center justify-center transition-all touch-active cursor-pointer backdrop-blur-md hover:scale-110 active:scale-95"
            title={t.btn_prev || 'Anterior'}
          >
            <ChevronLeft className="w-10 h-10 md:w-12 md:h-12" />
          </button>

          {/* Imagen a Pantalla Completa con Efecto Fit to Page, Zoom Táctil y Pan */}
          <div className="w-full h-full pt-24 pb-24 px-24 md:px-32 lg:px-44 flex items-center justify-center overflow-hidden">
            <div
              style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
                transition: isPinchingRef.current || isPanningRef.current ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                transformOrigin: 'center center'
              }}
              className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing will-change-transform"
            >
              <img
                src={selectedArchivoPeriodistico.imagen}
                alt={getTitulo(selectedArchivoPeriodistico)}
                className="max-h-[calc(100vh-200px)] max-w-[calc(100vw-300px)] w-auto h-auto object-contain rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.95)] border border-amber-500/30 pointer-events-none select-none"
                draggable={false}
              />
            </div>
          </div>

          {/* Botón Lateral Derecho Fijo (Siguiente) - Gran Objetivo Táctil */}
          <button
            onClick={() => handleNavigateModal('next')}
            className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-900/90 hover:bg-amber-500 text-white hover:text-slate-950 border-2 border-amber-500/60 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center justify-center transition-all touch-active cursor-pointer backdrop-blur-md hover:scale-110 active:scale-95"
            title={t.btn_next || 'Siguiente'}
          >
            <ChevronRight className="w-10 h-10 md:w-12 md:h-12" />
          </button>

          {/* Barra Inferior Flotante Fija (Cerrar) */}
          <div className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
            <button
              onClick={() => setSelectedArchivoPeriodistico(null)}
              className="px-8 py-3 rounded-full bg-slate-900/90 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border-2 border-amber-500/60 font-black text-xs md:text-sm uppercase tracking-widest shadow-2xl transition-all touch-active cursor-pointer backdrop-blur-md flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              <span>{t.press_close_viewer || t.close || 'Cerrar Visor'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
