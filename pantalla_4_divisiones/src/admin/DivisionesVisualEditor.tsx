import React, { useState } from 'react';
import type { Division, Brigada } from '../context/DivisionesContext';
import {
  Shield,
  Plus,
  Trash2,
  Edit3,
  Search,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Layers,
  FileText,
  Building,
  Columns,
} from 'lucide-react';

interface DivisionesVisualEditorProps {
  data: { divisiones: Division[] } | Division[];
  onChange: (newData: any) => void;
}

export const DivisionesVisualEditor: React.FC<DivisionesVisualEditorProps> = ({ data, onChange }) => {
  const divisionesList: Division[] = Array.isArray(data) ? data : (data as any).divisiones || [];
  
  const [selectedDivId, setSelectedDivId] = useState<string>(divisionesList[0]?.id || 'I-DE');
  const [selectedBrigId, setSelectedBrigId] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [activeLangTab, setActiveLangTab] = useState<'es' | 'en' | 'qu'>('es');
  const [editorSubTab, setEditorSubTab] = useState<'division' | 'brigadas'>('division');

  // Deep clone helper
  const updateData = (updater: (draft: Division[]) => void) => {
    const clone: Division[] = JSON.parse(JSON.stringify(divisionesList));
    updater(clone);
    if (Array.isArray(data)) {
      onChange(clone);
    } else {
      onChange({ ...data, divisiones: clone });
    }
  };

  const selectedDiv = divisionesList.find((d) => d.id === selectedDivId) || divisionesList[0];
  const brigadasList = selectedDiv?.brigadas || [];

  const selectedBrigada =
    brigadasList.find((b) => b.id === selectedBrigId) ||
    brigadasList[0] ||
    null;

  // Search filter for brigades
  const filteredBrigadas = brigadasList.filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      b.nombre.toLowerCase().includes(q) ||
      (b.alias && b.alias.toLowerCase().includes(q)) ||
      (b.sede && b.sede.toLowerCase().includes(q))
    );
  });

  // Handle Update Division Fields
  const handleUpdateDivField = (field: keyof Division, value: any) => {
    updateData((draft) => {
      const d = draft.find((x) => x.id === selectedDivId);
      if (d) {
        (d as any)[field] = value;
      }
    });
  };

  // Handle Update Division Multilingual Reseña
  const handleUpdateDivLangResena = (lang: 'es' | 'en' | 'qu', text: string) => {
    updateData((draft) => {
      const d = draft.find((x) => x.id === selectedDivId);
      if (d) {
        if (!d.language) {
          d.language = {
            es: { nombre: d.nombre, resena: d.resena || '' },
            en: { nombre: d.nombre, resena: d.resena || '' },
            qu: { nombre: d.nombre, resena: d.resena || '' },
          };
        }
        d.language[lang].resena = text;
        if (lang === 'es') d.resena = text;
      }
    });
  };

  // Handle Update Brigade Fields
  const handleUpdateBrigField = (brigId: string, field: keyof Brigada, value: any) => {
    updateData((draft) => {
      const d = draft.find((x) => x.id === selectedDivId);
      if (d) {
        const b = d.brigadas.find((x) => x.id === brigId);
        if (b) {
          (b as any)[field] = value;
        }
      }
    });
  };

  // Handle Update Brigade Multilingual Reseña
  const handleUpdateBrigLangResena = (brigId: string, lang: 'es' | 'en' | 'qu', text: string) => {
    updateData((draft) => {
      const d = draft.find((x) => x.id === selectedDivId);
      if (d) {
        const b = d.brigadas.find((x) => x.id === brigId);
        if (b) {
          if (!b.language) {
            b.language = {
              es: { nombre: b.nombre, resena: b.resena || '' },
              en: { nombre: b.nombre, resena: b.resena || '' },
              qu: { nombre: b.nombre, resena: b.resena || '' },
            };
          }
          b.language[lang].resena = text;
          if (lang === 'es') b.resena = text;
        }
      }
    });
  };

  // Subordinate Unit editing inside a brigade column
  const handleAddUnitToColumn = (brigId: string, colIdx: number) => {
    const name = window.prompt('Nombre de la nueva unidad (ej. BATALLÓN DE INFANTERÍA MOTORIZADO N° 10):');
    if (!name || !name.trim()) return;

    updateData((draft) => {
      const d = draft.find((x) => x.id === selectedDivId);
      if (d) {
        const b = d.brigadas.find((x) => x.id === brigId);
        if (b) {
          if (!b.columnas) b.columnas = [[]];
          while (b.columnas.length <= colIdx) b.columnas.push([]);
          b.columnas[colIdx].push(name.trim());
          // Update flat list
          b.unidades = b.columnas.flat();
        }
      }
    });
  };

  const handleEditUnitName = (brigId: string, colIdx: number, uIdx: number) => {
    if (!selectedBrigada?.columnas?.[colIdx]?.[uIdx]) return;
    const currentName = selectedBrigada.columnas[colIdx][uIdx];
    const newName = window.prompt('Editar nombre de unidad:', currentName);
    if (!newName || !newName.trim() || newName === currentName) return;

    updateData((draft) => {
      const d = draft.find((x) => x.id === selectedDivId);
      if (d) {
        const b = d.brigadas.find((x) => x.id === brigId);
        if (b && b.columnas && b.columnas[colIdx]) {
          b.columnas[colIdx][uIdx] = newName.trim();
          b.unidades = b.columnas.flat();
        }
      }
    });
  };

  const handleDeleteUnit = (brigId: string, colIdx: number, uIdx: number) => {
    if (!window.confirm('¿Eliminar esta unidad del organigrama?')) return;
    updateData((draft) => {
      const d = draft.find((x) => x.id === selectedDivId);
      if (d) {
        const b = d.brigadas.find((x) => x.id === brigId);
        if (b && b.columnas && b.columnas[colIdx]) {
          b.columnas[colIdx].splice(uIdx, 1);
          b.unidades = b.columnas.flat();
        }
      }
    });
  };

  const handleMoveUnitInColumn = (brigId: string, colIdx: number, uIdx: number, dir: 'up' | 'down') => {
    updateData((draft) => {
      const d = draft.find((x) => x.id === selectedDivId);
      if (d) {
        const b = d.brigadas.find((x) => x.id === brigId);
        if (b && b.columnas && b.columnas[colIdx]) {
          const col = b.columnas[colIdx];
          if (dir === 'up' && uIdx > 0) {
            [col[uIdx - 1], col[uIdx]] = [col[uIdx], col[uIdx - 1]];
          } else if (dir === 'down' && uIdx < col.length - 1) {
            [col[uIdx + 1], col[uIdx]] = [col[uIdx], col[uIdx + 1]];
          }
          b.unidades = b.columnas.flat();
        }
      }
    });
  };

  const handleAddColumnToBrigade = (brigId: string) => {
    updateData((draft) => {
      const d = draft.find((x) => x.id === selectedDivId);
      if (d) {
        const b = d.brigadas.find((x) => x.id === brigId);
        if (b) {
          if (!b.columnas) b.columnas = [];
          b.columnas.push([]);
        }
      }
    });
  };

  const handleAddBrigade = () => {
    const nombre = window.prompt('Nombre de la nueva Brigada / Agrupamiento:');
    if (!nombre || !nombre.trim()) return;

    const newId = nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newBrig: Brigada = {
      id: newId,
      nombre: nombre.trim(),
      tipo: 'BRIGADA',
      alias: '',
      sede: selectedDiv?.cuartelGeneral || 'Perú',
      creacion: 'Nueva Unidad',
      resena: `Unidad táctica y operativa perteneciente a la ${selectedDiv?.nombre || 'División de Ejército'}.`,
      escudo: selectedDiv?.escudo || '/assets/divisiones/escudo_default.png',
      columnas: [[], [], []],
      unidades: [],
      language: {
        es: { nombre: nombre.trim(), resena: '' },
        en: { nombre: nombre.trim(), resena: '' },
        qu: { nombre: nombre.trim(), resena: '' },
      },
    };

    updateData((draft) => {
      const d = draft.find((x) => x.id === selectedDivId);
      if (d) {
        d.brigadas.push(newBrig);
      }
    });
    setSelectedBrigId(newId);
    setEditorSubTab('brigadas');
  };

  const handleDeleteBrigade = (brigId: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar esta brigada de la división?`)) return;
    updateData((draft) => {
      const d = draft.find((x) => x.id === selectedDivId);
      if (d) {
        d.brigadas = d.brigadas.filter((x) => x.id !== brigId);
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Divisions Selector Bar */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap flex-shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-400 mr-2 flex items-center gap-1.5">
            <Building className="w-4 h-4" /> División:
          </span>
          {divisionesList.map((d) => (
            <button
              key={d.id}
              onClick={() => {
                setSelectedDivId(d.id);
                setSelectedBrigId('');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                selectedDivId === d.id
                  ? 'bg-emerald-600 text-white shadow-lg scale-105 ring-1 ring-emerald-400'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{d.id}</span>
              <span className="hidden md:inline font-bold text-[11px] opacity-80">({d.nombre.split(' ')[0]})</span>
            </button>
          ))}
        </div>

        {/* Subtab Toggle (División vs Brigadas) */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
          <button
            onClick={() => setEditorSubTab('division')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              editorSubTab === 'division' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Datos División</span>
          </button>
          <button
            onClick={() => setEditorSubTab('brigadas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              editorSubTab === 'brigadas' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Brigadas ({brigadasList.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 kiosk-scroll bg-[#030A06]">
        {editorSubTab === 'division' && selectedDiv && (
          /* ======================================================== */
          /* FORMULARIO DE EDICIÓN DE LA DIVISIÓN SELECCIONADA        */
          /* ======================================================== */
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-emerald-500/40 p-2 flex items-center justify-center shadow-inner">
                    {selectedDiv.escudo ? (
                      <img src={selectedDiv.escudo} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <Shield className="w-6 h-6 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                      ID: {selectedDiv.id} • Gran Unidad
                    </span>
                    <h3 className="text-xl font-black text-white">{selectedDiv.nombre}</h3>
                  </div>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
                    Nombre Oficial
                  </label>
                  <input
                    type="text"
                    value={selectedDiv.nombre}
                    onChange={(e) => handleUpdateDivField('nombre', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
                    Cuartel General (Sede)
                  </label>
                  <input
                    type="text"
                    value={selectedDiv.cuartelGeneral || ''}
                    onChange={(e) => handleUpdateDivField('cuartelGeneral', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
                    Jurisdicción / Cobertura
                  </label>
                  <input
                    type="text"
                    value={selectedDiv.jurisdiccion || ''}
                    onChange={(e) => handleUpdateDivField('jurisdiccion', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
                    Ruta Escudo / Imagen
                  </label>
                  <input
                    type="text"
                    value={selectedDiv.escudo || ''}
                    onChange={(e) => handleUpdateDivField('escudo', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Reseña Histórica Multilingüe */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> Reseña Histórica de la División
                  </label>
                  {/* Language Tab Switcher */}
                  <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
                    {(['es', 'en', 'qu'] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => setActiveLangTab(l)}
                        className={`px-3 py-1 rounded-lg text-xs font-black uppercase transition-all ${
                          activeLangTab === l ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={6}
                  value={selectedDiv.language?.[activeLangTab]?.resena || (activeLangTab === 'es' ? selectedDiv.resena : '')}
                  onChange={(e) => handleUpdateDivLangResena(activeLangTab, e.target.value)}
                  placeholder={`Escribe la reseña histórica en ${activeLangTab.toUpperCase()}...`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-100 leading-relaxed focus:border-emerald-500 focus:outline-none font-normal"
                />
              </div>
            </div>
          </div>
        )}

        {editorSubTab === 'brigadas' && (
          /* ======================================================== */
          /* EDITOR DE BRIGADAS Y SUS ORGANIGRAMAS POR COLUMNAS       */
          /* ======================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full animate-fade-in">
            {/* Columna Izquierda: Lista de Brigadas */}
            <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-4 flex flex-col space-y-3 shadow-xl max-h-[78vh]">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  Brigadas ({brigadasList.length})
                </span>
                <button
                  onClick={handleAddBrigade}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nueva</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar brigada..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Brigades List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 kiosk-scroll">
                {filteredBrigadas.map((b) => {
                  const isSelected = selectedBrigada?.id === b.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBrigId(b.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                        isSelected
                          ? 'bg-emerald-950/70 border-emerald-500/60 shadow-lg'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 p-1 flex items-center justify-center flex-shrink-0">
                          {b.escudo ? (
                            <img src={b.escudo} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <Shield className="w-4 h-4 text-emerald-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-black text-white truncate leading-snug">{b.nombre}</h4>
                          <p className="text-[10px] text-slate-400 truncate">{b.sede || 'Sede sin definir'}</p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isSelected ? 'text-emerald-400 translate-x-1' : ''}`} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Columna Derecha: Detalle de Brigada y Editor de Organigrama por Columnas */}
            <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-y-auto max-h-[78vh] kiosk-scroll space-y-6">
              {selectedBrigada ? (
                <>
                  {/* Header Brigada */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-emerald-500/40 p-2 flex items-center justify-center shadow-inner">
                        {selectedBrigada.escudo ? (
                          <img src={selectedBrigada.escudo} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <Shield className="w-6 h-6 text-emerald-400" />
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                          {selectedBrigada.tipo || 'BRIGADA'} • {selectedBrigada.id}
                        </span>
                        <h3 className="text-xl font-black text-white">{selectedBrigada.nombre}</h3>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteBrigade(selectedBrigada.id)}
                      className="p-2 rounded-xl text-red-400 hover:bg-red-950/40 border border-red-500/30 text-xs font-bold flex items-center gap-1.5"
                      title="Eliminar esta brigada"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Eliminar</span>
                    </button>
                  </div>

                  {/* Formulario de Campos */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                        Nombre de la Brigada
                      </label>
                      <input
                        type="text"
                        value={selectedBrigada.nombre}
                        onChange={(e) => handleUpdateBrigField(selectedBrigada.id, 'nombre', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                        Lema / Alias Honorífico
                      </label>
                      <input
                        type="text"
                        value={selectedBrigada.alias || ''}
                        onChange={(e) => handleUpdateBrigField(selectedBrigada.id, 'alias', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                        Sede / Fuerte / Cuartel
                      </label>
                      <input
                        type="text"
                        value={selectedBrigada.sede || ''}
                        onChange={(e) => handleUpdateBrigField(selectedBrigada.id, 'sede', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Reseña de la Brigada */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> Reseña Histórica
                      </label>
                      <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 gap-1">
                        {(['es', 'en', 'qu'] as const).map((l) => (
                          <button
                            key={l}
                            onClick={() => setActiveLangTab(l)}
                            className={`px-2.5 py-0.5 rounded text-[11px] font-black uppercase transition-all ${
                              activeLangTab === l ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      rows={4}
                      value={selectedBrigada.language?.[activeLangTab]?.resena || (activeLangTab === 'es' ? selectedBrigada.resena : '')}
                      onChange={(e) => handleUpdateBrigLangResena(selectedBrigada.id, activeLangTab, e.target.value)}
                      placeholder={`Escribe la reseña histórica de la brigada en ${activeLangTab.toUpperCase()}...`}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-100 leading-relaxed focus:border-emerald-500 focus:outline-none font-normal"
                    />
                  </div>

                  {/* ======================================================== */}
                  {/* ORGANIGRAMA: COLUMNAS DE UNIDADES SUBORDINADAS           */}
                  {/* ======================================================== */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Columns className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-black uppercase tracking-widest text-white">
                          Organigrama Subordinado (Columnas Oficiales)
                        </h4>
                      </div>
                      <button
                        onClick={() => handleAddColumnToBrigade(selectedBrigada.id)}
                        className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold border border-slate-700 shadow"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar Columna</span>
                      </button>
                    </div>

                    {/* Columns Layout Container */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-2">
                      {(selectedBrigada.columnas || [selectedBrigada.unidades || []]).map((col, colIdx) => (
                        <div
                          key={colIdx}
                          className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-3 flex flex-col space-y-2.5 shadow-lg"
                        >
                          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                              Columna {colIdx + 1} ({col.length})
                            </span>
                            <button
                              onClick={() => handleAddUnitToColumn(selectedBrigada.id, colIdx)}
                              className="p-1 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 hover:text-white text-[10px] font-bold flex items-center gap-0.5"
                              title="Agregar unidad en esta columna"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Units Stack inside Column */}
                          <div className="space-y-2 flex-1">
                            {col.map((uNombre, uIdx) => (
                              <div
                                key={uIdx}
                                className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 flex items-center justify-between gap-2 shadow-sm group hover:border-slate-700"
                              >
                                <span className="text-[11px] font-bold text-slate-100 flex-1 leading-snug">
                                  {uNombre}
                                </span>
                                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 flex-shrink-0">
                                  <button
                                    onClick={() => handleMoveUnitInColumn(selectedBrigada.id, colIdx, uIdx, 'up')}
                                    disabled={uIdx === 0}
                                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                                    title="Subir"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleMoveUnitInColumn(selectedBrigada.id, colIdx, uIdx, 'down')}
                                    disabled={uIdx === col.length - 1}
                                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                                    title="Bajar"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleEditUnitName(selectedBrigada.id, colIdx, uIdx)}
                                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-300"
                                    title="Editar nombre"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUnit(selectedBrigada.id, colIdx, uIdx)}
                                    className="p-1 rounded hover:bg-red-950/60 text-slate-400 hover:text-red-400"
                                    title="Eliminar unidad"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}

                            {col.length === 0 && (
                              <div className="text-center py-4 text-[10px] text-slate-600 italic">
                                Columna vacía. Toca + para agregar unidades.
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-20 text-slate-500 text-xs">
                  Selecciona una brigada de la lista para editar sus datos y organigrama.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
