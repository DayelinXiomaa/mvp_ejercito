import React from 'react';
import { useI18n } from '../context/I18nContext';
import { useKioskShell } from '../context/KioskShellContext';
import { KIOSK_CONFIG } from '../config/kioskConfig';
import type { SupportedLanguage } from '../config/kioskConfig';
import { Clock, Globe } from 'lucide-react';

interface BottomBarProps {
  children?: React.ReactNode; // Slot for app-specific controls (filters, nav)
}

const LANG_CONFIG: Record<
  SupportedLanguage,
  { label: string; name: string; shortName: string; flag: string }
> = {
  es: { label: 'ES', name: 'Español', shortName: 'ES', flag: '🇵🇪' },
  en: { label: 'EN', name: 'English', shortName: 'EN', flag: '🇬🇧' },
  qu: { label: 'QU', name: 'Quechua', shortName: 'QU', flag: '🇵🇪' },
};

export const BottomBar: React.FC<BottomBarProps> = ({ children }) => {
  const { language, setLanguage } = useI18n();
  const { timeRemaining } = useKioskShell();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#030A06]/95 backdrop-blur-xl border-t border-emerald-500/20 shadow-2xl">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between px-3 py-2 gap-2">
        {/* Left: App-specific controls slot (Búsqueda + Rangos de fechas) */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto no-scrollbar">
          {children}
        </div>

        {/* Right: Language + Timer */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Botonera Estandarizada Compacta de Idiomas */}
          <div className="flex items-center gap-1 bg-slate-900/90 rounded-full border border-emerald-500/30 p-0.5 shadow-inner">
            <div className="flex items-center gap-1 pl-2.5 pr-1 text-emerald-400">
              <Globe className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                {language === 'en' ? 'Language' : language === 'qu' ? 'Simi' : 'Idioma'}
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              {KIOSK_CONFIG.SUPPORTED_LANGUAGES.map((lang) => {
                const cfg = LANG_CONFIG[lang];
                const isSelected = language === lang;
                return (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold transition-all touch-active ${
                      isSelected
                        ? 'bg-gradient-to-r from-green-800 to-emerald-600 text-white shadow-md ring-1 ring-emerald-400/40 font-black'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/90'
                    }`}
                    title={cfg.name}
                  >
                    <span className="text-xs leading-none">{cfg.flag}</span>
                    <span className="tracking-wide font-extrabold">{cfg.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inactivity timer */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 text-[10px] font-mono h-8">
            <Clock className="w-3 h-3 text-emerald-400/70" />
            <span>{timeRemaining >= 60 ? `${Math.floor(timeRemaining / 60)}m ${String(timeRemaining % 60).padStart(2, '0')}s` : `${timeRemaining}s`}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
