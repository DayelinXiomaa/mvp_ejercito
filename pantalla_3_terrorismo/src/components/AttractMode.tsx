import React, { useState, useEffect } from 'react';
import { useKioskShell } from '../context/KioskShellContext';
import { useTerrorismo } from '../context/TerrorismoContext';
import { useI18n } from '../context/I18nContext';
import { Sparkles, ChevronRight } from 'lucide-react';

export const AttractMode: React.FC = () => {
  const { wakeUp } = useKioskShell();
  const { setCurrentSection } = useTerrorismo();
  const { t } = useI18n();
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  const quotes = [
    {
      text: t.attract_quote_1 || 'El sacrificio de nuestros héroes devolvió la paz y la democracia al Perú.',
      author: t.attract_quote_1_author || 'Ejército del Perú',
    },
    {
      text: t.attract_quote_2 || 'Honor y gloria a los defensores de la patria que ofrendaron su vida por la pacificación.',
      author: t.attract_quote_2_author || 'Pacificación Nacional',
    },
    {
      text: t.attract_quote_3 || 'Firmeza, valor y patriotismo frente a las amenazas a nuestra soberanía.',
      author: t.attract_quote_3_author || 'Fuerzas Armadas del Perú',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [quotes.length]);

  const handleStart = () => {
    wakeUp();
    setCurrentSection('HUB');
  };

  return (
    <div
      onClick={handleStart}
      className="relative w-full h-screen bg-[#020804] text-white flex flex-col justify-between overflow-hidden select-none cursor-pointer p-8 md:p-14 animate-fade-in"
    >
      {/* Background Lighting Effects */}
      <div className="absolute top-1/4 left-1/4 w-[700px] h-[700px] bg-red-950/20 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] bg-emerald-900/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:36px_36px] opacity-15 pointer-events-none" />

      {/* Header Superior Centrado / Limpio (Sin botón superior de toque) */}
      <header className="relative z-10 flex items-center justify-between w-full">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-red-800 via-slate-900 to-emerald-800 p-0.5 shadow-2xl flex items-center justify-center">
            <div className="w-full h-full rounded-2xl bg-[#040D07] flex items-center justify-center border border-emerald-500/40 shadow-inner overflow-hidden p-1">
              <img
                src="/assets/escudo_ejercito_peru.png"
                alt="Escudo Ejército del Perú"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div>
            <span className="bg-red-950/90 text-red-300 text-[10px] md:text-xs uppercase tracking-widest px-3 py-0.5 rounded-full font-bold border border-red-500/30">
              EJÉRCITO DEL PERÚ • SALA HISTÓRICA
            </span>
            <h1 className="text-[17px] md:text-[20px] font-black text-white tracking-wide mt-0.5">
              {t.app_title || 'Terrorismo y Pacificación Nacional'}
            </h1>
          </div>
        </div>
      </header>

      {/* Centro: Escudo Central Institucional + Gran Título de Pacificación + Cita Dinámica */}
      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6 my-auto flex flex-col items-center justify-center">
        {/* Gran Escudo Central del Ejército */}
        <div className="relative mb-2">
          <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-b from-red-900 via-emerald-600 to-green-950 p-1 shadow-[0_0_60px_rgba(16,185,129,0.45)]">
            <div className="w-full h-full rounded-full bg-[#011208] flex items-center justify-center border-2 border-emerald-400/80 overflow-hidden p-3 shadow-inner">
              <img
                src="/assets/escudo_ejercito_peru.png"
                alt="Escudo del Ejército del Perú"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 text-xs md:text-sm font-extrabold uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.35)] animate-pulse">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{t.attract_title || 'MEMORIA Y PACIFICACIÓN NACIONAL'}</span>
        </div>

        <h3 className="text-[26px] md:text-[44px] lg:text-[52px] font-black text-white leading-tight tracking-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] max-w-4xl">
          {t.attract_subtitle || 'La Victoria de las Fuerzas Armadas y el Pueblo Peruano sobre el Terrorismo'}
        </h3>

        {/* Quote Box Rotativo con Bounding Box Seguro y Tipografía Proporcionada */}
        <div className="h-[84px] max-w-2xl px-6 py-2 rounded-2xl bg-slate-900/60 border border-emerald-500/30 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center overflow-hidden">
          <p className="text-sm md:text-base text-slate-200 font-medium italic leading-snug drop-shadow text-center line-clamp-2">
            “{quotes[currentQuoteIndex].text}”
          </p>
          <span className="text-[11px] md:text-xs text-emerald-400 font-extrabold uppercase tracking-widest mt-1">
            {(quotes[currentQuoteIndex].author || '').replace(/^[—–-]\s*/, '')}
          </span>
        </div>
      </div>

      {/* Footer: Gran Botón Central Táctil con Separación Física Garantizada */}
      <footer className="relative z-10 flex flex-col items-center justify-center gap-2.5 pb-2 pt-2 flex-shrink-0">
        <button
          onClick={handleStart}
          className="flex items-center gap-3 px-10 py-3.5 md:py-4 rounded-full bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 text-slate-950 font-black text-sm md:text-base uppercase tracking-widest shadow-[0_0_50px_rgba(16,185,129,0.7)] hover:scale-105 active:scale-95 transition-all touch-active border border-emerald-300/40"
        >
          <span>{t.attract_prompt || 'TOQUE LA PANTALLA PARA EXPLORAR'}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Toque en cualquier parte para acceder a las opciones de contenido
        </span>
      </footer>
    </div>
  );
};
