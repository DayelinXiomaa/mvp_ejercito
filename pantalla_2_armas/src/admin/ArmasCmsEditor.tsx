import React, { useState, useEffect, useRef } from 'react';
import type {
  ArmaServicio,
  PersonajeHistorico,
  ElementoSimbologia,
} from '../context/ArmasContext';
import { api, type MediaItem } from './api';
import {
  Shield,
  Star,
  Award,
  Flag,
  User,
  Plus,
  Trash2,
  Save,
  Eye,
  ArrowUp,
  ArrowDown,
  Check,
  Search,
  Upload,
  Image as ImageIcon,
  Layers,
  Sparkles,
  Palette,
  BookOpen,
  X,
  FileText,
  Languages,
} from 'lucide-react';

interface ArmasCmsEditorProps {
  initialArmas: ArmaServicio[];
  onSaveAll: (armas: ArmaServicio[]) => Promise<void>;
  onExit?: () => void;
}

type EditorTab =
  | 'general'
  | 'identidad'
  | 'mision'
  | 'patrono'
  | 'heroes'
  | 'secciones'
  | 'traducciones';

export const ArmasCmsEditor: React.FC<ArmasCmsEditorProps> = ({
  initialArmas,
  onSaveAll,
}) => {
  const [armas, setArmas] = useState<ArmaServicio[]>(initialArmas);
  const [selectedId, setSelectedId] = useState<string>(
    initialArmas[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<EditorTab>('general');
  const [filterType, setFilterType] = useState<'TODOS' | 'ARMA' | 'SERVICIO'>('TODOS');
  const [search, setSearch] = useState('');
  const [searchPersonaje, setSearchPersonaje] = useState('');
  const [filterConflicto, setFilterConflicto] = useState('TODOS');
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [mediaModalTarget, setMediaModalTarget] = useState<{
    path: string;
    onSelect: (url: string) => void;
  } | null>(null);

  // Personaje Modal state
  const [editingPersonaje, setEditingPersonaje] = useState<PersonajeHistorico | null>(null);
  const [isNewPersonaje, setIsNewPersonaje] = useState(false);

  // Elemento Escudo Modal state
  const [editingElemento, setEditingElemento] = useState<ElementoSimbologia | null>(null);
  const [isNewElemento, setIsNewElemento] = useState(false);

  // Feedback messages
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [previewModal, setPreviewModal] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileUploadRef = useRef<HTMLInputElement>(null);

  // Load media library on mount
  useEffect(() => {
    api
      .listMedia('armas')
      .then(setMediaList)
      .catch(() => {});
  }, []);

  const currentItem = armas.find((a) => a.id === selectedId) || armas[0];

  const showNotification = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUpdateCurrent = (updates: Partial<ArmaServicio>) => {
    if (!currentItem) return;
    const updated: ArmaServicio = {
      ...currentItem,
      ...updates,
      // Auto synchronize language.es with base fields
      language: {
        ...currentItem.language,
        es: {
          ...currentItem.language?.es,
          nombre: updates.nombre !== undefined ? updates.nombre : currentItem.language?.es?.nombre || '',
          lema: updates.lema !== undefined ? updates.lema : currentItem.language?.es?.lema || '',
          mision: updates.misionEmpleo?.mision !== undefined ? updates.misionEmpleo.mision : currentItem.language?.es?.mision || '',
          empleo: updates.misionEmpleo?.empleo !== undefined ? updates.misionEmpleo.empleo : currentItem.language?.es?.empleo || '',
          origen: updates.origenHistorico?.texto !== undefined ? updates.origenHistorico.texto : currentItem.language?.es?.origen || '',
          patronoResena: updates.patrono?.biografia !== undefined ? updates.patrono.biografia : currentItem.language?.es?.patronoResena || '',
          escudoResena: updates.escudo?.descripcion !== undefined ? updates.escudo.descripcion : currentItem.language?.es?.escudoResena || '',
          vivo: updates.colorNombre !== undefined ? updates.colorNombre : currentItem.language?.es?.vivo || '',
        },
      },
    };
    setArmas((prev) => prev.map((item) => (item.id === currentItem.id ? updated : item)));
  };

  const handleCreateNew = (tipo: 'ARMA' | 'SERVICIO') => {
    const nextNum = armas.length + 1;
    const newId = `${tipo.toLowerCase()}_nueva_${Date.now()}`;
    const newItem: ArmaServicio = {
      id: newId,
      slug: newId,
      nombre: `Nueva ${tipo === 'ARMA' ? 'Arma' : 'Servicio'} ${nextNum}`,
      nombreCorto: `Nueva ${nextNum}`,
      tipo: tipo,
      descripcionBreve: '',
      estado: 'BORRADOR',
      orden: nextNum,
      lema: '',
      colorHex: tipo === 'ARMA' ? '#00A8E8' : '#FFA500',
      colorNombre: tipo === 'ARMA' ? 'Celeste' : 'Naranja',
      colorDescripcion: '',
      imagenPrincipal: '',
      imagenPortada: '',
      secciones: [
        { id: 'identidad', label: 'Identidad y Lema', activa: true, orden: 1 },
        { id: 'mision_empleo', label: 'Misión y Empleo / Función', activa: true, orden: 2 },
        { id: 'patrono_historia', label: 'Patrono y Origen Histórico', activa: true, orden: 3 },
        { id: 'escudo_simbologia', label: 'Escudo y Simbología', activa: true, orden: 4 },
        { id: 'heroes_fallecidos', label: 'Héroes y Fallecidos en Acción', activa: true, orden: 5 },
      ],
      escudo: {
        imagen: '',
        titulo: '',
        descripcion: '',
        significado: '',
        elementos: [],
      },
      misionEmpleo: {
        mision: '',
        empleo: '',
        imagen: '',
        capacidades: [],
      },
      patrono: {
        nombre: '',
        cargo: `Patrono del ${tipo === 'ARMA' ? 'Arma' : 'Servicio'}`,
        fotografia: '',
        biografia: '',
      },
      origenHistorico: {
        titulo: 'Origen Histórico',
        texto: '',
        fuente: 'Ejército del Perú',
      },
      personajes: [],
      galeria: [],
      ppt: [],
      language: {
        es: {
          nombre: `Nueva ${tipo === 'ARMA' ? 'Arma' : 'Servicio'}`,
          lema: '',
          mision: '',
          empleo: '',
          origen: '',
          patronoResena: '',
          escudoResena: '',
          motivo: '',
          vivo: '',
        },
        en: {
          nombre: '',
          lema: '',
          mision: '',
          empleo: '',
          origen: '',
          patronoResena: '',
          escudoResena: '',
          motivo: '',
          vivo: '',
        },
        qu: {
          nombre: '',
          lema: '',
          mision: '',
          empleo: '',
          origen: '',
          patronoResena: '',
          escudoResena: '',
          motivo: '',
          vivo: '',
        },
      },
    };

    setArmas((prev) => [...prev, newItem]);
    setSelectedId(newId);
    showNotification(`Nueva ${tipo === 'ARMA' ? 'Arma' : 'Servicio'} creada en borrador.`);
  };

  const handleDeleteCurrent = () => {
    if (!currentItem) return;
    if (confirm(`¿Estás seguro de eliminar "${currentItem.nombre}"? Esta acción no se puede deshacer.`)) {
      const filtered = armas.filter((a) => a.id !== currentItem.id);
      setArmas(filtered);
      setSelectedId(filtered[0]?.id || '');
      showNotification(`"${currentItem.nombre}" ha sido eliminada.`);
    }
  };

  // Reorder Sections
  const handleMoveSection = (secId: string, direction: 'up' | 'down') => {
    if (!currentItem) return;
    const list = [...currentItem.secciones].sort((a, b) => a.orden - b.orden);
    const idx = list.findIndex((s) => s.id === secId);
    if (idx === -1) return;
    if (direction === 'up' && idx > 0) {
      const temp = list[idx].orden;
      list[idx].orden = list[idx - 1].orden;
      list[idx - 1].orden = temp;
    } else if (direction === 'down' && idx < list.length - 1) {
      const temp = list[idx].orden;
      list[idx].orden = list[idx + 1].orden;
      list[idx + 1].orden = temp;
    }
    handleUpdateCurrent({ secciones: list.sort((a, b) => a.orden - b.orden) });
  };

  const handleToggleSectionActive = (secId: string) => {
    if (!currentItem) return;
    const updated = currentItem.secciones.map((s) =>
      s.id === secId ? { ...s, activa: !s.activa } : s
    );
    handleUpdateCurrent({ secciones: updated });
  };

  // Upload image handler
  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await api.uploadMedia('armas', file.name, base64);
        setMediaList((prev) => [
          { name: file.name, url: res.url, screen: 'armas', size: file.size || 0, ext: file.name.split('.').pop() || '' },
          ...prev,
        ]);
        if (mediaModalTarget) {
          mediaModalTarget.onSelect(res.url);
          setMediaModalTarget(null);
        }
        showNotification(`Imagen "${file.name}" subida con éxito.`);
      };
      reader.readAsDataURL(file);
    } catch {
      showNotification('Error al subir la imagen.', 'error');
    }
  };

  // Validation
  const validateCurrent = (): string[] => {
    const errors: string[] = [];
    if (!currentItem.nombre.trim()) errors.push('El nombre es obligatorio.');
    if (!currentItem.tipo) errors.push('El tipo (Arma o Servicio) es obligatorio.');
    if (!currentItem.colorHex.trim()) errors.push('El código de color es obligatorio.');
    return errors;
  };

  const handleSaveDraft = async () => {
    const errors = validateCurrent();
    if (errors.length > 0) {
      showNotification(errors.join(' '), 'error');
      return;
    }
    setIsSaving(true);
    handleUpdateCurrent({ estado: 'BORRADOR' });
    try {
      await onSaveAll(armas);
      showNotification('Borrador guardado exitosamente.');
    } catch {
      showNotification('Error al guardar el borrador.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    const errors = validateCurrent();
    if (errors.length > 0) {
      showNotification(errors.join(' '), 'error');
      return;
    }
    setIsSaving(true);
    const updated = { ...currentItem, estado: 'PUBLICADO' as const };
    const newArmasList = armas.map((a) => (a.id === updated.id ? updated : a));
    setArmas(newArmasList);
    try {
      await onSaveAll(newArmasList);
      showNotification(`"${currentItem.nombre}" ha sido publicado correctamente en el kiosco.`);
    } catch {
      showNotification('Error al publicar el contenido.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered sidebar list
  const filteredList = armas.filter((a) => {
    const matchType = filterType === 'TODOS' || a.tipo === filterType;
    const matchSearch =
      !search ||
      a.nombre.toLowerCase().includes(search.toLowerCase()) ||
      a.nombreCorto.toLowerCase().includes(search.toLowerCase()) ||
      a.lema.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="flex h-[calc(100vh-80px)] bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-black border transition-all animate-bounce ${
            notification.type === 'error'
              ? 'bg-red-950 text-red-200 border-red-500/50'
              : notification.type === 'info'
              ? 'bg-blue-950 text-blue-200 border-blue-500/50'
              : 'bg-emerald-950 text-emerald-200 border-emerald-500/50'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>{notification.text}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* SIDEBAR: ARBOL DE ARMAS Y SERVICIOS                          */}
      {/* ============================================================ */}
      <aside className="w-80 bg-slate-900/95 border-r border-slate-800 flex flex-col flex-shrink-0">
        {/* Header Sidebar */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Armas y Servicios
            </h2>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full font-bold text-slate-400">
              {armas.length} registros
            </span>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800/80">
            {(['TODOS', 'ARMA', 'SERVICIO'] as const).map((ft) => (
              <button
                key={ft}
                onClick={() => setFilterType(ft)}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  filterType === ft
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {ft === 'TODOS' ? 'Todos' : ft === 'ARMA' ? 'Armas' : 'Servicios'}
              </button>
            ))}
          </div>
        </div>

        {/* List of Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 kiosk-scroll">
          {filteredList.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`w-full p-3 rounded-2xl text-left transition-all flex items-center gap-3 border ${
                selectedId === item.id
                  ? 'bg-emerald-950/60 border-emerald-500/60 shadow-lg text-white scale-[1.01]'
                  : 'bg-slate-950/60 border-slate-800/60 text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div
                className="w-9 h-9 rounded-xl border-2 flex items-center justify-center flex-shrink-0 shadow overflow-hidden"
                style={{
                  backgroundColor: item.colorHex || '#10b981',
                  borderColor: item.colorHex || '#10b981',
                }}
              >
                {item.escudo?.imagen || item.imagenPrincipal ? (
                  <img
                    src={item.escudo?.imagen || item.imagenPrincipal}
                    alt=""
                    className="w-full h-full object-contain p-0.5 bg-slate-950/60"
                  />
                ) : (
                  <Shield className="w-5 h-5 text-white" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-black truncate">{item.nombre}</span>
                  <span
                    className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                      item.estado === 'PUBLICADO'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {item.estado === 'PUBLICADO' ? 'Pub' : 'Borr'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                  <span className="truncate">{item.tipo}</span>
                  {item.lema && <span className="italic truncate max-w-[110px]">“{item.lema}”</span>}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Create Buttons */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex gap-2">
          <button
            onClick={() => handleCreateNew('ARMA')}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-900 border border-emerald-500/30 hover:border-emerald-400 text-emerald-300 hover:text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> + Arma
          </button>
          <button
            onClick={() => handleCreateNew('SERVICIO')}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-900 border border-orange-500/30 hover:border-orange-400 text-orange-300 hover:text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> + Servicio
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MAIN EDITOR: FORMULARIO MODULAR POR PESTAÑAS                 */}
      {/* ============================================================ */}
      {currentItem ? (
        <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-hidden">
          {/* Top Bar Actions */}
          <header className="p-4 border-b border-slate-800 bg-slate-900/60 backdrop-blur flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 shadow"
                style={{
                  backgroundColor: currentItem.colorHex,
                  borderColor: currentItem.colorHex,
                }}
              >
                {currentItem.escudo?.imagen ? (
                  <img
                    src={currentItem.escudo.imagen}
                    alt=""
                    className="w-full h-full object-contain p-1 bg-slate-950/80 rounded-xl"
                  />
                ) : (
                  <Shield className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  {currentItem.tipo} • ID: {currentItem.id}
                </span>
                <h1 className="text-xl font-black text-white truncate leading-tight">
                  {currentItem.nombre}
                </h1>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-slate-500 text-xs font-black flex items-center gap-1.5 transition-all"
              >
                <Eye className="w-4 h-4 text-emerald-400" /> Previsualizar
              </button>
              <button
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-black flex items-center gap-1.5 transition-all"
              >
                <Save className="w-4 h-4" /> Guardar Borrador
              </button>
              <button
                onClick={handlePublish}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:brightness-110 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" /> Publicar en Kiosco
              </button>
              <button
                onClick={handleDeleteCurrent}
                className="p-2 rounded-xl bg-slate-900/80 border border-red-500/20 text-red-400 hover:bg-red-950/40 hover:border-red-500 transition-all ml-2"
                title="Eliminar este registro"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-6 pt-3 bg-slate-950 border-b border-slate-800 overflow-x-auto no-scrollbar flex-shrink-0">
            {[
              { id: 'general', label: '1. Datos Generales', icon: FileText },
              { id: 'identidad', label: '2. Identidad & Escudo', icon: Shield },
              { id: 'mision', label: '3. Misión & Empleo', icon: Flag },
              { id: 'patrono', label: '4. Patrono & Origen', icon: Award },
              { id: 'heroes', label: `5. Héroes (${currentItem.personajes.length})`, icon: User },
              { id: 'secciones', label: '6. Orden de Secciones', icon: Layers },
              { id: 'traducciones', label: '7. Idiomas (i18n)', icon: Languages },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as EditorTab)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-black transition-all border-t-2 border-x ${
                    activeTab === t.id
                      ? 'bg-slate-900 border-emerald-500 text-white border-b-transparent -mb-[1px]'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 p-6 overflow-y-auto kiosk-scroll space-y-6 bg-slate-950">
            {/* ============================================================ */}
            {/* TAB 1: DATOS GENERALES                                       */}
            {/* ============================================================ */}
            {activeTab === 'general' && (
              <div className="max-w-4xl space-y-6 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={currentItem.nombre}
                      onChange={(e) => handleUpdateCurrent({ nombre: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      Nombre Corto / Título
                    </label>
                    <input
                      type="text"
                      value={currentItem.nombreCorto}
                      onChange={(e) => handleUpdateCurrent({ nombreCorto: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      Tipo *
                    </label>
                    <select
                      value={currentItem.tipo}
                      onChange={(e) =>
                        handleUpdateCurrent({ tipo: e.target.value as 'ARMA' | 'SERVICIO' })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="ARMA">Arma</option>
                      <option value="SERVICIO">Servicio</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      Estado de Publicación
                    </label>
                    <select
                      value={currentItem.estado}
                      onChange={(e) =>
                        handleUpdateCurrent({
                          estado: e.target.value as 'PUBLICADO' | 'BORRADOR' | 'OCULTO',
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="PUBLICADO">Publicado</option>
                      <option value="BORRADOR">Borrador</option>
                      <option value="OCULTO">Oculto</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      Orden de Aparición
                    </label>
                    <input
                      type="number"
                      value={currentItem.orden}
                      onChange={(e) => handleUpdateCurrent({ orden: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* LEMA ÚNICO (Regla 21.3) */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border-2 border-emerald-500/40 space-y-2">
                  <label className="text-xs font-black text-emerald-300 uppercase tracking-widest flex items-center gap-2">
                    <Star className="w-4 h-4 text-emerald-400" /> Lema Institucional (Campo Único)
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Este es el único campo del lema. El frontend lo renderizará en todos los lugares correspondientes sin duplicaciones.
                  </p>
                  <input
                    type="text"
                    placeholder="Ej: Paso de Vencedores"
                    value={currentItem.lema}
                    onChange={(e) => handleUpdateCurrent({ lema: e.target.value })}
                    className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl px-4 py-3 text-base font-black text-emerald-200 placeholder-slate-600 focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                {/* COLOR DISTINTIVO (Regla 21.5) */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Palette className="w-4 h-4 text-emerald-400" /> Color Institucional del Arma / Servicio
                  </h3>
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Nombre del Color / Vivo</label>
                      <input
                        type="text"
                        placeholder="Ej: Celeste, Granate, Rojo"
                        value={currentItem.colorNombre}
                        onChange={(e) => handleUpdateCurrent({ colorNombre: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Código Hexadecimal</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={currentItem.colorHex}
                          onChange={(e) => handleUpdateCurrent({ colorHex: e.target.value })}
                          className="w-10 h-9 rounded-xl bg-transparent cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={currentItem.colorHex}
                          onChange={(e) => handleUpdateCurrent({ colorHex: e.target.value })}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Muestra Visual</label>
                      <div
                        className="h-9 rounded-xl border border-white/20 shadow-inner flex items-center justify-center text-xs font-black text-white drop-shadow"
                        style={{ backgroundColor: currentItem.colorHex }}
                      >
                        {currentItem.colorNombre || currentItem.colorHex}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Descripción breve */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Descripción Breve / Resumen Kiosco
                  </label>
                  <textarea
                    rows={3}
                    value={currentItem.descripcionBreve}
                    onChange={(e) => handleUpdateCurrent({ descripcionBreve: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 2: IDENTIDAD & ESCUDO (Regla 21.4)                       */}
            {/* ============================================================ */}
            {activeTab === 'identidad' && (
              <div className="max-w-4xl space-y-6 animate-fade-in">
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Escudo Institucional
                  </h3>

                  <div className="flex gap-6 items-start">
                    {/* Image Preview */}
                    <div className="w-40 h-40 rounded-2xl bg-slate-950 border-2 border-emerald-500/40 p-2 flex items-center justify-center flex-shrink-0 relative group">
                      {currentItem.escudo.imagen ? (
                        <img
                          src={currentItem.escudo.imagen}
                          alt="Escudo"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Shield className="w-16 h-16 text-slate-600" />
                      )}
                      <button
                        onClick={() =>
                          setMediaModalTarget({
                            path: 'escudo.imagen',
                            onSelect: (url) =>
                              handleUpdateCurrent({
                                escudo: { ...currentItem.escudo, imagen: url },
                                imagenPrincipal: url,
                              }),
                          })
                        }
                        className="absolute inset-0 bg-slate-950/80 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity text-emerald-300 text-xs font-bold"
                      >
                        <ImageIcon className="w-5 h-5" />
                        <span>Cambiar Imagen</span>
                      </button>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">
                          Título del Escudo
                        </label>
                        <input
                          type="text"
                          value={currentItem.escudo.titulo}
                          onChange={(e) =>
                            handleUpdateCurrent({
                              escudo: { ...currentItem.escudo, titulo: e.target.value },
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">
                          Descripción y Simbología del Escudo
                        </label>
                        <textarea
                          rows={4}
                          value={currentItem.escudo.descripcion}
                          onChange={(e) =>
                            handleUpdateCurrent({
                              escudo: {
                                ...currentItem.escudo,
                                descripcion: e.target.value,
                                significado: e.target.value,
                              },
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Elementos Simbólicos del Escudo (Multi-registro) */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black text-white uppercase tracking-widest">
                        Elementos Simbólicos del Escudo ({currentItem.escudo.elementos?.length || 0})
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Define los componentes del escudo para hacer la interacción interactiva.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingElemento({
                          id: `elem-${Date.now()}`,
                          nombre: '',
                          descripcion: '',
                          orden: (currentItem.escudo.elementos?.length || 0) + 1,
                        });
                        setIsNewElemento(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-slate-950 font-black text-xs flex items-center gap-1 hover:brightness-110"
                    >
                      <Plus className="w-3.5 h-3.5" /> + Elemento
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {currentItem.escudo.elementos?.map((el, i) => (
                      <div
                        key={el.id || i}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-black text-emerald-300 truncate">{el.nombre}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{el.descripcion}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => {
                              setEditingElemento(el);
                              setIsNewElemento(false);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                            title="Editar"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              const filtered = currentItem.escudo.elementos.filter((x) => x.id !== el.id);
                              handleUpdateCurrent({
                                escudo: { ...currentItem.escudo, elementos: filtered },
                              });
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 text-red-400 hover:bg-red-950"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 3: MISIÓN & EMPLEO OPERATIVO (Regla 21.6)                */}
            {/* ============================================================ */}
            {activeTab === 'mision' && (
              <div className="max-w-4xl space-y-6 animate-fade-in">
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <Flag className="w-4 h-4" /> Misión
                  </h3>
                  <textarea
                    rows={4}
                    placeholder="Describe la misión del arma o servicio..."
                    value={currentItem.misionEmpleo.mision}
                    onChange={(e) =>
                      handleUpdateCurrent({
                        misionEmpleo: { ...currentItem.misionEmpleo, mision: e.target.value },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Empleo Táctico / Funciones
                  </h3>
                  <textarea
                    rows={4}
                    placeholder="Describe las formas de empleo, funciones y operaciones..."
                    value={currentItem.misionEmpleo.empleo}
                    onChange={(e) =>
                      handleUpdateCurrent({
                        misionEmpleo: { ...currentItem.misionEmpleo, empleo: e.target.value },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-400" /> Fotografía Operacional de Empleo
                  </h3>

                  <div className="flex gap-6 items-start">
                    <div className="w-56 h-36 rounded-2xl bg-slate-950 border-2 border-emerald-500/40 overflow-hidden flex-shrink-0 relative group">
                      {currentItem.misionEmpleo.imagen ? (
                        <img
                          src={currentItem.misionEmpleo.imagen}
                          alt="Empleo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <ImageIcon className="w-10 h-10" />
                        </div>
                      )}
                      <button
                        onClick={() =>
                          setMediaModalTarget({
                            path: 'misionEmpleo.imagen',
                            onSelect: (url) =>
                              handleUpdateCurrent({
                                misionEmpleo: { ...currentItem.misionEmpleo, imagen: url },
                              }),
                          })
                        }
                        className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity text-emerald-300 text-xs font-bold"
                      >
                        <ImageIcon className="w-5 h-5" />
                        <span>Seleccionar Foto</span>
                      </button>
                    </div>

                    <div className="flex-1 space-y-2">
                      <label className="text-xs font-bold text-slate-300 block">
                        Descripción o Pie de Foto
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Despliegue de unidades en operaciones de combate"
                        value={currentItem.misionEmpleo.descripcionImagen || ''}
                        onChange={(e) =>
                          handleUpdateCurrent({
                            misionEmpleo: {
                              ...currentItem.misionEmpleo,
                              descripcionImagen: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 4: PATRONO & ORIGEN HISTÓRICO (Regla 21.7 & 21.8)        */}
            {/* ============================================================ */}
            {activeTab === 'patrono' && (
              <div className="max-w-4xl space-y-6 animate-fade-in">
                {/* Patrono */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <Award className="w-4 h-4" /> Patrono / Referente Institucional
                  </h3>

                  <div className="flex gap-6 items-start">
                    {/* Retrato */}
                    <div className="w-36 h-36 rounded-full bg-slate-950 border-4 border-emerald-400/60 overflow-hidden flex-shrink-0 relative group mx-auto">
                      {currentItem.patrono.fotografia ? (
                        <img
                          src={currentItem.patrono.fotografia}
                          alt="Patrono"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <User className="w-12 h-12" />
                        </div>
                      )}
                      <button
                        onClick={() =>
                          setMediaModalTarget({
                            path: 'patrono.fotografia',
                            onSelect: (url) =>
                              handleUpdateCurrent({
                                patrono: { ...currentItem.patrono, fotografia: url },
                              }),
                          })
                        }
                        className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity text-emerald-300 text-xs font-bold"
                      >
                        <ImageIcon className="w-5 h-5" />
                        <span>Cambiar Foto</span>
                      </button>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-300 block mb-1">
                            Nombre del Patrono
                          </label>
                          <input
                            type="text"
                            value={currentItem.patrono.nombre}
                            onChange={(e) =>
                              handleUpdateCurrent({
                                patrono: { ...currentItem.patrono, nombre: e.target.value },
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-300 block mb-1">
                            Cargo / Denominación
                          </label>
                          <input
                            type="text"
                            value={currentItem.patrono.cargo}
                            onChange={(e) =>
                              handleUpdateCurrent({
                                patrono: { ...currentItem.patrono, cargo: e.target.value },
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">
                          Biografía / Reseña del Patrono
                        </label>
                        <textarea
                          rows={3}
                          value={currentItem.patrono.biografia}
                          onChange={(e) =>
                            handleUpdateCurrent({
                              patrono: { ...currentItem.patrono, biografia: e.target.value },
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Origen Histórico */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Origen Histórico
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Título de la Sección
                      </label>
                      <input
                        type="text"
                        value={currentItem.origenHistorico.titulo}
                        onChange={(e) =>
                          handleUpdateCurrent({
                            origenHistorico: {
                              ...currentItem.origenHistorico,
                              titulo: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Fecha de Origen / Aniversario
                      </label>
                      <input
                        type="text"
                        value={currentItem.origenHistorico.fecha || ''}
                        onChange={(e) =>
                          handleUpdateCurrent({
                            origenHistorico: {
                              ...currentItem.origenHistorico,
                              fecha: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Texto Histórico Detallado
                    </label>
                    <textarea
                      rows={5}
                      value={currentItem.origenHistorico.texto}
                      onChange={(e) =>
                        handleUpdateCurrent({
                          origenHistorico: {
                            ...currentItem.origenHistorico,
                            texto: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 5: HÉROES Y FALLECIDOS EN ACCIÓN (Regla 21.9)            */}
            {/* ============================================================ */}
            {activeTab === 'heroes' && (() => {
              const allPersonajes = currentItem.personajes || [];
              const q = searchPersonaje.toLowerCase().trim();

              const filtered = allPersonajes.filter((p) => {
                const matchesConflicto =
                  filterConflicto === 'TODOS' ||
                  (p.hechoHistorico && p.hechoHistorico.toLowerCase().includes(filterConflicto.toLowerCase()));
                const matchesSearch =
                  !q ||
                  p.nombre.toLowerCase().includes(q) ||
                  (p.rango && p.rango.toLowerCase().includes(q)) ||
                  (p.fecha && p.fecha.toLowerCase().includes(q)) ||
                  (p.resena && p.resena.toLowerCase().includes(q)) ||
                  (p.hechoHistorico && p.hechoHistorico.toLowerCase().includes(q));
                return matchesConflicto && matchesSearch;
              });

              return (
                <div className="max-w-5xl space-y-5 animate-fade-in">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                    <div>
                      <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                        <User className="w-4 h-4" /> Héroes y Fallecidos en Armas ({allPersonajes.length})
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Búsqueda instantánea y administración de registros de inmolación.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingPersonaje({
                          id: `per-${Date.now()}`,
                          nombre: '',
                          tipo: 'HEROE',
                          rango: '',
                          fecha: '',
                          fotografia: '',
                          resena: '',
                          hechoHistorico: '',
                          orden: (currentItem.personajes?.length || 0) + 1,
                          publicado: true,
                        });
                        setIsNewPersonaje(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-slate-950 font-black text-xs flex items-center gap-1.5 hover:brightness-110 shadow-lg"
                    >
                      <Plus className="w-4 h-4" /> + Agregar Persona
                    </button>
                  </div>

                  {/* Barra de Búsqueda y Filtros de Conflicto */}
                  <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Buscar por nombre, grado/rango, conflicto, año o reseña..."
                        value={searchPersonaje}
                        onChange={(e) => setSearchPersonaje(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 shadow-inner"
                      />
                      {searchPersonaje && (
                        <button
                          onClick={() => setSearchPersonaje('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                      {[
                        { id: 'TODOS', label: 'Todos los Conflictos' },
                        { id: 'Terrorismo', label: 'Lucha Contra el Terrorismo' },
                        { id: 'Cenepa', label: 'Cenepa (1995)' },
                        { id: '1981', label: 'Cordillera del Cóndor (1981)' },
                        { id: '1941', label: 'Campaña 1941' },
                        { id: 'Pacífico', label: 'Guerra del Pacífico' },
                      ].map((cat) => {
                        const active = filterConflicto === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setFilterConflicto(cat.id)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase whitespace-nowrap transition-all ${
                              active
                                ? 'bg-emerald-600 text-slate-950 shadow'
                                : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span>
                        Mostrando <strong>{filtered.length}</strong> de {allPersonajes.length} personajes
                      </span>
                    </div>
                  </div>

                  {filtered.length === 0 ? (
                    <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                      No se encontraron personajes con los filtros actuales.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {filtered.map((p, i) => (
                        <div
                          key={p.id || i}
                          className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex gap-3.5 items-start hover:border-emerald-500/40 transition-all shadow-md group"
                        >
                          <div className="w-14 h-14 rounded-xl bg-slate-950 border border-emerald-500/40 overflow-hidden flex-shrink-0">
                            {p.fotografia ? (
                              <img src={p.fotografia} alt={p.nombre} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-600">
                                <User className="w-6 h-6" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                  p.tipo === 'HEROE'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-red-500/20 text-red-300 border border-red-500/40'
                                }`}
                              >
                                {p.tipo === 'HEROE' ? 'Héroe' : 'Caído en Armas'}
                              </span>
                              {p.rango && <span className="text-[10px] text-emerald-400 font-bold truncate">{p.rango}</span>}
                            </div>
                            <h4 className="text-xs font-black text-white mt-0.5 truncate">{p.nombre}</h4>
                            {p.hechoHistorico && (
                              <div className="text-[9px] text-slate-400 font-semibold truncate mt-0.5">
                                ⚔️ {p.hechoHistorico}
                              </div>
                            )}
                            <p className="text-[10px] text-slate-300 line-clamp-2 mt-1 leading-snug">{p.resena}</p>

                            <div className="flex items-center justify-end gap-2 mt-2 pt-1.5 border-t border-slate-800/80">
                              <button
                                onClick={() => {
                                  setEditingPersonaje(p);
                                  setIsNewPersonaje(false);
                                }}
                                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700"
                              >
                                Editar Ficha
                              </button>
                              <button
                                onClick={() => {
                                  const remaining = currentItem.personajes.filter((x) => x.id !== p.id);
                                  handleUpdateCurrent({ personajes: remaining });
                                }}
                                className="text-[11px] font-bold text-red-400 hover:text-red-300 px-2 py-0.5 rounded bg-slate-800 hover:bg-red-950/40"
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ============================================================ */}
            {/* TAB 6: ORDEN & VISIBILIDAD DE SECCIONES (Regla 21.10 & 21.11)*/}
            {/* ============================================================ */}
            {activeTab === 'secciones' && (
              <div className="max-w-3xl space-y-6 animate-fade-in">
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Configuración y Orden de Secciones
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Reordena los bloques con las flechas y utiliza el switch para mostrar u ocultar secciones en la pantalla de detalle. Las secciones desactivadas no se renderizarán en el kiosco.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {currentItem.secciones
                    ?.slice()
                    .sort((a, b) => a.orden - b.orden)
                    .map((sec, idx) => (
                      <div
                        key={sec.id}
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                          sec.activa
                            ? 'bg-slate-900 border-slate-700 text-white shadow-md'
                            : 'bg-slate-950 border-slate-800/60 text-slate-500 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center text-xs font-black text-emerald-400">
                            {idx + 1}
                          </span>
                          <div>
                            <h4 className="text-sm font-black">{sec.label}</h4>
                            <span className="text-[10px] text-slate-400 uppercase font-mono">
                              ID: {sec.id}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Toggle Active */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={sec.activa}
                              onChange={() => handleToggleSectionActive(sec.id)}
                              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                            />
                            <span className="text-xs font-bold">
                              {sec.activa ? 'Visible' : 'Oculta'}
                            </span>
                          </label>

                          {/* Reorder Buttons */}
                          <div className="flex items-center gap-1 border-l border-slate-800 pl-3">
                            <button
                              onClick={() => handleMoveSection(sec.id, 'up')}
                              disabled={idx === 0}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30"
                              title="Mover arriba"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveSection(sec.id, 'down')}
                              disabled={idx === currentItem.secciones.length - 1}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30"
                              title="Mover abajo"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 7: IDIOMAS (i18n)                                        */}
            {/* ============================================================ */}
            {activeTab === 'traducciones' && (
              <div className="max-w-4xl space-y-6 animate-fade-in">
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <Languages className="w-4 h-4" /> Traducciones Multilingües (ES / EN / QU)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Modifica los textos correspondientes para el modo Inglés y Quechua en el kiosco.
                  </p>
                </div>

                {(['en', 'qu'] as const).map((langKey) => {
                  const langData = currentItem.language?.[langKey] || {
                    nombre: '',
                    lema: '',
                    mision: '',
                    empleo: '',
                    origen: '',
                    patronoResena: '',
                    escudoResena: '',
                    motivo: '',
                    vivo: '',
                  };
                  return (
                    <div
                      key={langKey}
                      className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4"
                    >
                      <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        Traducción: {langKey === 'en' ? 'Inglés (English)' : 'Quechua (Runasimi)'}
                      </h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-300 block mb-1">Nombre</label>
                          <input
                            type="text"
                            value={langData.nombre || ''}
                            onChange={(e) =>
                              handleUpdateCurrent({
                                language: {
                                  ...currentItem.language,
                                  [langKey]: { ...langData, nombre: e.target.value },
                                },
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-300 block mb-1">Lema</label>
                          <input
                            type="text"
                            value={langData.lema || ''}
                            onChange={(e) =>
                              handleUpdateCurrent({
                                language: {
                                  ...currentItem.language,
                                  [langKey]: { ...langData, lema: e.target.value },
                                },
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">Misión</label>
                        <textarea
                          rows={2}
                          value={langData.mision || ''}
                          onChange={(e) =>
                            handleUpdateCurrent({
                              language: {
                                ...currentItem.language,
                                [langKey]: { ...langData, mision: e.target.value },
                              },
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">Empleo / Funciones</label>
                        <textarea
                          rows={2}
                          value={langData.empleo || ''}
                          onChange={(e) =>
                            handleUpdateCurrent({
                              language: {
                                ...currentItem.language,
                                [langKey]: { ...langData, empleo: e.target.value },
                              },
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
          Selecciona un Arma o Servicio de la lista lateral para comenzar a editar.
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: SELECTOR DE IMÁGENES / MULTIMEDIA                     */}
      {/* ============================================================ */}
      {mediaModalTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-3xl bg-slate-900 border-2 border-emerald-500/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" /> Biblioteca Multimedia
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileUploadRef}
                  onChange={handleUploadFile}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileUploadRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-slate-950 font-black text-xs flex items-center gap-1 hover:brightness-110"
                >
                  <Upload className="w-3.5 h-3.5" /> Subir Imagen
                </button>
                <button
                  onClick={() => setMediaModalTarget(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto kiosk-scroll flex-1 grid grid-cols-4 gap-4">
              {mediaList.map((m, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    mediaModalTarget.onSelect(m.url);
                    setMediaModalTarget(null);
                    showNotification('Imagen asignada.');
                  }}
                  className="group relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden cursor-pointer hover:border-emerald-400 hover:scale-105 transition-all p-2 flex flex-col items-center justify-center"
                >
                  <img src={m.url} alt={m.name} className="w-full h-24 object-contain" />
                  <span className="text-[9px] text-slate-400 mt-2 truncate w-full text-center group-hover:text-emerald-300">
                    {m.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: EDITAR PERSONAJE HISTÓRICO                            */}
      {/* ============================================================ */}
      {editingPersonaje && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-xl bg-slate-900 border-2 border-emerald-500/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                {isNewPersonaje ? 'Nuevo Personaje' : 'Editar Personaje'}
              </h3>
              <button
                onClick={() => setEditingPersonaje(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto kiosk-scroll flex-1 space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="tipoPer"
                    checked={editingPersonaje.tipo === 'HEROE'}
                    onChange={() => setEditingPersonaje({ ...editingPersonaje, tipo: 'HEROE' })}
                    className="accent-emerald-500"
                  />
                  <span>Héroe de la Patria</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="tipoPer"
                    checked={editingPersonaje.tipo === 'FALLECIDO_EN_ACCION'}
                    onChange={() =>
                      setEditingPersonaje({ ...editingPersonaje, tipo: 'FALLECIDO_EN_ACCION' })
                    }
                    className="accent-red-500"
                  />
                  <span>Fallecido en Acción / Mártir</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    value={editingPersonaje.nombre}
                    onChange={(e) => setEditingPersonaje({ ...editingPersonaje, nombre: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Rango / Título</label>
                  <input
                    type="text"
                    placeholder="Ej: Coronel EP"
                    value={editingPersonaje.rango || ''}
                    onChange={(e) => setEditingPersonaje({ ...editingPersonaje, rango: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Fotografía / Retrato</label>
                <div className="flex gap-3 items-center">
                  <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex-shrink-0">
                    {editingPersonaje.fotografia ? (
                      <img src={editingPersonaje.fotografia} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <User className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      setMediaModalTarget({
                        path: 'personaje.fotografia',
                        onSelect: (url) =>
                          setEditingPersonaje({ ...editingPersonaje, fotografia: url }),
                      })
                    }
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-300"
                  >
                    Seleccionar Foto
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Reseña Biográfica</label>
                <textarea
                  rows={3}
                  value={editingPersonaje.resena}
                  onChange={(e) => setEditingPersonaje({ ...editingPersonaje, resena: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Hecho Histórico / Batalla</label>
                <textarea
                  rows={2}
                  placeholder="Ej: Inmolación en la Batalla de Tarapacá de 1879..."
                  value={editingPersonaje.hechoHistorico || ''}
                  onChange={(e) =>
                    setEditingPersonaje({ ...editingPersonaje, hechoHistorico: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setEditingPersonaje(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!editingPersonaje.nombre.trim()) {
                    alert('El nombre es obligatorio.');
                    return;
                  }
                  let updatedList: PersonajeHistorico[];
                  if (isNewPersonaje) {
                    updatedList = [...(currentItem.personajes || []), editingPersonaje];
                  } else {
                    updatedList = (currentItem.personajes || []).map((p) =>
                      p.id === editingPersonaje.id ? editingPersonaje : p
                    );
                  }
                  handleUpdateCurrent({ personajes: updatedList });
                  setEditingPersonaje(null);
                  showNotification('Ficha de personaje guardada.');
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-slate-950 text-xs font-black hover:brightness-110"
              >
                Guardar Personaje
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: EDITAR ELEMENTO SIMBÓLICO DEL ESCUDO                  */}
      {/* ============================================================ */}
      {editingElemento && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-emerald-500/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                {isNewElemento ? 'Nuevo Elemento del Escudo' : 'Editar Elemento'}
              </h3>
              <button
                onClick={() => setEditingElemento(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nombre del Elemento *</label>
                <input
                  type="text"
                  placeholder="Ej: Corona de laureles, Fusiles cruzados, etc."
                  value={editingElemento.nombre}
                  onChange={(e) => setEditingElemento({ ...editingElemento, nombre: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Significado / Descripción</label>
                <textarea
                  rows={4}
                  value={editingElemento.descripcion}
                  onChange={(e) =>
                    setEditingElemento({ ...editingElemento, descripcion: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setEditingElemento(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!editingElemento.nombre.trim()) {
                    alert('El nombre es obligatorio.');
                    return;
                  }
                  let updatedList: ElementoSimbologia[];
                  const currentElems = currentItem.escudo?.elementos || [];
                  if (isNewElemento) {
                    updatedList = [...currentElems, editingElemento];
                  } else {
                    updatedList = currentElems.map((el) =>
                      el.id === editingElemento.id ? editingElemento : el
                    );
                  }
                  handleUpdateCurrent({
                    escudo: { ...currentItem.escudo, elementos: updatedList },
                  });
                  setEditingElemento(null);
                  showNotification('Elemento simbólico guardado.');
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-slate-950 text-xs font-black hover:brightness-110"
              >
                Guardar Elemento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: PREVIEW EN VIVO DEL DETALLE (Regla 21.14)             */}
      {/* ============================================================ */}
      {previewModal && currentItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col animate-fade-in p-6">
          <div className="flex items-center justify-between pb-4 border-b border-emerald-500/30">
            <div className="flex items-center gap-3">
              <span className="bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase">
                Modo Previsualización
              </span>
              <h2 className="text-xl font-black text-white">{currentItem.nombre}</h2>
            </div>
            <button
              onClick={() => setPreviewModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Cerrar Previsualización
            </button>
          </div>

          <div className="flex-1 overflow-y-auto kiosk-scroll p-6 space-y-8 max-w-5xl mx-auto w-full">
            {/* Banner Preview */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-emerald-500/30 text-center relative overflow-hidden">
              <div
                className="w-24 h-24 rounded-full mx-auto p-1 border-4 shadow-2xl mb-4"
                style={{ backgroundColor: currentItem.colorHex, borderColor: currentItem.colorHex }}
              >
                <img
                  src={currentItem.escudo?.imagen || currentItem.imagenPrincipal}
                  alt=""
                  className="w-full h-full object-contain p-1 bg-slate-950 rounded-full"
                />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
                {currentItem.tipo}
              </span>
              <h1 className="text-3xl font-black text-white mt-1">{currentItem.nombre}</h1>
              {currentItem.lema && (
                <p className="text-xl font-black text-emerald-300 italic mt-3">
                  “{currentItem.lema}”
                </p>
              )}
            </div>

            {/* Sections Preview based on Order and Active Status */}
            {currentItem.secciones
              ?.slice()
              .sort((a, b) => a.orden - b.orden)
              .filter((s) => s.activa)
              .map((sec) => (
                <div
                  key={sec.id}
                  className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3"
                >
                  <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest border-b border-slate-800 pb-2">
                    {sec.label}
                  </h3>

                  {sec.id === 'identidad' && (
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex-shrink-0"
                        style={{ backgroundColor: currentItem.colorHex }}
                      />
                      <div>
                        <div className="text-sm font-black text-white">
                          Color Vivo: {currentItem.colorNombre} ({currentItem.colorHex})
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">{currentItem.colorDescripcion}</p>
                      </div>
                    </div>
                  )}

                  {sec.id === 'mision_empleo' && (
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs font-bold text-emerald-400 block mb-1">Misión</span>
                        <p className="text-sm text-slate-200">{currentItem.misionEmpleo?.mision}</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-400 block mb-1">Empleo Operacional</span>
                        <p className="text-sm text-slate-200">{currentItem.misionEmpleo?.empleo}</p>
                      </div>
                      {currentItem.misionEmpleo?.imagen && (
                        <img
                          src={currentItem.misionEmpleo.imagen}
                          alt=""
                          className="w-full h-48 object-cover rounded-2xl mt-2 border border-slate-800"
                        />
                      )}
                    </div>
                  )}

                  {sec.id === 'patrono_historia' && (
                    <div className="flex gap-6 items-start">
                      <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-emerald-400 flex-shrink-0">
                        <img
                          src={currentItem.patrono?.fotografia}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-black text-white">{currentItem.patrono?.nombre}</h4>
                        <span className="text-xs text-emerald-400 font-bold">{currentItem.patrono?.cargo}</span>
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                          {currentItem.patrono?.biografia}
                        </p>
                        <div className="mt-4 pt-3 border-t border-slate-800">
                          <span className="text-xs font-bold text-white block mb-1">
                            {currentItem.origenHistorico?.titulo}
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {currentItem.origenHistorico?.texto}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {sec.id === 'escudo_simbologia' && (
                    <div>
                      <p className="text-sm text-slate-200">{currentItem.escudo?.descripcion}</p>
                      {currentItem.escudo?.elementos?.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          {currentItem.escudo.elementos.map((el, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                              <span className="text-xs font-black text-emerald-300 block">{el.nombre}</span>
                              <p className="text-[11px] text-slate-400 mt-1">{el.descripcion}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {sec.id === 'heroes_fallecidos' && (
                    <div>
                      <div className="grid grid-cols-2 gap-3">
                        {currentItem.personajes?.map((p, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex gap-3 items-center">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0">
                              {p.fotografia && <img src={p.fotografia} alt="" className="w-full h-full object-cover" />}
                            </div>
                            <div className="min-w-0">
                              <span className="text-[9px] font-bold text-amber-400">{p.tipo}</span>
                              <h5 className="text-xs font-black text-white truncate">{p.nombre}</h5>
                              <p className="text-[10px] text-slate-400 line-clamp-1">{p.resena}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
