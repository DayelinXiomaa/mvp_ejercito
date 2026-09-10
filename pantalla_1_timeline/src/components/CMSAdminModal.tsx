import React, { useState, useRef, useMemo } from 'react';
import { useTimeline, type TimelineEvent } from '../context/TimelineContext';
import { useI18n } from '../context/I18nContext';
import {
  X,
  Plus,
  Trash2,
  Save,
  Upload,
  Image as ImageIcon,
  User,
  MapPin,
  Search,
  ArrowUpDown,
  FileText,
  Languages,
  CheckCircle2,
} from 'lucide-react';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const CATEGORIES = [
  'Todos',
  'Independencia',
  'República',
  'Conflictos',
  'Modernización',
  'Actualidad',
];

export const CMSAdminModal: React.FC = () => {
  const { events, cmsOpen, setCmsOpen, addEvent, updateEvent, deleteEvent } = useTimeline();
  const { t } = useI18n();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortAsc, setSortAsc] = useState(true);
  const [formTab, setFormTab] = useState<'principal' | 'multimedia' | 'idiomas'>('principal');

  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Omit<TimelineEvent, 'id'>>({
    year: 2026,
    month: 'Enero',
    title: '',
    subtitle: '',
    thumbnail: '/assets/timeline_so_lugo/slide_12_img_1.jpeg',
    image: '/assets/timeline_so_lugo/slide_12_img_1.jpeg',
    gallery: [],
    description: '',
    location: 'Lima, Perú',
    category: 'Actualidad',
    hero: 'Ejército del Perú',
    coordinates: { lat: -12.0464, lng: -77.0428 },
    language: {
      es: { title: '', subtitle: '', description: '' },
      en: { title: '', subtitle: '', description: '' },
      qu: { title: '', subtitle: '', description: '' },
    },
  });

  // Filtered & Sorted events for fast access
  const filteredEvents = useMemo(() => {
    return events
      .filter((ev) => {
        const matchesCategory =
          selectedCategory === 'Todos' ||
          (ev.category && ev.category.toLowerCase().includes(selectedCategory.toLowerCase()));
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          ev.title.toLowerCase().includes(q) ||
          (ev.subtitle && ev.subtitle.toLowerCase().includes(q)) ||
          String(ev.year).includes(q) ||
          (ev.hero && ev.hero.toLowerCase().includes(q)) ||
          (ev.location && ev.location.toLowerCase().includes(q)) ||
          (ev.description && ev.description.toLowerCase().includes(q));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => (sortAsc ? a.year - b.year : b.year - a.year));
  }, [events, selectedCategory, searchQuery, sortAsc]);

  if (!cmsOpen) return null;

  const handleEdit = (ev: TimelineEvent) => {
    setEditingEvent(ev);
    setIsCreating(false);
    setSavedSuccess(false);
    setFormData({
      year: ev.year,
      month: ev.month || 'Enero',
      title: ev.title,
      subtitle: ev.subtitle || '',
      thumbnail: ev.thumbnail || ev.image,
      image: ev.image,
      gallery: ev.gallery || [],
      description: ev.description,
      location: ev.location,
      category: ev.category,
      hero: ev.hero,
      coordinates: ev.coordinates || { lat: -12.0464, lng: -77.0428 },
      language: ev.language || {
        es: { title: ev.title, subtitle: ev.subtitle, description: ev.description },
        en: { title: ev.title, subtitle: ev.subtitle, description: ev.description },
        qu: { title: ev.title, subtitle: ev.subtitle, description: ev.description },
      },
    });
  };

  const handleCreateNew = () => {
    setEditingEvent(null);
    setIsCreating(true);
    setSavedSuccess(false);
    setFormTab('principal');
    setFormData({
      year: 2026,
      month: 'Enero',
      title: 'Nuevo Hito Histórico',
      subtitle: 'Subtítulo del Hito',
      thumbnail: '/assets/timeline_so_lugo/slide_12_img_1.jpeg',
      image: '/assets/timeline_so_lugo/slide_12_img_1.jpeg',
      gallery: [],
      description: 'Descripción detallada del acontecimiento...',
      location: 'Lima, Perú',
      category: 'Actualidad',
      hero: 'Héroe del Ejército',
      coordinates: { lat: -12.0464, lng: -77.0428 },
      language: {
        es: { title: 'Nuevo Hito Histórico', subtitle: 'Subtítulo', description: 'Descripción' },
        en: { title: 'New Historical Milestone', subtitle: 'Subtitle', description: 'Description' },
        qu: { title: 'Musuq Willakuy', subtitle: 'Suti', description: 'Willakuy' },
      },
    });
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData((prev) => ({
          ...prev,
          image: result,
          thumbnail: result,
          gallery: [result, ...prev.gallery],
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const updatedData = {
      ...formData,
      language: {
        ...formData.language,
        es: {
          title: formData.title,
          subtitle: formData.subtitle,
          description: formData.description,
        },
      },
    };

    if (isCreating) {
      addEvent(updatedData);
    } else if (editingEvent) {
      updateEvent({ ...updatedData, id: editingEvent.id });
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-6 animate-fade-in select-none">
      <div className="relative w-full max-w-7xl h-[92vh] bg-slate-900 border border-emerald-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header CMS */}
        <div className="px-6 py-4 bg-slate-950 border-b border-emerald-500/20 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
                <span>{t.cms_title}</span>
                <span className="text-xs bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {events.length} Hitos
                </span>
              </h2>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                Búsqueda instantánea, edición visual y traducciones en tiempo real
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition-all shadow-lg min-h-[40px]"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo Hito</span>
            </button>
            <button
              onClick={() => setCmsOpen(false)}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cuerpos CMS: Dos Paneles (Lista Buscable / Formulario con Pestañas) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Panel Izquierdo: Buscador + Filtros Rápidos + Lista (5 columnas) */}
          <div className="lg:col-span-5 border-r border-slate-800 bg-slate-950/60 flex flex-col min-h-0">
            {/* Buscador Superior */}
            <div className="p-4 border-b border-slate-800 space-y-3 flex-shrink-0 bg-slate-950">
              <div className="relative">
                <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por título, año, héroe, lugar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filtros Rápidos de Categoría */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-slate-950 shadow'
                          : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Barra de Conteo y Orden */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>
                  Mostrando <strong>{filteredEvents.length}</strong> de {events.length}
                </span>
                <button
                  onClick={() => setSortAsc(!sortAsc)}
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold"
                >
                  <ArrowUpDown className="w-3 h-3" />
                  <span>{sortAsc ? 'Cronológico (Antiguo → Reciente)' : 'Reciente → Antiguo'}</span>
                </button>
              </div>
            </div>

            {/* Lista Scrollable con Cards Compactas */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 kiosk-scroll">
              {filteredEvents.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No se encontraron hitos con los filtros actuales.
                </div>
              ) : (
                filteredEvents.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => handleEdit(ev)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                      editingEvent?.id === ev.id
                        ? 'bg-emerald-950/80 border-emerald-400 text-white shadow-lg ring-1 ring-emerald-400/40'
                        : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-800">
                      <img src={ev.thumbnail || ev.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/90 px-1.5 py-0.2 rounded border border-emerald-500/20">
                          {ev.year}
                        </span>
                        {ev.category && (
                          <span className="text-[9px] text-slate-400 uppercase font-bold truncate">
                            • {ev.category}
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-xs truncate text-white leading-tight">{ev.title}</div>
                      {ev.hero && <div className="text-[10px] text-slate-400 truncate">{ev.hero}</div>}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`¿Eliminar hito "${ev.title}"?`)) {
                          deleteEvent(ev.id);
                        }
                      }}
                      className="p-2 text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                      title="Eliminar evento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Panel Derecho: Formulario Estructurado con Pestañas (7 columnas) */}
          <div className="lg:col-span-7 flex flex-col min-h-0 bg-slate-900/90">
            {isCreating || editingEvent ? (
              <>
                {/* Header Fijo del Formulario */}
                <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm md:text-base font-black text-white truncate">
                      {isCreating ? '➕ Crear Nuevo Hito' : `✏️ Editando: ${editingEvent?.title}`}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {formData.year} • {formData.category}
                    </p>
                  </div>

                  {/* Selector de Pestañas del Formulario */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setFormTab('principal')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        formTab === 'principal'
                          ? 'bg-emerald-600 text-slate-950 font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Datos</span>
                    </button>
                    <button
                      onClick={() => setFormTab('multimedia')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        formTab === 'multimedia'
                          ? 'bg-emerald-600 text-slate-950 font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Imágenes</span>
                    </button>
                    <button
                      onClick={() => setFormTab('idiomas')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        formTab === 'idiomas'
                          ? 'bg-emerald-600 text-slate-950 font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Languages className="w-3.5 h-3.5" />
                      <span>Idiomas</span>
                    </button>
                  </div>
                </div>

                {/* Contenido del Formulario según Pestaña */}
                <div className="flex-1 overflow-y-auto p-6 kiosk-scroll space-y-4">
                  {savedSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-black flex items-center gap-2 animate-bounce">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>¡Hito guardado y sincronizado con éxito!</span>
                    </div>
                  )}

                  {/* TAB 1: DATOS PRINCIPALES */}
                  {formTab === 'principal' && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Fecha & Categoría */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] text-slate-400 font-bold block mb-1">Año *</label>
                          <input
                            type="number"
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-xs focus:border-emerald-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 font-bold block mb-1">Mes</label>
                          <select
                            value={formData.month}
                            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-xs focus:border-emerald-400 focus:outline-none"
                          >
                            {MONTHS.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 font-bold block mb-1">Categoría</label>
                          <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:border-emerald-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Título y Subtítulo */}
                      <div>
                        <label className="text-[11px] text-slate-400 font-bold block mb-1">Título del Hito *</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-black text-sm focus:border-emerald-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 font-bold block mb-1">Subtítulo Resumen</label>
                        <input
                          type="text"
                          value={formData.subtitle}
                          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:border-emerald-400 focus:outline-none"
                        />
                      </div>

                      {/* Héroe y Ubicación */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-slate-400 font-bold block mb-1 flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Protagonista / Héroe</span>
                          </label>
                          <input
                            type="text"
                            value={formData.hero}
                            onChange={(e) => setFormData({ ...formData, hero: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:border-emerald-400 focus:outline-none font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 font-bold block mb-1 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Lugar / Ubicación</span>
                          </label>
                          <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:border-emerald-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Descripción Detallada */}
                      <div>
                        <label className="text-[11px] text-slate-400 font-bold block mb-1">
                          Descripción Histórica Completa
                        </label>
                        <textarea
                          rows={5}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs focus:border-emerald-400 focus:outline-none leading-relaxed"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 2: MULTIMEDIA & IMÁGENES */}
                  {formTab === 'multimedia' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="w-44 h-32 rounded-xl overflow-hidden border-2 border-emerald-500/40 bg-slate-900 flex-shrink-0">
                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <label className="text-xs font-black text-emerald-400 uppercase">
                              Imagen Principal / Obra de Arte
                            </label>
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleImageFileChange}
                              accept="image/*"
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/80 text-emerald-200 border border-emerald-500/40 hover:bg-emerald-800 transition-colors text-xs font-bold"
                            >
                              <Upload className="w-4 h-4 text-emerald-400" />
                              <span>Examinar desde este equipo...</span>
                            </button>
                            <input
                              type="text"
                              value={formData.image}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  image: e.target.value,
                                  thumbnail: e.target.value,
                                })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
                              placeholder="O pegue la ruta /assets/..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: IDIOMAS (INGLÉS Y QUECHUA) */}
                  {formTab === 'idiomas' && (
                    <div className="space-y-4 animate-fade-in">
                      {/* English */}
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                        <span className="text-xs font-black text-emerald-400 flex items-center gap-2">
                          <span>🇬🇧 English Translation</span>
                        </span>
                        <input
                          type="text"
                          placeholder="Title in English"
                          value={formData.language?.en?.title || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              language: {
                                ...formData.language,
                                en: { ...(formData.language?.en || {}), title: e.target.value },
                              },
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-bold"
                        />
                        <textarea
                          rows={3}
                          placeholder="Description in English"
                          value={formData.language?.en?.description || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              language: {
                                ...formData.language,
                                en: { ...(formData.language?.en || {}), description: e.target.value },
                              },
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white text-xs"
                        />
                      </div>

                      {/* Quechua */}
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                        <span className="text-xs font-black text-emerald-400 flex items-center gap-2">
                          <span>🇵🇪 Quechua T'ikray</span>
                        </span>
                        <input
                          type="text"
                          placeholder="Quechuapi suti"
                          value={formData.language?.qu?.title || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              language: {
                                ...formData.language,
                                qu: { ...(formData.language?.qu || {}), title: e.target.value },
                              },
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-bold"
                        />
                        <textarea
                          rows={3}
                          placeholder="Quechuapi willakuy"
                          value={formData.language?.qu?.description || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              language: {
                                ...formData.language,
                                qu: { ...(formData.language?.qu || {}), description: e.target.value },
                              },
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Fijo con Botón de Guardar */}
                <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
                  <span className="text-xs text-slate-500">
                    Cambios listos para guardar en el archivo institucional
                  </span>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-800 to-emerald-600 text-white font-extrabold text-xs shadow-xl hover:brightness-110 transition-all min-h-[44px]"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-slate-500 p-8 text-center">
                <ImageIcon className="w-14 h-14 mb-3 text-slate-700 animate-pulse" />
                <h4 className="font-black text-white text-sm">Seleccione un Hito de la Lista</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Utilice el buscador o las categorías a la izquierda para encontrar y editar rápidamente cualquier acontecimiento.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
