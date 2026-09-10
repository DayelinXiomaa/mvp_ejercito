import React, { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Play,
  Pause,
  Square,
  RotateCcw,
  Volume2,
  VolumeX,
  Film,
  AlertCircle,
} from 'lucide-react';
import { useI18n } from '../context/I18nContext';

interface VideoPlayerModalProps {
  videoUrl: string;
  poster?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  accentColor?: 'red' | 'amber' | 'emerald';
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  videoUrl,
  poster,
  title,
  subtitle,
  badge,
  accentColor = 'red',
  onClose,
}) => {
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [showCenterIcon, setShowCenterIcon] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<string | null>(null);

  // Paleta de colores según sección
  const colorMap = {
    red: {
      border: 'border-red-500/40',
      borderHover: 'border-red-400',
      badgeBg: 'bg-red-950/90',
      badgeText: 'text-red-300',
      badgeBorder: 'border-red-500/50',
      iconBg: 'bg-red-950',
      iconBorder: 'border-red-500/40',
      iconColor: 'text-red-400',
      shadow: 'shadow-[0_0_50px_rgba(239,68,68,0.3)]',
      playBg: 'bg-red-600 hover:bg-red-500 text-white',
      accentText: 'text-red-400',
      rangeAccent: 'accent-red-500',
    },
    amber: {
      border: 'border-amber-500/40',
      borderHover: 'border-amber-400',
      badgeBg: 'bg-amber-950/90',
      badgeText: 'text-amber-300',
      badgeBorder: 'border-amber-500/50',
      iconBg: 'bg-amber-950',
      iconBorder: 'border-amber-500/40',
      iconColor: 'text-amber-400',
      shadow: 'shadow-[0_0_50px_rgba(245,158,11,0.3)]',
      playBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
      accentText: 'text-amber-400',
      rangeAccent: 'accent-amber-500',
    },
    emerald: {
      border: 'border-emerald-500/40',
      borderHover: 'border-emerald-400',
      badgeBg: 'bg-emerald-950/90',
      badgeText: 'text-emerald-300',
      badgeBorder: 'border-emerald-500/50',
      iconBg: 'bg-emerald-950',
      iconBorder: 'border-emerald-500/40',
      iconColor: 'text-emerald-400',
      shadow: 'shadow-[0_0_50px_rgba(16,185,129,0.3)]',
      playBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
      accentText: 'text-emerald-400',
      rangeAccent: 'accent-emerald-500',
    },
  };

  const c = colorMap[accentColor] || colorMap.red;

  // Ref para onClose para no reiniciar el efecto en cada render
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Cerrar y pausar video
  const handleClose = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    onCloseRef.current?.();
  }, []);

  // Conmutar Play / Pause
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
    setShowCenterIcon(true);
    setTimeout(() => setShowCenterIcon(false), 600);
  }, []);

  // Detener video (Stop completo y volver a 0)
  const handleStop = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  // Reiniciar video desde el inicio
  const handleRestart = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    setCurrentTime(0);
    video.play().catch(console.error);
    setIsPlaying(true);
  }, []);

  // Autoplay solo al montar el componente o si cambia videoUrl
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isCancelled = false;
    setHasError(null);
    setIsLoading(true);
    video.volume = 0.9;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (!isCancelled) {
            setIsPlaying(true);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (!isCancelled) {
            setIsPlaying(false);
          }
        });
    }

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => {
      setDuration(video.duration || 0);
      setIsLoading(false);
    };
    const onPlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };
    const onCanPlay = () => setIsLoading(false);
    const onEnded = () => {
      setIsPlaying(false);
      video.currentTime = 0;
    };
    const onError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      const err = video.error;
      console.error('Video error:', err);
      let msg = 'No se pudo reproducir el video. Verifique el archivo.';
      if (err) {
        if (err.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) msg = 'Formato de video no compatible o archivo no encontrado.';
        else if (err.code === MediaError.MEDIA_ERR_NETWORK) msg = 'Error de red o conexión al cargar el video.';
        else if (err.code === MediaError.MEDIA_ERR_DECODE) msg = 'Error de decodificación en el video.';
      }
      setHasError(msg);
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('ended', onEnded);
    video.addEventListener('error', onError);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isCancelled = true;
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('error', onError);
      window.removeEventListener('keydown', handleKeyDown);
      video.pause();
    };
  }, [videoUrl, handleClose, togglePlay]);

  // Conmutar Silencio
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  // Seek bar
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = Number(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Formato mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return createPortal(
    <div
      style={{ zIndex: 9999 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex flex-col h-screen w-screen overflow-hidden p-2.5 sm:p-4 select-none animate-fade-in"
    >
      {/* HEADER SUPERIOR */}
      <div className={`flex items-center justify-between gap-3 border-b ${c.border} pb-2.5 sm:pb-3 flex-shrink-0`}>
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-xl ${c.iconBg} border ${c.iconBorder} flex items-center justify-center flex-shrink-0 shadow`}>
            <Film className={`w-4 h-4 ${c.iconColor}`} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${c.badgeText} ${c.badgeBg} px-2 py-0.5 rounded border ${c.badgeBorder}`}>
                {badge || t.video_badge_default || 'DOCUMENTAL AUDIOVISUAL'}
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">• {t.museum_footer || 'Sala de Pacificación Nacional'}</span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white truncate max-w-md md:max-w-2xl mt-0.5">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate hidden md:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Indicador táctil y botón de cierre secundario */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 bg-slate-900/90 px-3 py-1.5 rounded-full border border-slate-700 hidden md:inline">
            {t.video_touch_hint || 'Controles táctiles en la parte inferior ↓'}
          </span>
          <button
            onClick={handleClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-slate-400 hover:text-white hover:bg-red-900/60 hover:border-red-500 transition-all touch-active cursor-pointer text-xs font-bold"
            title={t.video_close_tooltip || 'Cerrar video'}
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">{t.close || 'Cerrar'}</span>
          </button>
        </div>
      </div>

      {/* CONTENEDOR DEL VIDEO (CLICK DIRECTO PARA PLAY/PAUSE) */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-1 sm:p-2 my-1 sm:my-2 relative">
        <div
          onClick={hasError ? undefined : togglePlay}
          className={`w-full max-w-5xl h-full bg-black rounded-2xl sm:rounded-3xl overflow-hidden border-2 ${c.border} ${c.shadow} relative flex items-center justify-center cursor-pointer group`}
        >
          <video
            ref={videoRef}
            poster={poster}
            playsInline
            preload="metadata"
            className="w-full h-full object-contain"
          >
            <source src={videoUrl} type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"' />
          </video>

          {/* Spinner de carga / buffering */}
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 pointer-events-none z-20 animate-fade-in">
              <div className="w-12 h-12 rounded-full border-4 border-slate-600 border-t-white animate-spin mb-3" />
              <span className="text-xs font-bold text-slate-200 tracking-wider uppercase">
                Cargando video...
              </span>
            </div>
          )}

          {/* Banner de error y reintento */}
          {hasError && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6 z-20 text-center animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
              <p className="text-sm font-bold text-white mb-1 max-w-md">{hasError}</p>
              <p className="text-xs font-mono text-slate-400 mb-4 truncate max-w-sm">{videoUrl}</p>
              <button
                type="button"
                onClick={() => {
                  setHasError(null);
                  setIsLoading(true);
                  if (videoRef.current) {
                    videoRef.current.load();
                    videoRef.current.play().catch(console.error);
                  }
                }}
                className={`px-5 py-2.5 rounded-xl ${c.playBg} font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer touch-active active:scale-95 transition-transform`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reintentar</span>
              </button>
            </div>
          )}

          {/* Botón central de Play cuando está pausado (o si autoplay fue bloqueado) */}
          {!isPlaying && !isLoading && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/35 z-10 pointer-events-none">
              <div className={`w-20 h-20 rounded-full ${c.iconBg} text-white flex items-center justify-center shadow-2xl scale-110 border-2 ${c.iconBorder} group-hover:scale-125 transition-transform`}>
                <Play className="w-10 h-10 fill-current ml-1" />
              </div>
            </div>
          )}

          {/* Animación central al pausar o reproducir mediante clic */}
          {showCenterIcon && !isLoading && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none animate-fade-in z-15">
              <div className={`w-20 h-20 rounded-full ${c.iconBg} text-white flex items-center justify-center shadow-2xl scale-110 border-2 ${c.iconBorder}`}>
                {isPlaying ? (
                  <Play className="w-10 h-10 fill-current ml-1" />
                ) : (
                  <Pause className="w-10 h-10 fill-current" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PANEL DE CONTROL TÁCTIL INFERIOR */}
      <div className={`bg-slate-950/95 border ${c.border} rounded-2xl p-2.5 sm:p-3 flex flex-col gap-2 flex-shrink-0 shadow-2xl max-w-5xl mx-auto w-full`}>
        {/* Barra de progreso interactiva */}
        <div className="flex items-center gap-3 w-full">
          <span className={`text-[11px] font-mono ${c.accentText} font-bold min-w-[38px] text-right`}>
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className={`flex-1 h-2 sm:h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer ${c.rangeAccent} transition-all`}
          />
          <span className="text-[11px] font-mono text-slate-400 font-bold min-w-[38px]">
            {formatTime(duration)}
          </span>
        </div>

        {/* Botones de control físico y estado */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {/* PLAY / PAUSE */}
            <button
              onClick={togglePlay}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs sm:text-sm transition-all shadow-md touch-active cursor-pointer ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                  : c.playBg
              }`}
              title={isPlaying ? (t.video_pause_tooltip || 'Pausar video') : (t.video_play_tooltip || 'Reproducir video')}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>{t.video_pause || 'PAUSAR'}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{t.video_play || 'REPRODUCIR'}</span>
                </>
              )}
            </button>

            {/* DETENER */}
            <button
              onClick={handleStop}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 font-black text-xs transition-all touch-active cursor-pointer"
              title={t.video_stop_tooltip || 'Detener video y volver al inicio'}
            >
              <Square className="w-3.5 h-3.5 fill-current text-red-400" />
              <span>{t.video_stop || 'DETENER'}</span>
            </button>

            {/* REINICIAR */}
            <button
              onClick={handleRestart}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 font-bold text-xs transition-all touch-active cursor-pointer hidden sm:flex"
              title={t.video_restart_tooltip || 'Reiniciar video desde el inicio'}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${c.accentText}`} />
              <span>{t.video_restart || 'Reiniciar'}</span>
            </button>

            {/* SONIDO / SILENCIO */}
            <button
              onClick={toggleMute}
              className={`p-2 rounded-xl border transition-all touch-active cursor-pointer ${
                isMuted
                  ? 'bg-red-950 border-red-500/60 text-red-300'
                  : `bg-slate-900 border-slate-700 ${c.accentText} hover:bg-slate-800`
              }`}
              title={isMuted ? (t.video_unmute_tooltip || 'Activar sonido') : (t.video_mute_tooltip || 'Silenciar')}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* BOTÓN CERRAR VIDEO PRINCIPAL INFERIOR */}
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              onClick={handleClose}
              className="flex items-center gap-2.5 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs sm:text-sm tracking-wider transition-all shadow-xl shadow-red-950/80 border-2 border-red-400/80 touch-active cursor-pointer hover:scale-105 active:scale-95 ring-2 ring-red-500/30"
              title={t.video_close_tooltip || 'Cerrar reproductor de video'}
            >
              <X className="w-5 h-5 stroke-[3]" />
              <span>{t.video_close_btn || 'CERRAR VIDEO'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default VideoPlayerModal;
