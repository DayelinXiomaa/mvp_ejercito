import React, { useState, useEffect } from 'react';
import { useTerrorismo, type OperacionItem, type PhotoItem } from '../context/TerrorismoContext';
import { useI18n } from '../context/I18nContext';
import {
  Shield,
  Search,
  Flame,
  Crosshair,
  Calendar,
  Layers,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Image as ImageIcon,
  Info,
} from 'lucide-react';

export const OperacionesView: React.FC = () => {
  const {
    data,
    selectedOp,
    setSelectedOp,
    opTargetFilter,
    setOpTargetFilter,
    opPeriodFilter,
    setOpPeriodFilter,
    searchQuery,
    setSearchQuery,
    setFullscreenImage,
  } = useTerrorismo();
  const { t, language } = useI18n();

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // H-P3-M3: Preservación de posición de scroll en la cuadrícula de operaciones
  const catalogScrollRef = React.useRef<HTMLDivElement>(null);
  const savedOpScrollTopRef = React.useRef<number>(0);

  // Restaurar posición de scroll al volver a la cuadrícula
  useEffect(() => {
    if (!selectedOp && catalogScrollRef.current) {
      requestAnimationFrame(() => {
        if (catalogScrollRef.current) {
          catalogScrollRef.current.scrollTop = savedOpScrollTopRef.current;
        }
      });
    }
  }, [selectedOp]);

  // Reset active photo when selected operation changes
  useEffect(() => {
    setActivePhotoIndex(0);
  }, [selectedOp?.id]);

  const allOps = data.operaciones?.items || [];

  // Filter operations based on target, period, and search query
  const filteredOps = allOps.filter((op) => {
    // Target filter
    if (opTargetFilter !== 'TODOS' && op.target !== opTargetFilter) {
      return false;
    }
    // Period filter
    if (opPeriodFilter !== 'TODOS') {
      if (opPeriodFilter === '1987-1992' && (op.period === '1987-1992' || op.period === '1989-1992')) {
        // match
      } else if (opPeriodFilter === '1993-2012' && (op.period === '1993-2012' || op.period === '1992-1997')) {
        // match
      } else if (opPeriodFilter === '2013-2026' && (op.period === '2013-2026' || op.period === '2013-2023')) {
        // match
      } else if (op.period !== opPeriodFilter) {
        return false;
      }
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = (op.title?.[language] || op.title?.es || '').toLowerCase();
      const content = (op.content?.[language] || op.content?.es || '').toLowerCase();
      const year = (op.year || '').toLowerCase();
      if (!title.includes(q) && !content.includes(q) && !year.includes(q)) {
        return false;
      }
    }
    return true;
  });

  const handleSelectOp = (op: OperacionItem) => {
    savedOpScrollTopRef.current = catalogScrollRef.current?.scrollTop || 0;
    setSelectedOp(op);
  };

  const handleNavigateOp = (direction: 'next' | 'prev') => {
    if (!selectedOp) return;
    const currentIndex = filteredOps.findIndex((o) => o.id === selectedOp.id);
    if (currentIndex === -1) return;

    if (direction === 'next') {
      const nextIdx = currentIndex < filteredOps.length - 1 ? currentIndex + 1 : 0;
      setSelectedOp(filteredOps[nextIdx]);
    } else {
      const prevIdx = currentIndex > 0 ? currentIndex - 1 : filteredOps.length - 1;
      setSelectedOp(filteredOps[prevIdx]);
    }
  };

  // ================= VISTA DETALLE DE OPERACIÓN =================
  if (selectedOp) {
    const isSL = selectedOp.target === 'Sendero Luminoso';
    const opTitle = selectedOp.title?.[language] || selectedOp.title?.es || '';
    const opContent = selectedOp.content?.[language] || selectedOp.content?.es || '';
    const opIndex = filteredOps.findIndex((o) => o.id === selectedOp.id);

    // Get only real photos (no slide_image in gallery)
    const photos: PhotoItem[] = (selectedOp.photos && selectedOp.photos.length > 0)
      ? selectedOp.photos
      : (selectedOp.embedded_images && selectedOp.embedded_images.length > 0)
      ? selectedOp.embedded_images.map((img) => ({
          url: img,
          alt: `Registro fotográfico de ${opTitle}`,
          description: {
            es: `Registro táctico y fotográfico de la ${opTitle}`,
            en: `Tactical and photographic record of ${opTitle}`,
            qu: `Táctica qillqasqa hinaspa foto: ${opTitle}`,
          },
        }))
      : [
          {
            url: selectedOp.slide_image,
            alt: `Documento táctico de ${opTitle}`,
            description: {
              es: `Documento de la ${opTitle}`,
              en: `Document of ${opTitle}`,
              qu: `Qillqa: ${opTitle}`,
            },
          },
        ];

    const currentPhoto = photos[activePhotoIndex] || photos[0];
    const photoDescription = currentPhoto?.description?.[language] || currentPhoto?.description?.es || currentPhoto?.alt || '';

    return (
      <div className="w-full h-full flex flex-col justify-between p-2 md:p-4 overflow-hidden select-none animate-fade-in">
        {/* Header Superior del Detalle */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-4 shadow-xl flex items-center justify-between gap-4 flex-shrink-0 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSelectedOp(null)}
              className="p-2.5 rounded-2xl bg-slate-950 text-emerald-400 hover:text-white border border-slate-800 hover:border-emerald-400 transition-all flex-shrink-0 touch-active"
              title={t.btn_back_to_ops || 'Volver a Operaciones'}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                    isSL
                      ? 'bg-red-950/90 text-red-200 border-red-500/40'
                      : 'bg-amber-950/90 text-amber-200 border-amber-500/40'
                  }`}
                >
                  {isSL ? (t.target_sl_full || 'Contra Sendero Luminoso') : (t.target_mrta_full || 'Contra el MRTA')}
                </span>
                <span className="text-[9px] font-black text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                  {t.year_prefix || 'Año'} {selectedOp.year}
                </span>
                <span className="text-[9px] text-slate-400 font-bold hidden sm:inline">
                  {selectedOp.subcategory}
                </span>
              </div>
              <h3 className="text-[12px] md:text-[16px] font-black text-white leading-tight truncate mt-1">
                {opTitle}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setSelectedOp(null)}
              className="px-4 py-2 rounded-full bg-slate-950 text-emerald-400 hover:text-white border border-slate-800 font-bold text-xs transition-all touch-active"
            >
              {t.view_op_catalog || t.btn_back_to_ops || 'Ver Catálogo'}
            </button>
          </div>
        </div>

        {/* Cuerpo del Detalle: Visor de Fotos Interactivo + Ficha y Párrafos */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
          {/* Columna Izquierda (5 cols): Visor Interactivo de Fotografías con Pie de Foto */}
          <div className="lg:col-span-5 bg-slate-950/80 rounded-3xl border border-emerald-500/20 p-4 flex flex-col justify-between overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                {t.op_photo_badge || 'Fotografía de Operación'}
              </span>
              {photos.length > 0 && (
                <span className="text-[9px] text-slate-400 font-bold bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                  {activePhotoIndex + 1} {t.of_photos || 'de'} {photos.length}
                </span>
              )}
            </div>

            {/* Imagen Principal en Grande */}
            {currentPhoto && (
              <div
                onClick={() =>
                  setFullscreenImage({
                    url: currentPhoto.url,
                    alt: currentPhoto.alt,
                    description: photoDescription,
                  })
                }
                className="relative flex-1 min-h-0 bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden group cursor-pointer flex items-center justify-center p-2 shadow-inner hover:border-emerald-400 transition-colors"
              >
                <img
                  key={currentPhoto.url}
                  src={currentPhoto.url}
                  alt={currentPhoto.alt || opTitle}
                  className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300 animate-fade-in"
                />

                {/* Botones de cambio de foto dentro de la imagen si hay más de una */}
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/80 text-white hover:bg-emerald-600 border border-slate-700 flex items-center justify-center opacity-80 hover:opacity-100 transition-all touch-active"
                      title={t.prev_photo_title || 'Foto anterior'}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/80 text-white hover:bg-emerald-600 border border-slate-700 flex items-center justify-center opacity-80 hover:opacity-100 transition-all touch-active"
                      title={t.next_photo_title || 'Siguiente foto'}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs backdrop-blur-xs pointer-events-none">
                  <ZoomIn className="w-5 h-5 text-emerald-300" />
                  <span>{t.tap_to_zoom || 'Toque para pantalla completa'}</span>
                </div>
              </div>
            )}

            {/* Pie de Foto / Descripción de la Fotografía */}
            {currentPhoto && (
              <div className="mt-2.5 px-3 py-2 rounded-xl bg-slate-900/95 border border-slate-800 text-xs flex items-start gap-2 text-slate-200">
                <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="leading-snug font-medium text-[11px] md:text-xs">
                  {photoDescription}
                </p>
              </div>
            )}

            {/* Galería de Miniaturas si hay más de 1 foto */}
            {photos.length > 1 && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-900 flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1 mr-1 flex-shrink-0">
                  <Layers className="w-3 h-3 text-emerald-400" /> {t.gallery_label || 'Galería:'}
                </span>
                {photos.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhotoIndex(i)}
                    className={`relative rounded-xl border p-1 flex-shrink-0 overflow-hidden cursor-pointer group shadow-sm transition-all min-h-[48px] min-w-[56px] flex flex-col items-center justify-center ${
                      activePhotoIndex === i
                        ? 'border-emerald-400 bg-emerald-950/60 ring-2 ring-emerald-500/50 scale-105'
                        : 'border-slate-800 bg-slate-900/90 hover:border-slate-600 opacity-70 hover:opacity-100'
                    }`}
                    title={item.alt}
                  >
                    <img
                      src={item.url}
                      alt={item.alt}
                      className="w-10 h-7 object-contain rounded"
                    />
                    <span className="text-[8px] font-bold text-slate-300 mt-0.5 block truncate max-w-[50px]">
                      {t.photo_prefix || 'Foto'} {i + 1}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Columna Derecha (7 cols): Ficha Táctica y Reseña Justificada con Párrafos */}
          <div className="lg:col-span-7 bg-slate-950/90 rounded-3xl border border-emerald-500/20 p-6 md:p-8 flex flex-col justify-between overflow-y-auto kiosk-scroll shadow-2xl">
            <div className="space-y-4">
              <div className="border-b border-emerald-500/20 pb-3 flex items-center justify-between">
                <h4 className="text-[16px] md:text-[20px] font-black text-emerald-300 flex items-center gap-2 leading-tight">
                  <Shield className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  {opTitle}
                </h4>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                  {language === 'es' ? 'Español' : language === 'en' ? 'English' : 'Quechua'}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold block uppercase">{t.field_target || 'Objetivo'}</span>
                  <span className="font-black text-white">{isSL ? (t.target_sl_full || selectedOp.target) : (t.target_mrta_full || selectedOp.target)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-bold block uppercase">{t.field_period || 'Año / Periodo'}</span>
                  <span className="font-black text-emerald-300">{selectedOp.year} ({selectedOp.period})</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-bold block uppercase">{t.field_sector || 'Sector'}</span>
                  <span className="font-bold text-slate-200 truncate block">{selectedOp.subcategory}</span>
                </div>
              </div>

              {/* Párrafos Justificados sin sangría */}
              <div className="space-y-4 text-slate-100 text-sm md:text-base font-medium leading-relaxed text-justify">
                {opContent.split('\n\n').filter(Boolean).map((paragraph, pIdx) => (
                  <p key={pIdx}>
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
            </div>

            {/* Navegación Siguiente / Anterior de Operaciones */}
            <div className="mt-6 pt-4 border-t border-slate-900 flex items-center justify-between gap-4 flex-shrink-0">
              <button
                onClick={() => handleNavigateOp('prev')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 font-extrabold text-xs transition-all border border-slate-800 min-h-[44px] touch-active"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t.btn_prev || 'Anterior'}</span>
              </button>

              <span className="text-xs text-slate-400 font-bold">
                {opIndex >= 0 ? opIndex + 1 : 1} / {filteredOps.length}
              </span>

              <button
                onClick={() => handleNavigateOp('next')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-700 to-green-600 text-white font-extrabold text-xs transition-all hover:brightness-110 shadow-lg min-h-[44px] touch-active"
              >
                <span>{t.btn_next || 'Siguiente'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= VISTA CATÁLOGO GENERAL (GRID DE OPERACIONES) =================
  return (
    <div className="w-full h-full flex flex-col justify-between p-2 md:p-4 overflow-hidden select-none animate-fade-in">
      {/* Barra Superior de Filtros y Búsqueda */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3 flex-shrink-0 mb-3">
        {/* Filtros por Organización */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto">
          <button
            onClick={() => setOpTargetFilter('TODOS')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all min-h-[40px] touch-active ${
              opTargetFilter === 'TODOS'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-lg scale-105'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            {t.filter_all || 'Todas'} ({allOps.length})
          </button>
          <button
            onClick={() => setOpTargetFilter('Sendero Luminoso')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all min-h-[40px] flex items-center gap-1.5 touch-active ${
              opTargetFilter === 'Sendero Luminoso'
                ? 'bg-red-600 text-white font-black shadow-lg scale-105'
                : 'bg-slate-950 text-slate-300 hover:text-red-300 border border-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>Sendero Luminoso</span>
          </button>
          <button
            onClick={() => setOpTargetFilter('MRTA')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all min-h-[40px] flex items-center gap-1.5 touch-active ${
              opTargetFilter === 'MRTA'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg scale-105'
                : 'bg-slate-950 text-slate-300 hover:text-amber-300 border border-slate-800'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5 text-amber-400" />
            <span>MRTA</span>
          </button>
        </div>

        {/* Filtros por Periodo + Búsqueda */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center bg-slate-950 p-1 rounded-full border border-slate-800">
            {['TODOS', '1987-1992', '1993-2012', '2013-2026'].map((per) => (
              <button
                key={per}
                onClick={() => setOpPeriodFilter(per)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all min-h-[36px] touch-active ${
                  opPeriodFilter === per
                    ? 'bg-emerald-600 text-white font-extrabold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {per === 'TODOS' ? (t.all_years || 'Todos los Años') : per}
              </button>
            ))}
          </div>

          <div className="relative flex-shrink-0">
            <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.search_placeholder || 'Buscar operación...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-emerald-500/30 rounded-full pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 w-44"
            />
          </div>
        </div>
      </div>

      {/* Grid de Tarjetas de Operaciones */}
      <div ref={catalogScrollRef} className="flex-1 min-h-0 overflow-y-auto kiosk-scroll p-1">
        {filteredOps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOps.map((op) => {
              const isSL = op.target === 'Sendero Luminoso';
              const title = op.title?.[language] || op.title?.es || '';
              const content = op.content?.[language] || op.content?.es || '';

              return (
                <div
                  key={op.id}
                  onClick={() => handleSelectOp(op)}
                  className="group relative bg-slate-950/90 rounded-3xl border border-emerald-500/25 hover:border-emerald-400 p-5 flex flex-col justify-between hover:scale-[1.02] transition-all cursor-pointer shadow-xl overflow-hidden touch-active"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          isSL
                            ? 'bg-red-950/80 text-red-300 border-red-500/40'
                            : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {isSL ? (t.target_sl_short || 'Sendero') : (t.target_mrta_short || 'MRTA')}
                      </span>
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/90 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {op.year}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors leading-snug line-clamp-2">
                      {title}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {content}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[10px] font-bold text-emerald-400 group-hover:text-white transition-colors">
                    <span>{t.view_op_sheet || 'Ver Ficha Táctica'}</span>
                    <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-950/50 rounded-3xl border border-slate-800">
            <Shield className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-slate-300 font-bold text-base">{t.no_ops_found || 'No se encontraron operaciones con los filtros actuales.'}</p>
            <button
              onClick={() => {
                setOpTargetFilter('TODOS');
                setOpPeriodFilter('TODOS');
                setSearchQuery('');
              }}
              className="mt-4 px-6 py-2 rounded-full bg-emerald-600 text-slate-950 font-black text-xs hover:brightness-110 transition-all"
            >
              {t.reset_filters || 'Restablecer Filtros'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
