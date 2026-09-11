import React from 'react';
import { useI18n } from '../context/I18nContext';
import { useKioskShell } from '../context/KioskShellContext';
import { useTerrorismo } from '../context/TerrorismoContext';
import { KIOSK_CONFIG } from '../config/kioskConfig';
import type { SupportedLanguage } from '../config/kioskConfig';
import { Clock, Globe, Home, Flame, Crosshair, Shield, Newspaper } from 'lucide-react';

interface BottomBarProps {
  children?: React.ReactNode;
}

const LANG_CONFIG: Record<
  SupportedLanguage,
  { label: string; name: string; flag: string }
> = {
  es: { label: 'ES', name: 'Español', flag: '🇵🇪' },
  en: { label: 'EN', name: 'English', flag: '🇬🇧' },
  qu: { label: 'QU', name: 'Quechua', flag: '🇵🇪' },
};

export const BottomBar: React.FC<BottomBarProps> = ({ children }) => {
  const { language, setLanguage, t } = useI18n();
  const { timeRemaining } = useKioskShell();
  const { currentSection, setCurrentSection, setSelectedOp, setSelectedTopicIndex } = useTerrorismo();

  const handleSelectSection = (s: 'HUB' | 'SENDERO_LUMINOSO' | 'MRTA' | 'OPERACIONES' | 'CRONOLOGIA' | 'ARCHIVOS_PERIODISTICOS') => {
    setSelectedOp(null);
    setSelectedTopicIndex(0);
    setCurrentSection(s);
  };

  return (
    <footer className="flex-shrink-0 z-30 w-full bg-[#030A06]/95 backdrop-blur-xl border-t border-emerald-500/20 shadow-2xl">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between px-4 py-2 gap-3">
        {/* Left: Section Navigation buttons */}
        <div className="flex items-center gap-2 flex-1 overflow-x-auto no-scrollbar">
          {currentSection !== 'HUB' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSelectSection('HUB')}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-slate-900 to-slate-950 text-emerald-300 border border-emerald-500/40 hover:border-emerald-300 font-extrabold text-[10px] md:text-xs transition-all min-h-[44px] touch-active shadow-md"
              >
                <Home className="w-4 h-4 text-emerald-400" />
                <span>{t.nav_home || t.btn_back || 'Menú Principal'}</span>
              </button>

              <div className="h-5 w-px bg-slate-800 mx-1" />

              <div className="flex items-center bg-slate-950 p-1 rounded-full border border-slate-800 gap-1">
                <button
                  onClick={() => handleSelectSection('SENDERO_LUMINOSO')}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all min-h-[38px] flex items-center gap-1.5 touch-active ${
                    currentSection === 'SENDERO_LUMINOSO'
                      ? 'bg-red-600 text-white font-black shadow-md scale-105'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.nav_sl || 'Sendero Luminoso'}</span>
                </button>
                <button
                  onClick={() => handleSelectSection('MRTA')}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all min-h-[38px] flex items-center gap-1.5 touch-active ${
                    currentSection === 'MRTA'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md scale-105'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.nav_mrta || 'MRTA'}</span>
                </button>
                <button
                  onClick={() => handleSelectSection('CRONOLOGIA')}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all min-h-[38px] flex items-center gap-1.5 touch-active ${
                    currentSection === 'CRONOLOGIA'
                      ? 'bg-[#a5443b] text-white font-black shadow-md scale-105'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.nav_cronologia || 'Acciones Terroristas'}</span>
                </button>
                <button
                  onClick={() => handleSelectSection('OPERACIONES')}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all min-h-[38px] flex items-center gap-1.5 touch-active ${
                    currentSection === 'OPERACIONES'
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md scale-105'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.nav_operaciones || 'Operaciones'}</span>
                </button>
                <button
                  onClick={() => handleSelectSection('ARCHIVOS_PERIODISTICOS')}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all min-h-[38px] flex items-center gap-1.5 touch-active ${
                    currentSection === 'ARCHIVOS_PERIODISTICOS'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md scale-105'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Newspaper className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.nav_archivos || 'Archivos'}</span>
                </button>
              </div>
            </div>
          ) : (
            children || (
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t.museum_footer || 'Museo Virtual del Ejército del Perú • Sala de Pacificación Nacional'}</span>
              </div>
            )
          )}
        </div>

        {/* Right: Language + Accessibility + Timer */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Botonera Estandarizada Compacta de Idiomas */}
          <div className="flex items-center gap-1 bg-slate-900/90 rounded-full border border-emerald-500/30 p-1 shadow-inner">
            <div className="flex items-center gap-1 pl-2 pr-1 text-emerald-400">
              <Globe className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            </div>
            <div className="flex items-center gap-0.5">
              {KIOSK_CONFIG.SUPPORTED_LANGUAGES.map((lang) => {
                const cfg = LANG_CONFIG[lang];
                const isSelected = language === lang;
                return (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all touch-active cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-green-800 to-emerald-600 text-white shadow-md shadow-emerald-950/60 ring-1 ring-emerald-400/40 font-black'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/90'
                    }`}
                    title={cfg.name}
                  >
                    <span className="text-xs leading-none">{cfg.flag}</span>
                    <span className="tracking-wide font-black text-[11px]">{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inactivity timer */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-400 text-xs font-mono">
            <Clock className="w-3 h-3 text-emerald-400/60" />
            <span>{timeRemaining >= 60 ? `${Math.floor(timeRemaining / 60)}m ${String(timeRemaining % 60).padStart(2, '0')}s` : `${timeRemaining}s`}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
