import React from 'react';
import { useI18n } from '../context/I18nContext';
import { useKioskShell } from '../context/KioskShellContext';
import { KIOSK_CONFIG } from '../config/kioskConfig';
import type { SupportedLanguage } from '../config/kioskConfig';
import { Clock, Globe } from 'lucide-react';

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
  const { language, setLanguage } = useI18n();
  const { timeRemaining } = useKioskShell();

  return (
    <footer className="flex-shrink-0 z-30 w-full bg-[#030A06]/95 backdrop-blur-xl border-t border-emerald-500/20 shadow-2xl">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between px-6 py-3 gap-4">
        {/* Left: App-specific controls slot */}
        <div className="flex items-center gap-2 flex-1 overflow-x-auto no-scrollbar">
          {children}
        </div>

        {/* Right: Language + Timer */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Botonera Estandarizada de Idiomas */}
          <div className="flex items-center gap-1 bg-slate-900/90 rounded-full border border-emerald-500/30 p-1 shadow-inner">
            <div className="flex items-center gap-1.5 pl-2.5 pr-1 text-emerald-400">
              <Globe className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-[8px] font-black uppercase tracking-wider hidden sm:inline text-emerald-300">
                {language === 'en' ? 'Language' : language === 'qu' ? 'Simi' : 'Idioma'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {KIOSK_CONFIG.SUPPORTED_LANGUAGES.map((lang) => {
                const cfg = LANG_CONFIG[lang];
                const isSelected = language === lang;
                return (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[6px] font-bold transition-all min-h-[44px] touch-active ${
                      isSelected
                        ? 'bg-gradient-to-r from-green-800 to-emerald-600 text-white shadow-lg shadow-emerald-950/60 ring-2 ring-emerald-400/40 font-black scale-105'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/90'
                    }`}
                    title={cfg.name}
                  >
                    <span className="text-sm leading-none">{cfg.flag}</span>
                    <span className="tracking-wide">{cfg.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inactivity timer */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-500 text-xs font-mono min-h-[48px]">
            <Clock className="w-3.5 h-3.5 text-emerald-400/60" />
            <span>{timeRemaining >= 60 ? `${Math.floor(timeRemaining / 60)}m ${String(timeRemaining % 60).padStart(2, '0')}s` : `${timeRemaining}s`}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
