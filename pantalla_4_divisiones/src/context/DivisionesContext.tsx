import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import initialDivisiones from '../data/divisiones.json';
import { CMS_URL } from '../admin/api';

export interface DivLanguage {
  nombre: string;
  resena: string;
}

export interface Brigada {
  id: string;
  nombre: string;
  tipo: string; // alias
  alias: string;
  sede: string;
  creacion?: string;
  imagen?: string;
  resena?: string;
  escudo?: string;
  unidades: string[];
  columnas?: string[][];
  language: {
    es: DivLanguage;
    en: DivLanguage;
    qu: DivLanguage;
  };
}

export interface Division {
  id: string;
  numero: string;
  nombre: string;
  cuartelGeneral: string;
  jurisdiccion: string;
  region: string;
  resena: string;
  unidadesDivisionarias: string[];
  organigrama_columnas?: string[][];
  escudo: string;
  color: string;
  lat: number;
  lng: number;
  brigadas: Brigada[];
  language: {
    es: DivLanguage;
    en: DivLanguage;
    qu: DivLanguage;
  };
}

export type DivisionTab = 'ORGANIGRAMA' | 'RESENA' | 'BRIGADAS';
export type ModalTab = 'TEXTO' | 'ORGANIGRAMA';

interface DivisionesContextType {
  divisiones: Division[];
  selectedDivision: Division | null;
  setSelectedDivision: (div: Division | null) => void;
  selectedBrigada: Brigada | null;
  setSelectedBrigada: (b: Brigada | null) => void;
  activeFilter: string;
  setActiveFilter: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeTab: DivisionTab;
  setActiveTab: (tab: DivisionTab) => void;
  modalHistory: Brigada[];
  modalTab: ModalTab;
  setModalTab: (tab: ModalTab) => void;
  pushModal: (b: Brigada) => void;
  popModal: () => void;
  closeAllModals: () => void;
}

const DivisionesContext = createContext<DivisionesContextType | undefined>(undefined);

const sanitizeText = (s?: unknown): string => {
  if (!s) return '';
  const str = typeof s === 'string' ? s : typeof s === 'object' && s !== null && 'nombre' in s ? (s as any).nombre : String(s);
  return str
    .replace(/COMAN[°º]DO/g, 'COMANDO')
    .replace(/COMUN[°º]ICACION[°º]ES/g, 'COMUNICACIONES')
    .replace(/COMUN[°º]ICACI[ÓO]N/g, 'COMUNICACIÓN')
    .replace(/IN[°º]GEN[°º]IER[ÍI]A/g, 'INGENIERÍA')
    .replace(/INGEN[°º]IER[ÍI]A/g, 'INGENIERÍA')
    .replace(/CON[°º]STRUCCI[ÓO]N[°º]?/g, 'CONSTRUCCIÓN')
    .replace(/IN[°º]F\b/g, 'INF')
    .replace(/ASEN[°º]TAMIEN[°º]TO/g, 'ASENTAMIENTO')
    .replace(/UN[°º]IDAD/g, 'UNIDAD')
    .replace(/AMAZON[°º]ÍA/g, 'AMAZONÍA')
    .replace(/AMAZONÍAs/g, 'AMAZONÍA')
    .replace(/MONTAN[°º]\s*A/g, 'MONTAÑA')
    .replace(/MONTAN[°º]A/g, 'MONTAÑA')
    .replace(/ANTIA[°º]REOs/g, 'ANTIAÉREOS')
    .replace(/ANTIA[°º]REO/g, 'ANTIAÉREO')
    .replace(/PROTECCI[ÓO]N[°º]/g, 'PROTECCIÓN')
    .replace(/DIVISI[ÓO]N[°º]/g, 'DIVISIÓN')
    .replace(/BRIGADA[°º]/g, 'BRIGADA')
    .replace(/BATALL[ÓO]N[°º]/g, 'BATALLÓN')
    .replace(/35ª?\s*BRIGADA\s*DE\s*SELVA/gi, '4ª Brig Selva de Protección a la Amazonía')
    .replace(/N[º°\.\s]+[º°\.\s]+/g, 'N° ')
    .replace(/(?<=N°\s)(?:[0-9][ª°º\s]*)+/g, (m: string) => m.replace(/[ª°º\s]/g, ''));
};

