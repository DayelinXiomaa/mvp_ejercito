import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Copy,
  Check,
  Languages,
  Filter,
  AlertCircle,
  Columns,
  ListFilter,
  CheckCircle2,
} from 'lucide-react';

interface TranslationsVisualEditorProps {
  value: unknown;
  onChange: (newValue: unknown) => void;
}

type ViewMode = 'comparative' | 'es' | 'en' | 'qu';

export const TranslationsVisualEditor: React.FC<TranslationsVisualEditorProps> = ({
  value,
  onChange,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('comparative');
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New Key Modal state
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEs, setNewKeyEs] = useState('');
  const [newKeyEn, setNewKeyEn] = useState('');
  const [newKeyQu, setNewKeyQu] = useState('');
  const [addError, setAddError] = useState('');

  // Cast and safeguard data
  const data = useMemo(() => {
    const raw = (value && typeof value === 'object' ? value : {}) as Record<string, Record<string, string>>;
    return {
      es: raw.es && typeof raw.es === 'object' ? raw.es : {},
      en: raw.en && typeof raw.en === 'object' ? raw.en : {},
      qu: raw.qu && typeof raw.qu === 'object' ? raw.qu : {},
    };
  }, [value]);

  // Extract union of all keys across languages
  const allKeys = useMemo(() => {
    const keySet = new Set<string>();
    Object.keys(data.es).forEach((k) => keySet.add(k));
    Object.keys(data.en).forEach((k) => keySet.add(k));
    Object.keys(data.qu).forEach((k) => keySet.add(k));
    return Array.from(keySet).sort();
  }, [data]);

  // Categories helper
  const getCategory = (k: string): string => {
    if (k.startsWith('app_') || k.startsWith('attract_')) return 'app';
    if (k.startsWith('section_') || k.includes('topic') || k.includes('op_')) return 'section';
    if (k.startsWith('btn_') || k === 'close') return 'buttons';
    if (k.startsWith('filter_') || k.includes('search')) return 'filters';
    if (k.startsWith('slide_') || k.startsWith('tap_') || k.includes('media') || k.includes('photo')) return 'media';
    return 'other';
  };

  const categories = [
    { id: 'all', label: 'Todos', count: allKeys.length },
    { id: 'app', label: 'App / Portada', count: allKeys.filter((k) => getCategory(k) === 'app').length },
    { id: 'section', label: 'Secciones', count: allKeys.filter((k) => getCategory(k) === 'section').length },
    { id: 'buttons', label: 'Botones / UI', count: allKeys.filter((k) => getCategory(k) === 'buttons').length },
    { id: 'filters', label: 'Filtros y Búsqueda', count: allKeys.filter((k) => getCategory(k) === 'filters').length },
    { id: 'media', label: 'Multimedia / Visor', count: allKeys.filter((k) => getCategory(k) === 'media').length },
    { id: 'other', label: 'Otros', count: allKeys.filter((k) => getCategory(k) === 'other').length },
  ];

  // Helper to check if key has missing translations
  const isPending = (k: string) => {
    const es = (data.es[k] || '').trim();
    const en = (data.en[k] || '').trim();
    const qu = (data.qu[k] || '').trim();
    return !en || !qu || !es;
  };

  const pendingCount = useMemo(() => {
    return allKeys.filter(isPending).length;
  }, [allKeys, data]);

  // Filtered keys
  const filteredKeys = useMemo(() => {
    return allKeys.filter((k) => {
      // Category filter
      if (categoryFilter !== 'all' && getCategory(k) !== categoryFilter) {
        return false;
      }

      // Pending filter
      if (showOnlyPending && !isPending(k)) {
        return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const kMatch = k.toLowerCase().includes(q);
        const esMatch = (data.es[k] || '').toLowerCase().includes(q);
        const enMatch = (data.en[k] || '').toLowerCase().includes(q);
        const quMatch = (data.qu[k] || '').toLowerCase().includes(q);
        if (!kMatch && !esMatch && !enMatch && !quMatch) {
          return false;
        }
      }

      return true;
    });
  }, [allKeys, categoryFilter, showOnlyPending, search, data]);

  // Update a single translation entry
  const handleUpdate = (lang: 'es' | 'en' | 'qu', keyName: string, text: string) => {
    const updated = {
      ...data,
      [lang]: {
        ...data[lang],
        [keyName]: text,
      },
    };
    onChange(updated);
  };

  // Delete a translation key across all languages
  const handleDeleteKey = (keyName: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar la clave de traducción "${keyName}" en todos los idiomas?`)) {
      return;
    }
    const newEs = { ...data.es };
    const newEn = { ...data.en };
    const newQu = { ...data.qu };
    delete newEs[keyName];
    delete newEn[keyName];
    delete newQu[keyName];

    onChange({
      es: newEs,
      en: newEn,
      qu: newQu,
    });
  };

  // Add a new translation key
  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedKey = newKeyName.trim().toLowerCase().replace(/\s+/g, '_');
    if (!formattedKey) {
      setAddError('Por favor ingresa un nombre para la clave.');
      return;
    }
    if (allKeys.includes(formattedKey)) {
      setAddError('Esta clave ya existe.');
      return;
    }

    onChange({
      es: { ...data.es, [formattedKey]: newKeyEs },
      en: { ...data.en, [formattedKey]: newKeyEn },
      qu: { ...data.qu, [formattedKey]: newKeyQu },
    });

    setNewKeyName('');
    setNewKeyEs('');
    setNewKeyEn('');
    setNewKeyQu('');
    setAddError('');
    setIsAddingKey(false);
  };

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Header Controls */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 space-y-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Left: Title & Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
              <Languages className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black uppercase text-emerald-300">
                {allKeys.length} Claves de Traducción
              </span>
            </div>

            {pendingCount > 0 ? (
              <button
                onClick={() => setShowOnlyPending(!showOnlyPending)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  showOnlyPending
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                    : 'bg-amber-950/40 text-amber-300 border-amber-500/30 hover:bg-amber-900/40'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{pendingCount} Pendientes</span>
              </button>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% Traducido</span>
              </span>
            )}
          </div>

          {/* Right: View Mode & Add Key Button */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Buttons */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
              <button
                onClick={() => setViewMode('comparative')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'comparative'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Ver Español, Inglés y Quechua lado a lado"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Comparativo (3 Columnas)</span>
              </button>
              <button
                onClick={() => setViewMode('es')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                  viewMode === 'es'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Ver sólo Español"
              >
                ES
              </button>
              <button
                onClick={() => setViewMode('en')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                  viewMode === 'en'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Ver sólo Inglés"
              >
                EN
              </button>
              <button
                onClick={() => setViewMode('qu')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                  viewMode === 'qu'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Ver sólo Quechua"
              >
                QU
              </button>
            </div>

            <button
              onClick={() => {
                setIsAddingKey(true);
                setAddError('');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Clave</span>
            </button>
          </div>
        </div>

        {/* Search & Category Filter bar */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por clave o texto en cualquier idioma..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
            <span className="text-[10px] font-bold text-slate-500 uppercase mr-1 flex items-center gap-1">
              <ListFilter className="w-3 h-3" /> Categoría:
            </span>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryFilter(c.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                  categoryFilter === c.id
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800/80'
                }`}
              >
                {c.label} ({c.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal / Panel: Agregar Nueva Clave */}
      {isAddingKey && (
        <div className="p-4 bg-slate-900 border-b border-emerald-500/40 animate-fade-in flex-shrink-0">
          <form onSubmit={handleCreateKey} className="max-w-4xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Agregar Nueva Clave de Traducción
              </h4>
              <button
                type="button"
                onClick={() => setIsAddingKey(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕ Cancelar
              </button>
            </div>

            {addError && (
              <div className="text-xs text-red-400 bg-red-950/50 border border-red-500/30 p-2 rounded-lg">
                {addError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Nombre de la clave (ID)
                </label>
                <input
                  type="text"
                  placeholder="ej. btn_confirmar"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">
                  Español (ES)
                </label>
                <input
                  type="text"
                  placeholder="Texto en español"
                  value={newKeyEs}
                  onChange={(e) => setNewKeyEs(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-sky-400 uppercase block mb-1">
                  Inglés (EN)
                </label>
                <input
                  type="text"
                  placeholder="Texto en inglés"
                  value={newKeyEn}
                  onChange={(e) => setNewKeyEn(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-amber-400 uppercase block mb-1">
                  Quechua (QU)
                </label>
                <input
                  type="text"
                  placeholder="Texto en quechua"
                  value={newKeyQu}
                  onChange={(e) => setNewKeyQu(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingKey(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase"
              >
                Guardar Clave
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Translation Cards List with Scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        {filteredKeys.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-900/40 rounded-2xl border border-slate-800/80">
            <Filter className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-sm font-bold text-slate-400">No se encontraron claves de traducción</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Prueba cambiando el filtro de categoría o limpiando el término de búsqueda.
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-3 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          filteredKeys.map((k) => {
            const valEs = data.es[k] || '';
            const valEn = data.en[k] || '';
            const valQu = data.qu[k] || '';

            const isEsLong = valEs.length > 70 || valEs.includes('\n');
            const isEnLong = valEn.length > 70 || valEn.includes('\n');
            const isQuLong = valQu.length > 70 || valQu.includes('\n');
            const isAnyLong = isEsLong || isEnLong || isQuLong;

            const missingEn = !valEn.trim();
            const missingQu = !valQu.trim();
            const missingEs = !valEs.trim();

            return (
              <div
                key={k}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3.5 shadow-md hover:border-slate-700 transition-all space-y-2.5"
              >
                {/* Header of Item */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-black text-emerald-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      {k}
                    </span>

                    <button
                      onClick={() => handleCopy(k, k)}
                      className="p-1 rounded text-slate-500 hover:text-emerald-400 transition-colors"
                      title="Copiar nombre de clave"
                    >
                      {copiedKey === k ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Pending tags */}
                    {missingEs && (
                      <span className="text-[10px] font-bold text-red-400 bg-red-950/60 border border-red-500/30 px-2 py-0.5 rounded-full">
                        Falta ES
                      </span>
                    )}
                    {missingEn && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        Falta EN
                      </span>
                    )}
                    {missingQu && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        Falta QU
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteKey(k)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                    title="Eliminar esta clave de todos los idiomas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Content / Inputs */}
                {viewMode === 'comparative' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* ES */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase text-emerald-400 flex items-center gap-1">
                          <span>🇵🇪 Español (ES)</span>
                        </label>
                      </div>
                      {isAnyLong ? (
                        <textarea
                          rows={2}
                          value={valEs}
                          onChange={(e) => handleUpdate('es', k, e.target.value)}
                          placeholder="Sin traducción en español..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white leading-relaxed focus:border-emerald-500 focus:outline-none"
                        />
                      ) : (
                        <input
                          type="text"
                          value={valEs}
                          onChange={(e) => handleUpdate('es', k, e.target.value)}
                          placeholder="Sin traducción en español..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none font-medium"
                        />
                      )}
                    </div>

                    {/* EN */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase text-sky-400 flex items-center gap-1">
                          <span>🇺🇸 English (EN)</span>
                        </label>
                      </div>
                      {isAnyLong ? (
                        <textarea
                          rows={2}
                          value={valEn}
                          onChange={(e) => handleUpdate('en', k, e.target.value)}
                          placeholder="Missing English translation..."
                          className={`w-full bg-slate-950 border rounded-xl p-2.5 text-xs text-white leading-relaxed focus:border-sky-500 focus:outline-none ${
                            missingEn ? 'border-amber-500/50 bg-amber-950/10' : 'border-slate-800'
                          }`}
                        />
                      ) : (
                        <input
                          type="text"
                          value={valEn}
                          onChange={(e) => handleUpdate('en', k, e.target.value)}
                          placeholder="Missing English translation..."
                          className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none font-medium ${
                            missingEn ? 'border-amber-500/50 bg-amber-950/10' : 'border-slate-800'
                          }`}
                        />
                      )}
                    </div>

                    {/* QU */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase text-amber-400 flex items-center gap-1">
                          <span>🇵🇪 Quechua (QU)</span>
                        </label>
                      </div>
                      {isAnyLong ? (
                        <textarea
                          rows={2}
                          value={valQu}
                          onChange={(e) => handleUpdate('qu', k, e.target.value)}
                          placeholder="Quechua willakuy mana kanchu..."
                          className={`w-full bg-slate-950 border rounded-xl p-2.5 text-xs text-white leading-relaxed focus:border-amber-500 focus:outline-none ${
                            missingQu ? 'border-amber-500/50 bg-amber-950/10' : 'border-slate-800'
                          }`}
                        />
                      ) : (
                        <input
                          type="text"
                          value={valQu}
                          onChange={(e) => handleUpdate('qu', k, e.target.value)}
                          placeholder="Quechua willakuy mana kanchu..."
                          className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none font-medium ${
                            missingQu ? 'border-amber-500/50 bg-amber-950/10' : 'border-slate-800'
                          }`}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  /* Single Language View */
                  <div className="space-y-2">
                    {/* Reference Source (ES) if viewing EN or QU */}
                    {viewMode !== 'es' && (
                      <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] font-black text-slate-500 uppercase block mb-0.5">
                          Referencia Original (Español):
                        </span>
                        <p className="text-xs text-slate-300 italic">{valEs || '(Sin texto en español)'}</p>
                      </div>
                    )}

                    <div>
                      <label className="text-[10px] font-black uppercase block mb-1 text-emerald-400">
                        Traducción en {viewMode === 'es' ? 'Español (ES)' : viewMode === 'en' ? 'Inglés (EN)' : 'Quechua (QU)'}:
                      </label>
                      {isAnyLong ? (
                        <textarea
                          rows={3}
                          value={viewMode === 'es' ? valEs : viewMode === 'en' ? valEn : valQu}
                          onChange={(e) => handleUpdate(viewMode, k, e.target.value)}
                          placeholder={`Escribe la traducción en ${viewMode.toUpperCase()}...`}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white leading-relaxed focus:border-emerald-500 focus:outline-none"
                        />
                      ) : (
                        <input
                          type="text"
                          value={viewMode === 'es' ? valEs : viewMode === 'en' ? valEn : valQu}
                          onChange={(e) => handleUpdate(viewMode, k, e.target.value)}
                          placeholder={`Escribe la traducción en ${viewMode.toUpperCase()}...`}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-medium"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
