import React, { useState, useEffect } from 'react';
import { I18nProvider, useI18n } from './context/I18nContext';
import { KioskShellProvider, useKioskShell } from './context/KioskShellContext';
import { TimelineProvider, useTimeline, YEAR_RANGES } from './context/TimelineContext';
import { AttractMode } from './components/AttractMode';
import { BottomBar } from './components/BottomBar';
import { TimelineView } from './components/TimelineView';
import { EventDetailModal } from './components/EventDetailModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { CMSAdminModal } from './components/CMSAdminModal';
import { AdminApp } from './admin/AdminApp';
import { Shield, Search, Clock, Lock } from 'lucide-react';
import './index.css';

const TimelineAppContent: React.FC = () => {
  const { screen } = useKioskShell();
  const { highContrast, largeText } = useKioskShell();
  const { t, setLanguage } = useI18n();
  const {
    activeRange,
    setActiveRange,
    searchQuery,
    setSearchQuery,
    activeVideo,
    setActiveVideo,
    setSelectedEvent,
  } = useTimeline();

  // H-P1-M2: Restablecer idioma a español al regresar al modo reposo/attract por inactividad
  useEffect(() => {
    if (screen === 'ATTRACT') {
      setLanguage('es');
    }
  }, [screen, setLanguage]);

  if (screen === 'ATTRACT') {
    return <AttractMode />;
  }

  return (
    <div
      className={`h-screen overflow-hidden bg-[#030A06] text-slate-100 flex flex-col justify-between select-none ${
        highContrast ? 'high-contrast-mode' : ''
      } ${largeText ? 'large-text-mode' : ''}`}
    >
      {/* Background Ambient Glow */}
      <div className="fixed top-0 left-1/4 w-[700px] h-[700px] bg-green-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Informativo Superior (100% Pasivo - Sin controles interactivos al ser inaccesible por altura) */}
      <header className="sticky top-0 z-30 w-full bg-[#030A06]/90 backdrop-blur-xl border-b border-emerald-500/20 px-8 py-4 shadow-xl flex-shrink-0">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-b from-green-900 to-emerald-600 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#040D07] flex items-center justify-center border border-emerald-400">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="bg-green-900/80 text-emerald-200 text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
                EJÉRCITO DEL PERÚ • MUSEO VIRTUAL
              </span>
              <h1 className="text-2xl font-black text-white">{t.app_title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-[11px] text-emerald-400/80 font-bold uppercase tracking-wider bg-slate-900/80 px-4 py-2 rounded-full border border-emerald-500/20">
              <span>Interacción Táctil Inferior ↓</span>
            </div>
            <a
              href="#/admin"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 text-[11px] font-bold transition-all"
              title="Administración de contenido (acceso restringido)"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main View Horizontal Timeline */}
      <main className="flex-1 pb-20 relative z-10 flex items-center overflow-hidden">
        <TimelineView />
      </main>

      {/* Modales */}
      <EventDetailModal />
      <CMSAdminModal />

      {activeVideo && (
        <VideoPlayerModal
          videoUrl={activeVideo.url}
          title={activeVideo.title}
          onClose={() => setActiveVideo(null)}
          onViewDetails={
            activeVideo.event
              ? () => {
                  const ev = activeVideo.event!;
                  setActiveVideo(null);
                  setSelectedEvent(ev);
                }
              : undefined
          }
        />
      )}

      {/* Bottom Bar con Búsqueda, CMS, Filtros e Idiomas (Zona Interactiva Alcanzable) */}
      <BottomBar>
        {/* Búsqueda Táctil Compacta */}
        <div className="relative mr-1 flex-shrink-0">
          <Search className="w-3 h-3 text-emerald-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-900/90 border border-emerald-500/30 rounded-full pl-7 pr-2.5 py-1 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 w-28 sm:w-32"
          />
        </div>

        {/* Navegación por Rangos de Años */}
        <div className="flex items-center gap-0.5 bg-slate-900/90 rounded-full border border-emerald-500/20 p-0.5 flex-shrink-0">
          <div className="flex items-center gap-1 pl-2 pr-1 text-emerald-400/90">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span className="text-[9px] font-black uppercase tracking-wider hidden lg:inline">Periodo</span>
          </div>
          {YEAR_RANGES.map((range) => {
            const isActive = activeRange === range.key;
            return (
              <button
                key={range.key}
                onClick={() => setActiveRange(range.key)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all touch-active ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/25 scale-[1.02]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </BottomBar>
    </div>
  );
};

export const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(() =>
    typeof window !== 'undefined' &&
    (window.location.hash === '#/admin' || new URLSearchParams(window.location.search).get('admin') !== null)
  );

  useEffect(() => {
    const onHash = () => setIsAdmin(window.location.hash === '#/admin');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (isAdmin) {
    return <AdminApp defaultScreenId="timeline" />;
  }

  return (
    <I18nProvider>
      <KioskShellProvider>
        <TimelineProvider>
          <TimelineAppContent />
        </TimelineProvider>
      </KioskShellProvider>
    </I18nProvider>
  );
};

export default App;
