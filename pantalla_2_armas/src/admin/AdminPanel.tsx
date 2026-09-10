import React, { useEffect, useState, useRef } from 'react';
import { api, CMS_URL, type MediaItem, type ScreenInfo } from './api';
import { JsonEditor } from './JsonEditor';
import { ArmasCmsEditor } from './ArmasCmsEditor';
import { buildArmasFrom } from '../context/ArmasContext';
import { Save, Image as ImageIcon, Database, Upload, Copy, Trash2, RefreshCw, LogOut, ChevronLeft, MonitorPlay, Languages } from 'lucide-react';

import initialArmasData from '../data/armas_servicios.json';
import initialLanguagesData from '../data/languages.json';

type Tab = 'contenido' | 'traducciones' | 'media' | 'respaldos';

const DEFAULT_SCREENS: ScreenInfo[] = [
  { id: 'armas', nombre: 'Armas y Servicios', recursos: [{ id: 'principal', nombre: 'Contenido principal' }] },
  { id: 'timeline', nombre: 'Línea del Tiempo', recursos: [{ id: 'principal', nombre: 'Contenido principal' }] },
  { id: 'terrorismo', nombre: 'Terrorismo y Pacificación', recursos: [{ id: 'principal', nombre: 'Contenido principal' }] },
  { id: 'divisiones', nombre: 'Divisiones del Ejército', recursos: [
    { id: 'principal', nombre: 'Contenido principal' },
    { id: 'unitdb', nombre: 'Base de Unidades (unit_database.json)' }
  ]}
];

