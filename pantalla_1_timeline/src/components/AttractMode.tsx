import React, { useState, useEffect, useRef } from 'react';
import { useKioskShell } from '../context/KioskShellContext';
import { useI18n } from '../context/I18nContext';
import { Sparkles } from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  dx: number;
  dy: number;
}

export const AttractMode: React.FC = () => {
  const { wakeUp } = useKioskShell();
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);

  const quotes = [
    { text: t.attract_quote_1, author: t.attract_quote_1_author },
    { text: t.attract_quote_2, author: t.attract_quote_2_author },
    { text: t.attract_quote_3, author: t.attract_quote_3_author },
  ];

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 5 + 2,
      duration: Math.random() * 6 + 4,
      delay: Math.random() * 5,
      dx: (Math.random() - 0.5) * 200,
      dy: -(Math.random() * 300 + 100),
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  const currentQuote = quotes[quoteIndex];

  return (
    <div
      ref={containerRef}
      onClick={wakeUp}
      className="fixed inset-0 z-50 bg-[#020804] cursor-pointer overflow-hidden flex flex-col justify-between select-none"
    >
      {/* FOCO / SPOTLIGHT FOSFORESCENTE VERDE MILITAR */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[1000px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-400/35 via-emerald-600/10 to-transparent pointer-events-none blur-3xl animate-pulse" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[600px] border-l-transparent border-r-[600px] border-r-transparent border-t-[800px] border-t-emerald-400/10 pointer-events-none blur-2xl" />

      {/* Partículas fosforescentes estilo polvo verde */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: `radial-gradient(circle, rgba(52,211,153,1) 0%, rgba(16,185,129,0) 70%)`,
              boxShadow: '0 0 10px rgba(52,211,153,0.8)',
              animation: `particle-drift ${p.duration}s ease-in-out ${p.delay}s infinite`,
              ['--dx' as string]: `${p.dx}px`,
              ['--dy' as string]: `${p.dy}px`,
            }}
          />
        ))}
      </div>

      {/* Ambient glow circles */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-400/20 rounded-full blur-[140px] pointer-events-none animate-pulse" />

      {/* Header Institucional discreto */}
      <div className="relative z-10 pt-8 flex justify-center">
        <span className="bg-green-950/80 text-emerald-300 text-xs font-black tracking-[0.4em] uppercase px-8 py-2.5 rounded-full border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.4)] backdrop-blur-md">
          EJÉRCITO DEL PERÚ • MUSEO VIRTUAL
        </span>
      </div>

      {/* Centro: Foco + Imagen Fosforescente + Cita */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-8 py-4">
        {/* Emblem / Imagen Fosforescente bajo el Foco */}
        <div className="relative mb-8 group">
          {/* Anillos de luz fosforescente */}
          <div className="absolute -inset-8 rounded-full bg-emerald-400/20 blur-xl animate-ping" style={{ animationDuration: '4s' }} />
          <div className="absolute -inset-4 rounded-full border-2 border-emerald-400/40 animate-spin" style={{ animationDuration: '20s' }} />
          
          <div className="w-52 h-52 rounded-full bg-gradient-to-b from-emerald-300 via-emerald-600 to-green-950 p-1 shadow-[0_0_60px_rgba(52,211,153,0.6)]">
            <div className="w-full h-full rounded-full bg-[#011208] flex items-center justify-center border-4 border-emerald-400/80 overflow-hidden relative">
              <img
                src="/assets/escudo_ejercito_peru.png"
                alt="Escudo del Ejército del Perú"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Título Principal */}
        <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tight text-center mb-2 drop-shadow-[0_0_35px_rgba(52,211,153,0.5)]">
          {t.attract_title}
        </h1>
        <p className="text-xl text-emerald-300 font-bold tracking-[0.2em] uppercase mb-8 drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]">
          {t.app_subtitle}
        </p>

        {/* Cita Histórica en Marco Fosforescente */}
        <div
          key={quoteIndex}
          className="max-w-3xl px-8 py-6 rounded-3xl bg-slate-950/80 backdrop-blur-2xl border border-emerald-500/40 shadow-[0_0_35px_rgba(16,185,129,0.2)] animate-fade-in text-center"
        >
          <p className="text-xl lg:text-2xl font-bold text-emerald-200 italic leading-relaxed mb-3">
            "{currentQuote.text}"
          </p>
          <p className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest">
            {(currentQuote.author || '').replace(/^[—–-]\s*/, '')}
          </p>
        </div>

        {/* Prompt Táctil Inferior (Zona de alcance con alta prominencia) */}
        <div className="mt-8 flex items-center gap-3.5 bg-gradient-to-r from-green-900 via-emerald-600 to-green-900 text-white px-10 py-4 rounded-full border-2 border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.7)] hover:scale-105 transition-transform min-h-[52px] animate-pulse">
          <Sparkles className="w-5 h-5 text-emerald-300 animate-spin" />
          <span className="text-lg md:text-xl font-black tracking-widest text-emerald-100 uppercase">
            {t.attract_prompt}
          </span>
          <Sparkles className="w-5 h-5 text-emerald-300 animate-spin" />
        </div>
      </div>

      {/* BANDA MARQUESINA INFERIOR (Marquee Text Loop Fosforescente) */}
      <div className="relative z-20 w-full bg-emerald-500/10 backdrop-blur-md border-t border-b border-emerald-500/30 py-3 overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.3)]">
        <div className="flex whitespace-nowrap animate-marquee">
          <span className="text-base font-black tracking-[0.2em] text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)] px-8">
            ★ MUSEO VIRTUAL DEL EJÉRCITO DEL PERÚ ★ TOQUE LA PANTALLA PARA INICIAR LA EXPERIENCIA INTERACTIVA ★ HONOR • DISCIPLINA • LEALTAD ★ SIEMPRE AL SERVICIO DE LA PATRIA ★ HISTORIA, ARMAS Y GLORIA DEL PERÚ ★ TOQUE CUALQUIER PANTALLA PARA EXPLORAR ★
          </span>
          <span className="text-base font-black tracking-[0.2em] text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)] px-8">
            ★ MUSEO VIRTUAL DEL EJÉRCITO DEL PERÚ ★ TOQUE LA PANTALLA PARA INICIAR LA EXPERIENCIA INTERACTIVA ★ HONOR • DISCIPLINA • LEALTAD ★ SIEMPRE AL SERVICIO DE LA PATRIA ★ HISTORIA, ARMAS Y GLORIA DEL PERÚ ★ TOQUE CUALQUIER PANTALLA PARA EXPLORAR ★
          </span>
        </div>
      </div>
    </div>
  );
};
