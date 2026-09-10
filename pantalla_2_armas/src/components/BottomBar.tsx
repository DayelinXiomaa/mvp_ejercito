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
  { code: string; name: string }
> = {
  es: { code: 'PE', name: 'Español' },
  en: { code: 'GB', name: 'English' },
  qu: { code: 'PE', name: 'Quechua' },
};

export const BottomBar: React.FC<BottomBarProps> = ({ children }) => {
  const { language, setLanguage } = useI18n();
  const { timeRemaining } = useKioskShell();

  return (
    <footer className="flex-shrink-0 z-30 w-full bg-[#030A06]/95 backdrop-blur-xl border-t border-emerald-500/20 shadow-2xl">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between px-4 py-2.5 gap-3">
        {/* Left: App-specific controls slot */}
        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto no-scrollbar">
          {children}
        </div>

        {/* Right: Language + Timer */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Botonera Estandarizada de Idiomas */}
          <div className="flex items-center gap-1 bg-slate-900/90 rounded-full border border-emerald-500/30 p-1 shadow-inner">
            <div className="flex items-center gap-1.5 pl-3 pr-2 text-emerald-400">
              <Globe className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all min-h-[38px] touch-active cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md shadow-emerald-950/60 font-black'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`}
                    title={cfg.name}
                  >
                    <span className={`text-[11px] font-black ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                      {cfg.code}
                    </span>
                    <span className="tracking-tight">{cfg.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inactivity timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-500 text-xs font-mono min-h-[38px]">
            <Clock className="w-3.5 h-3.5 text-emerald-400/60" />
            <span>{timeRemaining >= 60 ? `${Math.floor(timeRemaining / 60)}m ${String(timeRemaining % 60).padStart(2, '0')}s` : `${timeRemaining}s`}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
