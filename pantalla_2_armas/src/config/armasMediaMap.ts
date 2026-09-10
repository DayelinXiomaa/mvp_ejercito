export interface ArmaMedia {
  videoUrl?: string;
  himnoUrl?: string;
  videoTitle?: string;
  himnoTitle?: string;
}

export const ARMAS_MEDIA: Record<string, ArmaMedia> = {
  infanteria: {
    videoUrl: '/assets/multimedia/videos/infanteria.mp4',
    himnoUrl: '/assets/multimedia/audio/infanteria.mp3',
    videoTitle: 'Arma de Infantería — Video Institucional',
    himnoTitle: 'Himno del Arma de Infantería',
  },
  caballeria: {
    videoUrl: '/assets/multimedia/videos/caballeria.mp4',
    himnoUrl: '/assets/multimedia/audio/caballeria.mp3',
    videoTitle: 'Arma de Caballería — Video Institucional',
    himnoTitle: 'Himno del Arma de Caballería',
  },
  artilleria: {
    videoUrl: '/assets/multimedia/videos/artilleria.mp4',
    himnoUrl: '/assets/multimedia/audio/artilleria.mp3',
    videoTitle: 'Arma de Artillería — Video Institucional',
    himnoTitle: 'Himno del Arma de Artillería',
  },
  ingenieria: {
    videoUrl: '/assets/multimedia/videos/ingenieria.mp4',
    himnoUrl: '/assets/multimedia/audio/ingenieria.mp3',
    videoTitle: 'Arma de Ingeniería — Video Institucional',
    himnoTitle: 'Himno del Arma de Ingeniería',
  },
  comunicaciones: {
    videoUrl: '/assets/multimedia/videos/comunicaciones.mp4',
    himnoUrl: '/assets/multimedia/audio/comunicaciones.mp3',
    videoTitle: 'Arma de Comunicaciones — Video Institucional',
    himnoTitle: 'Himno del Arma de Comunicaciones',
  },
  inteligencia: {
    videoUrl: '/assets/multimedia/videos/inteligencia.mp4',
    himnoUrl: '/assets/multimedia/audio/inteligencia.mp3',
    videoTitle: 'Arma de Inteligencia — Video Institucional',
    himnoTitle: 'Himno del Arma de Inteligencia',
  },
  material_guerra: {
    videoUrl: '/assets/multimedia/videos/material_guerra.mp4',
    himnoUrl: '/assets/multimedia/audio/material_guerra.mp3',
    videoTitle: 'Servicio de Material de Guerra — Video Institucional',
    himnoTitle: 'Himno del Servicio de Material de Guerra',
  },
  intendencia: {
    videoUrl: '/assets/multimedia/videos/intendencia.mp4',
    himnoUrl: '/assets/multimedia/audio/intendencia.mp3',
    videoTitle: 'Servicio de Intendencia — Video Institucional',
    himnoTitle: 'Himno del Servicio de Intendencia',
  },
  juridico: {
    videoUrl: '/assets/multimedia/videos/juridico.mp4',
    himnoUrl: '/assets/multimedia/audio/juridico.mp3',
    videoTitle: 'Servicio Jurídico — Video Institucional',
    himnoTitle: 'Himno del Servicio Jurídico',
  },
  sanidad: {
    videoUrl: '/assets/multimedia/videos/sanidad.mp4',
    himnoUrl: '/assets/multimedia/audio/sanidad.mp3',
    videoTitle: 'Servicio de Sanidad — Video Institucional',
    himnoTitle: 'Himno del Servicio de Sanidad Militar',
  },
  ciencia_tecnologia: {
    videoUrl: '/assets/multimedia/videos/ciencia_tecnologia.mp4',
    himnoUrl: '/assets/multimedia/audio/ciencia_tecnologia.mp3',
    videoTitle: 'Servicio de Ciencia y Tecnología — Video Institucional',
    himnoTitle: 'Himno del Servicio de Ciencia y Tecnología',
  },
};
