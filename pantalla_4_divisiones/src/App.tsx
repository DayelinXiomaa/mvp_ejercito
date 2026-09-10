import React, { useState, useEffect } from 'react';
import { I18nProvider, useI18n } from './context/I18nContext';
import { KioskShellProvider, useKioskShell } from './context/KioskShellContext';
import { DivisionesProvider, useDivisiones } from './context/DivisionesContext';
import { AttractMode } from './components/AttractMode';
import { BottomBar } from './components/BottomBar';
import { DivisionesView } from './components/DivisionesView';
import { AdminApp } from './admin/AdminApp';
import { MapPin, Search, Lock, ArrowLeft, GitFork, FileText, X } from 'lucide-react';
import './index.css';

const DIVISION_FILTERS = [
  { key: 'TODOS', getLabel: (t: any) => t.filter_all || 'Todas', color: '#10b981' },
  { key: '1de', getLabel: (t: any) => t.filter_1de || 'I DE (Piura)', color: '#00cfff' },
  { key: '2de', getLabel: (t: any) => t.filter_2de || 'II DE (Rímac)', color: '#ff9f1a' },
  { key: '3de', getLabel: (t: any) => t.filter_3de || 'III DE (Arequipa)', color: '#2aff6e' },
  { key: '4de', getLabel: (t: any) => t.filter_4de || 'IV DE (Pichari)', color: '#ffe12d' },
  { key: '5de', getLabel: (t: any) => t.filter_5de || 'V DE (Iquitos)', color: '#c565ff' },
  { key: 'ae', getLabel: (t: any) => t.filter_ae || 'Aviación del Ejército', color: '#38bdf8' },
];

