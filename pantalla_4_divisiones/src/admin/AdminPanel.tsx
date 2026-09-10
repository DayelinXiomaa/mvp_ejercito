import React, { useEffect, useState, useRef } from 'react';
import { api, CMS_URL, type MediaItem, type ScreenInfo } from './api';
import { JsonEditor } from './JsonEditor';
import { DivisionesVisualEditor } from './DivisionesVisualEditor';
import { TranslationsVisualEditor } from './TranslationsVisualEditor';
import initialDivisionesData from '../data/divisiones.json';
import initialUnitDbData from '../data/unit_database.json';
import initialLanguagesData from '../data/languages.json';
import {
  Save,
  Image as ImageIcon,
  Database,
  Upload,
  Copy,
  Trash2,
  RefreshCw,
  LogOut,
  ChevronLeft,
  MonitorPlay,
  Languages,
  LayoutGrid,
  Code,
} from 'lucide-react';

type Tab = 'contenido' | 'traducciones' | 'media' | 'respaldos';

const DEFAULT_SCREENS: ScreenInfo[] = [
  {
    id: 'divisiones',
    nombre: 'Divisiones del Ejército',
    recursos: [
      { id: 'principal', nombre: 'Divisiones y Brigadas (divisiones.json)' },
      { id: 'unitdb', nombre: 'Base de Datos de Unidades (unit_database.json)' },
    ],
  },
  { id: 'terrorismo', nombre: 'Terrorismo y Pacificación', recursos: [{ id: 'principal', nombre: 'Contenido principal' }] },
  { id: 'armas', nombre: 'Armas y Servicios', recursos: [{ id: 'principal', nombre: 'Contenido principal' }] },
  { id: 'timeline', nombre: 'Línea del Tiempo', recursos: [{ id: 'principal', nombre: 'Contenido principal' }] },
];

