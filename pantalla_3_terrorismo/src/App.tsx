import React, { useState, useEffect } from 'react';
import { I18nProvider, useI18n } from './context/I18nContext';
import { KioskShellProvider, useKioskShell } from './context/KioskShellContext';
import { TerrorismoProvider, useTerrorismo } from './context/TerrorismoContext';
import { AttractMode } from './components/AttractMode';
import { TerrorismoHub } from './components/TerrorismoHub';
import { TopicDetailView } from './components/TopicDetailView';
import { OperacionesView } from './components/OperacionesView';
import { CronologiaView } from './components/CronologiaView';
import { ArchivosPeriodisticosView } from './components/ArchivosPeriodisticosView';
import { BottomBar } from './components/BottomBar';
import { AdminApp } from './admin/AdminApp';
import { Shield, Lock, X, Info } from 'lucide-react';
import './index.css';

const TerrorismoAppContent: React.FC = () => {
  const { screen, highContrast, largeText } = useKioskShell();
  const { t, setLanguage } = useI18n();
  const { currentSection, fullscreenImage, setFullscreenImage } = useTerrorismo();

  // Restablecer idioma a español al regresar al modo reposo/attract por inactividad
  useEffect(() => {
    if (screen === 'ATTRACT') {
      setLanguage('es');
    }
  }, [screen, setLanguage]);

  // Soporte para abrir modal de imagen en pantalla completa desde iframe (Línea de Tiempo)
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'OPEN_FULLSCREEN_IMAGE' && e.data.payload) {
        setFullscreenImage(e.data.payload);
      } else if (e.data && e.data.type === 'CLOSE_FULLSCREEN_IMAGE') {
        setFullscreenImage(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFullscreenImage(null);
      }
    };
    window.addEventListener('message', handleMessage);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setFullscreenImage]);

  if (screen === 'ATTRACT') {
    return <AttractMode />;
  }

  const imageUrl = typeof fullscreenImage === 'string' ? fullscreenImage : fullscreenImage?.url;
  const imageAlt = typeof fullscreenImage === 'object' ? fullscreenImage?.alt : '';
  const imageDesc = typeof fullscreenImage === 'object' ? fullscreenImage?.description : '';

  return (
    <div
      className={`h-screen overflow-hidden bg-[#030A06] text-slate-100 flex flex-col justify-between select-none ${
        highContrast ? 'high-contrast-mode' : ''
      } ${largeText ? 'large-text-mode' : ''}`}
    >
      {/* Background Lighting */}
      <div className="fixed top-0 left-1/4 w-[700px] h-[700px] bg-red-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Informativo Superior (solo visible en el HUB) */}
      {currentSection === 'HUB' && (
      <header className="sticky top-0 z-30 w-full bg-[#030A06]/90 backdrop-blur-xl border-b border-emerald-500/20 px-6 py-2 shadow-xl flex-shrink-0">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-b from-red-900 via-slate-900 to-emerald-700 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#040D07] flex items-center justify-center border border-emerald-400">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="bg-red-950/80 text-red-200 text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold border border-red-500/30">
                {t.header_badge || 'EJÉRCITO DEL PERÚ • SALA DE PACIFICACIÓN'}
              </span>
              <h1 className="text-[17px] font-black text-white">{t.app_title || 'Terrorismo y Pacificación Nacional'}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-[10px] text-emerald-400/80 font-bold uppercase tracking-wider bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
              <span>{t.touch_interaction || 'Interacción Táctil Inferior ↓'}</span>
            </div>
            <a
              href="#/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 text-[10px] font-bold transition-all"
              title="Administración de contenido (acceso restringido)"
            >
              <Lock className="w-3 h-3" />
              <span>{t.admin_btn || 'Admin'}</span>
            </a>
          </div>
        </div>
      </header>
      )}

      {/* Vista Central según Sección Activa */}
      <main className="flex-1 min-h-0 w-full relative z-10 overflow-hidden flex flex-col">
        {currentSection === 'HUB' && <TerrorismoHub />}
        {currentSection === 'SENDERO_LUMINOSO' && <TopicDetailView />}
        {currentSection === 'MRTA' && <TopicDetailView />}
        {currentSection === 'OPERACIONES' && <OperacionesView />}
        {currentSection === 'CRONOLOGIA' && <CronologiaView />}
        {currentSection === 'ARCHIVOS_PERIODISTICOS' && <ArchivosPeriodisticosView />}
      </main>

      {/* Barra Inferior Estandarizada */}
      <BottomBar />

      {/* Modal de Imagen en Pantalla Completa (Zoom Viewer) */}
      {imageUrl && (
        <div
          onClick={() => setFullscreenImage(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-between p-4 md:p-8 animate-fade-in cursor-pointer"
        >
          <div className="w-full flex items-center justify-between z-10" onClick={(e) => e.stopPropagation()}>
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest bg-slate-900/80 px-4 py-1.5 rounded-full border border-emerald-500/40">
              {t.fullscreen_photo_badge || 'Fotografía Histórica en Alta Resolución'}
            </span>
            <button
              onClick={() => setFullscreenImage(null)}
              className="p-3 rounded-full bg-slate-900 text-white hover:bg-red-600 transition-all border border-slate-700 shadow-xl touch-active cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative flex-1 w-full max-h-[75vh] flex items-center justify-center p-2" onClick={(e) => e.stopPropagation()}>
            <img
              src={imageUrl}
              alt={imageAlt || 'Fotografía en pantalla completa'}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-slate-800"
            />
          </div>

          {imageDesc && (
            <div
              className="z-10 max-w-3xl px-6 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs md:text-sm flex items-center gap-3 text-center cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <Info className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{imageDesc}</span>
            </div>
          )}

          <div className="z-10 flex items-center gap-3 mt-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setFullscreenImage(null)}
              className="px-8 py-3 rounded-full bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-widest hover:brightness-110 shadow-xl transition-all cursor-pointer"
            >
              {t.close || 'Cerrar Visor'}
            </button>
          </div>
        </div>
      )}
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
    return <AdminApp defaultScreenId="terrorismo" />;
  }

  return (
    <I18nProvider>
      <KioskShellProvider>
        <TerrorismoProvider>
          <TerrorismoAppContent />
        </TerrorismoProvider>
      </KioskShellProvider>
    </I18nProvider>
  );
};

export default App;
