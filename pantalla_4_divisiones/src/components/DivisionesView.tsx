import React, { useState, useEffect } from 'react';
import { useDivisiones } from '../context/DivisionesContext';
import { useI18n } from '../context/I18nContext';
import { PeruMapDivisiones } from './PeruMapDivisiones';
import { Shield, ChevronRight, MapPin, FileText, Compass } from 'lucide-react';
import unitDatabase from '../data/unit_database.json';

const cleanEscudoPath = (p?: string): string | undefined => {
  if (!p) return undefined;
  return p.replace(/\/assets\/DIVIS[^\s/"']+\//i, '/assets/divisiones/');
};

const UnitShield: React.FC<{
  src?: string;
  className?: string;
  iconClass?: string;
  alt?: string;
}> = ({
  src,
  className = 'w-full h-full object-contain',
  iconClass = 'w-4 h-4 text-emerald-400',
  alt = '',
}) => {
    const [hasError, setHasError] = useState(false);
    const cleanSrc = cleanEscudoPath(src);

    useEffect(() => {
      setHasError(false);
    }, [src]);

    if (!cleanSrc || hasError) {
      return <Shield className={iconClass} />;
    }

    return (
      <img
        src={cleanSrc}
        alt={alt}
        className={className}
        onError={() => setHasError(true)}
      />
    );
  };

const cleanUnitName = (text: string) => {
  if (!text) return '';
  text = text.replace(/COMPAÑ[ÍI]ADE\b/gi, 'COMPAÑÍA DE ');
  const quoteMatch = text.match(/(«[^»]+»|“[^”]+”|"[^"]+")/);
  if (quoteMatch) {
    return text.replace(quoteMatch[0], '').replace(/\s+/g, ' ').trim();
  }
  return text.trim();
};

const renderUnitTitle = (text: string) => {
  const name = cleanUnitName(text);
  return (
    <div className="min-w-0 flex flex-col">
      <h5 className="text-[10.5px] md:text-[11px] font-extrabold text-white group-hover:text-emerald-300 transition-colors leading-tight tracking-tight">
        {name}
      </h5>
    </div>
  );
};

export const DivisionesView: React.FC = () => {
  const { selectedDivision, activeTab, setActiveTab, modalHistory, modalTab, pushModal } = useDivisiones();
  const { language } = useI18n();

  const divLang = selectedDivision?.language[language] || selectedDivision?.language.es;

  const activeModalBrigada = modalHistory[modalHistory.length - 1] || null;

  // Helper to find unit details in database (ignora sufijos entre paréntesis y variantes)
  const getUnitDbInfo = (name: string) => {
    // Quitar contenido entre paréntesis: "Batallón X N° 111 (Piura)" -> "Batallón X N° 111"
    const baseName = name.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
    const normKey = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const direct = (unitDatabase as any)[normKey] || (unitDatabase as any)[name] || (unitDatabase as any)[baseName];
    if (direct) return direct;

    // Normalización semántica de abreviaturas frecuentes
    const expandedKey = normKey
      .replace(/deingde/g, 'ingenierade')
      .replace(/deing/g, 'ingenierade')
      .replace(/ingde/g, 'ingenierade')
      .replace(/comunicacionesy/g, 'comunicacionesde')
      .replace(/blin/g, 'blindado')
      .replace(/inf/g, 'infanteriade')
      .replace(/infde/g, 'infanteriade')
      .replace(/infselva/g, 'infanteriadeselva')
      .replace(/tanques(\d+)/g, 'tanquesn$1');

    if ((unitDatabase as any)[expandedKey]) return (unitDatabase as any)[expandedKey];

    // Fallback por prefijo o inclusión de clave (evitando falsos positivos con claves genéricas o números distintos)
    const queryNum = name.match(/n[°º\s]*(\d+)/i)?.[1] || name.match(/\b(\d+)\b/)?.[1];
    const genericBadKeys = new Set(['compaa', 'compaia', 'batalln', 'batallon', 'batallnde', 'compaade', 'grupode', 'escuadrn', 'batera', 'comandode', 'unidad', 'ddee', 'aede']);
    for (const key of Object.keys(unitDatabase)) {
      const kl = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!kl || genericBadKeys.has(kl) || kl.length < 8) continue;
      if (kl === normKey || kl === expandedKey) {
        return (unitDatabase as any)[key];
      }
      // Si la consulta contiene un número específico de unidad, descartar claves con número diferente
      if (queryNum) {
        const keyNumMatch = kl.match(/n(\d+)/) || key.match(/\b(\d+)\b/);
        if (keyNumMatch && keyNumMatch[1] !== queryNum) continue;
      }
      if (kl.startsWith(normKey) || (normKey.startsWith(kl) && kl.length >= normKey.length * 0.85)) {
        return (unitDatabase as any)[key];
      }
    }
    // Fallback: buscar por coincidencia de tipo + número
    const numMatch = name.match(/(\d{2,3})/);
    const typeWords = name.match(/^(Batallón|Compañía|Grupo|Regimiento|Escuadrón|Agrupamiento|Comando|Escuela|Destacamento|Centro|Servicio|Batallon|Compania|Batalin)/i);
    if (numMatch && typeWords) {
      const typeNorm = typeWords[1].toLowerCase().replace(/[^a-z]/g, '');
      const n = numMatch[1];
      const best = { key: '', score: -1 };
      for (const key of Object.keys(unitDatabase)) {
        const kl = key.toLowerCase();
        if (!kl.includes(`n${n}`)) continue;
        // El tipo debe estar al inicio de la clave (o cerca)
        if (!kl.startsWith(typeNorm.slice(0, 5))) continue;
        // Puntaje: similitud con el query normalizado
        let score = 0;
        const qn = normKey;
        for (let i = 0; i < Math.min(qn.length, kl.length); i++) {
          if (qn[i] === kl[i]) score++;
          else break;
        }
        if (score > best.score) {
          best.key = key;
          best.score = score;
        }
      }
      if (best.key) return (unitDatabase as any)[best.key];
    }
    return null;
  };

  // Helper to open unit detail modal for ANY unit/brigade/regimiento
  const handleOpenUnitDetail = (nombre: string, alias: string = 'Unidad Orgánica', sede?: string, resenaCustom?: string, unidadesList?: string[], escudoCustom?: string) => {
    const dbInfo = getUnitDbInfo(nombre) as any;
    const finalResena = dbInfo?.resena || resenaCustom || `Unidad táctica y operativa perteneciente a la ${selectedDivision?.nombre || 'División de Ejército'}.`;
    const finalEscudo = escudoCustom || dbInfo?.escudo || selectedDivision?.escudo;
    const finalSede = dbInfo?.sede || sede || selectedDivision?.cuartelGeneral || 'Perú';
    const finalNombre = dbInfo?.nombre || nombre;
    const finalAlias = dbInfo?.alias || alias;
    const dbLang = dbInfo?.language;
    const langBase = { nombre: finalNombre, resena: finalResena };

    const rawUnidades = dbInfo?.unidades || unidadesList || [];
    const validUnidades = rawUnidades.filter(
      (u: string) => u && u.trim().toLowerCase() !== nombre.trim().toLowerCase() && u.trim().toLowerCase() !== finalNombre.trim().toLowerCase()
    );

    pushModal({
      id: nombre.toLowerCase().replace(/\s+/g, '-'),
      nombre: finalNombre,
      tipo: alias,
      alias: finalAlias,
      sede: finalSede,
      creacion: dbInfo?.creacion || 'Unidad Orgánica del Ejército',
      resena: finalResena,
      escudo: finalEscudo,
      unidades: validUnidades,
      language: dbLang || { es: langBase, en: langBase, qu: langBase },
    });
  };

  return (
    <div className="w-full h-full min-h-0 p-2 md:p-3 flex flex-col overflow-hidden">
      {selectedDivision ? (
        /* ===== VISTA DE DETALLE COMPLETA DE LA DIVISIÓN ===== */
        <div className="flex-1 min-h-0 bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-emerald-500/30 overflow-hidden shadow-2xl flex flex-col animate-fade-in">
          {/* Contenido Principal según Pestaña */}
          <div className="flex-1 p-6 overflow-y-auto kiosk-scroll bg-[#030A06]">
            {activeTab === 'ORGANIGRAMA' && (
              /* ===== ÁRBOL DE CONTENIDOS - ORGANIGRAMA DINÁMICO ESTILO PPT ===== */
              <div className="flex flex-col items-center justify-center py-2 w-full min-w-[850px] select-none">
                {/* Nivel 1: Nodo Raíz de la Gran Unidad */}
                <div
                  className="bg-gradient-to-r from-green-950 via-emerald-900 to-green-950 border-2 border-emerald-400 text-white px-7 py-3 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-4 max-w-xl text-left mb-4 relative group cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setActiveTab('RESENA')}
                >
                  <div className="w-7 h-7 rounded-full bg-slate-950 border border-emerald-400 p-1 flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
                    <UnitShield src={selectedDivision.escudo} className="w-5 h-5 object-contain" iconClass="w-4 h-4 text-emerald-300" />
                  </div>
                  <div>
                    <span className="bg-green-900/90 text-emerald-200 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-emerald-500/40">
                      CUARTEL GENERAL: {selectedDivision.cuartelGeneral}
                    </span>
                    <h3 className="text-base md:text-lg font-black text-white mt-0.5 leading-tight">{selectedDivision.nombre}</h3>
                  </div>
                </div>

                {/* Línea Tronco Principal Vertical */}
                <div className="w-1 h-5 bg-emerald-400/70" />

                {/* Rama Conectora Horizontal Estilo PPT */}
                <div className="w-[90%] h-1 bg-emerald-400/70" />

                {/* Nivel 2: Cajas Directas de Unidades y Brigadas organizadas en Columnas Oficiales (PPT) */}
                <div className="flex justify-center items-start gap-3 md:gap-4 w-full pt-3 overflow-x-auto no-scrollbar">
                  {selectedDivision.organigrama_columnas && selectedDivision.organigrama_columnas.length > 0 ? (
                    selectedDivision.organigrama_columnas.map((col, colIdx) => (
                      <div key={colIdx} className="flex flex-col items-center flex-1 min-w-[170px] max-w-[230px]">
                        <div className="w-1 h-4 bg-emerald-400/70 -mt-3 mb-1.5" />
                        <div className="w-full bg-slate-950/70 border border-emerald-500/30 p-2 rounded-2xl flex flex-col space-y-2 shadow-lg">
                          {col.map((itemText, itemIdx) => {
                            // Verificar si corresponde a una Brigada registrada en la división
                            const normItem = itemText.toLowerCase().replace(/[^a-z0-9]/g, '');
                            const isSubunit = normItem.includes('batallon') || normItem.includes('compania') || normItem.includes('compana') || normItem.includes('bateria') || normItem.includes('grupo') || normItem.includes('escuadron') || normItem.includes('regimiento') || normItem.includes('umar') || normItem.includes('unidadmilitar');

                            const matchingBrigada = isSubunit ? null : selectedDivision.brigadas.find((b) => {
                              const nb = b.nombre.toLowerCase().replace(/[^a-z0-9]/g, '');
                              const na = (b.alias || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                              const nid = b.id.toLowerCase().replace(/[^a-z0-9]/g, '');

                              if (nb.includes(normItem) || normItem.includes(nb)) return true;
                              if (na && (normItem === na || normItem.includes(na))) return true;
                              if (nid && (normItem === nid || normItem.includes(nid))) return true;

                              // Coincidencias clave por brigada explícita
                              if (normItem.includes('brig') || normItem.includes('agrupamiento')) {
                                if (normItem.includes('selva') && (normItem.includes('1brig') || normItem.includes('1ra') || normItem.includes('1a')) && b.id.includes('1-brig-selva')) return true;
                                if (normItem.includes('selva') && (normItem.includes('5brig') || normItem.includes('5ta') || normItem.includes('5a')) && b.id.includes('5-brig-selva')) return true;
                                if (normItem.includes('selva') && (normItem.includes('2brig') || normItem.includes('2da') || normItem.includes('2a')) && b.id.includes('2-brig-selva')) return true;
                                if (normItem.includes('selva') && (normItem.includes('4brig') || normItem.includes('4ta') || normItem.includes('4a')) && b.id.includes('4-brig-selva')) return true;
                                if (normItem.includes('artilleria') && (normItem.includes('jji') || normItem.includes('inclan')) && b.id.includes('jji')) return true;
                                if (normItem.includes('artilleria') && normItem.includes('bolognesi') && b.id.includes('bolognesi')) return true;
                                if (normItem.includes('antitanque') && b.id.includes('antitanque')) return true;
                                if (normItem.includes('cohetes') && b.id.includes('cohetes')) return true;
                                if (normItem.includes('olaya') && b.id.includes('olaya')) return true;
                                if (normItem.includes('ruizgallo') && b.id.includes('ruiz-gallo')) return true;
                                if ((normItem.includes('ffee') || (normItem.includes('fuerzas') && normItem.includes('especiales'))) && b.id.includes('ffee')) return true;
                                if (normItem.includes('coar') && b.id.includes('coar')) return true;
                                if (normItem.includes('aero') && b.id.includes('aero')) return true;
                              }

                              return false;
                            });

                            if (matchingBrigada) {
                              return (
                                <div
                                  key={itemIdx}
                                  onClick={() => pushModal(matchingBrigada)}
                                  className="w-full bg-green-950/90 border-2 border-emerald-500/50 hover:border-emerald-300 hover:scale-105 transition-all text-white p-2 px-2.5 rounded-xl shadow-xl cursor-pointer flex items-center gap-2.5 group touch-active"
                                >
                                  <div className="w-6 h-6 rounded-lg bg-slate-900 border border-emerald-400/60 p-0.5 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner">
                                    <UnitShield src={matchingBrigada.escudo} iconClass="w-3.5 h-3.5 text-emerald-400" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    {renderUnitTitle(matchingBrigada.nombre)}
                                  </div>
                                </div>
                              );
                            }

                            // Si es una Unidad Divisionaria / Batallón Directo
                            const dbInfo = getUnitDbInfo(itemText);
                            const unitEscudo = dbInfo?.escudo || selectedDivision.escudo;
                            return (
                              <div
                                key={itemIdx}
                                onClick={() =>
                                  handleOpenUnitDetail(
                                    itemText,
                                    selectedDivision.id === 'AE' ? 'Unidad de Apoyo' : 'Unidad Divisionaria',
                                    selectedDivision.cuartelGeneral,
                                    undefined,
                                    undefined,
                                    unitEscudo
                                  )
                                }
                                className="w-full bg-green-950/90 border-2 border-emerald-500/50 hover:border-emerald-300 hover:scale-105 transition-all text-white p-2 px-2.5 rounded-xl shadow-xl cursor-pointer flex items-center gap-2.5 group touch-active"
                              >
                                <div className="w-6 h-6 rounded-lg bg-slate-900 border border-emerald-400/60 p-0.5 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner">
                                  <UnitShield src={unitEscudo} iconClass="w-3.5 h-3.5 text-emerald-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  {renderUnitTitle(itemText)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    /* Fallback para divisiones sin columnas definidas */
                    <div className="grid grid-cols-4 gap-4 w-full pt-3">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-1 h-4 bg-emerald-400/70 -mt-3 mb-1" />
                        {selectedDivision.unidadesDivisionarias.map((ud, idx) => {
                          const dbInfo = getUnitDbInfo(ud);
                          const unitEscudo = dbInfo?.escudo || selectedDivision.escudo;
                          return (
                            <div
                              key={idx}
                              onClick={() =>
                                handleOpenUnitDetail(
                                  ud,
                                  selectedDivision.id === 'AE' ? 'Unidad de Apoyo' : 'Unidad Divisionaria Directa',
                                  selectedDivision.cuartelGeneral,
                                  undefined,
                                  undefined,
                                  unitEscudo
                                )
                              }
                              className="w-full bg-green-950/90 border-2 border-emerald-500/50 hover:border-emerald-300 hover:scale-105 transition-all text-white p-2 px-2.5 rounded-xl shadow-xl cursor-pointer flex items-center gap-2.5 group touch-active"
                            >
                              <div className="w-6 h-6 rounded-lg bg-slate-900 border border-emerald-400/60 p-0.5 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner">
                                <UnitShield src={unitEscudo} iconClass="w-3.5 h-3.5 text-emerald-400" />
                              </div>
                              <div className="min-w-0 flex-1">
                                {renderUnitTitle(ud)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {selectedDivision.brigadas.map((b) => (
                        <div key={b.id} className="flex flex-col items-center space-y-2">
                          <div className="w-1 h-4 bg-emerald-400/70 -mt-3 mb-1" />
                          <div
                            onClick={() => pushModal(b)}
                            className="w-full bg-green-950/90 border-2 border-emerald-500/50 hover:border-emerald-300 hover:scale-105 transition-all text-white p-2 px-2.5 rounded-xl shadow-xl cursor-pointer flex items-center gap-2.5 group touch-active"
                          >
                            <div className="w-6 h-6 rounded-lg bg-slate-900 border border-emerald-400/60 p-0.5 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner">
                              <UnitShield src={b.escudo} iconClass="w-3.5 h-3.5 text-emerald-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              {renderUnitTitle(b.nombre)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'RESENA' && (
              /* ===== RESEÑA HISTÓRICA DETALLADA DE LA DIVISIÓN (ESTILO TIMELINE: 2 COLUMNAS) ===== */
              <div className="max-w-5xl mx-auto my-auto flex items-center justify-center p-2">
                <div className="bg-slate-950/90 rounded-3xl border border-emerald-500/30 shadow-2xl overflow-hidden flex flex-col lg:flex-row w-full max-h-[82vh]">
                  {/* Columna Izquierda: Escudo Grande */}
                  <div className="w-full lg:w-5/12 p-8 flex flex-col items-center justify-center bg-gradient-to-b from-green-950/40 via-slate-950 to-slate-950 border-b lg:border-b-0 lg:border-r border-emerald-500/20 relative overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full" />
                    <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
                      <UnitShield
                        src={selectedDivision.escudo}
                        alt={selectedDivision.nombre}
                        className="max-w-full max-h-full object-contain drop-shadow-[0_0_35px_rgba(16,185,129,0.5)] animate-fade-in"
                        iconClass="w-32 h-32 text-emerald-400/50"
                      />
                    </div>
                    <div className="mt-6 text-center z-10 space-y-2">
                      <span className="bg-green-900/90 text-emerald-200 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/40 inline-block">
                        CUARTEL GENERAL: {selectedDivision.cuartelGeneral}
                      </span>
                      {selectedDivision.jurisdiccion && (
                        <p className="text-[11px] text-slate-300 font-bold">
                          Jurisdicción: {selectedDivision.jurisdiccion}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Columna Derecha: Reseña Histórica */}
                  <div className="w-full lg:w-7/12 p-6 lg:p-8 flex flex-col justify-between overflow-y-auto kiosk-scroll">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-emerald-900/80 text-emerald-200 text-xs font-black px-3 py-1 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                          DIVISIÓN DE EJÉRCITO
                        </span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black text-white mb-3 leading-tight">
                        {selectedDivision.nombre}
                      </h2>
                      <div className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-emerald-500/20 pb-2">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>Reseña Histórica</span>
                      </div>
                      <div className="space-y-3">
                        {((divLang?.resena || selectedDivision.resena || '')
                          .split(/\n\n+/)
                          .map((paragraph: string, pIdx: number) => (
                            <p key={pIdx} className="text-slate-100 text-sm md:text-base leading-relaxed font-normal text-justify">
                              {paragraph.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()}
                            </p>
                          )))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'BRIGADAS' && (
              /* ===== LISTADO DETALLADO DE BRIGADAS Y UNIDADES ===== */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedDivision.brigadas.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => pushModal(b)}
                    className="bg-slate-950/90 rounded-3xl border border-emerald-500/30 p-6 flex flex-col justify-between hover:border-emerald-400 hover:scale-[1.02] transition-all cursor-pointer shadow-xl group touch-active"
                  >
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-8 h-8 rounded-2xl bg-slate-900 border-2 border-emerald-400/60 p-1 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
                          <UnitShield src={b.escudo} className="w-full h-full object-contain drop-shadow" iconClass="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 inline-block mb-1">
                            {b.tipo || 'BRIGADA'}
                          </span>
                          {(() => {
                            const quoteMatch = b.nombre.match(/(«[^»]+»|“[^”]+”|"[^"]+")/);
                            if (quoteMatch) {
                              const quoted = quoteMatch[0];
                              const main = b.nombre.replace(quoted, '').replace(/\s+/g, ' ').trim();
                              return (
                                <>
                                  <h4 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors leading-snug">
                                    {main}
                                  </h4>
                                  <p className="text-xs text-emerald-300 font-extrabold truncate leading-tight mt-0.5">
                                    {quoted}
                                  </p>
                                </>
                              );
                            }
                            return (
                              <>
                                <h4 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors leading-snug">
                                  {b.nombre}
                                </h4>
                                {b.alias && (
                                  <p className="text-xs text-emerald-300 font-extrabold truncate leading-tight mt-0.5">
                                    “{b.alias}”
                                  </p>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400 mb-3 flex items-center gap-1.5 font-bold">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        Sede: {b.sede}
                      </p>

                      {(b.language?.[language]?.resena || b.resena) && (
                        <p className="text-[10px] text-slate-300 line-clamp-2 mb-4 leading-relaxed text-justify">
                          {b.language?.[language]?.resena || b.resena}
                        </p>
                      )}


                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-900 flex items-center justify-between text-[10px] font-black text-emerald-400 uppercase tracking-wider group-hover:text-white transition-colors">
                      <span>Ver Detalle de Brigada</span>
                      <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ===== VISTA PRINCIPAL: MAPA COMPLETO + TIRA DE DIVISIONES ===== */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mapa Completo del Perú (Maximizado a pantalla completa) */}
          <div className="flex-1 flex flex-col min-h-0 relative">
            <div className="mb-2 flex items-center justify-between px-2 z-20">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-full border border-emerald-500/30">
                <Compass className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '10s' }} />
                MAPA TÁCTICO DE DIVISIONES DE EJÉRCITO
              </span>
              <span className="text-[11px] text-slate-300 font-extrabold bg-slate-900/90 px-3 py-1.5 rounded-full border border-slate-700 shadow-md">
                Toca cualquier división en el mapa para ver su jurisdicción y organigrama
              </span>
            </div>
            <div className="flex-1 w-full h-full min-h-0">
              <PeruMapDivisiones />
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL DE DETALLE DE BRIGADA / UNIDAD (ESTILO TIMELINE CON RESEÑA EN 2 COLUMNAS Y BOTONERA INFERIOR) ===== */}
      {activeModalBrigada && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4 md:p-6 animate-fade-in">
          <div className="relative w-full max-w-5xl bg-slate-900 border-2 border-emerald-500/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Cuerpo del Modal según Pestaña */}
            <div className="flex-1 min-h-0 overflow-y-auto kiosk-scroll bg-[#030A06] flex flex-col">
              {modalTab === 'TEXTO' ? (
                /* ===== PESTAÑA 1: RESEÑA - 2 COLUMNAS (ESCUDO A LA IZQUIERDA Y TEXTO A LA DERECHA ESTILO TIMELINE) ===== */
                <div className="flex-1 flex flex-col lg:flex-row min-h-0">
                  {/* Columna Izquierda: Escudo de la Unidad / Brigada */}
                  <div className="w-full lg:w-5/12 p-6 lg:p-8 flex flex-col items-center justify-center bg-gradient-to-b from-green-950/40 via-slate-950 to-slate-950 border-b lg:border-b-0 lg:border-r border-emerald-500/20 relative overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full" />
                    <div className="relative w-44 h-44 md:w-56 md:h-56 flex items-center justify-center">
                      <UnitShield
                        src={activeModalBrigada.escudo}
                        alt={`Escudo ${activeModalBrigada.nombre}`}
                        className="max-w-full max-h-full object-contain drop-shadow-[0_0_35px_rgba(16,185,129,0.5)] animate-fade-in"
                        iconClass="w-32 h-32 text-emerald-400/50"
                      />
                    </div>
                  </div>

                  {/* Columna Derecha: Información y Reseña Detallada */}
                  <div className="w-full lg:w-7/12 p-6 lg:p-8 flex flex-col justify-between overflow-y-auto kiosk-scroll">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black text-white mb-3 leading-tight">
                        {activeModalBrigada.language?.[language]?.nombre || activeModalBrigada.nombre}
                      </h2>

                      {/* Sección Reseña */}
                      <div className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-emerald-500/20 pb-2">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>Reseña Histórica e Información Institucional</span>
                      </div>

                      <div className="space-y-3">
                        {((activeModalBrigada.language?.[language]?.resena || activeModalBrigada.resena || '')
                          .split(/\n\n+/)
                          .map((paragraph: string, pIdx: number) => (
                            <p key={pIdx} className="text-slate-100 text-sm md:text-[15px] leading-relaxed font-normal text-justify">
                              {paragraph.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()}
                            </p>
                          )))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ===== PESTAÑA 2: ORGANIGRAMA ESTRUCTURAL DEL SUBNIVEL (CABECERA OCULTA) ===== */
                <div className="flex-1 p-4 flex flex-col items-center justify-center w-full min-w-[650px] select-none">
                  {/* Nodo Raíz de la Brigada / Subunidad */}
                  <div className="bg-gradient-to-r from-green-950 via-emerald-900 to-green-950 border-2 border-emerald-400 text-white px-6 py-2.5 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center gap-3.5 max-w-lg text-left relative group">
                    <div className="w-6 h-6 rounded-lg bg-slate-950 border border-emerald-400 p-0.5 flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
                      <UnitShield src={activeModalBrigada.escudo} iconClass="w-3.5 h-3.5 text-emerald-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="bg-emerald-900/90 text-emerald-200 text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-emerald-500/40 inline-block mb-0.5">
                        SEDE: {activeModalBrigada.sede}
                      </span>
                      <h4 className="text-base md:text-lg font-black text-white mt-0.5 leading-tight">
                        {cleanUnitName(activeModalBrigada.nombre)}
                      </h4>
                    </div>
                  </div>

                  {/* Línea Tronco Principal Vertical */}
                  <div className="w-1 h-4 bg-emerald-400/70" />

                  {/* Rama Conectora Horizontal */}
                  <div className="w-[88%] h-1 bg-emerald-400/70" />

                  {/* Nodos de Unidades Subordinadas en Columnas Oficiales (PPT) */}
                  <div className="flex justify-center items-start gap-3 md:gap-4 w-full pt-3 overflow-x-auto no-scrollbar">
                    {activeModalBrigada.columnas && activeModalBrigada.columnas.length > 0 ? (
                      activeModalBrigada.columnas.map((col, colIdx) => (
                        <div key={colIdx} className="flex flex-col items-center flex-1 min-w-[160px] max-w-[220px]">
                          <div className="w-1 h-4 bg-emerald-400/70 -mt-3 mb-1.5" />
                          <div className="w-full bg-slate-950/70 border border-emerald-500/30 p-2 rounded-2xl flex flex-col space-y-2 shadow-lg">
                            {col.map((uNombre, uIdx) => {
                              const dbSubInfo = getUnitDbInfo(uNombre);
                              const subEscudo = dbSubInfo?.escudo || activeModalBrigada.escudo;
                              return (
                                <div
                                  key={uIdx}
                                  onClick={() =>
                                    handleOpenUnitDetail(
                                      uNombre,
                                      'Unidad Subordinada',
                                      activeModalBrigada.sede,
                                      dbSubInfo?.resena
                                    )
                                  }
                                  className="w-full bg-green-950/90 border-2 border-emerald-500/50 hover:border-emerald-300 hover:scale-105 transition-all text-white p-2 px-2.5 rounded-xl shadow-xl cursor-pointer flex items-center gap-2.5 group touch-active"
                                >
                                  <div className="w-6 h-6 rounded-lg bg-slate-900 border border-emerald-400/60 p-0.5 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner">
                                    <UnitShield src={subEscudo} iconClass="w-3.5 h-3.5 text-emerald-400" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    {renderUnitTitle(uNombre)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    ) : activeModalBrigada.unidades && activeModalBrigada.unidades.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full pt-3">
                        {activeModalBrigada.unidades.map((uNombre, idx) => {
                          const dbSubInfo = getUnitDbInfo(uNombre);
                          const subEscudo = dbSubInfo?.escudo || activeModalBrigada.escudo;
                          return (
                            <div key={idx} className="flex flex-col items-center">
                              <div className="w-1 h-3 bg-emerald-400/70 -mt-3 mb-1" />
                              <div
                                onClick={() =>
                                  handleOpenUnitDetail(
                                    uNombre,
                                    'Unidad Subordinada',
                                    activeModalBrigada.sede,
                                    dbSubInfo?.resena
                                  )
                                }
                                className="w-full bg-green-950/90 border-2 border-emerald-500/50 hover:border-emerald-300 hover:scale-105 transition-all text-white p-2 px-2.5 rounded-xl shadow-xl cursor-pointer flex items-center gap-2.5 group touch-active"
                              >
                                <div className="w-6 h-6 rounded-lg bg-slate-900 border border-emerald-400/60 p-0.5 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner">
                                  <UnitShield src={subEscudo} iconClass="w-3.5 h-3.5 text-emerald-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  {renderUnitTitle(uNombre)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="col-span-full text-center text-slate-400 text-xs py-6 font-bold bg-slate-950/60 rounded-2xl border border-slate-800">
                        Unidad táctica final sin subunidades orgánicas subordinadas registradas.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

