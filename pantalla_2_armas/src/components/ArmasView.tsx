import React, { useState, useEffect } from 'react';
import { useArmas, type PersonajeHistorico, type ElementoSimbologia } from '../context/ArmasContext';
import { useI18n } from '../context/I18nContext';
import {
  ChevronRight,
  Shield,
  Star,
  Award,
  User,
  Flag,
  Calendar,
  X,
  ZoomIn,
  Users,
  Sparkles,
  Play,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ARMAS_MEDIA } from '../config/armasMediaMap';
import { useArmaAudio } from '../hooks/useArmaAudio';
import { VideoPlayerModal } from './VideoPlayerModal';

interface FullscreenImageState {
  url: string;
  alt: string;
  title?: string;
  description?: string;
}

export const ArmasView: React.FC = () => {
  const {
    armas,
    selectedItem,
    setSelectedItem,
    activeFilter,
    searchQuery,
    activeSlide,
    showHeroesModal,
    setShowHeroesModal,
    activeVideo,
    setActiveVideo,
  } = useArmas();
  const { language, t } = useI18n();

  // Modales
  const [selectedPersonaje, setSelectedPersonaje] = useState<PersonajeHistorico | null>(null);
  const [selectedElemento, setSelectedElemento] = useState<ElementoSimbologia | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<FullscreenImageState | null>(null);

  // Multimedia del arma o servicio actual
  const currentMedia = selectedItem ? ARMAS_MEDIA[selectedItem.id] : undefined;
  const himnoUrl = currentMedia?.himnoUrl;

  // Reproductor de himno oficial en segundo plano
  const { isPlaying, isMuted, toggleMute } = useArmaAudio({
    audioUrl: selectedItem ? himnoUrl : undefined,
    isPausedExternally: Boolean(activeVideo),
  });

  // H-P2-M4: Preservación de posición de scroll en la lista de armas
  const gridScrollRef = React.useRef<HTMLDivElement>(null);
  const savedScrollTopRef = React.useRef<number>(0);

  // Restaurar posición de scroll al volver a la lista
  useEffect(() => {
    if (!selectedItem && gridScrollRef.current) {
      // Usar requestAnimationFrame para asegurar que el DOM de la lista esté montado
      requestAnimationFrame(() => {
        if (gridScrollRef.current) {
          gridScrollRef.current.scrollTop = savedScrollTopRef.current;
        }
      });
    }
  }, [selectedItem]);

  // Reiniciar modales al cambiar de ítem
  useEffect(() => {
    setSelectedPersonaje(null);
    setSelectedElemento(null);
    setFullscreenImage(null);
  }, [selectedItem?.id]);

  // Idioma activo para el ítem seleccionado
  const currentLang = selectedItem?.language?.[language] || selectedItem?.language?.es;

  // Filtrado de lista inicial
  const filteredArmas = armas.filter((item) => {
    const isVisible = item.estado !== 'OCULTO';
    const matchesFilter = activeFilter === 'TODOS' || item.tipo === activeFilter;
    const matchesSearch =
      !searchQuery ||
      item.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nombreCorto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof item.patrono === 'object' && item.patrono?.nombre?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.misionEmpleo?.mision?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lema.toLowerCase().includes(searchQuery.toLowerCase());
    return isVisible && matchesFilter && matchesSearch;
  });

  return (
    <div className="w-full h-full min-h-0 p-3 md:p-5 flex flex-col select-none overflow-hidden">
      {selectedItem ? (
        /* ============================================================ */
        /* VISTA DE DETALLE: 3 SLIDES INTERACTIVOS EN 2 COLUMNAS        */
        /* ============================================================ */
        <div className="flex-1 min-h-0 bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-emerald-500/30 overflow-hidden shadow-2xl animate-fade-in flex flex-col justify-between">
          
          {/* ============================================================ */}
          {/* TOP BAR: BOTÓN VOLVER + TÍTULO ARMA + BADGE DE COLOR         */ }
          {/* ============================================================ */}
          <div className="px-5 py-3 md:px-7 md:py-3.5 bg-slate-950/95 border-b border-emerald-500/20 flex items-center justify-between gap-4 flex-shrink-0 z-20 backdrop-blur-xl">
            {/* Botón Volver */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSelectedItem(null)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600 hover:text-slate-950 transition-all shadow-xl text-xs font-black min-h-[40px] touch-active flex-shrink-0 cursor-pointer"
                title="Cerrar detalle"
              >
                <X className="w-4 h-4 text-emerald-400" />
                <span>{language === 'en' ? 'Close Detail' : language === 'qu' ? 'Wichqay' : 'Cerrar Detalle'}</span>
              </button>

              <div className="min-w-0 flex items-center gap-2.5">
                {selectedItem.colorHex && selectedItem.id !== 'administrativo' && (
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/60 shadow flex-shrink-0"
                    style={{ backgroundColor: selectedItem.colorHex }}
                  />
                )}
                <h2 className="text-base md:text-xl font-black text-white truncate">
                  {currentLang?.nombre || selectedItem.nombre}
                </h2>
              </div>
            </div>

            {/* Acciones de Multimedia y Badge de Tipo */}
            <div className="flex items-center gap-2.5">
              {/* Control de Audio del Himno Oficial */}
              {himnoUrl && (
                <button
                  onClick={toggleMute}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black transition-all shadow-md touch-active border ${
                    isPlaying && !isMuted
                      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-400/60 shadow-emerald-950/60'
                      : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                  title={isPlaying && !isMuted ? 'Silenciar Himno Oficial' : 'Reproducir Himno Oficial'}
                >
                  {isPlaying && !isMuted ? (
                    <>
                      <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse flex-shrink-0" />
                      <span className="hidden sm:inline">Himno</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="hidden sm:inline text-slate-500">Mudo</span>
                    </>
                  )}
                </button>
              )}

              {/* Botón Ver Video Institucional */}
              {currentMedia?.videoUrl && (
                <button
                  onClick={() => {
                    setActiveVideo({
                      url: currentMedia.videoUrl!,
                      title: currentMedia.videoTitle || `Video Institucional — ${currentLang?.nombre || selectedItem.nombre}`,
                    });
                  }}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-900 to-emerald-700 hover:from-emerald-600 hover:to-emerald-500 text-white text-xs font-black transition-all shadow-lg shadow-emerald-950/50 border border-emerald-400/50 touch-active hover:scale-105 active:scale-95 cursor-pointer"
                  title="Reproducir video institucional oficial"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-white flex-shrink-0" />
                  <span>{language === 'en' ? 'Watch Video' : language === 'qu' ? 'Videota Qaway' : 'Ver Video'}</span>
                </button>
              )}

              <span
                className="text-[11px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider border shadow"
                style={{
                  backgroundColor: `${selectedItem.colorHex}22`,
                  borderColor: selectedItem.colorHex,
                  color: '#ffffff',
                }}
              >
                {selectedItem.tipo === 'ARMA' ? (t.branch_type_arma || 'ARMA') : (t.branch_type_servicio || 'SERVICIO')}
              </span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* CUERPO PRINCIPAL DEL SLIDE: 2 COLUMNAS (VISUAL / TEXTO)       */}
          {/* ============================================================ */}
          <div className="flex-1 min-h-0 p-4 md:p-6 overflow-hidden">
            
            {/* ------------------------------------------------------------ */}
            {/* SLIDE 1: PATRONO Y ESCUDO                                    */}
            {/* ------------------------------------------------------------ */}
            {activeSlide === 0 && (
              <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 overflow-hidden animate-fade-in">
                
                {/* Columna Izquierda (6 cols): Retrato del Patrono + Identificación y Conmemoración */}
                <div className="lg:col-span-6 bg-slate-950/80 rounded-3xl border border-emerald-500/20 p-4 md:p-5 flex flex-col justify-between overflow-hidden shadow-2xl space-y-3">
                  <div className="flex items-center justify-between flex-shrink-0">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      {t.official_portrait || (language === 'en' ? 'Official Portrait' : language === 'qu' ? 'Apu Retrato' : 'Retrato Oficial del Patrono')}
                    </span>
                    {selectedItem.patrono?.fecha && (
                      <span className="text-[9px] text-amber-300 font-bold bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40">
                        {selectedItem.patrono.fecha}
                      </span>
                    )}
                  </div>

                  {/* Retrato del Patrono con Zoom */}
                  <div
                    onClick={() => {
                      if (selectedItem.patrono?.fotografia) {
                        setFullscreenImage({
                          url: selectedItem.patrono.fotografia,
                          alt: selectedItem.patrono.nombre,
                          title: selectedItem.patrono.nombre,
                          description: currentLang?.patronoResena || selectedItem.patrono.cargo || selectedItem.patrono.infoAdicional,
                        });
                      }
                    }}
                    className={`relative flex-1 min-h-0 bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden group flex items-center justify-center p-3 shadow-inner transition-colors flex-shrink-0 ${
                      selectedItem.patrono?.fotografia ? 'cursor-pointer hover:border-emerald-400' : ''
                    }`}
                  >
                    {selectedItem.patrono?.fotografia ? (
                      <>
                        <img
                          src={selectedItem.patrono.fotografia}
                          alt={selectedItem.patrono.nombre}
                          className="max-w-full max-h-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs backdrop-blur-xs pointer-events-none">
                          <ZoomIn className="w-5 h-5 text-emerald-300" />
                          <span>{t.touch_fullscreen || (language === 'en' ? 'Tap for Fullscreen' : language === 'qu' ? 'Hatun rikuy' : 'Toque para Pantalla Completa')}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-500 p-6 text-center">
                        <User className="w-16 h-16 text-slate-600 mb-2" />
                        <span className="text-xs font-bold text-slate-400">
                          {language === 'en' ? 'No Patron Photograph' : language === 'qu' ? 'Manan Patronpa Retraton kanchu' : 'Sin Fotografía de Patrono'}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-1">
                          {language === 'en' ? 'Service without individual historical patron' : language === 'qu' ? 'Patronmanta mana kanchu' : 'Servicio sin patrono histórico individual'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tarjeta de Identificación del Patrono y Conmemoración */}
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center flex-shrink-0 text-amber-400">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm md:text-base font-black text-white">
                          {selectedItem.patrono?.nombre || (language === 'en' ? 'Institutional Patron' : language === 'qu' ? 'Apu Patrono' : 'Patrono Institucional')}
                        </h4>
                        {selectedItem.patrono?.cargo && (
                          <p className="text-[11px] text-emerald-300 font-bold">
                            {language === 'en'
                              ? (selectedItem.id === 'administrativo' ? 'Administrative Service' : `Patron of the ${currentLang?.nombre || selectedItem.nombre}`)
                              : language === 'qu'
                              ? (selectedItem.id === 'administrativo' ? 'Servicio Administrativo' : `${currentLang?.nombre || selectedItem.nombre} patronnin`)
                              : selectedItem.patrono.cargo}
                          </p>
                        )}
                      </div>
                    </div>
                    {(currentLang?.patronoResena || selectedItem.patrono?.infoAdicional) && (
                      <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-amber-200/90 text-xs leading-relaxed text-justify font-medium">
                        {currentLang?.patronoResena || selectedItem.patrono?.infoAdicional}
                      </div>
                    )}
                  </div>
                </div>

                {/* Columna Derecha (6 cols): Escudo Heráldico + Vivo Institucional */}
                <div className="lg:col-span-6 bg-slate-950/80 rounded-3xl border border-emerald-500/20 p-4 md:p-5 flex flex-col justify-between overflow-hidden shadow-2xl space-y-3">
                  <div className="flex items-center justify-between flex-shrink-0">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      {t.heraldic_shield || (language === 'en' ? 'Heraldic Coat of Arms' : language === 'qu' ? 'Heráldico Escudo' : 'Escudo Heráldico Oficial')}
                    </span>
                    <span className="text-[9px] text-emerald-300 font-bold bg-emerald-950/90 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      {t.high_definition || (language === 'en' ? 'High Definition' : language === 'qu' ? 'Hatun Rikch’ay' : 'Gran Formato')}
                    </span>
                  </div>

                  {/* Escudo Gigante en Card Blanco de Alta Definición */}
                  <div
                    onClick={() => {
                      const img = selectedItem.escudo?.imagen || selectedItem.imagenPrincipal;
                      if (img) {
                        setFullscreenImage({
                          url: img,
                          alt: selectedItem.escudo?.titulo || selectedItem.nombre,
                          title: language === 'en'
                            ? (selectedItem.id === 'administrativo' ? 'Administrative Service' : `Coat of Arms of the ${currentLang?.nombre || selectedItem.nombre}`)
                            : language === 'qu'
                            ? (selectedItem.id === 'administrativo' ? 'Servicio Administrativo' : `${currentLang?.nombre || selectedItem.nombre} Escudo`)
                            : (selectedItem.escudo?.titulo || `Escudo del ${selectedItem.nombre}`),
                          description: currentLang?.escudoResena || selectedItem.escudo?.descripcion,
                        });
                      }
                    }}
                    className={`relative flex-1 min-h-0 bg-white rounded-2xl border-2 border-emerald-400/80 shadow-[0_0_30px_rgba(16,185,129,0.2)] overflow-hidden group flex items-center justify-center p-4 transition-transform duration-300 flex-shrink-0 ${
                      selectedItem.escudo?.imagen || selectedItem.imagenPrincipal ? 'cursor-pointer hover:scale-[1.01]' : ''
                    }`}
                  >
                    {selectedItem.escudo?.imagen || selectedItem.imagenPrincipal ? (
                      <>
                        <img
                          src={selectedItem.escudo?.imagen || selectedItem.imagenPrincipal}
                          alt="Escudo Heráldico"
                          className="max-w-full max-h-full object-contain drop-shadow-xl"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs backdrop-blur-xs pointer-events-none">
                          <ZoomIn className="w-5 h-5 text-emerald-300" />
                          <span>{t.touch_fullscreen || (language === 'en' ? 'Tap for Fullscreen' : language === 'qu' ? 'Hatun rikuy' : 'Toque para Pantalla Completa')}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                        <Shield className="w-16 h-16 text-slate-400 mb-2" />
                        <span className="text-xs font-bold text-slate-600">
                          {language === 'en' ? 'No Official Heraldic Coat of Arms' : language === 'qu' ? 'Manan Oficial Escudo kanchu' : 'Sin Escudo Heráldico Oficial'}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-1">
                          {language === 'en' ? 'Recently established service' : language === 'qu' ? 'Chayllaraq kamasqa servicio' : 'Servicio recién creado'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Pie de Escudo */}
                  <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center flex-shrink-0">
                    <h4 className="text-xs font-black text-white truncate">
                      {language === 'en'
                        ? (selectedItem.id === 'administrativo' ? 'Administrative Service' : `Coat of Arms of the ${currentLang?.nombre || selectedItem.nombre}`)
                        : language === 'qu'
                        ? (selectedItem.id === 'administrativo' ? 'Servicio Administrativo' : `${currentLang?.nombre || selectedItem.nombre} Escudo`)
                        : (selectedItem.escudo?.titulo || `Escudo del ${selectedItem.nombre}`)}
                    </h4>
                  </div>

                  {/* Vivo Institucional y Color */}
                  {selectedItem.colorHex && (currentLang?.vivo || selectedItem.colorNombre) && selectedItem.id !== 'administrativo' && (
                    <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/20 flex items-center gap-3.5 flex-shrink-0">
                      <div
                        className="w-12 h-12 rounded-xl border-2 border-white/40 shadow-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: selectedItem.colorHex }}
                      >
                        <Sparkles className="w-5 h-5 text-white/90 drop-shadow" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-400 block">
                          {language === 'en' ? 'Institutional Color' : language === 'qu' ? 'Llimp’i' : 'Vivo Institucional'}
                        </span>
                        <h4 className="text-sm font-black text-white truncate">
                          {currentLang?.vivo || selectedItem.colorNombre}
                        </h4>
                        <p className="text-[11px] text-slate-300 line-clamp-1">
                          {currentLang?.colorDescripcion ||
                            (language === 'en'
                              ? `The distinctive institutional color is ${currentLang?.vivo || selectedItem.colorNombre}.`
                              : language === 'qu'
                              ? `Llimp’i kikin siminqa ${currentLang?.vivo || selectedItem.colorNombre}mi.`
                              : selectedItem.colorDescripcion || `El color distintivo o vivo institucional es ${selectedItem.colorNombre}.`)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* SLIDE 2: MISIÓN Y EMPLEO                                     */}
            {/* ------------------------------------------------------------ */}
            {activeSlide === 1 && (() => {
              const personajes = (selectedItem.personajes || []).filter((p) => p.publicado !== false);

              return (
                <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 overflow-hidden animate-fade-in">
                  
                  {/* Columna Izquierda (5 cols): Fotografía Operativa + Lema Oficial */}
                  <div className="lg:col-span-5 bg-slate-950/80 rounded-3xl border border-emerald-500/20 p-4 md:p-5 flex flex-col justify-between overflow-hidden shadow-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Flag className="w-3.5 h-3.5" />
                        {t.operational_deployment || (language === 'en' ? 'Operational Deployment' : language === 'qu' ? 'Awqanakuy Foto' : 'Fotografía Operativa')}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                        HD 1080p
                      </span>
                    </div>

                    {/* Imagen Operativa con Zoom */}
                    <div
                      onClick={() => {
                        const img = selectedItem.misionEmpleo?.imagen || selectedItem.imagenPortada || selectedItem.imagenPrincipal;
                        if (img) {
                          setFullscreenImage({
                            url: img,
                            alt: currentLang?.nombre || selectedItem.nombre,
                            title: currentLang?.nombre || selectedItem.nombre,
                            description: selectedItem.misionEmpleo?.descripcionImagen || selectedItem.descripcionBreve,
                          });
                        }
                      }}
                      className="relative flex-1 min-h-0 bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden group cursor-pointer flex items-center justify-center p-2 shadow-inner hover:border-emerald-400 transition-colors"
                    >
                      <img
                        src={selectedItem.misionEmpleo?.imagen || selectedItem.imagenPortada || selectedItem.imagenPrincipal}
                        alt={currentLang?.nombre || selectedItem.nombre}
                        className="w-full h-full object-cover rounded-xl drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs backdrop-blur-xs pointer-events-none">
                        <ZoomIn className="w-5 h-5 text-emerald-300" />
                        <span>{t.touch_fullscreen || (language === 'en' ? 'Tap for Fullscreen' : language === 'qu' ? 'Hatun rikuy' : 'Toque para Pantalla Completa')}</span>
                      </div>
                    </div>

                    {/* Lema Oficial Destacado */}
                    {(currentLang?.lema || selectedItem.lema) && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-emerald-950/70 border-2 border-emerald-500/40 shadow-lg relative overflow-hidden flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-900/80 border border-emerald-400/50 flex items-center justify-center flex-shrink-0">
                          <Star className="w-5 h-5 text-emerald-300 animate-pulse" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 block">
                            {t.official_motto || (language === 'en' ? 'Official Motto' : language === 'qu' ? 'Lema' : 'Lema Oficial')}
                          </span>
                          <p className="text-base md:text-lg font-black italic text-emerald-100 leading-snug">
                            “{currentLang?.lema || selectedItem.lema}”
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Columna Derecha (7 cols): Misión, Empleo y Botón Inmolados */}
                  <div className="lg:col-span-7 bg-slate-950/90 rounded-3xl border border-emerald-500/20 p-5 md:p-6 flex flex-col justify-start gap-4 overflow-y-auto kiosk-scroll shadow-2xl">
                    
                    {/* Declaración de Misión */}
                    <div className="p-4 md:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Award className="w-5 h-5" />
                        <h3 className="text-base md:text-lg font-black text-white">
                          {t.detail_mision || (language === 'en' ? 'Mission' : language === 'qu' ? 'Llank’ay Misión' : 'Misión')}
                        </h3>
                      </div>
                      <p className="text-slate-200 text-sm md:text-base leading-relaxed text-justify">
                        {currentLang?.mision || selectedItem.misionEmpleo?.mision || selectedItem.descripcionBreve}
                      </p>
                    </div>

                    {/* Empleo y Capacidades Tácticas */}
                    <div className="p-4 md:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Flag className="w-5 h-5" />
                        <h3 className="text-base md:text-lg font-black text-white">
                          {t.detail_empleo || (language === 'en' ? 'Tactical Employment' : language === 'qu' ? 'Llank’ay' : 'Empleo Táctico')}
                        </h3>
                      </div>
                      <p className="text-slate-300 text-xs md:text-sm leading-relaxed text-justify">
                        {currentLang?.empleo || selectedItem.misionEmpleo?.empleo || selectedItem.descripcionBreve}
                      </p>
                    </div>

                    {/* Botón / Tarjeta Destacada de Acceso a Inmolados en el Deber */}
                    {personajes.length > 0 && (
                      <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-red-950/70 via-slate-900/90 to-red-950/70 border-2 border-red-500/40 shadow-xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-red-950 border border-red-500/50 flex items-center justify-center flex-shrink-0 shadow">
                            <Award className="w-6 h-6 text-red-300" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm md:text-base font-black text-white leading-snug">
                              {t.section_fallecidos || 'Fallecidos en Armas'}
                            </h4>
                            <p className="text-xs text-red-300/90 font-bold truncate">
                              {personajes.length} {language === 'en' ? 'Soldiers Fallen in Duty' : language === 'qu' ? 'Mamallakta Amachaypi Wañusqakuna' : 'Combatientes Inmolados en el Deber'}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setShowHeroesModal(true)}
                          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition-all shadow-lg flex items-center gap-2 flex-shrink-0 touch-active hover:scale-105 cursor-pointer"
                        >
                          <Users className="w-4 h-4" />
                          <span>{t.view_records || (language === 'en' ? 'View Records' : language === 'qu' ? 'Rikuy' : 'Ver Fichas')}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        /* ============================================================ */
        /* GRILLA PRINCIPAL: CARDS DE ARMAS Y SERVICIOS                 */
        /* ============================================================ */
        <div
          ref={gridScrollRef}
          className="flex-1 min-h-0 overflow-y-auto kiosk-scroll grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2 content-start auto-rows-max pb-16"
        >
          {filteredArmas.map((item) => {
            const itemLang = item.language?.[language] || item.language?.es;
            const itemNombre = itemLang?.nombre || item.nombre;
            const itemLema = itemLang?.lema || item.lema;
            const itemDesc = itemLang?.mision || item.descripcionBreve || item.misionEmpleo?.mision || '';
            const itemTipo = item.tipo === 'ARMA' ? (t.branch_type_arma || 'ARMA') : (t.branch_type_servicio || 'SERVICIO');
            const patronoNombre = typeof item.patrono === 'string' ? item.patrono : item.patrono?.nombre || '';

            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  savedScrollTopRef.current = gridScrollRef.current?.scrollTop || 0;
                  setSelectedItem(item);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    savedScrollTopRef.current = gridScrollRef.current?.scrollTop || 0;
                    setSelectedItem(item);
                  }
                }}
                className="group relative bg-slate-900/80 hover:bg-slate-800/90 border border-emerald-500/20 hover:border-emerald-400 rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] flex flex-col justify-between text-left touch-active overflow-hidden min-h-[280px] cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />

                {/* Insignia + Acciones (Video / Badge) */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-lg flex items-center justify-center border border-emerald-500/30 group-hover:scale-105 transition-transform flex-shrink-0">
                    {item.escudo?.imagen || item.imagenPrincipal ? (
                      <img
                        src={item.escudo?.imagen || item.imagenPrincipal}
                        alt={itemNombre}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Shield className="w-8 h-8 text-emerald-600" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {ARMAS_MEDIA[item.id]?.videoUrl && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const m = ARMAS_MEDIA[item.id];
                          setActiveVideo({
                            url: m.videoUrl!,
                            title: m.videoTitle || `Video Institucional — ${itemNombre}`,
                          });
                        }}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/50 text-[10px] font-black transition-all shadow-md touch-active cursor-pointer group/vbtn z-10"
                        title="Ver video institucional"
                      >
                        <Play className="w-3 h-3 fill-current text-emerald-400 group-hover/vbtn:text-slate-950" />
                        <span>Ver Video</span>
                      </button>
                    )}
                    <span className="bg-green-900/60 text-emerald-300 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-500/30">
                      {itemTipo}
                    </span>
                  </div>
                </div>

                {/* Info: Nombre + Lema */}
                <div className="flex-1 mb-3">
                  <h3 className="text-xl font-black text-white group-hover:text-emerald-300 transition-colors leading-tight">
                    {itemNombre}
                  </h3>
                  {itemLema && (
                    <p className="text-xs text-emerald-400/90 italic font-semibold mt-1">
                      “{itemLema}”
                    </p>
                  )}
                  <p className="text-slate-300 text-xs line-clamp-4 mt-2.5 leading-relaxed text-justify">
                    {itemDesc}
                  </p>
                </div>

                {/* Patrono con Icono */}
                <div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-xs text-slate-300 font-bold leading-snug line-clamp-2">
                      {patronoNombre}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: VISOR DE IMÁGENES A PANTALLA COMPLETA (HD ZOOM)      */}
      {/* ============================================================ */}
      {fullscreenImage && (
        <div
          onClick={() => setFullscreenImage(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 md:p-8 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
            <div className="min-w-0">
              <h3 className="text-base md:text-xl font-black text-white truncate">
                {fullscreenImage.title || fullscreenImage.alt}
              </h3>
              {fullscreenImage.description && (
                <p className="text-xs text-slate-400 truncate mt-0.5">{fullscreenImage.description}</p>
              )}
            </div>
            <button
              onClick={() => setFullscreenImage(null)}
              className="p-2.5 rounded-full bg-slate-900 text-slate-300 hover:text-white border border-slate-700 touch-active"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 min-h-0 flex items-center justify-center p-4">
            <img
              src={fullscreenImage.url}
              alt={fullscreenImage.alt}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl drop-shadow-2xl animate-fade-in"
            />
          </div>

          <div className="text-center text-xs text-slate-500 pb-2 flex-shrink-0">
            {t.touch_close || (language === 'en' ? 'Tap anywhere to close' : language === 'qu' ? 'Mayllapipas llankay wichqanapaq' : 'Toque en cualquier lugar para cerrar')}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: LISTADO COMPLETO EN GALERÍA ÚNICA DE INMOLADOS        */}
      {/* ============================================================ */}
      {showHeroesModal && selectedItem && (() => {
        const personajes = (selectedItem.personajes || []).filter((p) => p.publicado !== false);

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-fade-in">
            <div className="w-full max-w-5xl bg-slate-900 border-2 border-red-500/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              {/* Header Modal */}
              <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-500/50 flex items-center justify-center text-red-300">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-black text-white">
                      {t.section_fallecidos || 'Fallecidos en Armas'} — {currentLang?.nombre || selectedItem.nombre}
                    </h3>
                    <p className="text-xs text-red-300 font-bold">
                      {personajes.length} {language === 'en' ? 'fallen in the line of duty' : language === 'qu' ? 'mamallakta amachasqankupi wañusqakuna' : 'inmolados en el cumplimiento del deber'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHeroesModal(false)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid de Fallecidos - Galería Única Sin Tabs */}
              <div className="p-4 md:p-6 overflow-y-auto kiosk-scroll grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 min-h-0 flex-1 content-start">
                {personajes.map((personaje, idx) => {
                  const pLang = (personaje as any).language?.[language] || personaje;
                  return (
                    <button
                      key={personaje.id || idx}
                      onClick={() => setSelectedPersonaje(personaje)}
                      className="group rounded-xl bg-slate-950 border border-slate-800 hover:border-red-500 hover:shadow-red-500/30 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col h-48 sm:h-52 md:h-56 text-left touch-active cursor-pointer"
                    >
                      {personaje.fotografia ? (
                        <div className="w-full flex-1 bg-black overflow-hidden flex items-center justify-center p-1 relative">
                          <img
                            src={personaje.fotografia}
                            alt={pLang.nombre || personaje.nombre}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="w-full flex-1 p-3 flex flex-col justify-between bg-gradient-to-b from-slate-900 to-slate-950">
                          <span className="text-[9px] font-black px-2 py-0.5 rounded uppercase bg-red-950 text-red-300 border border-red-500/40 truncate inline-block w-fit">
                            {pLang.rango || personaje.rango || (language === 'en' ? 'Military' : language === 'qu' ? 'Awqaq' : 'Militar')}
                          </span>
                          <h4 className="text-xs font-bold text-white group-hover:text-red-300 transition-colors line-clamp-3 leading-snug">
                            {pLang.nombre || personaje.nombre}
                          </h4>
                          <span className="text-[9px] text-slate-400 truncate">
                            {personaje.fecha || (language === 'en' ? 'In action' : language === 'qu' ? 'Awqanakuypi' : 'En acción')}
                          </span>
                        </div>
                      )}

                      <div className="w-full bg-slate-950 border-t border-slate-800/90 px-2 py-1.5 flex items-center justify-between text-[10px] flex-shrink-0">
                        <span className="font-bold text-slate-300 truncate group-hover:text-red-300 transition-colors">
                          {pLang.rango ? `${pLang.rango.split(' ')[0]} - ` : ''}{pLang.nombre?.split(',')[0] || personaje.nombre?.split(',')[0]}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-red-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer Modal */}
              <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
                <span className="text-xs text-slate-400 font-medium pl-2">
                  {language === 'en' ? `Showing ${personajes.length} fallen heroes` : language === 'qu' ? `${personajes.length} inmoladokunata qhawachispa` : `Mostrando ${personajes.length} inmolados`}
                </span>
                <button
                  onClick={() => setShowHeroesModal(false)}
                  className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
                >
                  {t.close || (language === 'en' ? 'Close' : language === 'qu' ? 'Wichqay' : 'Cerrar')}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ============================================================ */}
      {/* MODAL: DETALLE INDIVIDUAL DE UN HÉROE / INMOLADO (COMPACTO)  */}
      {/* ============================================================ */}
      {selectedPersonaje && (() => {
        const pLang = (selectedPersonaje as any).language?.[language] || selectedPersonaje;
        return (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-6 animate-fade-in">
            <div className="w-full max-w-3xl bg-slate-900 border-2 border-red-500/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 ${
                      selectedPersonaje.tipo === 'HEROE'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}
                  >
                    {selectedPersonaje.tipo === 'HEROE'
                      ? (language === 'en' ? 'Hero of the Homeland' : language === 'qu' ? 'Mamallaktapa Apu Awqa' : 'Héroe de la Patria')
                      : (language === 'en' ? 'Fallen in Action / Martyr' : language === 'qu' ? 'Awqanakuy Wañusqa' : 'Fallecido en Acción / Mártir')}
                  </span>
                  <h3 className="text-sm md:text-base font-black text-white truncate">{pLang.nombre || selectedPersonaje.nombre}</h3>
                </div>
                <button
                  onClick={() => setSelectedPersonaje(null)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body con 2 columnas (foto + datos) */}
              <div className="p-4 md:p-6 overflow-y-auto kiosk-scroll flex-1">
                <div className="flex flex-col md:flex-row gap-5 items-center md:items-start">
                  {/* Ficha / Foto vertical */}
                  <div className="w-48 md:w-56 h-64 md:h-72 rounded-2xl bg-black border-2 border-red-500/40 overflow-hidden shadow-xl flex-shrink-0 flex items-center justify-center p-1">
                    {selectedPersonaje.fotografia ? (
                      <img
                        src={selectedPersonaje.fotografia}
                        alt={pLang.nombre || selectedPersonaje.nombre}
                        className="w-full h-full object-contain rounded-xl"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <User className="w-16 h-16" />
                      </div>
                    )}
                  </div>

                  {/* Datos informativos */}
                  <div className="flex-1 space-y-3.5 text-center md:text-left min-w-0">
                    <div>
                      <h4 className="text-lg md:text-xl font-black text-white leading-tight">
                        {pLang.nombre || selectedPersonaje.nombre}
                      </h4>
                      {(pLang.rango || selectedPersonaje.rango) && (
                        <p className="text-xs md:text-sm font-bold text-red-400 mt-0.5">
                          {pLang.rango || selectedPersonaje.rango}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center md:justify-start text-xs">
                      {selectedPersonaje.fecha && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                          <Calendar className="w-3 h-3 text-red-400" />
                          {selectedPersonaje.fecha}
                        </span>
                      )}
                      {(pLang.conflicto || (selectedPersonaje as any).conflicto) && (
                        <span className="inline-block text-[11px] font-bold text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                          {pLang.conflicto || (selectedPersonaje as any).conflicto}
                        </span>
                      )}
                    </div>

                    {/* Reseña */}
                    <div className="pt-2 border-t border-slate-800">
                      <h5 className="text-[11px] font-black uppercase tracking-widest text-emerald-400 mb-1">
                        {t.biography_record || (language === 'en' ? 'Biography & Record' : language === 'qu' ? 'Kawsay Willakuy' : 'Biografía y Reseña')}
                      </h5>
                      <p className="text-slate-300 text-xs md:text-sm leading-relaxed text-justify">
                        {pLang.resena || selectedPersonaje.resena}
                      </p>
                    </div>

                    {(pLang.hechoHistorico || selectedPersonaje.hechoHistorico) && (
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-0.5">
                          {t.historical_event || (language === 'en' ? 'Historical Event' : language === 'qu' ? 'Hatun Ruray' : 'Hecho Histórico Destacado')}
                        </h5>
                        <p className="text-slate-300 text-xs leading-relaxed text-justify">
                          {pLang.hechoHistorico || selectedPersonaje.hechoHistorico}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Fijo Siempre Visible */}
              <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex justify-end flex-shrink-0">
                <button
                  onClick={() => setSelectedPersonaje(null)}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition-colors shadow-lg"
                >
                  {t.close_record || (language === 'en' ? 'Close Record' : language === 'qu' ? 'Fichata Wichqay' : 'Cerrar Ficha')}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ============================================================ */}
      {/* MODAL: DETALLE DE ELEMENTO SIMBÓLICO DEL ESCUDO              */}
      {/* ============================================================ */}
      {selectedElemento && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-emerald-500/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-4 h-4" /> {t.symbolic_element || (language === 'en' ? 'Symbolic Element' : language === 'qu' ? 'Unancha Elemento' : 'Elemento Simbólico')}
              </h3>
              <button
                onClick={() => setSelectedElemento(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <h4 className="text-xl font-black text-white">{selectedElemento.nombre}</h4>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line text-justify">
                {selectedElemento.descripcion}
              </p>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedElemento(null)}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-slate-950 font-black text-xs hover:brightness-110"
              >
                {t.understood || (language === 'en' ? 'Understood' : language === 'qu' ? 'Tukuykun' : 'Entendido')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: REPRODUCTOR DE VIDEO INSTITUCIONAL                   */}
      {/* ============================================================ */}
      {activeVideo && (
        <VideoPlayerModal
          videoUrl={activeVideo.url}
          title={activeVideo.title}
          fromDetail={Boolean(selectedItem)}
          onClose={() => setActiveVideo(null)}
          onBackToCards={() => {
            setActiveVideo(null);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
};
