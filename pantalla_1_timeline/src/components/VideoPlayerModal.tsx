import React, { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Play, Pause, RotateCcw } from 'lucide-react';

interface VideoPlayerModalProps {
  videoUrl: string;
  title: string;
  onClose: () => void;
  onViewDetails?: () => void;
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  return match ? match[1] : null;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  videoUrl,
  title,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [showCenterIcon, setShowCenterIcon] = useState<boolean>(false);
  const [isEnded, setIsEnded] = useState<boolean>(false);

  const youtubeId = extractYouTubeId(videoUrl);
  const isYouTube = !!youtubeId;
  const youtubeEmbedUrl = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&controls=1&playsinline=1&vq=hd1080&hd=1&enablejsapi=1`
    : null;

  // AutoPlay al montar
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isYouTube) return;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Si el navegador bloquea autoplay con sonido, intentar en mute
          video.muted = true;
          video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        });
    }

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      video.play().catch(() => {});
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setIsEnded(true);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [isYouTube]);

  // Tecla Escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClose = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    onClose();
  }, [onClose]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isEnded) {
      video.currentTime = 0;
      video.play();
      setIsPlaying(true);
      setIsEnded(false);
      return;
    }

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      setShowCenterIcon(true);
    } else {
      video.play();
      setIsPlaying(true);
      setShowCenterIcon(true);
      setTimeout(() => setShowCenterIcon(false), 900);
    }
  };

  return createPortal(
    <div
      style={{ zIndex: 9999 }}
      className="fixed inset-0 bg-black w-screen h-screen overflow-hidden select-none flex items-center justify-center animate-fade-in"
    >
      {/* BOTÓN CERRAR FLOTANTE PROMINENTE (Sin ningún card alrededor) */}
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 z-50 flex items-center gap-2.5 px-6 py-3 rounded-full bg-red-600/95 hover:bg-red-500 text-white font-black text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(239,68,68,0.7)] border-2 border-white/90 backdrop-blur-md cursor-pointer touch-active hover:scale-105 active:scale-95 transition-all"
        title="Cerrar video"
      >
        <X className="w-6 h-6 stroke-[3]" />
        <span>CERRAR</span>
      </button>

      {/* VIDEO A PANTALLA COMPLETA DIRECTA (Sin marcos, sin bordes, sin cards) */}
      {isYouTube && youtubeEmbedUrl ? (
        <div className="w-full h-full bg-black relative">
          <iframe
            src={youtubeEmbedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
      ) : (
        <div
          onClick={togglePlay}
          className="w-full h-full bg-black relative flex items-center justify-center cursor-pointer"
        >
          <video
            ref={videoRef}
            playsInline
            preload="auto"
            autoPlay
            className="w-full h-full object-contain"
          >
            <source src={videoUrl} type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"' />
          </video>

          {/* OVERLAY CENTRAL FLOTANTE DE PLAY / PAUSA / REINICIO (Solo aparece al pausar o terminar) */}
          {(!isPlaying || showCenterIcon || isEnded) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none animate-fade-in">
              <div className="w-24 h-24 rounded-full bg-emerald-500/95 text-slate-950 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.9)] border-4 border-white transform hover:scale-110 transition-all">
                {isEnded ? (
                  <RotateCcw className="w-12 h-12 stroke-[2.5]" />
                ) : isPlaying ? (
                  <Pause className="w-12 h-12 fill-current" />
                ) : (
                  <Play className="w-12 h-12 fill-current ml-1.5" />
                )}
              </div>
            </div>
          )}

          {/* BARRA DE PROGRESO INFERIOR ULTRA DISCRETA (Sin panel ni card de controles) */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/15 pointer-events-none">
            <div
              className="h-full bg-emerald-400 transition-all duration-200"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};