const DivisionesAppContent: React.FC = () => {
  const { screen, highContrast, largeText } = useKioskShell();
  const { setLanguage, t } = useI18n();
  const {
    selectedDivision,
    setSelectedDivision,
    activeTab,
    setActiveTab,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    modalHistory,
    popModal,
    closeAllModals,
    modalTab,
    setModalTab,
  } = useDivisiones();

  // Restablecer idioma a español al regresar al modo reposo/attract por inactividad
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
      <div className="fixed top-0 left-1/4 w-[700px] h-[700px] bg-green-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Informativo Superior (Pasivo) - Oculto en el detalle de divisiones */}
      {!selectedDivision && (
      <header className="sticky top-0 z-30 w-full bg-[#030A06]/90 backdrop-blur-xl border-b border-emerald-500/20 px-6 py-2 shadow-xl flex-shrink-0">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-b from-green-900 to-emerald-600 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#040D07] flex items-center justify-center border border-emerald-400">
                <MapPin className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="bg-green-900/80 text-emerald-200 text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                EJÉRCITO DEL PERÚ • MUSEO VIRTUAL
              </span>
              <h1 className="text-xl font-black text-white">{t.app_title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-[10px] text-emerald-400/80 font-bold uppercase tracking-wider bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
              <span>Interacción Táctil Inferior ↓</span>
            </div>
            <a
              href="#/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 text-[10px] font-bold transition-all"
              title="Administración de contenido (acceso restringido)"
            >
              <Lock className="w-3 h-3" />
              <span>Admin</span>
            </a>
          </div>
        </div>
      </header>
      )}

      <main className="flex-1 min-h-0 w-full relative z-10 overflow-hidden flex flex-col">
        <DivisionesView />
      </main>

      {/* Bottom Bar: Modal de Unidad vs Modo Detalle de División vs Modo Mapa General */}
      <BottomBar>
        {modalHistory.length > 0 ? (
          /* ===== BOTONERA CUANDO SE ESTÁ DENTRO DEL MODAL DE UNIDAD ===== */
          <div className="flex items-center gap-3 flex-1 overflow-x-auto no-scrollbar py-0.5">
            {/* Botón Volver a Nivel Anterior si hay historial anidado (Batallón / Compañía) */}
            {modalHistory.length > 1 ? (
              <button
                onClick={popModal}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 text-slate-950 font-black text-[10px] md:text-xs shadow-xl hover:brightness-110 transition-all min-h-[48px] touch-active flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 text-slate-950" />
                <span>Volver al Organigrama</span>
              </button>
            ) : (
              /* Botón Cerrar Detalle solo en el nivel principal de la Brigada */
              <button
                onClick={closeAllModals}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 text-slate-950 font-black text-[10px] md:text-xs shadow-xl hover:brightness-110 transition-all min-h-[48px] touch-active flex-shrink-0"
              >
                <X className="w-4 h-4 text-slate-950" />
                <span>Cerrar Detalle</span>
              </button>
            )}

            <div className="h-6 w-px bg-emerald-500/30 flex-shrink-0" />

            {/* Selector de Pestañas del Modal (Reseña vs Organigrama) */}
            <div className="flex items-center bg-slate-900/90 p-1 rounded-full border border-emerald-500/30 shadow-inner flex-shrink-0 gap-1">
              <button
                onClick={() => setModalTab('TEXTO')}
                className={`px-4 py-2 rounded-full text-[10px] md:text-xs font-bold transition-all min-h-[44px] flex items-center gap-2 touch-active ${
                  modalTab === 'TEXTO'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-lg scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Reseña</span>
              </button>
              {modalHistory[modalHistory.length - 1].unidades && modalHistory[modalHistory.length - 1].unidades.length > 0 && (
                <button
                  onClick={() => setModalTab('ORGANIGRAMA')}
                  className={`px-4 py-2 rounded-full text-[10px] md:text-xs font-bold transition-all min-h-[44px] flex items-center gap-2 touch-active ${
                    modalTab === 'ORGANIGRAMA'
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-lg scale-105'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <GitFork className="w-4 h-4" />
                  <span>Organigrama ({modalHistory[modalHistory.length - 1].unidades.length})</span>
                </button>
              )}
            </div>
          </div>
        ) : selectedDivision ? (
          /* ===== BOTONERA CUANDO SE ESTÁ DENTRO DE UNA DIVISIÓN ===== */
          <div className="flex items-center gap-3 flex-1 overflow-x-auto no-scrollbar py-0.5">
            {/* Botón Volver al Mapa */}
            <button
              onClick={() => setSelectedDivision(null)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-green-950 via-slate-900 to-green-950 text-emerald-300 border border-emerald-500/50 hover:border-emerald-300 hover:text-white font-extrabold text-[10px] md:text-xs shadow-xl transition-all min-h-[48px] touch-active flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>{t.nav_back || 'Volver al Mapa'}</span>
            </button>

            <div className="h-6 w-px bg-emerald-500/30 flex-shrink-0" />

            {/* Selector de Pestañas: Organigrama vs Reseña */}
            <div className="flex items-center bg-slate-900/90 p-1 rounded-full border border-emerald-500/30 shadow-inner flex-shrink-0 gap-1">
              <button
                onClick={() => setActiveTab('ORGANIGRAMA')}
                className={`px-4 py-2 rounded-full text-[10px] md:text-xs font-bold transition-all min-h-[44px] flex items-center gap-2 touch-active ${
                  activeTab === 'ORGANIGRAMA'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-lg scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <GitFork className="w-4 h-4" />
                <span>Organigrama</span>
              </button>
              <button
                onClick={() => setActiveTab('RESENA')}
                className={`px-4 py-2 rounded-full text-[10px] md:text-xs font-bold transition-all min-h-[44px] flex items-center gap-2 touch-active ${
                  activeTab === 'RESENA'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-lg scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Reseña Histórica</span>
              </button>
            </div>
          </div>
        ) : (
          /* ===== BOTONERA GENERAL CUANDO SE ESTÁ EN EL MAPA ===== */
          <>
            {/* Búsqueda Táctil */}
            <div className="relative mr-2 flex-shrink-0">
              <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900/90 border border-emerald-500/30 rounded-full pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 w-44"
              />
            </div>

            {DIVISION_FILTERS.map((btn) => {
              const isActive = activeFilter === btn.key;
              const label = btn.getLabel(t);
              return (
                <button
                  key={btn.key}
                  onClick={() => setActiveFilter(btn.key)}
                  style={{
                    backgroundColor: isActive ? btn.color : 'rgba(15, 23, 42, 0.85)',
                    borderColor: isActive ? btn.color : `${btn.color}66`,
                    color: isActive ? '#020804' : '#e2e8f0',
                    boxShadow: isActive ? `0 0 20px ${btn.color}88` : 'none',
                  }}
                  className="px-3.5 py-1.5 rounded-full text-[9px] md:text-[10px] font-black transition-all min-h-[44px] touch-active border flex items-center gap-1.5 flex-shrink-0"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-white/40 shadow-sm"
                    style={{ backgroundColor: btn.color }}
                  />
                  <span>{label}</span>
                </button>
              );
            })}
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
    return <AdminApp defaultScreenId="divisiones" />;
  }

  return (
    <I18nProvider>
      <KioskShellProvider>
        <DivisionesProvider>
          <DivisionesAppContent />
        </DivisionesProvider>
      </KioskShellProvider>
    </I18nProvider>
  );
};

export default App;
