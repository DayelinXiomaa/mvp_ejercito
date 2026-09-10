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
  Shield,
  ArrowLeft,
} from 'lucide-react';

interface VideoPlayerModalProps {
  videoUrl: string;
  title: string;
  onClose: () => void;
  onBackToCards?: () => void;
  fromDetail?: boolean;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  videoUrl,
  title,
  onClose,
  onBackToCards,
  fromDetail = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [showCenterIcon, setShowCenterIcon] = useState<boolean>(false);

  // Refs para funciones de callback para evitar remounts innecesarios
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const onBackToCardsRef = useRef(onBackToCards);
  useEffect(() => {
    onBackToCardsRef.current = onBackToCards;
  }, [onBackToCards]);

  // Cerrar solo el reproductor de video
  const handleCloseVideoOnly = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    onCloseRef.current?.();
  }, []);

  // Cerrar y regresar directamente a la cuadrícula de tarjetas
  const handleBackToCards = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    if (onBackToCardsRef.current) {
      onBackToCardsRef.current();
    } else {
      onCloseRef.current?.();
    }
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

  // Detener video (Stop completo y regresar al inicio)
  const handleStop = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  // Reiniciar video
  const handleRestart = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    setCurrentTime(0);
    video.play().catch(console.error);
    setIsPlaying(true);
  }, []);

  // Autoplay inicial y eventos (solo se ejecuta al montar o cambiar videoUrl)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isCancelled = false;
    video.volume = 0.9;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (!isCancelled) setIsPlaying(true);
        })
        .catch(() => {
          if (!isCancelled) setIsPlaying(false);
        });
    }

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => setDuration(video.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      video.currentTime = 0;
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseVideoOnly();
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
      video.removeEventListener('ended', onEnded);
      window.removeEventListener('keydown', handleKeyDown);
      video.pause();
    };
  }, [videoUrl, handleCloseVideoOnly, togglePlay]);

  // Conmutar Mute
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  // Barra de progreso interactiva
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
      {/* ============================================================ */}
      {/* HEADER SUPERIOR: TÍTULO INFORMATIVO Y ESTADO                 */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between gap-3 border-b border-emerald-500/30 pb-2.5 sm:pb-3 flex-shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 shadow">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
              Video Institucional Oficial
            </span>
            <h3 className="text-sm sm:text-base font-black text-white truncate max-w-md md:max-w-xl">
              {title}
            </h3>
          </div>
        </div>

        {/* Indicador táctil y botón de cierre secundario */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-emerald-300/80 bg-slate-900/90 px-3 py-1.5 rounded-full border border-emerald-500/20 hidden md:inline">
            Controles táctiles en la parte inferior ↓
          </span>
          <button
            onClick={handleCloseVideoOnly}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-slate-400 hover:text-white hover:bg-red-900/60 hover:border-red-500 transition-all touch-active cursor-pointer text-xs font-bold"
            title="Cerrar video"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CONTENEDOR DEL VIDEO (TOCAR DIRECTAMENTE PARA PLAY/PAUSE)   */}
      {/* ============================================================ */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-1 sm:p-2 my-1 sm:my-2 relative">
        <div
          onClick={togglePlay}
          className="w-full max-w-5xl h-full bg-black rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.25)] relative flex items-center justify-center cursor-pointer group"
        >
          <video
            ref={videoRef}
            playsInline
            preload="metadata"
            className="w-full h-full object-contain"
          >
            <source src={videoUrl} type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"' />
          </video>

          {/* Indicador animado al pausar/reproducir */}
          {showCenterIcon && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-emerald-600/90 text-slate-950 flex items-center justify-center shadow-2xl scale-110">
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

      {/* ============================================================ */}
      {/* PANEL DE CONTROL TÁCTIL (PLAY, PAUSE, STOP, SEEKER, TIEMPO)  */}
      {/* ============================================================ */}
      <div className="bg-slate-950/95 border border-emerald-500/30 rounded-2xl p-2.5 sm:p-3 flex flex-col gap-2 flex-shrink-0 shadow-2xl max-w-5xl mx-auto w-full">
        {/* Barra de progreso interactiva táctil */}
        <div className="flex items-center gap-3 w-full">
          <span className="text-[11px] font-mono text-emerald-300 font-bold min-w-[38px] text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-2 sm:h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 hover:accent-emerald-300 transition-all"
          />
          <span className="text-[11px] font-mono text-slate-400 font-bold min-w-[38px]">
            {formatTime(duration)}
          </span>
        </div>

        {/* Botones de control físico y estado */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Grupo de Controles: Reproducir/Pausar, Detener, Reiniciar */}
          <div className="flex items-center gap-2">
            {/* Botón Principal PLAY / PAUSE */}
            <button
              onClick={togglePlay}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs sm:text-sm transition-all shadow-md touch-active cursor-pointer ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
              title={isPlaying ? 'Pausar video' : 'Reproducir video'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>PAUSAR</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>REPRODUCIR</span>
                </>
              )}
            </button>

            {/* Botón DETENER (Stop) */}
            <button
              onClick={handleStop}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 font-black text-xs transition-all touch-active cursor-pointer"
              title="Detener video y volver al inicio"
            >
              <Square className="w-3.5 h-3.5 fill-current text-red-400" />
              <span>DETENER</span>
            </button>

            {/* Botón REINICIAR */}
            <button
              onClick={handleRestart}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 font-bold text-xs transition-all touch-active cursor-pointer hidden sm:flex"
              title="Reiniciar video desde 0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Reiniciar</span>
            </button>

            {/* Botón Silenciar / Sonido */}
            <button
              onClick={toggleMute}
              className={`p-2 rounded-xl border transition-all touch-active cursor-pointer ${
                isMuted
                  ? 'bg-red-950 border-red-500/60 text-red-300'
                  : 'bg-slate-900 border-slate-700 text-emerald-400 hover:bg-slate-800'
              }`}
              title={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Grupo de Salida / Cerrar Video en la parte inferior (fácil interacción en televisor táctil) */}
          <div className="flex items-center gap-2.5 ml-auto">
            {fromDetail && onBackToCards && (
              <button
                onClick={handleBackToCards}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs sm:text-sm transition-all touch-active cursor-pointer"
                title="Volver directamente a todas las armas"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Todas las Armas</span>
              </button>
            )}

            {/* BOTÓN CERRAR VIDEO PRINCIPAL EN LA PARTE INFERIOR */}
            <button
              onClick={handleCloseVideoOnly}
              className="flex items-center gap-2.5 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs sm:text-sm tracking-wider transition-all shadow-xl shadow-red-950/80 border-2 border-red-400/80 touch-active cursor-pointer hover:scale-105 active:scale-95 ring-2 ring-red-500/30"
              title="Cerrar reproductor de video"
            >
              <X className="w-5 h-5 stroke-[3]" />
              <span>CERRAR VIDEO</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
