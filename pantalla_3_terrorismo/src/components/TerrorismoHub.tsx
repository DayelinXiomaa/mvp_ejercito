import React, { useState } from 'react';
import { useTerrorismo } from '../context/TerrorismoContext';
import { useI18n } from '../context/I18nContext';
import { ChevronRight, Film, Play } from 'lucide-react';
import { VideoPlayerModal } from './VideoPlayerModal';

export const TerrorismoHub: React.FC = () => {
  const { data, archivosPeriodisticos, setCurrentSection, setSelectedTopicIndex, setSelectedOp, setSelectedArchivoPeriodistico } = useTerrorismo();
  const { t, language } = useI18n();

  const [activeVideo, setActiveVideo] = useState<{
    url: string;
    poster?: string;
    title: string;
    subtitle?: string;
    badge?: string;
    accentColor: 'red' | 'amber';
  } | null>(null);

  const handleSelectSection = (
    section: 'SENDERO_LUMINOSO' | 'MRTA' | 'OPERACIONES' | 'CRONOLOGIA' | 'ARCHIVOS_PERIODISTICOS'
  ) => {
    setSelectedTopicIndex(0);
    setSelectedOp(null);
    setSelectedArchivoPeriodistico(null);
    setCurrentSection(section);
  };

  const sl = data.sendero_luminoso;
  const mrta = data.mrta;
  const op = data.operaciones;

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 md:p-4 lg:p-5 overflow-hidden select-none animate-fade-in">
      {/* Grid Principal de 4 Grandes Opciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 md:gap-4 max-w-[1800px] mx-auto w-full my-auto">
        {/* ================= TARJETA 1: SENDERO LUMINOSO ================= */}
        <div
          onClick={() => handleSelectSection('SENDERO_LUMINOSO')}
          className="group relative bg-gradient-to-b from-slate-900/95 via-[#0d0404]/95 to-slate-950/95 rounded-2xl md:rounded-3xl border-2 border-red-500/40 hover:border-red-400 p-4 md:p-4.5 flex flex-col justify-between shadow-2xl hover:shadow-[0_0_40px_rgba(239,68,68,0.3)] hover:scale-[1.015] transition-all cursor-pointer overflow-hidden touch-active"
        >
          {sl?.cover_image && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 group-hover:scale-105 transition-all duration-700 pointer-events-none"
              style={{ backgroundImage: `url(${sl.cover_image})` }}
            />
          )}
          <div className="absolute top-0 right-0 w-36 h-36 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-red-950/90 border-2 border-red-500/60 p-0.5 shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
                <img
                  src="/assets/terrorismo/icono_sendero.jpeg"
                  alt="Sendero Luminoso"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <span className="bg-red-950/90 text-red-300 text-[9px] md:text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-red-500/40 shadow-inner">
                {sl?.topics?.length || 7} {t.topics_count || 'temas'}
              </span>
            </div>

            <h4 className="text-[15px] md:text-[17px] font-black text-white group-hover:text-red-200 transition-colors leading-tight">
              {sl?.title?.[language] || 'Sendero Luminoso'}
            </h4>

            <p className="text-[11px] md:text-[11.5px] text-slate-300 leading-snug font-normal mt-1.5 text-justify">
              {sl?.subtitle?.[language] ||
                'Orígenes, violencia armada, fracturas y disolución de MOVADEF.'}
            </p>

            <div className="mt-2.5 pt-2 border-t border-red-500/20 space-y-1 text-[10px] md:text-[10.5px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                <span className="truncate">{t.sl_bullet_1 || 'Orígenes e inicio de lucha armada (1980)'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                <span className="truncate">{t.sl_bullet_2 || 'Captura de Abimael Guzmán y Paz'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                <span className="truncate">{t.sl_bullet_3 || 'Huallaga, VRAEM y Disolución MOVADEF'}</span>
              </div>
            </div>

            {/* Botón de Video Documental Sendero Luminoso */}
            <div
              className="mt-2.5 pt-2 border-t border-red-500/20"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveVideo({
                    url: '/assets/terrorismo/SENDEROLUMINOSO.mp4',
                    poster: '/assets/terrorismo/poster_sendero.jpg',
                    title: t.doc_sl_title || 'Sendero Luminoso: Violencia Armada y Derrota Estratégica',
                    subtitle: t.doc_sl_subtitle || 'Documental Histórico de la Pacificación Nacional (1980 - 2026)',
                    badge: t.btn_doc_badge_sl || 'DOCUMENTAL',
                    accentColor: 'red',
                  });
                }}
                className="w-full group/vidbtn relative overflow-hidden rounded-xl bg-gradient-to-r from-red-950/90 via-slate-900/90 to-red-950/90 hover:from-red-900/90 hover:to-slate-900/95 border border-red-500/50 hover:border-red-400 p-2 sm:p-2.5 flex items-center justify-between gap-2.5 shadow-lg hover:shadow-[0_0_25px_rgba(239,68,68,0.35)] transition-all cursor-pointer touch-active active:scale-[0.98]"
                title={t.doc_sl_title || 'Reproducir Documental Histórico de Sendero Luminoso'}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-red-500/50 flex-shrink-0 bg-black shadow-md">
                    <img
                      src="/assets/terrorismo/poster_sendero.jpg"
                      alt="Sendero Luminoso"
                      className="w-full h-full object-cover group-hover/vidbtn:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md group-hover/vidbtn:scale-110 transition-transform">
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="text-left min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Film className="w-3 h-3 text-red-400 flex-shrink-0" />
                      <span className="text-[8.5px] font-black uppercase tracking-wider text-red-300 bg-red-950/90 px-1.5 py-0.2 rounded border border-red-500/40">
                        {t.btn_doc_badge_sl || 'DOCUMENTAL'}
                      </span>
                    </div>
                    <span className="block text-[11px] md:text-[12px] font-black text-white group-hover/vidbtn:text-red-200 transition-colors truncate">
                      {t.btn_doc_view_video || 'Ver Video Documental'}
                    </span>
                    <span className="block text-[9px] text-slate-400 truncate">
                      {t.btn_doc_tap_play || 'Tocar para reproducir en pantalla completa'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black text-[10px] uppercase tracking-wider shadow-md flex-shrink-0 group-hover/vidbtn:scale-105 transition-all">
                  <Play className="w-3 h-3 fill-current" />
                  <span>{t.btn_doc_watch || 'Ver Video'}</span>
                </div>
              </button>
            </div>
          </div>

          <div className="relative z-10 mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[10px] md:text-[10.5px] font-black text-red-400 uppercase tracking-wider group-hover:text-white transition-colors">
              {t.btn_explore || 'Explorar Contenido'}
            </span>
            <div className="w-7 h-7 rounded-full bg-red-900/40 border border-red-500/40 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all">
              <ChevronRight className="w-3.5 h-3.5 text-red-300 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* ================= TARJETA 2: MRTA ================= */}
        <div
          onClick={() => handleSelectSection('MRTA')}
          className="group relative bg-gradient-to-b from-slate-900/95 via-[#0d0a04]/95 to-slate-950/95 rounded-2xl md:rounded-3xl border-2 border-amber-500/40 hover:border-amber-400 p-4 md:p-4.5 flex flex-col justify-between shadow-2xl hover:shadow-[0_0_40px_rgba(245,158,11,0.3)] hover:scale-[1.015] transition-all cursor-pointer overflow-hidden touch-active"
        >
          {mrta?.cover_image && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 group-hover:scale-105 transition-all duration-700 pointer-events-none"
              style={{ backgroundImage: `url(${mrta.cover_image})` }}
            />
          )}
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-amber-950/90 border-2 border-amber-500/60 p-0.5 shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
                <img
                  src="/assets/terrorismo/icono_mrta.jpeg"
                  alt="MRTA"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <span className="bg-amber-950/90 text-amber-300 text-[9px] md:text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-500/40 shadow-inner">
                {mrta?.topics?.length || 6} {t.topics_count || 'temas'}
              </span>
            </div>

            <h4 className="text-[15px] md:text-[17px] font-black text-white group-hover:text-amber-200 transition-colors leading-tight">
              {mrta?.title?.[language] || 'Movimiento Revolucionario Túpac Amaru (MRTA)'}
            </h4>

            <p className="text-[11px] md:text-[11.5px] text-slate-300 leading-snug font-normal mt-1.5 text-justify">
              {mrta?.subtitle?.[language] ||
                'Surgimiento, secuestros, crisis de rehenes y Operación Chavín de Huántar.'}
            </p>

            <div className="mt-2.5 pt-2 border-t border-amber-500/20 space-y-1 text-[10px] md:text-[10.5px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
                <span className="truncate">{t.mrta_bullet_1 || 'Orígenes, ideología y secuestros'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
                <span className="truncate">{t.mrta_bullet_2 || 'Canto Grande y recaptura de cabecillas'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
                <span className="truncate">{t.mrta_bullet_3 || 'Crisis de la Embajada y Rescate Histórico'}</span>
              </div>
            </div>

            {/* Botón de Video Reseña Histórica MRTA */}
            <div
              className="mt-2.5 pt-2 border-t border-amber-500/20"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveVideo({
                    url: '/assets/terrorismo/MRTA.mp4',
                    poster: '/assets/terrorismo/poster_mrta.jpg',
                    title: t.doc_mrta_title || 'MRTA: Surgimiento, Accionar Terrorista y Operación Chavín de Huántar',
                    subtitle: t.doc_mrta_subtitle || 'Reseña Histórica y Documental Audiovisual',
                    badge: t.btn_doc_badge_mrta || 'RESEÑA HISTÓRICA',
                    accentColor: 'amber',
                  });
                }}
                className="w-full group/vidbtn relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-950/90 via-slate-900/90 to-amber-950/90 hover:from-amber-900/90 hover:to-slate-900/95 border border-amber-500/50 hover:border-amber-400 p-2 sm:p-2.5 flex items-center justify-between gap-2.5 shadow-lg hover:shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all cursor-pointer touch-active active:scale-[0.98]"
                title={t.doc_mrta_title || 'Reproducir Reseña Histórica en Video del MRTA'}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-amber-500/50 flex-shrink-0 bg-black shadow-md">
                    <img
                      src="/assets/terrorismo/poster_mrta.jpg"
                      alt="MRTA"
                      className="w-full h-full object-cover group-hover/vidbtn:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md group-hover/vidbtn:scale-110 transition-transform">
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="text-left min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Film className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      <span className="text-[8.5px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/90 px-1.5 py-0.2 rounded border border-amber-500/40">
                        {t.btn_doc_badge_mrta || 'RESEÑA HISTÓRICA'}
                      </span>
                    </div>
                    <span className="block text-[11px] md:text-[12px] font-black text-white group-hover/vidbtn:text-amber-200 transition-colors truncate">
                      {t.btn_doc_view_mrta || 'Ver Video Reseña'}
                    </span>
                    <span className="block text-[9px] text-slate-400 truncate">
                      {t.btn_doc_tap_play || 'Tocar para reproducir en pantalla completa'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md flex-shrink-0 group-hover/vidbtn:scale-105 transition-all">
                  <Play className="w-3 h-3 fill-current" />
                  <span>{t.btn_doc_watch || 'Ver Video'}</span>
                </div>
              </button>
            </div>
          </div>

          <div className="relative z-10 mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[10px] md:text-[10.5px] font-black text-amber-400 uppercase tracking-wider group-hover:text-white transition-colors">
              {t.btn_explore || 'Explorar Contenido'}
            </span>
            <div className="w-7 h-7 rounded-full bg-amber-900/40 border border-amber-500/40 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
              <ChevronRight className="w-3.5 h-3.5 text-amber-300 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* ================= TARJETA 3: ACCIONES TERRORISTAS QUE SUCEDIERON EN EL PERÚ ================= */}
        <div
          onClick={() => handleSelectSection('CRONOLOGIA')}
          className="group relative bg-gradient-to-b from-slate-900/95 via-[#1a150e]/95 to-slate-950/95 rounded-2xl md:rounded-3xl border-2 border-[#a9895a]/40 hover:border-[#d9d0b8] p-4 md:p-4.5 flex flex-col justify-between shadow-2xl hover:shadow-[0_0_40px_rgba(169,137,90,0.35)] hover:scale-[1.015] transition-all cursor-pointer overflow-hidden touch-active"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#a5443b]/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-[#251f16] border-2 border-[#a9895a]/60 p-0.5 shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
                <img
                  src="/assets/terrorismo/icono_acciones.jpg"
                  alt="Acciones terroristas"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <span className="bg-[#251f16] text-[#ece5d3] text-[9px] md:text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#a9895a]/50 shadow-inner">
                {t.section_cronologia_badge || '1980 - 2026 • LÍNEA DE TIEMPO'}
              </span>
            </div>

            <h4 className="text-[15px] md:text-[17px] font-black text-white group-hover:text-[#ece5d3] transition-colors leading-tight">
              {t.section_cronologia_title || 'Acciones terroristas que sucedieron en el Perú'}
            </h4>

            <p className="text-[11px] md:text-[11.5px] text-slate-300 leading-snug font-normal mt-1.5 text-justify">
              {t.section_cronologia_desc || 'Expediente cronológico detallado año por año sobre los acontecimientos, atentados y victorias militares durante el Conflicto Armado Interno.'}
            </p>

            <div className="mt-2.5 pt-2 border-t border-[#a9895a]/30 space-y-1 text-[10px] md:text-[10.5px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#a5443b] flex-shrink-0" />
                <span className="truncate">{t.section_cronologia_h1 || '1980–1992: Inicio y escalada de violencia'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#a5443b] flex-shrink-0" />
                <span className="truncate">{t.section_cronologia_h2 || '1992–2000: Capturas y pacificación'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#a5443b] flex-shrink-0" />
                <span className="truncate">{t.section_cronologia_h3 || '2000–2026: Operaciones residuales VRAEM'}</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[10px] md:text-[10.5px] font-black text-[#d9d0b8] uppercase tracking-wider group-hover:text-white transition-colors">
              {t.btn_view_timeline || 'Ver Línea de Tiempo'}
            </span>
            <div className="w-7 h-7 rounded-full bg-[#251f16] border border-[#a9895a]/50 flex items-center justify-center group-hover:bg-[#a5443b] group-hover:text-white transition-all">
              <ChevronRight className="w-3.5 h-3.5 text-[#d9d0b8] group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* ================= TARJETA 4: OPERACIONES CONTRATERRORISTAS ================= */}
        <div
          onClick={() => handleSelectSection('OPERACIONES')}
          className="group relative bg-gradient-to-b from-slate-900/95 via-[#040d08]/95 to-slate-950/95 rounded-2xl md:rounded-3xl border-2 border-emerald-500/40 hover:border-emerald-400 p-4 md:p-4.5 flex flex-col justify-between shadow-2xl hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:scale-[1.015] transition-all cursor-pointer overflow-hidden touch-active"
        >
          {op?.cover_image && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 group-hover:scale-105 transition-all duration-700 pointer-events-none"
              style={{ backgroundImage: `url(${op.cover_image})` }}
            />
          )}
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-emerald-950/90 border-2 border-emerald-500/60 p-0.5 shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
                <img
                  src="/assets/terrorismo/icono_operaciones.jpg"
                  alt="Operaciones Contraterroristas"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <span className="bg-emerald-950/90 text-emerald-300 text-[9px] md:text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-emerald-500/40 shadow-inner">
                {op?.items?.length || 43} {t.ops_count || 'operaciones'}
              </span>
            </div>

            <h4 className="text-[15px] md:text-[17px] font-black text-white group-hover:text-emerald-200 transition-colors leading-tight">
              {op?.title?.[language] || 'Operaciones Contraterroristas'}
            </h4>

            <p className="text-[11px] md:text-[11.5px] text-slate-300 leading-snug font-normal mt-1.5 text-justify">
              {op?.subtitle?.[language] ||
                'Acciones estratégicas y tácticas de las Fuerzas Armadas y Policía Nacional (1987 - 2026).'}
            </p>

            <div className="mt-2.5 pt-2 border-t border-emerald-500/20 space-y-1 text-[10px] md:text-[10.5px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="truncate">{t.op_bullet_1 || 'Operaciones: Tempestad, Centurión, Victoria'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="truncate">{t.op_bullet_2 || 'Chavín de Huántar y rescate de rehenes'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="truncate">{t.op_bullet_3 || 'Operaciones VRAEM: Camaleón y Patriota'}</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[10px] md:text-[10.5px] font-black text-emerald-400 uppercase tracking-wider group-hover:text-white transition-colors">
              {t.btn_explore || 'Explorar Contenido'}
            </span>
            <div className="w-7 h-7 rounded-full bg-emerald-900/40 border border-emerald-500/40 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <ChevronRight className="w-3.5 h-3.5 text-emerald-300 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTÓN INFERIOR: ARCHIVOS PERIODÍSTICOS ================= */}
      <div className="max-w-[1800px] mx-auto w-full mt-2.5">
        <div
          onClick={() => handleSelectSection('ARCHIVOS_PERIODISTICOS')}
          className="group relative bg-gradient-to-r from-slate-900/95 via-[#181105]/95 to-slate-900/95 rounded-2xl border-2 border-amber-500/40 hover:border-amber-400 p-2.5 md:p-3 flex items-center justify-between shadow-xl hover:shadow-[0_0_35px_rgba(245,158,11,0.3)] hover:scale-[1.008] transition-all cursor-pointer overflow-hidden touch-active"
        >
          <div className="absolute top-0 right-1/4 w-80 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 min-w-0 relative z-10">
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-amber-950/90 border-2 border-amber-500/60 p-0.5 shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden flex-shrink-0">
              <img
                src="/assets/terrorismo/icono_periodicos.jpg"
                alt="Archivos Periodísticos"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="bg-amber-950/90 text-amber-300 text-[8.5px] md:text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-500/40 shadow-inner">
                  {t.section_periodicos_badge || 'HEMEROTECA HISTÓRICA • PORTADAS Y PRENSA'}
                </span>
                <span className="text-[9.5px] font-bold text-amber-400/90 hidden sm:inline">
                  • {archivosPeriodisticos?.length || 96} {t.press_badge_records || (language === 'en' ? 'historical records' : language === 'qu' ? 'qillqasqa panqakuna' : 'documentos y recortes')}
                </span>
              </div>
              <h4 className="text-sm md:text-base font-black text-white group-hover:text-amber-200 transition-colors leading-tight truncate">
                {t.section_periodicos_title || 'Archivos Periodísticos'}
              </h4>
              <p className="text-[11px] md:text-[11.5px] text-slate-300 leading-snug font-normal line-clamp-1">
                {t.section_periodicos_desc ||
                  'Colección hemerográfica con portadas, artículos y recortes de prensa nacional documentando los acontecimientos de la pacificación.'}
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2.5 flex-shrink-0 ml-4">
            <span className="hidden md:inline text-[10px] md:text-[11px] font-black text-amber-400 uppercase tracking-wider group-hover:text-white transition-colors">
              {t.btn_view_periodicos || 'Explorar Hemeroteca'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-900/40 border border-amber-500/50 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-all shadow-md">
              <ChevronRight className="w-4 h-4 text-amber-300 group-hover:text-slate-950 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-[9.5px] md:text-[10.5px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">
        {t.hub_prompt_select || 'Seleccione una opción para iniciar el recorrido histórico'}
      </div>

      {/* Modal Reproductor de Video Fullscreen */}
      {activeVideo && (
        <VideoPlayerModal
          videoUrl={activeVideo.url}
          poster={activeVideo.poster}
          title={activeVideo.title}
          subtitle={activeVideo.subtitle}
          badge={activeVideo.badge}
          accentColor={activeVideo.accentColor}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </div>
  );
};
