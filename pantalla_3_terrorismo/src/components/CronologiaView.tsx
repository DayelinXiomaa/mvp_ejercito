import React from 'react';
import { useTerrorismo } from '../context/TerrorismoContext';
import { useI18n } from '../context/I18nContext';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export const CronologiaView: React.FC = () => {
  const { setCurrentSection } = useTerrorismo();
  const { t, language } = useI18n();
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = `/linea-tiempo.html?lang=${language}&t=${Date.now()}`;
    }
  };

  React.useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'CHANGE_LANG', lang: language }, '*');
    }
  }, [language]);

  return (
    <div className="w-full h-full flex flex-col bg-[#020804] overflow-hidden select-none animate-fade-in">
      {/* Sub-header de la Cronología */}
      <div className="flex-shrink-0 bg-[#030A06]/95 border-b border-emerald-500/20 px-6 py-2.5 flex items-center justify-between shadow-xl z-20 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentSection('HUB')}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-emerald-500/40 text-emerald-300 hover:border-emerald-300 hover:text-white text-xs font-bold transition-all shadow-md active:scale-95 touch-active"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>{t.btn_back || 'Volver al Menú'}</span>
          </button>

          <div className="h-5 w-px bg-slate-800" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-red-900 to-emerald-900 p-0.5 shadow-md flex items-center justify-center overflow-hidden">
              <div className="w-full h-full rounded-xl bg-[#040D07] flex items-center justify-center border border-emerald-400/50 overflow-hidden">
                <img
                  src="/assets/terrorismo/icono_acciones.jpg"
                  alt="Acciones terroristas"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <h2 className="text-sm md:text-base font-black text-white tracking-wide">
                {t.section_cronologia_title || 'Acciones terroristas que sucedieron en el Perú'}
              </h2>
              <span className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-widest block -mt-0.5">
                {t.cronologia_header_sub || 'EXPEDIENTE CRONOLÓGICO HISTÓRICO • 1980–2026'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-full bg-slate-900 border border-emerald-500/30 text-emerald-400 hover:text-white hover:border-emerald-400 transition-all touch-active"
            title={t.cronologia_reload || 'Recargar línea de tiempo'}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frame interactivo con la Línea de Tiempo */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-[#020804]">
        <iframe
          ref={iframeRef}
          src={`/linea-tiempo.html?lang=${language}`}
          title="Cronología de Eventos del Conflicto Armado"
          className="w-full h-full border-0"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};
