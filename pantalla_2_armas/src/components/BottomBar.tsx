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
      <div className="max-w-[1920px] mx-auto flex items-center justify-between px-4 py-2 gap-3">
        {/* Left: App-specific controls slot */}
        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto no-scrollbar">
          {children}
        </div>

        {/* Right: Language + Timer */}
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