interface AdminPanelProps {
  onLogout: () => void;
  onExitAdmin: () => void;
  defaultScreenId?: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, onExitAdmin, defaultScreenId }) => {
  const [tab, setTab] = useState<Tab>('contenido');
  const [screens, setScreens] = useState<ScreenInfo[]>(DEFAULT_SCREENS);
  const [screen, setScreen] = useState<string>(defaultScreenId || 'divisiones');
  const [recurso, setRecurso] = useState<string>('principal');
  const [content, setContent] = useState<unknown>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cms_content_divisiones_principal');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return initialDivisionesData;
  });
  const [langs, setLangs] = useState<unknown>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cms_langs_divisiones');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return initialLanguagesData;
  });
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [editMode, setEditMode] = useState<'visual' | 'json'>('visual');
  const fileRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const loadScreens = () => {
    api
      .getScreens()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) setScreens(res);
      })
      .catch(() => {});
  };

  const getInitialFallbackContent = (scr: string, rec: string) => {
    if (scr === 'divisiones') {
      if (rec === 'unitdb') return initialUnitDbData;
      return initialDivisionesData;
    }
    return { info: `Modo local para pantalla: ${scr}`, items: [] };
  };

  const loadContent = () => {
    setBusy(true);
    setMsg('');
    api
      .getContent(screen, recurso)
      .then((data) => {
        setContent(data);
        localStorage.setItem(`cms_content_${screen}_${recurso}`, JSON.stringify(data));
      })
      .catch(() => {
        // Fallback to localStorage or bundled data
        const saved = localStorage.getItem(`cms_content_${screen}_${recurso}`);
        if (saved) {
          try {
            setContent(JSON.parse(saved));
            setMsg('Cargado desde almacenamiento local.');
            return;
          } catch {}
        }
        setContent(getInitialFallbackContent(screen, recurso));
        setMsg('Cargado en modo local (Servidor CMS no conectado)');
      })
      .finally(() => setBusy(false));
  };

  const loadLanguages = () => {
    api
      .getLanguages(screen)
      .then((data) => {
        setLangs(data);
        localStorage.setItem(`cms_langs_${screen}`, JSON.stringify(data));
      })
      .catch(() => {
        const saved = localStorage.getItem(`cms_langs_${screen}`);
        if (saved) {
          try {
            setLangs(JSON.parse(saved));
            return;
          } catch {}
        }
        setLangs(initialLanguagesData);
      });
  };

  const loadMedia = () => {
    api
      .listMedia(screen)
      .then(setMedia)
      .catch(() => {});
  };

  useEffect(() => {
    loadScreens();
  }, []);

  useEffect(() => {
    setContent(null);
    setLangs(null);
    setRecurso('principal');
    loadContent();
    loadLanguages();
    loadMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  useEffect(() => {
    setContent(null);
    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recurso]);

  const saveContent = async () => {
    setBusy(true);
    setMsg('Guardando...');
    // Always persist to localStorage
    if (content) {
      localStorage.setItem(`cms_content_${screen}_${recurso}`, JSON.stringify(content));
    }
    try {
      await api.saveContent(screen, content, recurso);
      setMsg('Contenido guardado correctamente en servidor y local ✔');
    } catch (e) {
      setMsg('Guardado localmente ✔ (Servidor: ' + (e as Error).message + ')');
    } finally {
      setBusy(false);
    }
  };

  const saveLanguages = async () => {
    setBusy(true);
    setMsg('Guardando traducciones...');
    if (langs) {
      localStorage.setItem(`cms_langs_${screen}`, JSON.stringify(langs));
    }
    try {
      await api.saveLanguages(screen, langs);
      setMsg('Traducciones guardadas correctamente en servidor y local ✔');
    } catch (e) {
      setMsg('Traducciones guardadas localmente ✔ (Servidor: ' + (e as Error).message + ')');
    } finally {
      setBusy(false);
    }
  };

  const handleUpload = async (file: File) => {
    setBusy(true);
    setMsg('Subiendo imagen...');
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const b64 = String(reader.result);
        try {
          const res = await api.uploadMedia(screen, file.name, b64);
          setMsg(`Imagen subida: ${res.url}`);
          loadMedia();
        } catch (err) {
          setMsg('Error subiendo al servidor: ' + (err as Error).message);
        } finally {
          setBusy(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (e) {
      setMsg('Error: ' + (e as Error).message);
      setBusy(false);
    }
  };

  const handleDeleteMedia = async (name: string) => {
    if (!window.confirm(`¿Eliminar ${name}?`)) return;
    setBusy(true);
    try {
      await api.deleteMedia(screen, name);
      setMsg('Imagen eliminada');
      loadMedia();
    } catch (e) {
      setMsg('Error: ' + (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const exportBackup = () => {
    const backupData = {
      pantalla: screen,
      recurso,
      fecha: new Date().toISOString(),
      contenido: content,
      traducciones: langs,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `backup_${screen}_${recurso}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const finalContent = parsed.contenido !== undefined ? parsed.contenido : parsed;
        setContent(finalContent);
        if (parsed.traducciones) {
          setLangs(parsed.traducciones);
        }
        localStorage.setItem(`cms_content_${screen}_${recurso}`, JSON.stringify(finalContent));
        try {
          await api.saveContent(screen, finalContent, recurso);
        } catch {}
        setMsg('Respaldo importado y guardado ✔');
      } catch (e) {
        setMsg('Error de importación: ' + (e as Error).message);
      }
    };
    reader.readAsText(file);
  };

  const tabs: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
    { id: 'contenido', label: 'Contenido', icon: <Database className="w-4 h-4" /> },
    { id: 'traducciones', label: 'Traducciones', icon: <Languages className="w-4 h-4" /> },
    { id: 'media', label: 'Imágenes', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'respaldos', label: 'Respaldos', icon: <Save className="w-4 h-4" /> },
  ];

  const screenInfo = screens.find((s) => s.id === screen) || {
    id: screen,
    nombre: screen === 'divisiones' ? 'Divisiones del Ejército' : screen,
    recursos: [{ id: 'principal', nombre: 'Contenido principal' }],
  };

  const recursosList = screenInfo.recursos || [{ id: 'principal', nombre: 'Contenido principal' }];

  return (
    <div className="h-screen overflow-hidden bg-[#030A06] text-slate-100 flex flex-col select-none">
      {/* Header Admin */}
      <header className="flex-shrink-0 bg-slate-950/95 border-b border-slate-800 backdrop-blur-xl px-6 py-3 flex items-center justify-between gap-3 shadow-2xl z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onExitAdmin}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Volver al Kiosko</span>
          </button>
          <div>
            <h1 className="text-lg font-black text-white">CMS • Panel de Administración</h1>
            <p className="text-[10px] text-slate-500 font-mono">Servidor: {CMS_URL}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Selector de Pantalla */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
            <MonitorPlay className="w-4 h-4 text-emerald-400" />
            <select
              value={screen}
              onChange={(e) => setScreen(e.target.value)}
              className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer [&>option]:text-slate-900"
            >
              {screens.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              loadContent();
              loadLanguages();
              loadMedia();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recargar</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 hover:bg-red-900 text-xs font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* Selector de Recurso & Modo Visual/JSON */}
      <div className="px-6 pt-3 flex items-center justify-between gap-4 flex-wrap flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-[11px] font-black uppercase tracking-widest">
            <MonitorPlay className="w-3.5 h-3.5" />
            {screenInfo.nombre}
          </span>

          {recursosList.length > 1 && tab === 'contenido' && (
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase px-2">Recurso:</span>
              {recursosList.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRecurso(r.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    recurso === r.id ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r.nombre}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Toggle Editor Visual vs JSON */}
        {(tab === 'contenido' || tab === 'traducciones') && (
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
            <button
              onClick={() => setEditMode('visual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                editMode === 'visual'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Editor Visual</span>
            </button>
            <button
              onClick={() => setEditMode('json')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                editMode === 'json'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Editor JSON</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs Principales */}
      <nav className="flex-shrink-0 px-6 pt-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-t-2xl text-xs font-bold transition-all border-t border-x ${
                tab === t.id
                  ? 'bg-slate-900 border-slate-700 text-emerald-400 shadow-lg'
                  : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 pb-2">
          {msg && (
            <span
              className={`text-xs px-3 py-1 rounded-lg ${
                msg.includes('Error')
                  ? 'bg-red-950/60 text-red-300 border border-red-500/30'
                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {msg}
            </span>
          )}

          {tab === 'contenido' && (
            <button
              onClick={saveContent}
              disabled={busy}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-green-900 to-emerald-600 text-white font-black text-xs uppercase tracking-wider hover:brightness-110 disabled:opacity-50 shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Contenido</span>
            </button>
          )}

          {tab === 'traducciones' && (
            <button
              onClick={saveLanguages}
              disabled={busy}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-green-900 to-emerald-600 text-white font-black text-xs uppercase tracking-wider hover:brightness-110 disabled:opacity-50 shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Traducciones</span>
            </button>
          )}
        </div>
      </nav>

      {/* Contenido Principal de las Pestañas */}
      <main className="flex-1 min-h-0 overflow-hidden p-6">
        {tab === 'contenido' && (
          <div className="h-full flex flex-col overflow-hidden">
            {editMode === 'visual' && screen === 'divisiones' && recurso === 'principal' && content ? (
              <DivisionesVisualEditor data={content as any} onChange={setContent} />
            ) : (
              <div className="h-full overflow-y-auto kiosk-scroll">
                <JsonEditor
                  value={content}
                  onChange={setContent}
                />
              </div>
            )}
          </div>
        )}

        {tab === 'traducciones' && (
          <div className="h-full flex flex-col overflow-hidden">
            {editMode === 'visual' ? (
              <TranslationsVisualEditor value={langs} onChange={setLangs} />
            ) : (
              <div className="h-full overflow-y-auto kiosk-scroll">
                <JsonEditor
                  value={langs}
                  onChange={setLangs}
                />
              </div>
            )}
          </div>
        )}

        {tab === 'media' && (
          <div className="h-full bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
              <span className="text-xs font-black uppercase text-emerald-400">
                Imágenes de {screenInfo.nombre} ({media.length})
              </span>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase shadow"
              >
                <Upload className="w-4 h-4" />
                <span>Subir Imagen</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f);
                  e.target.value = '';
                }}
              />
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-4 kiosk-scroll">
              {media.map((m) => (
                <div
                  key={m.name}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between group hover:border-emerald-500/50 transition-all shadow-md"
                >
                  <div className="w-full h-28 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center p-2">
                    <img src={m.url} alt={m.name} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-[11px] font-bold text-white truncate" title={m.name}>
                      {m.name}
                    </p>
                    <p className="text-[9px] text-slate-500">{(m.size / 1024).toFixed(1)} KB</p>
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(m.url);
                          setMsg(`Ruta copiada: ${m.url}`);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-emerald-400"
                        title="Copiar URL"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMedia(m.name)}
                        className="p-1 rounded text-slate-400 hover:text-red-400"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {media.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-500 text-xs">
                  No hay imágenes subidas en el servidor para esta pantalla.
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'respaldos' && (
          <div className="max-w-xl mx-auto space-y-6 pt-10">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Save className="w-5 h-5 text-emerald-400" /> Respaldos de {screenInfo.nombre}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Descarga una copia completa de seguridad del contenido y traducciones en formato JSON o restaura un respaldo previo.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={exportBackup}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  <span>Exportar Respaldo</span>
                </button>
                <button
                  onClick={() => importRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-black text-xs uppercase border border-slate-700 shadow-lg"
                >
                  <Upload className="w-4 h-4" />
                  <span>Importar Respaldo</span>
                </button>
                <input
                  ref={importRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImport(f);
                    e.target.value = '';
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