const normalizeEscudo = (path?: string, defaultFallback: string = ''): string => {
  if (!path) return defaultFallback;
  return path.replace(/\/assets\/DIVIS[^\s/"']+\//i, '/assets/divisiones/');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildDivs(raw: unknown): Division[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = raw as { divisiones: any[] };
  return (data.divisiones || []).map((d: any) => ({
    id: d.id,
    numero: String(d.numero),
    nombre: sanitizeText(d.nombre),
    cuartelGeneral: sanitizeText(d.sede),
    jurisdiccion: sanitizeText(d.cobertura),
    region: sanitizeText(d.region || ''),
    resena: d.resena || '',
    unidadesDivisionarias: (d.unidadesDivisionarias || []).map((u: any) => sanitizeText(u)),
    organigrama_columnas: d.organigrama_columnas
      ? d.organigrama_columnas.map((col: any[]) => col.map((u: any) => sanitizeText(u)))
      : undefined,
    escudo: normalizeEscudo(d.escudo, `/assets/divisiones/escudo_${d.id.toLowerCase()}.png`),
    color: d.color || '#10b981',
    lat: d.lat,
    lng: d.lng,
    brigadas: (d.brigadas || []).map((b: any) => ({
      id: b.id,
      nombre: sanitizeText(b.nombre),
      tipo: sanitizeText(b.tipo || b.alias),
      alias: sanitizeText(b.alias || ''),
      sede: sanitizeText(b.sede),
      creacion: b.creacion || '',
      imagen: b.imagen || '',
      resena: b.resena || '',
      escudo: normalizeEscudo(b.escudo, `/assets/divisiones/escudo_${b.id.toLowerCase()}.png`),
      unidades: (b.unidades || []).map((u: any) => sanitizeText(u)),
      columnas: (b.columnas || b.organigrama_columnas)
        ? (b.columnas || b.organigrama_columnas).map((col: any[]) => col.map((u: any) => sanitizeText(u)))
        : undefined,
      language: b.language || {
        es: { nombre: sanitizeText(b.nombre), resena: b.resena || '' },
        en: { nombre: sanitizeText(b.nombre), resena: b.resena || '' },
        qu: { nombre: sanitizeText(b.nombre), resena: b.resena || '' },
      },
    })),
    language: d.language || {
      es: { nombre: sanitizeText(d.nombre), resena: d.resena || '' },
      en: { nombre: sanitizeText(d.nombre), resena: d.resena || '' },
      qu: { nombre: sanitizeText(d.nombre), resena: d.resena || '' },
    },
  }));
}

export const DivisionesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [divisiones, setDivisiones] = useState<Division[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cms_content_divisiones_principal');
      if (saved) {
        if (
          saved.includes('/assets/DIVIS') ||
          saved.includes('DIVISIÓNes') ||
          saved.includes('COMAN°DO') ||
          saved.includes('1ª1ª6ª') ||
          saved.includes('IN°GEN') ||
          saved.includes('MONTAN°') ||
          saved.includes('35 BRIGADA') ||
          saved.includes('COMPAÑÍA COMANDO DE RECONOCIMIENTO') ||
          !saved.includes('agrup-art-jji') ||
          !saved.includes('batallon-policia-militar-115') ||
          !saved.includes('bis-pa-17') ||
          !saved.includes('Centinela del Cenepa') ||
          saved.includes('1ª BRIGADA DE SELVA DE PROT DE LA AMAZONÍA') ||
          (saved.includes('1-brig-servicios') && saved.includes('Centro de Municionamiento')) ||
          (saved.includes('6-brig-blind') && saved.includes('JUSTO ARIAS'))
        ) {
          localStorage.removeItem('cms_content_divisiones_principal');
        } else {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && (parsed.divisiones || Array.isArray(parsed))) {
              return buildDivs(parsed);
            }
          } catch {}
        }
      }
    }
    return buildDivs(initialDivisiones);
  });
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);
  const [selectedBrigada, setSelectedBrigada] = useState<Brigada | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<DivisionTab>('ORGANIGRAMA');
  const [modalHistory, setModalHistory] = useState<Brigada[]>([]);
  const [modalTab, setModalTab] = useState<ModalTab>('TEXTO');

  const pushModal = (b: Brigada) => {
    setModalHistory((prev) => [...prev, b]);
    setModalTab('TEXTO');
  };

  const popModal = () => {
    setModalHistory((prev) => {
      const next = prev.slice(0, -1);
      if (next.length > 0) {
        const parent = next[next.length - 1];
        if ((parent.unidades && parent.unidades.length > 0) || (parent.columnas && parent.columnas.length > 0)) {
          setModalTab('ORGANIGRAMA');
        } else {
          setModalTab('TEXTO');
        }
      }
      return next;
    });
  };

  const closeAllModals = () => {
    setModalHistory([]);
  };

  const handleSetSelectedDivision = (div: Division | null) => {
    setSelectedDivision(div);
    if (div) {
      setActiveTab('ORGANIGRAMA');
    }
  };

  // Cargar contenido remoto del CMS si el servidor está disponible (fallback: localStorage o JSON local)
  useEffect(() => {
    let active = true;
    fetch(`${CMS_URL}/api/content/divisiones`)
      .then((r) => (r.ok ? r.json() : null))
      .then((remote: unknown) => {
        if (active && remote && (remote as { divisiones?: unknown }).divisiones) {
          setDivisiones(buildDivs(remote));
          localStorage.setItem('cms_content_divisiones_principal', JSON.stringify(remote));
        }
      })
      .catch(() => {
        // En caso de no haber servidor backend, intentar cargar de localStorage
        const saved = localStorage.getItem('cms_content_divisiones_principal');
        if (saved && active) {
          try {
            setDivisiones(buildDivs(JSON.parse(saved)));
          } catch {}
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <DivisionesContext.Provider
      value={{
        divisiones,
        selectedDivision,
        setSelectedDivision: handleSetSelectedDivision,
        selectedBrigada,
        setSelectedBrigada,
        activeFilter,
        setActiveFilter,
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab,
        modalHistory,
        modalTab,
        setModalTab,
        pushModal,
        popModal,
        closeAllModals,
      }}
    >
      {children}
    </DivisionesContext.Provider>
  );
};

export const useDivisiones = () => {
  const ctx = useContext(DivisionesContext);
  if (!ctx) throw new Error('useDivisiones must be used within DivisionesProvider');
  return ctx;
};