interface AdminPanelProps {
  onLogout: () => void;
  onExitAdmin: () => void;
  defaultScreenId?: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, onExitAdmin, defaultScreenId }) => {
  const [tab, setTab] = useState<Tab>('contenido');
  const [screens, setScreens] = useState<ScreenInfo[]>(DEFAULT_SCREENS);
  const [screen, setScreen] = useState<string>(defaultScreenId || 'armas');
  const [recurso, setRecurso] = useState<string>('principal');
  const [content, setContent] = useState<unknown>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cms_content_armas');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return initialArmasData;
  });
  const [langs, setLangs] = useState<unknown>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cms_langs_armas');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return initialLanguagesData;
  });
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
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
        if (screen === 'armas' && recurso === 'principal') {
          localStorage.setItem('cms_content_armas', JSON.stringify(data));
        }
      })
      .catch((e) => {
        // Fallback local storage or bundled JSON
        if (screen === 'armas' && recurso === 'principal') {
          const saved = localStorage.getItem('cms_content_armas');
          if (saved) {
            try {
              setContent(JSON.parse(saved));
              return;
            } catch {}
          }
          setContent(initialArmasData);
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
    setRecurso('principal');
    loadContent();
    loadLanguages();
    loadMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  useEffect(() => {
    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recurso]);

  const saveContent = async () => {
    setBusy(true);
    setMsg('Guardando...');
    if (content) {
      localStorage.setItem(`cms_content_${screen}_${recurso}`, JSON.stringify(content));
      if (screen === 'armas' && recurso === 'principal') {
        localStorage.setItem('cms_content_armas', JSON.stringify(content));
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
        await api.saveContent(screen, data);
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

  const screenNombre = screens.find((s) => s.id === screen)?.nombre || screen;

  return (
    <div className="h-screen overflow-hidden bg-[#030A06] text-slate-100 flex flex-col select-none">
      {/* Header admin */}
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
          {/* Selector de pantalla */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
            <MonitorPlay className="w-4 h-4 text-emerald-400" />
            <select
              value={screen}
              onChange={(e) => setScreen(e.target.value)}
              className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer [&>option]:text-slate-900"
            >
              {screens.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => { loadContent(); loadLanguages(); loadMedia(); }}
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
      <div className="px-6 pt-3">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-[11px] font-black uppercase tracking-widest">
          <MonitorPlay className="w-3.5 h-3.5" />
          Pantalla activa: {screenNombre} ({screen})
        </span>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 flex items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-all min-h-[44px] border ${
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
        <div className="mx-6 mt-4 px-4 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs font-bold">
          {msg}
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-6 overscroll-contain">
        {tab === 'contenido' && (
          <div>
            {screen === 'armas' && content !== null ? (
              <div className="space-y-4">
                <ArmasCmsEditor
                  initialArmas={buildArmasFrom(content)}
                  onSaveAll={async (newArmasList) => {
                    setBusy(true);
                    setMsg('Guardando cambios...');
                    const payload = {
                      armas: newArmasList.filter((i) => i.tipo === 'ARMA'),
                      servicios: newArmasList.filter((i) => i.tipo === 'SERVICIO'),
                    };
                    setContent(payload);
                    localStorage.setItem('cms_content_armas', JSON.stringify(payload));
                    try {
                      await api.saveContent(screen, payload, recurso);
                      setMsg('✔ Contenido guardado y sincronizado con servidor CMS');
                    } catch {
                      setMsg('✔ Contenido guardado localmente en la aplicación (Modo autónomo)');
                    } finally {
                      setBusy(false);
                    }
                  }}
                />
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-xs text-slate-400">
                      Editando: <strong className="text-emerald-300">{screenNombre}</strong>. Edite cualquier campo (textos e imágenes). Al guardar, se aplica al servidor y la pantalla lo refleja al recargar.
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
                    disabled={busy}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-green-900 to-emerald-700 text-white font-black text-xs uppercase tracking-wider disabled:opacity-50 min-h-[48px] shadow-xl"
                  >
                    <Save className="w-4 h-4" />
                    {busy ? 'Guardando...' : 'Guardar Contenido'}
                  </button>
                </div>
                {content === null ? (
                  <p className="text-slate-500 text-sm py-10 text-center">Cargando contenido...</p>
                ) : (
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
                    <JsonEditor value={content} onChange={setContent} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'traducciones' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-slate-400">
                Traducciones de interfaz de <strong className="text-emerald-300">{screenNombre}</strong> (Español, Inglés, Quechua). Edite las claves en cada idioma (es / en / qu) y guarde.
              </p>
              <button
                onClick={saveLanguages}
                disabled={busy}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-green-900 to-emerald-700 text-white font-black text-xs uppercase tracking-wider disabled:opacity-50 min-h-[48px] shadow-xl"
              >
                <Save className="w-4 h-4" />
                {busy ? 'Guardando...' : 'Guardar Traducciones'}
              </button>
            </div>
            {langs === null ? (
              <p className="text-slate-500 text-sm py-10 text-center">Cargando traducciones...</p>
            ) : (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
                <JsonEditor value={langs} onChange={setLangs} />
              </div>
            )}
          </div>
        )}

        {tab === 'media' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-slate-400">
                Imágenes de <strong className="text-emerald-300">{screenNombre}</strong>. Suba imágenes; copie su URL y péguela en el campo de imagen correspondiente.
              </p>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-green-900 to-emerald-700 text-white font-black text-xs uppercase tracking-wider disabled:opacity-50 min-h-[48px] shadow-xl"
              >
                <Upload className="w-4 h-4" />
                Subir Imagen
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {media.map((m) => (
                <div key={m.name} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 shadow-xl">
                  <img src={`${CMS_URL}${m.url}`} alt={m.name} className="w-full h-24 object-cover rounded-xl border border-slate-800 bg-black" />
                  <div className="mt-2 text-[10px] font-mono text-slate-400 truncate" title={m.name}>
                    {m.name}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <button
                      onClick={() => { navigator.clipboard?.writeText(`${m.url}`); setMsg(`URL copiada: ${m.url}`); }}
                      className="flex-1 px-2 py-1 rounded-lg bg-slate-800 text-slate-200 text-[10px] font-black hover:bg-slate-700"
                      title="Copiar URL"
                    >
                      <Copy className="w-3.5 h-3.5 mx-auto" />
                    </button>
                    <button
                      onClick={() => handleDeleteMedia(m.name)}
                      className="flex-1 px-2 py-1 rounded-lg bg-red-900/60 text-red-200 text-[10px] font-black hover:bg-red-800"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5 mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
              {media.length === 0 && (
                <p className="text-slate-500 text-sm col-span-full text-center py-10">No hay imágenes subidas todavía.</p>
              )}
            </div>
          </div>
        )}

        {tab === 'respaldos' && (
          <div className="max-w-2xl">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div>
                <h3 className="text-sm font-black text-white mb-1">Exportar respaldo ({screenNombre})</h3>
                <p className="text-xs text-slate-400 mb-3">Descargue el JSON completo del contenido actual.</p>
                <button
                  onClick={exportBackup}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-black hover:bg-slate-700 min-h-[44px]"
                >
                  <Save className="w-4 h-4" />
                  Descargar JSON
                </button>
              </div>
              <div className="border-t border-slate-800 pt-4">
                <h3 className="text-sm font-black text-white mb-1">Importar respaldo ({screenNombre})</h3>
                <p className="text-xs text-slate-400 mb-3">Suba un JSON de respaldo. Reemplaza y guarda el contenido.</p>
                <button
                  onClick={() => importRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-black hover:bg-slate-700 min-h-[44px]"
                >
                  <Upload className="w-4 h-4" />
                  Importar JSON
                </button>
                <input
                  ref={importRef}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
