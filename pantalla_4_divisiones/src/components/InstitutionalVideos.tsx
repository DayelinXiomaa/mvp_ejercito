import React, { useState } from 'react';
import { Music, ShieldCheck, Building2, Play, Film, Volume2 } from 'lucide-react';
import { VideoPlayerModal } from './VideoPlayerModal';

export interface VideoItem {
  id: string;
  title: string;
  badge: string;
  subtitle: string;
  description: string;
  src: string;
  poster: string;
  icon: 'music' | 'shield' | 'building';
}

const VIDEOS: VideoItem[] = [
  {
    id: 'himno',
    title: 'Himno del Ejército del Perú',
    badge: 'HIMNO OFICIAL',
    subtitle: 'Símbolo patrio e institucional',
    description: 'Himno representativo del Ejército del Perú — Símbolo de honor, disciplina y patriotismo militar.',
    src: '/assets/videos/himno_ejercito.mp4',
    poster: '/assets/videos/himno_poster.jpg',
    icon: 'music',
  },
  {
    id: 'roles',
    title: 'Roles del Ejército',
    badge: 'ROLES CONSTITUCIONALES',
    subtitle: 'Misión y soberanía nacional',
    description: 'Roles estratégicos y constitucionales del Ejército del Perú al servicio de la soberanía y el desarrollo de la Nación.',
    src: '/assets/videos/roles_ejercito.mp4',
    poster: '/assets/videos/roles_poster.jpg',
    icon: 'shield',
  },
  {
    id: 'construccion-cge',
    title: 'Construcción del CGE',
    badge: '50 AÑOS CGE',
    subtitle: 'Cuartel General del Ejército',
    description: 'Historia y edificación del Cuartel General del Ejército del Perú — 50 Años de modernidad institucional.',
    src: '/assets/videos/construccion_cge.mp4',
    poster: '/assets/videos/construccion_poster.jpg',
    icon: 'building',
  },
];

export const InstitutionalVideos: React.FC = () => {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  const handleOpenVideo = (video: VideoItem) => {
    setActiveVideo(video);
  };

  const renderIcon = (type: 'music' | 'shield' | 'building') => {
    switch (type) {
      case 'music':
        return <Music className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />;
      case 'shield':
        return <ShieldCheck className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />;
      case 'building':
        return <Building2 className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />;
    }
  };

  return (
    <>
      {/* Botones Flotantes a la Derecha del Mapa */}
      <div className="absolute top-1/2 -translate-y-1/2 right-3 md:right-5 flex flex-col gap-3 z-30 w-52 md:w-60">
        <div className="px-1 flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400/90 flex items-center gap-1.5">
            <Film className="w-3 h-3 text-emerald-400" /> VIDEOS INSTITUCIONALES
          </span>
        </div>

        {VIDEOS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleOpenVideo(item)}
            className="w-full bg-slate-950/90 hover:bg-slate-900 border border-emerald-500/40 hover:border-emerald-300 p-2.5 rounded-2xl shadow-2xl hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.03] active:scale-95 transition-all text-left flex items-center gap-3 cursor-pointer select-none backdrop-blur-md group touch-active"
          >
            {/* Icono con badge de Play */}
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-slate-900/90 border border-emerald-500/50 flex items-center justify-center relative overflow-hidden flex-shrink-0 group-hover:border-emerald-300 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.5)] transition-all">
              {renderIcon(item.icon)}
              <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center text-[7px] font-black shadow">
                <Play className="w-2 h-2 fill-current ml-0.5" />
              </span>
            </div>

            {/* Texto informativo */}
            <div className="min-w-0 flex-1">
              <span className="text-[8px] font-extrabold uppercase tracking-wider text-emerald-400/90 block leading-tight">
                {item.badge}
              </span>
              <h4 className="text-xs md:text-[12.5px] font-black text-white group-hover:text-emerald-300 transition-colors leading-snug truncate">
                {item.title}
              </h4>
              <p className="text-[9px] text-slate-400 font-medium truncate mt-0.5 flex items-center gap-1">
                <Volume2 className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
                <span>{item.subtitle}</span>
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Modal de Reproducción de Video Institucional */}
      {activeVideo && (
        <VideoPlayerModal
          videoUrl={activeVideo.src}
          title={activeVideo.title}
          subtitle={activeVideo.description}
          badge={activeVideo.badge}
          accentColor="emerald"
          onClose={() => setActiveVideo(null)}
        />
      )}
    </>
  );
};
