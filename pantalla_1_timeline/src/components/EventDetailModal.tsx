import React, { useState, useEffect } from 'react';
import { useTimeline } from '../context/TimelineContext';
import { useI18n } from '../context/I18nContext';
import { Calendar, MapPin, User, ArrowLeft, Image as ImageIcon, Maximize2 } from 'lucide-react';

export const EventDetailModal: React.FC = () => {
  const { selectedEvent, setSelectedEvent, setActiveVideo } = useTimeline();
  const { language, t } = useI18n();

  const [activeImage, setActiveImage] = useState<string>('');
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panPos, setPanPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const ytIframeRef = React.useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (selectedEvent) {
      setActiveImage(selectedEvent.image || selectedEvent.thumbnail || '');
      setZoomScale(1);
      setPanPos({ x: 0, y: 0 });
    }
  }, [selectedEvent?.id]);

  const extractYouTubeId = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeVideoId = selectedEvent?.video ? extractYouTubeId(selectedEvent.video) : null;
  const youtubeEmbedUrl = youtubeVideoId
    ? `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0&modestbranding=1&controls=1&playsinline=1&vq=hd1080&hd=1&enablejsapi=1`
    : null;

  React.useEffect(() => {
    if (!youtubeVideoId) return;

    const enforceMaxQuality = () => {
      if (!(window as any).YT || !(window as any).YT.Player || !ytIframeRef.current) return;
      try {
        new (window as any).YT.Player(ytIframeRef.current, {
          events: {
            onReady: (event: any) => {
              try {
                event.target.setPlaybackQuality('hd1080');
              } catch (e) {}
            },
            onStateChange: (event: any) => {
              if (event.data === 1) {
                try {
                  event.target.setPlaybackQuality('hd1080');
                } catch (e) {}
              }
            }
          }
        });
      } catch (e) {}
    };

    if (!(window as any).YT) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(script);
      const prevCallback = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        enforceMaxQuality();
      };
    } else {
      enforceMaxQuality();
    }
  }, [youtubeVideoId]);

  if (!selectedEvent) return null;

  const langData = selectedEvent.language[language] || selectedEvent.language['es'];
  const title = langData.title || selectedEvent.title;
  const description = langData.description || selectedEvent.description;

  const galleryImages = selectedEvent.gallery && selectedEvent.gallery.length > 0
    ? selectedEvent.gallery
    : [selectedEvent.image, selectedEvent.thumbnail].filter(Boolean) as string[];

  const handleResetZoom = () => {
    setZoomScale(1);
    setPanPos({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - panPos.x, y: e.clientY - panPos.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || zoomScale <= 1) return;
    setPanPos({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-6 md:p-8 animate-fade-in select-none">
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-slate-900 border border-emerald-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row">
        {/* Columna Izquierda: Multimedia con Zoom HD o Reproductor de Video */}
        <div
          className={`lg:w-1/2 relative bg-black flex flex-col justify-between items-center overflow-hidden min-h-[360px] ${
            selectedEvent.video ? '' : 'cursor-grab active:cursor-grabbing'
          }`}
          onMouseDown={selectedEvent.video ? undefined : handleMouseDown}
          onMouseMove={selectedEvent.video ? undefined : handleMouseMove}
          onMouseUp={selectedEvent.video ? undefined : handleMouseUp}
          onMouseLeave={selectedEvent.video ? undefined : handleMouseUp}
        >
          {selectedEvent.video ? (
            <div className="relative w-full h-full flex-1 flex flex-col items-center justify-center p-4 bg-black">
              {youtubeEmbedUrl ? (
                <div className="w-full flex flex-col gap-2">
                  {/* Badge informativo de máxima calidad HD */}
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/90 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      1080p Full HD • Máxima Calidad
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase">
                      60 FPS Streaming
                    </span>
                  </div>

                  <div className="w-full aspect-video max-h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-emerald-500/30 bg-black">
                    <iframe
                      ref={ytIframeRef}
                      src={youtubeEmbedUrl}
                      title={title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col gap-2">
                  {/* Badge informativo de máxima calidad HD local y botón Pantalla Completa */}
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/90 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      1080p Full HD • Video Institucional
                    </span>
                    <button
                      onClick={() => {
                        if (selectedEvent.video) {
                          setActiveVideo({
                            url: selectedEvent.video,
                            title: title,
                            event: selectedEvent,
                          });
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer hover:scale-105"
                      title="Ampliar video a pantalla completa"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Pantalla Completa</span>
                    </button>
                  </div>

                  <div className="w-full aspect-video max-h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-emerald-500/30 bg-black flex items-center justify-center">
                    <video
                      poster={selectedEvent.image || selectedEvent.thumbnail}
                      controls
                      autoPlay
                      preload="metadata"
                      playsInline
                      className="w-full h-full object-contain"
                    >
                      <source src={selectedEvent.video} type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"' />
                    </video>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Imagen Principal Activa */}
              <div className="relative w-full flex-1 flex items-center justify-center p-4 overflow-hidden">
                <img
                  src={activeImage || selectedEvent.image || selectedEvent.thumbnail}
                  alt={title}
                  className="w-full h-full object-contain max-h-[460px] drop-shadow-2xl animate-fade-in pointer-events-none rounded-xl"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    if (el.src !== selectedEvent.thumbnail && selectedEvent.thumbnail) {
                      el.src = selectedEvent.thumbnail;
                    }
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 pointer-events-none" />

              {/* Galería de Miniaturas Inferior */}
              {galleryImages.length > 1 && (
                <div className="relative z-10 w-full p-4 bg-slate-950/90 border-t border-slate-800 flex items-center gap-3 overflow-x-auto no-scrollbar">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex-shrink-0 mr-1">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Imágenes:</span>
                  </div>
                  {galleryImages.map((imgUrl, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setActiveImage(imgUrl);
                        handleResetZoom();
                      }}
                      className={`relative w-16 h-12 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 touch-active ${
                        activeImage === imgUrl
                          ? 'border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-105'
                          : 'border-slate-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt={`Vista ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Columna Derecha: Información Detallada */}
        <div className="lg:w-1/2 p-6 lg:p-8 flex flex-col justify-between overflow-y-auto kiosk-scroll">
          <div>
            {/* Header del Modal */}
            <div className="flex items-center justify-between mb-3">
              <span className="bg-green-900/80 text-emerald-200 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                {selectedEvent.displayDate || (selectedEvent.month ? `${selectedEvent.month} de ${selectedEvent.year}` : selectedEvent.year)}
              </span>
              <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800">
                {selectedEvent.category}
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-black text-white mb-3 leading-snug">
              {title}
            </h2>

            {(selectedEvent.hero || selectedEvent.location) && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4 text-xs">
                {selectedEvent.hero && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <User className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[9px] text-slate-500 uppercase font-bold">{t.detail_hero}</div>
                      <div className="font-bold text-white truncate text-xs">{selectedEvent.hero}</div>
                    </div>
                  </div>
                )}
                {selectedEvent.location && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[9px] text-slate-500 uppercase font-bold">{t.detail_location}</div>
                      <div className="font-bold text-white truncate text-xs">{selectedEvent.location}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Descripción Completa */}
            <div className="text-slate-200 text-sm md:text-[15px] leading-relaxed mb-6 whitespace-pre-line font-normal text-justify">
              {description}
            </div>
          </div>

          {/* Botón de cierre accesible en zona táctil */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
            <button
              onClick={() => setSelectedEvent(null)}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-green-800 to-emerald-700 text-white font-extrabold text-base shadow-xl hover:brightness-110 transition-all min-h-[50px] min-w-[50px] touch-active"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t.nav_back}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
