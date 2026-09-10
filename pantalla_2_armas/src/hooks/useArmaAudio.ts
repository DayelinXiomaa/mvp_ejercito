import { useState, useEffect, useRef, useCallback } from 'react';

interface UseArmaAudioOptions {
  audioUrl?: string;
  isPausedExternally?: boolean;
  volume?: number;
}

export function useArmaAudio({
  audioUrl,
  isPausedExternally = false,
  volume = 0.45,
}: UseArmaAudioOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Inicializar o cambiar el audio cuando cambia la URL
  useEffect(() => {
    if (!audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(audioUrl);
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    if (!isPausedExternally) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Autoplay policy puede requerir interacción previa del usuario
          console.warn('[useArmaAudio] Autoplay inicial detenido o diferido:', err);
          setIsPlaying(false);
        });
      }
    }

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [audioUrl, volume]);

  // Manejar pausa externa (ej. cuando se abre el modal de video)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (isPausedExternally) {
      if (!audio.paused) {
        audio.pause();
      }
    } else {
      if (audio.paused && !isMuted) {
        const p = audio.play();
        if (p !== undefined) {
          p.catch(() => {});
        }
      }
    }
  }, [isPausedExternally, isMuted, audioUrl]);

  // Conmutar Mute / Play
  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.muted = false;
      setIsMuted(false);
      const p = audio.play();
      if (p !== undefined) {
        p.catch(console.error);
      }
    } else {
      // Si está sonando, silenciar/pausar
      audio.pause();
      setIsMuted(true);
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.paused && !isPausedExternally) {
      audioRef.current.play().catch(console.error);
    }
  }, [isPausedExternally]);

  return {
    isPlaying,
    isMuted,
    toggleMute,
    pause,
    resume,
  };
}
