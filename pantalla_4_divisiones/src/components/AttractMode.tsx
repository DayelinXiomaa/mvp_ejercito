import React, { useState, useEffect } from 'react';
import { useKioskShell } from '../context/KioskShellContext';
import { useI18n } from '../context/I18nContext';
import { MapPin } from 'lucide-react';

export const AttractMode: React.FC = () => {
  const { wakeUp } = useKioskShell();
  const { t } = useI18n();

  const quotes = [
    { text: t.attract_quote_1, author: t.attract_quote_1_author },
    { text: t.attract_quote_2, author: t.attract_quote_2_author },
    { text: t.attract_quote_3, author: t.attract_quote_3_author },
  ];

  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  const currentQuote = quotes[quoteIndex];

  return (
    <div
      onClick={wakeUp}
      className="fixed inset-0 z-50 bg-[#020804] cursor-pointer overflow-hidden flex flex-col justify-between select-none"
    >
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-green-900/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-8">
        <div className="relative mb-10">
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
            DESPLIEGUE TERRITORIAL
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight text-center mb-3 drop-shadow-xl">
          {t.attract_title}
        </h1>
        {t.app_subtitle && (
          <p className="text-xs md:text-sm text-emerald-400 font-extrabold tracking-[0.25em] uppercase mt-2 mb-6 px-4 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/20">
            {t.app_subtitle}
          </p>
        )}

        {/* Contenedor de Cita Dinámica Compacto y Proporcionado */}
        <div className="max-w-3xl px-8 py-5 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-emerald-500/30 shadow-2xl animate-fade-in">
          <p className="text-xl md:text-2xl font-bold text-emerald-200/90 italic leading-relaxed text-center mb-2">
            "{currentQuote.text}"
          </p>
          <p className="text-xs font-black text-emerald-400/80 uppercase tracking-widest text-center">
            {(currentQuote.author || '').replace(/^[—–-]\s*/, '')}
          </p>
        </div>
      </div>

      {/* Botón Circular CTA Ampliado y Elevado */}
      <div className="relative z-10 pb-8 pt-2 flex flex-col items-center justify-center">
        <div className="animate-float flex flex-col items-center gap-3">
          <div className="w-22 h-22 md:w-24 md:h-24 rounded-full bg-gradient-to-r from-green-800 via-emerald-600 to-green-800 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.5)] border-2 border-emerald-400/80 hover:scale-105 transition-transform animate-glow-pulse">
            <MapPin className="w-11 h-11 md:w-12 md:h-12 text-emerald-100" />
          </div>
          <span className="text-xl md:text-2xl font-black tracking-[0.2em] text-emerald-300 drop-shadow-[0_0_20px_rgba(16,185,129,0.6)] uppercase">
            {t.attract_prompt}
          </span>
        </div>
      </div>
    </div>
  );
};
