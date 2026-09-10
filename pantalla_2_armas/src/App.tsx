import React, { useState, useEffect } from 'react';
import { I18nProvider, useI18n } from './context/I18nContext';
import { KioskShellProvider, useKioskShell } from './context/KioskShellContext';
import { ArmasProvider, useArmas } from './context/ArmasContext';
import { AttractMode } from './components/AttractMode';
import { BottomBar } from './components/BottomBar';
import { ArmasView } from './components/ArmasView';
import { AdminApp } from './admin/AdminApp';
import { Shield, Search, Lock, Award, Play, X } from 'lucide-react';
import { useKioskPreloader } from './hooks/useKioskPreloader';
import { ARMAS_MEDIA } from './config/armasMediaMap';
import './index.css';

const ArmasAppContent: React.FC = () => {
  const { screen, highContrast, largeText } = useKioskShell();
  const { language, setLanguage, t } = useI18n();
  const {
    armas,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    selectedItem,
    setSelectedItem,
    activeSlide,
    setActiveSlide,
    setShowHeroesModal,
    setActiveVideo,
  } = useArmas();

  // Precarga inteligente de imágenes en segundo plano en CacheStorage y RAM
  useKioskPreloader(armas);

  // Restablecer idioma a español al regresar al modo reposo/attract por inactividad
  useEffect(() => {
    if (screen === 'ATTRACT') {
      setLanguage('es');
    }
  }, [screen, setLanguage]);

  if (screen === 'ATTRACT') {
    return <AttractMode />;
  }

  // 2 botones de slides según requerimiento
  const slideTitles = [
    {
      idx: 0,
      title: language === 'en' ? 'Patron & Coat of Arms' : language === 'qu' ? 'Patrono hinaspa Escudo' : 'Patrono y Escudo',
    },
    {
      idx: 1,
      title: language === 'en' ? 'Mission & Employment' : language === 'qu' ? 'Misión hinaspa Llank’ay' : 'Misión y Empleo',
    },
  ];

  return (
    <div
      className={`h-screen w-full overflow-hidden bg-[#030A06] text-slate-100 flex flex-col justify-between select-none ${
        highContrast ? 'high-contrast-mode' : ''
      } ${largeText ? 'large-text-mode' : ''}`}
    >
      <div className="fixed top-0 left-1/4 w-[700px] h-[700px] bg-green-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Informativo Superior (Se oculta al entrar al detalle de un Arma o Servicio) */}
      {!selectedItem && (
        <header className="z-30 w-full bg-[#030A06]/90 backdrop-blur-xl border-b border-emerald-500/20 px-8 py-4 shadow-xl flex-shrink-0 animate-fade-in">
          <div className="max-w-[1920px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-b from-green-900 to-emerald-600 p-0.5 shadow-lg flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#040D07] flex items-center justify-center border border-emerald-400">
                  <Shield className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <div>
                <span className="bg-green-900/80 text-emerald-200 text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
                  {t.virtual_museum_tag || 'EJÉRCITO DEL PERÚ • MUSEO VIRTUAL'}
                </span>
                <h1 className="text-2xl font-black text-white">
                  {activeFilter === 'ARMA'
                    ? t.app_title_armas || 'Armas del Ejército'
                    : activeFilter === 'SERVICIO'
                    ? t.app_title_servicios || 'Servicios del Ejército'
                    : t.app_title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-[11px] text-emerald-400/80 font-bold uppercase tracking-wider bg-slate-900/80 px-4 py-2 rounded-full border border-emerald-500/20">
                <span>{t.touch_navigation_hint || 'Interacción Táctil Inferior ↓'}</span>
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
      )}

      <main className="flex-1 min-h-0 w-full relative z-10 overflow-hidden flex flex-col">
        <ArmasView />
      </main>

      {/* Bottom Bar: Se adapta dinámicamente según si está en la lista o en el detalle */}
      <BottomBar>
        {selectedItem ? (
          <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto no-scrollbar animate-fade-in">
            {/* Botón Cerrar Detalle en la barra inferior (fácil interacción táctil en televisor) */}
            <button
              onClick={() => setSelectedItem(null)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 border-2 border-emerald-500/50 hover:bg-red-950/80 hover:border-red-500 text-white text-xs font-black min-h-[38px] transition-all touch-active flex-shrink-0 shadow-md cursor-pointer group"
              title="Cerrar detalle y volver a la lista"
            >
              <X className="w-4 h-4 text-red-400 group-hover:text-white transition-colors" />
              <span>{language === 'en' ? 'Close Detail' : language === 'qu' ? 'Wichqay' : 'Cerrar Detalle'}</span>
            </button>

            {/* Selector de Píldoras de los 2 Slides Principales */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-full border border-slate-800 flex-shrink-0 shadow-inner">
              {slideTitles.map((st) => (
                <button
                  key={st.idx}
                  onClick={() => setActiveSlide(st.idx)}
                  className={`px-3 py-1.5 rounded-full text-xs font-black transition-all min-h-[34px] flex items-center gap-1.5 touch-active ${
                    activeSlide === st.idx
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-slate-900/80 text-[10px] flex items-center justify-center font-black">
                    {st.idx + 1}
                  </span>
                  <span>{st.title}</span>
                </button>
              ))}
            </div>

            {/* Botón Ver Video en la barra inferior (fácil interacción táctil en televisor) */}
            {ARMAS_MEDIA[selectedItem.id]?.videoUrl && (
              <button
                onClick={() => {
                  const m = ARMAS_MEDIA[selectedItem.id];
                  if (m?.videoUrl) {
                    setActiveVideo({
                      url: m.videoUrl,
                      title: m.videoTitle || `Video Institucional — ${selectedItem.nombre}`,
                    });
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-slate-950 font-black text-xs min-h-[38px] transition-all touch-active flex-shrink-0 shadow-lg shadow-emerald-950/60 cursor-pointer animate-pulse-subtle"
                title="Reproducir video institucional"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{language === 'en' ? 'Watch Video' : language === 'qu' ? 'Videota Qaway' : 'Ver Video'}</span>
              </button>
            )}

            {/* Botón Fallecidos / Inmolados de este Arma */}
            {(() => {
              const heroesCount = (selectedItem.personajes || []).filter((p) => p.publicado !== false).length;
              return (
                <button
                  onClick={() => setShowHeroesModal(true)}
                  disabled={heroesCount === 0}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black min-h-[38px] transition-all touch-active flex-shrink-0 shadow-lg ${
                    heroesCount > 0
                      ? 'bg-gradient-to-r from-red-950 via-red-900 to-red-800 text-white border-2 border-red-500/60 hover:brightness-125 active:scale-95 shadow-red-950/80 cursor-pointer animate-pulse-subtle'
                      : 'bg-slate-900/60 text-slate-500 border border-slate-800 cursor-not-allowed'
                  }`}
                  title={
                    heroesCount > 0
                      ? `Ver ${heroesCount} registros de combatientes inmolados`
                      : 'Sin registros de inmolados para este servicio'
                  }
                >
                  <Award className="w-4 h-4 text-red-300 flex-shrink-0" />
                  <span>
                    {language === 'en' ? 'Fallen Heroes' : language === 'qu' ? 'Wañusqakuna' : 'Fallecidos'}
                  </span>
                  {heroesCount > 0 && (
                    <span className="bg-black/60 text-red-200 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-400/50">
                      {heroesCount}
                    </span>
                  )}
                </button>
              );
            })()}
          </div>
        ) : (
          /* ============================================================ */
          /* FILTROS Y BÚSQUEDA EN LA LISTA PRINCIPAL                     */
          /* ============================================================ */
          <>
            <div className="relative mr-2 flex-shrink-0">
              <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.search_placeholder || (language === 'en' ? 'Search...' : language === 'qu' ? 'Maskay...' : 'Buscar...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900/90 border border-emerald-500/30 rounded-full pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 w-44"
              />
            </div>

            <button
              onClick={() => setActiveFilter('TODOS')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all min-h-[48px] touch-active ${
                activeFilter === 'TODOS'
                  ? 'bg-emerald-500 text-slate-950 font-extrabold scale-105 shadow-lg'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {t.filter_all}
            </button>
            <button
              onClick={() => setActiveFilter('ARMA')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all min-h-[48px] touch-active ${
                activeFilter === 'ARMA'
                  ? 'bg-emerald-500 text-slate-950 font-extrabold scale-105 shadow-lg'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {t.filter_armas}
            </button>
            <button
              onClick={() => setActiveFilter('SERVICIO')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all min-h-[48px] touch-active ${
                activeFilter === 'SERVICIO'
                  ? 'bg-emerald-500 text-slate-950 font-extrabold scale-105 shadow-lg'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {t.filter_servicios}
            </button>
          </>
        )}
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
    return <AdminApp defaultScreenId="armas" />;
  }

  return (
    <I18nProvider>
      <KioskShellProvider>
        <ArmasProvider>
          <ArmasAppContent />
        </ArmasProvider>
      </KioskShellProvider>
    </I18nProvider>
  );
};

export default App;
