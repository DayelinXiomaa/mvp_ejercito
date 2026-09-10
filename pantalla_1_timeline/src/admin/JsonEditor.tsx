import React, { useState } from 'react';
import {
  Search,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';

interface JsonEditorProps {
  value: unknown;
  onChange: (v: unknown) => void;
  depth?: number;
  searchQuery?: string;
  parentKey?: string;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  depth = 0,
  searchQuery = '',
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const effectiveSearch = (depth === 0 ? localSearch : searchQuery).toLowerCase().trim();

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (value === null || value === undefined) {
    return <span className="text-slate-500 text-xs italic">null</span>;
  }

  // ARRAY RENDERING
  if (Array.isArray(value)) {
    const totalItems = value.length;

    return (
      <div className={`rounded-2xl p-3 bg-slate-950/80 border border-slate-800/80 my-1 ${depth > 0 ? 'ml-2 pl-3 border-l-2 border-l-emerald-500/40' : ''}`}>
        {depth === 0 && (
          <div className="sticky top-0 z-20 bg-slate-950 p-2.5 rounded-xl border border-emerald-500/30 mb-3 shadow-lg flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar dentro de todos los elementos, claves o textos..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => setCollapsed(false)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold"
                title="Expandir todo"
              >
                Expandir
              </button>
              <button
                onClick={() => setCollapsed(true)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold"
                title="Colapsar todo"
              >
                Colapsar
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-1.5 text-xs font-black uppercase text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>Lista [{totalItems} elementos]</span>
          </button>
          <button
            onClick={() => onChange([...value, ''])}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold shadow transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir Elemento</span>
          </button>
        </div>

        {!collapsed && (
          <div className="space-y-2">
            {value.map((item, i) => {
              // If searching, check if item matches
              const itemStr = JSON.stringify(item).toLowerCase();
              if (effectiveSearch && !itemStr.includes(effectiveSearch)) {
                return null;
              }

              // Extract a readable title for the card if it's an object
              let previewTitle = `Elemento #${i + 1}`;
              if (item && typeof item === 'object') {
                const o = item as Record<string, unknown>;
                previewTitle = String(o.nombre || o.title || o.nombreCorto || o.id || `Ítem #${i + 1}`);
                if (o.year) previewTitle = `[${o.year}] ${previewTitle}`;
              }

              return (
                <div
                  key={i}
                  className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 shadow-md hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 mb-2">
                    <span className="text-[11px] font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/20 truncate max-w-md">
                      #{i + 1} • {previewTitle}
                    </span>
                    <button
                      onClick={() => {
                        if (window.confirm(`¿Eliminar elemento #${i + 1}?`)) {
                          const next = [...value];
                          next.splice(i, 1);
                          onChange(next);
                        }
                      }}
                      className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                      title="Eliminar este elemento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <JsonEditor
                    value={item}
                    onChange={(v) => {
                      const next = [...value];
                      next[i] = v;
                      onChange(next);
                    }}
                    depth={depth + 1}
                    searchQuery={effectiveSearch}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // OBJECT RENDERING
  if (typeof value === 'object') {
    const keys = Object.keys(value as Record<string, unknown>);

    return (
      <div className={`rounded-2xl p-3 bg-slate-900/60 border border-slate-800/80 my-1 ${depth > 0 ? 'ml-2 pl-3 border-l-2 border-l-emerald-500/30' : ''}`}>
        {depth === 0 && (
          <div className="sticky top-0 z-20 bg-slate-950 p-2.5 rounded-xl border border-emerald-500/30 mb-3 shadow-lg flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar campos o textos en este objeto..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => setCollapsed(false)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold"
              >
                Expandir
              </button>
              <button
                onClick={() => setCollapsed(true)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold"
              >
                Colapsar
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-1.5 text-xs font-black uppercase text-slate-300 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>Objeto ({keys.length} campos)</span>
          </button>
        </div>

        {!collapsed && (
          <div className="space-y-3">
            {keys.map((k) => {
              const val = (value as Record<string, unknown>)[k];
              const valStr = JSON.stringify(val).toLowerCase();
              const kLower = k.toLowerCase();
              if (effectiveSearch && !kLower.includes(effectiveSearch) && !valStr.includes(effectiveSearch)) {
                return null;
              }

              const isPrimitive = typeof val !== 'object' || val === null;

              return (
                <div key={k} className={`p-2 rounded-xl ${isPrimitive ? 'bg-slate-950/60 border border-slate-800/60' : ''}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider font-mono">
                      {k}
                    </span>
                    {typeof val === 'string' && val.length > 0 && (
                      <button
                        onClick={() => handleCopy(val, k)}
                        className="text-[10px] text-slate-500 hover:text-emerald-400 flex items-center gap-1"
                        title="Copiar texto"
                      >
                        {copiedKey === k ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                  <JsonEditor
                    value={val}
                    onChange={(v) => onChange({ ...(value as Record<string, unknown>), [k]: v })}
                    depth={depth + 1}
                    searchQuery={effectiveSearch}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // BOOLEAN
  if (typeof value === 'boolean') {
    return (
      <label className="flex items-center gap-2 cursor-pointer py-1">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 accent-emerald-500 cursor-pointer rounded"
        />
        <span className="text-xs font-bold text-slate-300">{value ? 'Activado (true)' : 'Desactivado (false)'}</span>
      </label>
    );
  }

  // NUMBER
  if (typeof value === 'number') {
    return (
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
      />
    );
  }

  // STRING
  const str = String(value);
  const isImage = /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(str);
  const isLong = str.length > 80 || str.includes('\n');

  if (isLong) {
    return (
      <textarea
        rows={3}
        value={str}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white leading-relaxed focus:border-emerald-500 focus:outline-none"
      />
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isImage && str && (
        <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-700 overflow-hidden flex-shrink-0">
          <img
            src={str}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      <input
        type="text"
        value={str}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
      />
    </div>
  );
};
