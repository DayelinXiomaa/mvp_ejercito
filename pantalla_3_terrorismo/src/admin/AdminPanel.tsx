import React, { useEffect, useState, useRef } from 'react';
import { api, CMS_URL, type MediaItem, type ScreenInfo } from './api';
import { JsonEditor } from './JsonEditor';
import { TerrorismoVisualEditor } from './TerrorismoVisualEditor';
import { TranslationsVisualEditor } from './TranslationsVisualEditor';
import type { TerrorismoData } from '../context/TerrorismoContext';
import initialContentData from '../data/terrorismo.json';
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
  { id: 'terrorismo', nombre: 'Terrorismo y Pacificación', recursos: [{ id: 'principal', nombre: 'Contenido principal' }] },
  { id: 'armas', nombre: 'Armas y Servicios', recursos: [{ id: 'principal', nombre: 'Contenido principal' }] },
  { id: 'timeline', nombre: 'Línea del Tiempo', recursos: [{ id: 'principal', nombre: 'Contenido principal' }] },
  { id: 'divisiones', nombre: 'Divisiones del Ejército', recursos: [
    { id: 'principal', nombre: 'Contenido principal' },
    { id: 'unitdb', nombre: 'Base de Unidades (unit_database.json)' }
  ]},
];

interface AdminPanelProps {
  onLogout: () => void;
  onExitAdmin: () => void;
  defaultScreenId?: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, onExitAdmin, defaultScreenId }) => {
  const [tab, setTab] = useState<Tab>('contenido');
  const [screens, setScreens] = useState<ScreenInfo[]>(DEFAULT_SCREENS);
  const [screen, setScreen] = useState<string>(defaultScreenId || 'terrorismo');
  const [recurso, setRecurso] = useState<string>('principal');
  const [content, setContent] = useState<unknown>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cms_content_terrorismo');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return initialContentData;
  });
  const [langs, setLangs] = useState<unknown>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cms_langs_terrorismo');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
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

  const loadContent = () => {
    setBusy(true);
    setMsg('');
    api
      .getContent(screen, recurso)
      .then((data) => {
        setContent(data);
        if (screen === 'terrorismo' && recurso === 'principal') {
          localStorage.setItem('cms_content_terrorismo', JSON.stringify(data));
        }
      })
      .catch((e) => {
        // Fallback: localStorage or bundled JSON
        if (screen === 'terrorismo' && recurso === 'principal') {
          const saved = localStorage.getItem('cms_content_terrorismo');
          if (saved) {
            try {
              setContent(JSON.parse(saved));
              return;
            } catch {}
          }
          setContent(initialContentData);
        } else {
          const saved = localStorage.getItem(`cms_content_${screen}_${recurso}`);
          if (saved) {
            try {
              setContent(JSON.parse(saved));
              return;
            } catch {}
          }
          setContent({ info: `Modo local para pantalla: ${screen}`, items: [] });
        }
        setMsg('Cargado en modo local (Servidor CMS: ' + e.message + ')');
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
    // Always persist locally
    if (content) {
      localStorage.setItem(`cms_content_${screen}_${recurso}`, JSON.stringify(content));
      if (screen === 'terrorismo' && recurso === 'principal') {
        localStorage.setItem('cms_content_terrorismo', JSON.stringify(content));
      }
    }
    try {
      await api.saveContent(screen, content, recurso);
      setMsg('✔ Contenido guardado y sincronizado en servidor CMS');
    } catch (e) {
      setMsg('✔ Guardado localmente en la aplicación (Servidor CMS no disponible: ' + (e as Error).message + ')');
    } finally {
      setBusy(false);
    }
  };

  const saveLanguages = async () => {
    setBusy(true);
    setMsg('Guardando traducciones...');
    // Always persist locally
    if (langs) {
      localStorage.setItem(`cms_langs_${screen}`, JSON.stringify(langs));
    }
    try {
      await api.saveLanguages(screen, langs);
      setMsg('✔ Traducciones guardadas en servidor CMS');
    } catch (e) {
      setMsg('✔ Traducciones guardadas localmente en la aplicación');
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
        const res = await api.uploadMedia(screen, file.name, b64);
        setMsg(`Imagen subida: ${res.url}`);
        loadMedia();
        setBusy(false);
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
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${screen}_contenido_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(String(reader.result));
        setContent(data);
        localStorage.setItem(`cms_content_${screen}_${recurso}`, JSON.stringify(data));
        if (screen === 'terrorismo' && recurso === 'principal') {
          localStorage.setItem('cms_content_terrorismo', JSON.stringify(data));
        }
        try {
          await api.saveContent(screen, data);
          setMsg('Respaldo importado y guardado en servidor CMS ✔');
        } catch {
          setMsg('Respaldo importado y guardado localmente ✔');
        }
      } catch (e) {
        setMsg('Error al importar: ' + (e as Error).message);
      }
    };
    reader.readAsText(file);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMsg(`Copiado: ${text}`);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'contenido', label: 'Contenido', icon: <Database className="w-4 h-4" /> },
    { id: 'traducciones', label: 'Traducciones (ES/EN/QU)', icon: <Languages className="w-4 h-4" /> },
    { id: 'media', label: 'Imágenes y Archivos', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'respaldos', label: 'Respaldos / Exportar', icon: <Upload className="w-4 h-4" /> },
  ];

  const screenNombre = screens.find((s) => s.id === screen)?.nombre || screen;

  return (
    <div className="flex flex-col h-screen bg-[#060D0A] text-slate-100 overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-slate-900/90 border-b border-emerald-500/20 px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onExitAdmin}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500 text-xs font-bold transition-all"
            title="Volver a la pantalla interactiva"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Volver a la Sala</span>
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
              CMS • EJÉRCITO DEL PERÚ
            </span>
            <h1 className="text-[13px] font-black text-white">Panel de Administración de Contenido</h1>
            <p className="text-[9px] text-slate-500 font-mono">Servidor: {CMS_URL}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Selector de Pantalla */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
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

      {/* Banner de pantalla activa */}
      <div className="px-6 pt-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-[11px] font-black uppercase tracking-widest">
          <MonitorPlay className="w-3.5 h-3.5" />
          Pantalla activa: {screenNombre} ({screen})
        </span>

        {((tab === 'contenido' && screen === 'terrorismo') || tab === 'traducciones') && (
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 gap-1">
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
              <span>JSON Avanzado</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="px-6 pt-3 flex items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all min-h-[40px] border ${
              tab === t.id
                ? 'bg-emerald-700 text-white border-emerald-500 shadow-lg'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Mensaje */}
      {msg && (
        <div className="mx-6 mt-3 px-4 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs font-bold animate-fade-in">
          {msg}
        </div>
      )}

      <main className="flex-1 min-h-0 overflow-y-auto p-6">
        {tab === 'contenido' && (
          <div className="h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 gap-3 flex-wrap flex-shrink-0">
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-xs text-slate-400">
                  Editando contenido de: <strong className="text-emerald-300">{screenNombre}</strong>. Los cambios guardados se reflejan inmediatamente en la pantalla y en el servidor CMS.
                </p>
                {(screens.find((s) => s.id === screen)?.recursos?.length || 0) > 1 && (
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <select
                      value={recurso}
                      onChange={(e) => setRecurso(e.target.value)}
                      className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer [&>option]:text-slate-900"
                    >
                      {screens.find((s) => s.id === screen)?.recursos?.map((r) => (
                        <option key={r.id} value={r.id}>{r.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <button
                onClick={saveContent}
                disabled={busy || !content}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 disabled:opacity-50 shadow-lg shadow-emerald-950/50 min-h-[44px]"
              >
                <Save className="w-4 h-4" />
                <span>{busy ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
              {content ? (
                screen === 'terrorismo' && editMode === 'visual' && (content as TerrorismoData)?.sendero_luminoso ? (
                  <TerrorismoVisualEditor
                    data={content as TerrorismoData}
                    onChange={(updated) => setContent(updated)}
                  />
                ) : (
                  <div className="h-full overflow-y-auto pr-1">
                    <JsonEditor value={content} onChange={setContent} />
                  </div>
                )
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
                  Cargando contenido...
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'traducciones' && (
          <div className="h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 gap-3 flex-wrap flex-shrink-0">
              <p className="text-xs text-slate-400">
                Traducciones globales (ES, EN, QU) para <strong className="text-emerald-300">{screenNombre}</strong>.
              </p>
              <button
                onClick={saveLanguages}
                disabled={busy || !langs}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 disabled:opacity-50 shadow-lg shadow-emerald-950/50 min-h-[44px]"
              >
                <Save className="w-4 h-4" />
                <span>{busy ? 'Guardando...' : 'Guardar Traducciones'}</span>
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              {langs ? (
                editMode === 'visual' ? (
                  <TranslationsVisualEditor value={langs} onChange={setLangs} />
                ) : (
                  <div className="h-full overflow-y-auto pr-1">
                    <JsonEditor value={langs} onChange={setLangs} />
                  </div>
                )
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
                  Cargando traducciones...
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'media' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="text-xs text-slate-400">
                Imágenes disponibles para <strong className="text-emerald-300">{screenNombre}</strong>. Haga clic en "Copiar ruta" para pegarla en cualquier tema u operación.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f);
                  }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={busy}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs"
                >
                  <Upload className="w-4 h-4" />
                  <span>Subir Nueva Imagen</span>
                </button>
              </div>
            </div>

            {media.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                No hay imágenes subidas en esta carpeta todavía.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {media.map((m) => (
                  <div
                    key={m.name}
                    className="bg-slate-950 rounded-2xl border border-slate-800 p-2.5 flex flex-col justify-between group hover:border-emerald-500 transition-all shadow-md"
                  >
                    <div className="w-full aspect-video bg-slate-900 rounded-xl overflow-hidden mb-2 flex items-center justify-center">
                      <img
                        src={`${CMS_URL}${m.url}`}
                        alt={m.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = m.url;
                        }}
                      />
                    </div>
                    <p className="text-[11px] font-mono text-slate-300 truncate" title={m.name}>
                      {m.name}
                    </p>
                    <span className="text-[9px] text-slate-500">{(m.size / 1024).toFixed(1)} KB</span>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900">
                      <button
                        onClick={() => copyToClipboard(m.url)}
                        className="p-1.5 text-emerald-400 hover:bg-slate-900 rounded-lg text-xs"
                        title="Copiar ruta"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMedia(m.name)}
                        className="p-1.5 text-red-400 hover:bg-slate-900 rounded-lg text-xs"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'respaldos' && (
          <div className="space-y-6 max-w-xl">
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-3 shadow-lg">
              <h4 className="text-sm font-black uppercase text-emerald-400">Exportar Respaldo</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Descargue una copia de seguridad en formato JSON de todos los datos y traducciones de la pantalla seleccionada.
              </p>
              <button
                onClick={exportBackup}
                disabled={!content}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                <span>Descargar Copia JSON</span>
              </button>
            </div>

            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-3 shadow-lg">
              <h4 className="text-sm font-black uppercase text-amber-400">Restaurar Respaldo</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cargue un archivo JSON previamente exportado para restaurar la información en el servidor.
              </p>
              <input
                type="file"
                ref={importRef}
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImport(f);
                }}
              />
              <button
                onClick={() => importRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-amber-300 font-bold text-xs flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Seleccionar Archivo JSON</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
