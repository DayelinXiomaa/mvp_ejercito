import React from 'react';
import { useKioskShell } from '../context/KioskShellContext';
import { useI18n } from '../context/I18nContext';
import { Shield } from 'lucide-react';

export const AttractMode: React.FC = () => {
  const { wakeUp } = useKioskShell();
  const { t } = useI18n();

  const lemaUnico = t.attract_quote_1 || 'Hasta quemar el último cartucho';
  const autorLema = t.attract_quote_1_author || 'Ejército del Perú';

  return (
    <div
      onClick={wakeUp}
      className="fixed inset-0 z-50 bg-[#020804] cursor-pointer overflow-hidden flex flex-col justify-between select-none"
    >
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-green-900/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-8">
        <div className="relative mb-8">
          <div className="w-48 h-48 rounded-full bg-gradient-to-b from-green-900 via-emerald-600 to-green-950 p-1 shadow-[0_0_50px_rgba(16,185,129,0.5)]">
            <div className="w-full h-full rounded-full bg-[#011208] flex items-center justify-center border-2 border-emerald-500/60 overflow-hidden">
              <img
                src="/assets/escudo_ejercito_peru.png"
                alt="Escudo del Ejército del Perú"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <span className="bg-green-900/60 text-emerald-200 text-sm uppercase tracking-[0.3em] px-6 py-2 rounded-full font-bold border border-emerald-500/30">
            EJÉRCITO DEL PERÚ
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight text-center mb-2">
          {t.attract_title}
        </h1>
        {t.app_subtitle && (
          <p className="text-xl text-emerald-400/80 font-semibold tracking-wider uppercase mb-10">
            {t.app_subtitle}
          </p>
        )}

        {/* Lema Único Fijo */}
        <div className="max-w-3xl px-8 py-5 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-emerald-500/30 shadow-2xl animate-fade-in mt-2">
          <p className="text-xl md:text-2xl font-bold text-emerald-200 italic leading-relaxed text-center mb-2">
            "{lemaUnico}"
          </p>
          <p className="text-xs font-bold text-emerald-400/80 uppercase tracking-widest text-center">
            {(autorLema || '').replace(/^[—–-]\s*/, '')}
          </p>
        </div>
      </div>

      <div className="relative z-10 pb-8 pt-2 flex flex-col items-center justify-center">
        <div className="animate-float flex flex-col items-center gap-3">
          <div className="w-18 h-18 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-green-800 via-emerald-600 to-green-800 flex items-center justify-center shadow-2xl shadow-emerald-500/30 border-2 border-emerald-400/60 animate-glow-pulse">
            <Shield className="w-9 h-9 md:w-10 md:h-10 text-emerald-200" />
          </div>
          <span className="text-xl md:text-2xl font-black tracking-[0.2em] text-emerald-300 drop-shadow-[0_0_20px_rgba(16,185,129,0.6)]">
            {t.attract_prompt}
          </span>
        </div>
      </div>
    </div>
  );
};
