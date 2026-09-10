import React, { useState } from 'react';
import type { TerrorismoData, TerrorismoTopic, OperacionItem, PhotoItem } from '../context/TerrorismoContext';
import {
  Flame,
  Crosshair,
  Shield,
  Plus,
  Trash2,
  Image as ImageIcon,
  Edit3,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Settings2,
  FileText,
  Eye,
} from 'lucide-react';

interface TerrorismoVisualEditorProps {
  data: TerrorismoData;
  onChange: (newData: TerrorismoData) => void;
}

type EditorSection = 'SENDERO' | 'MRTA' | 'OPERACIONES';

export const TerrorismoVisualEditor: React.FC<TerrorismoVisualEditorProps> = ({ data, onChange }) => {
  const [section, setSection] = useState<EditorSection>('SENDERO');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [activeLangTab, setActiveLangTab] = useState<'es' | 'en' | 'qu'>('es');
  const [expandedPhotoIdx, setExpandedPhotoIdx] = useState<number | null>(null);
  const [showSectionMeta, setShowSectionMeta] = useState<boolean>(false);

  // Deep clone helper
  const updateData = (updater: (draft: TerrorismoData) => void) => {
    const clone = JSON.parse(JSON.stringify(data)) as TerrorismoData;
    updater(clone);
    onChange(clone);
  };

  // Current list based on section
  const slTopics = data?.sendero_luminoso?.topics || [];
  const mrtaTopics = data?.mrta?.topics || [];
  const ops = data?.operaciones?.items || [];

  const currentList = section === 'SENDERO' ? slTopics : section === 'MRTA' ? mrtaTopics : ops;

  // Selected item
  const selectedItem =
    currentList.find((it) => it.id === selectedTopicId) ||
    currentList[0] ||
    null;

  // Search filter
  const filteredList = currentList.filter((it) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const t = (it.title?.es || '').toLowerCase();
    const c = (it.content?.es || '').toLowerCase();
    return t.includes(q) || c.includes(q);
  });

  // Current section metadata
  const getSectionMeta = () => {
    if (section === 'SENDERO') return data.sendero_luminoso;
    if (section === 'MRTA') return data.mrta;
    return data.operaciones;
  };
  const sectionMeta = getSectionMeta();

  // Reorder helper
  const handleReorder = (itemId: string, direction: 'up' | 'down') => {
    updateData((draft) => {
      let list: TerrorismoTopic[];
      if (section === 'SENDERO') list = draft.sendero_luminoso.topics;
      else if (section === 'MRTA') list = draft.mrta.topics;
      else list = draft.operaciones.items;

      const idx = list.findIndex((it) => it.id === itemId);
      if (idx === -1) return;
      if (direction === 'up' && idx > 0) {
        [list[idx - 1], list[idx]] = [list[idx], list[idx - 1]];
      } else if (direction === 'down' && idx < list.length - 1) {
        [list[idx + 1], list[idx]] = [list[idx], list[idx + 1]];
      }
    });
  };

  // Add new topic for Sendero/MRTA
  const handleAddTopic = () => {
    updateData((draft) => {
      const list = section === 'SENDERO' ? draft.sendero_luminoso.topics : draft.mrta.topics;
      const prefix = section === 'SENDERO' ? 'sl' : 'mrta';
      const newId = `${prefix}-p${list.length + 1}-${Date.now()}`;
      const newTopic: TerrorismoTopic = {
        id: newId,
        page: list.length + 1,
        slide_image: '/assets/terrorismo/slide_1.png',
        embedded_images: [],
        photos: [],
        title: {
          es: 'NUEVO TEMA',
          en: 'NEW TOPIC',
          qu: 'MUSUQ TEMA',
        },
        content: {
          es: 'Descripción del nuevo tema.',
          en: 'Description of the new topic.',
          qu: 'Musuq temapa willakuynin.',
        },
      };
      list.push(newTopic);
      setSelectedTopicId(newId);
    });
  };

  // Delete topic for Sendero/MRTA
  const handleDeleteTopic = (topicId: string) => {
    if (!window.confirm('¿Eliminar este tema?')) return;
    updateData((draft) => {
      if (section === 'SENDERO') {
        draft.sendero_luminoso.topics = draft.sendero_luminoso.topics.filter((t) => t.id !== topicId);
      } else if (section === 'MRTA') {
        draft.mrta.topics = draft.mrta.topics.filter((t) => t.id !== topicId);
      }
    });
    setSelectedTopicId('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Selector de Sección */}
      <div className="flex items-center justify-between p-4 bg-slate-900/90 border-b border-slate-800 flex-shrink-0 gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSection('SENDERO');
              setSelectedTopicId('');
              setShowSectionMeta(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              section === 'SENDERO'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Sendero Luminoso ({slTopics.length})</span>
          </button>
          <button
            onClick={() => {
              setSection('MRTA');
              setSelectedTopicId('');
              setShowSectionMeta(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              section === 'MRTA'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            <span>MRTA ({mrtaTopics.length})</span>
          </button>
          <button
            onClick={() => {
              setSection('OPERACIONES');
              setSelectedTopicId('');
              setShowSectionMeta(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              section === 'OPERACIONES'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Operaciones ({ops.length})</span>
          </button>

          <div className="h-6 w-px bg-slate-700 mx-1" />

          {/* Toggle Section Metadata */}
          <button
            onClick={() => {
              setShowSectionMeta(!showSectionMeta);
              if (!showSectionMeta) setSelectedTopicId('');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              showSectionMeta
                ? 'bg-emerald-700 text-white border-emerald-500 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
            }`}
            title="Editar título, subtítulo e imagen de portada de esta sección"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Metadatos Sección</span>
          </button>
        </div>

        {/* Idioma del Editor */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase px-2">Editar Idioma:</span>
          {(['es', 'en', 'qu'] as const).map((lng) => (
            <button
              key={lng}
              onClick={() => setActiveLangTab(lng)}
              className={`px-3 py-1 rounded-lg text-xs font-black uppercase transition-all ${
                activeLangTab === lng
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lng}
            </button>
          ))}
        </div>
      </div>

      {/* Section Metadata Panel (expandable) */}
      {showSectionMeta && (
        <div className="p-5 bg-slate-900/70 border-b border-emerald-500/30 space-y-4 flex-shrink-0 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Settings2 className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              Metadatos de Sección: {section === 'SENDERO' ? 'Sendero Luminoso' : section === 'MRTA' ? 'MRTA' : 'Operaciones'}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Título de Sección ({activeLangTab.toUpperCase()})
              </label>
              <input
                type="text"
                value={sectionMeta?.title?.[activeLangTab] || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateData((draft) => {
                    const sec = section === 'SENDERO' ? draft.sendero_luminoso : section === 'MRTA' ? draft.mrta : draft.operaciones;
                    if (sec.title) sec.title[activeLangTab] = val;
                  });
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Subtítulo / Descripción ({activeLangTab.toUpperCase()})
              </label>
              <input
                type="text"
                value={sectionMeta?.subtitle?.[activeLangTab] || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateData((draft) => {
                    const sec = section === 'SENDERO' ? draft.sendero_luminoso : section === 'MRTA' ? draft.mrta : draft.operaciones;
                    if (sec.subtitle) sec.subtitle[activeLangTab] = val;
                  });
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Imagen de Portada (URL)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={sectionMeta?.cover_image || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateData((draft) => {
                    const sec = section === 'SENDERO' ? draft.sendero_luminoso : section === 'MRTA' ? draft.mrta : draft.operaciones;
                    sec.cover_image = val;
                  });
                }}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              {sectionMeta?.cover_image && (
                <div className="w-16 h-12 rounded-xl bg-slate-950 border border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <img
                    src={sectionMeta.cover_image}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contenedor Principal: Sidebar de Items + Formulario de Edición */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden">
        {/* Sidebar Lista de Items (4 cols) */}
        <div className="md:col-span-4 border-r border-slate-800 bg-slate-900/40 p-3 flex flex-col justify-between overflow-hidden">
          <div className="relative mb-3 flex-shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrar por título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
            {filteredList.map((item, idx) => {
              const isSelected = (selectedItem && selectedItem.id === item.id) || (!selectedTopicId && idx === 0 && !showSectionMeta);
              return (
                <div key={item.id} className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedTopicId(item.id);
                      setShowSectionMeta(false);
                    }}
                    className={`flex-1 text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-500/80 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-slate-500 block uppercase">
                        #{idx + 1} • Pág {item.page}
                        {'year' in item ? ` • ${(item as OperacionItem).year}` : ''}
                      </span>
                      <h4 className="text-xs font-bold truncate mt-0.5">
                        {item.title?.[activeLangTab] || item.title?.es || 'Sin título'}
                      </h4>
                    </div>
                  </button>

                  {/* Reorder + Delete buttons */}
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => handleReorder(item.id, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Subir"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleReorder(item.id, 'down')}
                      disabled={idx === filteredList.length - 1}
                      className="p-1 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Bajar"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Topic / Operation button */}
          <div className="mt-3 pt-3 border-t border-slate-800 flex-shrink-0">
            {section === 'OPERACIONES' ? (
              <button
                onClick={() => {
                  updateData((draft) => {
                    const newId = `op-p${draft.operaciones.items.length + 1}-${Date.now()}`;
                    const newOp: OperacionItem = {
                      id: newId,
                      page: draft.operaciones.items.length + 1,
                      slide_image: '/assets/terrorismo/slide_16.png',
                      embedded_images: [],
                      photos: [],
                      target: 'Sendero Luminoso',
                      period: '2013-2023',
                      subcategory: 'Operaciones VRAEM',
                      year: '2024',
                      title: {
                        es: 'NUEVA OPERACIÓN MILITAR',
                        en: 'NEW MILITARY OPERATION',
                        qu: 'MUSUQ OPERACIÓN MILITAR',
                      },
                      content: {
                        es: 'Descripción de la nueva operación militar contraterrorista.',
                        en: 'Description of the new counterterrorist military operation.',
                        qu: 'Musuq operacionpa willakuynin.',
                      },
                    };
                    draft.operaciones.items.push(newOp);
                    setSelectedTopicId(newId);
                  });
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Nueva Operación</span>
              </button>
            ) : (
              <button
                onClick={handleAddTopic}
                className="w-full py-2.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Nuevo Tema</span>
              </button>
            )}
          </div>
        </div>

        {/* Formulario de Edición del Item Seleccionado (8 cols) */}
        <div className="md:col-span-8 p-6 overflow-y-auto space-y-6">
          {selectedItem && !showSectionMeta ? (
            <div className="space-y-6 max-w-3xl">
              {/* Header del Formulario */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    Editando {section} • Idioma: {activeLangTab.toUpperCase()}
                  </span>
                  <h4 className="text-[14px] font-black text-white">
                    {selectedItem.title?.[activeLangTab] || selectedItem.title?.es}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  {/* Delete button for topics (SL/MRTA) or operations */}
                  {(section === 'SENDERO' || section === 'MRTA') && currentList.length > 1 && (
                    <button
                      onClick={() => handleDeleteTopic(selectedItem.id)}
                      className="p-2 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400 hover:bg-red-600 hover:text-white transition-all text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Eliminar Tema</span>
                    </button>
                  )}
                  {section === 'OPERACIONES' && ops.length > 1 && (
                    <button
                      onClick={() => {
                        if (window.confirm(`¿Eliminar la operación "${selectedItem.title?.es}"?`)) {
                          updateData((draft) => {
                            draft.operaciones.items = draft.operaciones.items.filter(
                              (o) => o.id !== selectedItem.id
                            );
                          });
                          setSelectedTopicId('');
                        }
                      }}
                      className="p-2 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400 hover:bg-red-600 hover:text-white transition-all text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Eliminar Operación</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Campos Generales de Operación */}
              {'target' in selectedItem && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Objetivo Enemigo
                    </label>
                    <select
                      value={(selectedItem as OperacionItem).target}
                      onChange={(e) => {
                        const val = e.target.value as 'Sendero Luminoso' | 'MRTA';
                        updateData((draft) => {
                          const it = draft.operaciones.items.find((o) => o.id === selectedItem.id);
                          if (it) it.target = val;
                        });
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Sendero Luminoso">Sendero Luminoso</option>
                      <option value="MRTA">MRTA</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Año
                    </label>
                    <input
                      type="text"
                      value={(selectedItem as OperacionItem).year}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateData((draft) => {
                          const it = draft.operaciones.items.find((o) => o.id === selectedItem.id);
                          if (it) it.year = val;
                        });
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Periodo
                    </label>
                    <select
                      value={(selectedItem as OperacionItem).period}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateData((draft) => {
                          const it = draft.operaciones.items.find((o) => o.id === selectedItem.id);
                          if (it) it.period = val;
                        });
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="1987-1992">1987-1992</option>
                      <option value="1993-2012">1993-2012</option>
                      <option value="2013-2023">2013-2023</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Subcategoría / Sector
                    </label>
                    <input
                      type="text"
                      value={(selectedItem as OperacionItem).subcategory || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateData((draft) => {
                          const it = draft.operaciones.items.find((o) => o.id === selectedItem.id);
                          if (it) it.subcategory = val;
                        });
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      placeholder="Ej: Operaciones VRAEM"
                    />
                  </div>
                </div>
              )}

              {/* Slide Image (for SL/MRTA topics) */}
              {section !== 'OPERACIONES' && (
                <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Imagen de Diapositiva (slide_image)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={selectedItem.slide_image || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateData((draft) => {
                          let it: TerrorismoTopic | undefined;
                          if (section === 'SENDERO') it = draft.sendero_luminoso.topics.find((t) => t.id === selectedItem.id);
                          else it = draft.mrta.topics.find((t) => t.id === selectedItem.id);
                          if (it) it.slide_image = val;
                        });
                      }}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                    {selectedItem.slide_image && (
                      <div className="w-12 h-9 rounded-lg bg-slate-950 border border-slate-700 overflow-hidden flex-shrink-0">
                        <img
                          src={selectedItem.slide_image}
                          alt="Slide preview"
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Título */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
                  <FileText className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
                  Título ({activeLangTab.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={selectedItem.title?.[activeLangTab] || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateData((draft) => {
                      let it: TerrorismoTopic | undefined;
                      if (section === 'SENDERO') it = draft.sendero_luminoso.topics.find((t) => t.id === selectedItem.id);
                      else if (section === 'MRTA') it = draft.mrta.topics.find((t) => t.id === selectedItem.id);
                      else it = draft.operaciones.items.find((t) => t.id === selectedItem.id);
                      if (it && it.title) it.title[activeLangTab] = val;
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              {/* Contenido / Párrafos */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300 uppercase">
                    Contenido y Párrafos ({activeLangTab.toUpperCase()})
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Use dos saltos de línea (\n\n) para separar párrafos
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={selectedItem.content?.[activeLangTab] || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateData((draft) => {
                      let it: TerrorismoTopic | undefined;
                      if (section === 'SENDERO') it = draft.sendero_luminoso.topics.find((t) => t.id === selectedItem.id);
                      else if (section === 'MRTA') it = draft.mrta.topics.find((t) => t.id === selectedItem.id);
                      else it = draft.operaciones.items.find((t) => t.id === selectedItem.id);
                      if (it && it.content) it.content[activeLangTab] = val;
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs md:text-sm text-white focus:outline-none focus:border-emerald-500 leading-relaxed font-mono"
                />
              </div>

              {/* Galería de Fotos y Descripciones */}
              <div className="border-t border-slate-800 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      <span>Fotografías del Tema ({selectedItem.photos?.length || 0})</span>
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      Administre las imágenes, descripciones y textos alternativos
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      updateData((draft) => {
                        let it: TerrorismoTopic | undefined;
                        if (section === 'SENDERO') it = draft.sendero_luminoso.topics.find((t) => t.id === selectedItem.id);
                        else if (section === 'MRTA') it = draft.mrta.topics.find((t) => t.id === selectedItem.id);
                        else it = draft.operaciones.items.find((t) => t.id === selectedItem.id);
                        if (it) {
                          if (!it.photos) it.photos = [];
                          const newPhoto: PhotoItem = {
                            url: '/assets/terrorismo/slide_1.png',
                            alt: 'Nueva fotografía histórica',
                            description: {
                              es: 'Descripción de la fotografía en español',
                              en: 'Photo description in English',
                              qu: 'Fotografiapa willakuynin',
                            },
                          };
                          it.photos.push(newPhoto);
                          if (!it.embedded_images) it.embedded_images = [];
                          it.embedded_images.push(newPhoto.url);
                        }
                      });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Foto</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(selectedItem.photos || []).map((photo, pIdx) => {
                    const isExpanded = expandedPhotoIdx === pIdx;
                    return (
                      <div
                        key={pIdx}
                        className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 p-1 flex-shrink-0 overflow-hidden flex items-center justify-center">
                              <img
                                src={photo.url}
                                alt={photo.alt}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[9px] font-bold text-emerald-400 uppercase">
                                Foto #{pIdx + 1}
                              </span>
                              <h5 className="text-xs font-bold text-white truncate max-w-md">
                                {photo.description?.[activeLangTab] || photo.description?.es || photo.alt}
                              </h5>
                              <span className="text-[10px] text-slate-500 font-mono block truncate max-w-sm">
                                {photo.url}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => setExpandedPhotoIdx(isExpanded ? null : pIdx)}
                              className="p-2 rounded-xl bg-slate-950 text-slate-300 hover:text-white border border-slate-800 text-xs flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>{isExpanded ? 'Contraer' : 'Editar'}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm('¿Eliminar esta fotografía?')) {
                                  updateData((draft) => {
                                    let it: TerrorismoTopic | undefined;
                                    if (section === 'SENDERO') it = draft.sendero_luminoso.topics.find((t) => t.id === selectedItem.id);
                                    else if (section === 'MRTA') it = draft.mrta.topics.find((t) => t.id === selectedItem.id);
                                    else it = draft.operaciones.items.find((t) => t.id === selectedItem.id);
                                    if (it && it.photos) {
                                      it.photos.splice(pIdx, 1);
                                      if (it.embedded_images && it.embedded_images[pIdx]) {
                                        it.embedded_images.splice(pIdx, 1);
                                      }
                                    }
                                  });
                                }
                              }}
                              className="p-2 rounded-xl bg-red-950/40 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/30 transition-colors"
                              title="Eliminar foto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Campos Expandidos de la Foto */}
                        {isExpanded && (
                          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="md:col-span-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                                Ruta de la Imagen (URL)
                              </label>
                              <input
                                type="text"
                                value={photo.url}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateData((draft) => {
                                    let it: TerrorismoTopic | undefined;
                                    if (section === 'SENDERO') it = draft.sendero_luminoso.topics.find((t) => t.id === selectedItem.id);
                                    else if (section === 'MRTA') it = draft.mrta.topics.find((t) => t.id === selectedItem.id);
                                    else it = draft.operaciones.items.find((t) => t.id === selectedItem.id);
                                    if (it && it.photos && it.photos[pIdx]) {
                                      it.photos[pIdx].url = val;
                                      if (it.embedded_images) it.embedded_images[pIdx] = val;
                                    }
                                  });
                                }}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                                Texto Alternativo (Alt)
                              </label>
                              <input
                                type="text"
                                value={photo.alt || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateData((draft) => {
                                    let it: TerrorismoTopic | undefined;
                                    if (section === 'SENDERO') it = draft.sendero_luminoso.topics.find((t) => t.id === selectedItem.id);
                                    else if (section === 'MRTA') it = draft.mrta.topics.find((t) => t.id === selectedItem.id);
                                    else it = draft.operaciones.items.find((t) => t.id === selectedItem.id);
                                    if (it && it.photos && it.photos[pIdx]) it.photos[pIdx].alt = val;
                                  });
                                }}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                                Descripción / Pie de Foto ({activeLangTab.toUpperCase()})
                              </label>
                              <input
                                type="text"
                                value={photo.description?.[activeLangTab] || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateData((draft) => {
                                    let it: TerrorismoTopic | undefined;
                                    if (section === 'SENDERO') it = draft.sendero_luminoso.topics.find((t) => t.id === selectedItem.id);
                                    else if (section === 'MRTA') it = draft.mrta.topics.find((t) => t.id === selectedItem.id);
                                    else it = draft.operaciones.items.find((t) => t.id === selectedItem.id);
                                    if (it && it.photos && it.photos[pIdx]) {
                                      if (!it.photos[pIdx].description) {
                                        it.photos[pIdx].description = { es: '', en: '', qu: '' };
                                      }
                                      it.photos[pIdx].description[activeLangTab] = val;
                                    }
                                  });
                                }}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : !showSectionMeta ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              Seleccione un elemento del menú izquierdo para comenzar a editar
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-3 p-8 text-center">
              <Eye className="w-8 h-8 text-emerald-400/50" />
              <p className="text-sm font-bold text-slate-300">Panel de Metadatos Activo</p>
              <p>Edite el título, subtítulo e imagen de portada de la sección <strong className="text-emerald-300">{section === 'SENDERO' ? 'Sendero Luminoso' : section === 'MRTA' ? 'MRTA' : 'Operaciones'}</strong> en el panel superior.</p>
              <p className="text-[10px] text-slate-500">Estos datos se muestran en las tarjetas del menú principal (Hub) de la pantalla interactiva.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
