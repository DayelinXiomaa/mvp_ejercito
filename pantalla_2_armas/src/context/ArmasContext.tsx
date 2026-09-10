import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import initialArmasData from '../data/armas_servicios.json';
import { CMS_URL, api } from '../admin/api';

export interface ElementoSimbologia {
  id: string;
  nombre: string;
  descripcion: string;
  imagen?: string;
  orden: number;
}

export interface PersonajeHistorico {
  id: string;
  nombre: string;
  tipo: 'HEROE' | 'FALLECIDO_EN_ACCION';
  rango?: string;
  fecha?: string;
  conflicto?: string;
  fotografia: string;
  resena: string;
  hechoHistorico?: string;
  orden: number;
  publicado: boolean;
  language?: {
    es?: { nombre?: string; rango?: string; conflicto?: string; resena?: string; hechoHistorico?: string };
    en?: { nombre?: string; rango?: string; conflicto?: string; resena?: string; hechoHistorico?: string };
    qu?: { nombre?: string; rango?: string; conflicto?: string; resena?: string; hechoHistorico?: string };
  };
}

export interface SeccionConfig {
  id: 'identidad' | 'mision_empleo' | 'patrono_historia' | 'escudo_simbologia' | 'heroes_fallecidos';
  label: string;
  activa: boolean;
  orden: number;
}

export interface GaleriaItem {
  url: string;
  caption: string;
}

export interface PptSlide {
  tipo: string;
  label: string;
  imagen: string;
}

export interface ArmaLanguage {
  nombre: string;
  lema: string;
  mision: string;
  empleo: string;
  origen: string;
  patronoResena: string;
  escudoResena: string;
  motivo: string;
  vivo: string;
  colorDescripcion?: string;
  capacidades?: string[];
}

export interface ArmaServicio {
  id: string;
  slug: string;
  nombre: string;
  nombreCorto: string;
  tipo: 'ARMA' | 'SERVICIO';
  descripcionBreve: string;
  estado: 'PUBLICADO' | 'BORRADOR' | 'OCULTO';
  orden: number;

  // Lema único
  lema: string;

  // Color distintivo
  colorHex: string;
  colorNombre: string;
  colorDescripcion?: string;

  // Imágenes
  imagenPrincipal: string;
  imagenPortada: string;

  // Secciones
  secciones: SeccionConfig[];

  // Bloques de contenido
  escudo: {
    imagen: string;
    titulo: string;
    descripcion: string;
    significado: string;
    textoComplementario?: string;
    elementos: ElementoSimbologia[];
  };

  misionEmpleo: {
    mision: string;
    empleo: string;
    imagen: string;
    descripcionImagen?: string;
    capacidades?: string[];
  };

  patrono: {
    nombre: string;
    cargo: string;
    fotografia: string;
    biografia: string;
    fecha?: string;
    infoAdicional?: string;
  };

  origenHistorico: {
    titulo: string;
    texto: string;
    fecha?: string;
    imagen?: string;
    fuente?: string;
  };

  personajes: PersonajeHistorico[];
  galeria: GaleriaItem[];

  // Compatibilidad PPT y legacy
  ppt: PptSlide[];

  // i18n
  language: {
    es: ArmaLanguage;
    en: ArmaLanguage;
    qu: ArmaLanguage;
  };
}

interface ArmasContextType {
  armas: ArmaServicio[];
  selectedItem: ArmaServicio | null;
  setSelectedItem: (item: ArmaServicio | null) => void;
  activeFilter: 'TODOS' | 'ARMA' | 'SERVICIO';
  setActiveFilter: (filter: 'TODOS' | 'ARMA' | 'SERVICIO') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeSlide: number;
  setActiveSlide: (slide: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  showHeroesModal: boolean;
  setShowHeroesModal: (show: boolean) => void;
  activeVideo: { url: string; title: string } | null;
  setActiveVideo: (video: { url: string; title: string } | null) => void;
  updateArma: (updated: ArmaServicio) => Promise<boolean>;
  addArma: (newArma: ArmaServicio) => Promise<boolean>;
  deleteArma: (id: string) => Promise<boolean>;
  reloadContent: () => Promise<void>;
}

const ArmasContext = createContext<ArmasContextType | undefined>(undefined);

function buildPptSequence(escudoImg: string, patronoImg: string, heroImg: string): PptSlide[] {
  const slides: PptSlide[] = [
    { tipo: 'ESCUDO', label: 'Escudo Institucional', imagen: escudoImg },
    { tipo: 'PATRONO', label: 'Patrono Institucional', imagen: patronoImg },
  ];
  if (heroImg) {
    slides.push({ tipo: 'OPERATIVA', label: 'Empleo Operativo', imagen: heroImg });
  }
  return slides.filter((s) => Boolean(s.imagen));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeArmaItem(raw: any, fallbackTipo: 'ARMA' | 'SERVICIO' = 'ARMA', index: number = 0): ArmaServicio {
  const tipo = (raw.tipo === 'SERVICIO' || raw.tipo === 'Servicio' || fallbackTipo === 'SERVICIO') ? 'SERVICIO' : 'ARMA';
  const id = raw.id || raw.slug || (raw.nombre ? raw.nombre.toLowerCase().replace(/[^a-z0-9]/g, '') : `item-${index}`);
  const lema = raw.lema || raw.language?.es?.lema || '';

  const defaultSecciones: SeccionConfig[] = [
    { id: 'identidad', label: 'Identidad y Lema', activa: true, orden: 1 },
    { id: 'mision_empleo', label: 'Misión y Empleo / Función', activa: true, orden: 2 },
    { id: 'patrono_historia', label: 'Patrono y Origen Histórico', activa: true, orden: 3 },
    { id: 'escudo_simbologia', label: 'Escudo y Simbología', activa: true, orden: 4 },
    { id: 'heroes_fallecidos', label: 'Héroes y Fallecidos en Acción', activa: true, orden: 5 },
  ];

  const secciones = Array.isArray(raw.secciones) && raw.secciones.length > 0
    ? raw.secciones
    : defaultSecciones;

  // Escudo
  const escudoData = raw.escudo && typeof raw.escudo === 'object'
    ? {
        imagen: raw.escudo.imagen || raw.insignia || '',
        titulo: raw.escudo.titulo || `Escudo del ${raw.nombre || ''}`,
        descripcion: raw.escudo.descripcion || raw.escudoResena || '',
        significado: raw.escudo.significado || raw.escudoResena || '',
        textoComplementario: raw.escudo.textoComplementario || raw.motivoFecha || '',
        elementos: Array.isArray(raw.escudo.elementos) ? raw.escudo.elementos : [],
      }
    : {
        imagen: typeof raw.escudo === 'string' ? raw.escudo : raw.insignia || '',
        titulo: `Escudo del ${raw.nombre || ''}`,
        descripcion: raw.escudoResena || '',
        significado: raw.escudoResena || '',
        textoComplementario: raw.motivoFecha || '',
        elementos: [],
      };

  // Misión y Empleo
  const misionEmpleoData = raw.misionEmpleo && typeof raw.misionEmpleo === 'object'
    ? {
        mision: raw.misionEmpleo.mision || raw.mision || '',
        empleo: raw.misionEmpleo.empleo || raw.empleoTactico || (Array.isArray(raw.funciones) ? raw.funciones.join(' ') : ''),
        imagen: raw.misionEmpleo.imagen || raw.imagenEmpleo || raw.hero || '',
        descripcionImagen: raw.misionEmpleo.descripcionImagen || `Empleo táctico del ${raw.nombre || ''}`,
        capacidades: Array.isArray(raw.misionEmpleo.capacidades) ? raw.misionEmpleo.capacidades : (Array.isArray(raw.funciones) ? raw.funciones : []),
      }
    : {
        mision: raw.mision || '',
        empleo: raw.empleoTactico || (Array.isArray(raw.funciones) ? raw.funciones.join(' ') : ''),
        imagen: raw.imagenEmpleo || raw.hero || '',
        descripcionImagen: `Empleo táctico del ${raw.nombre || ''}`,
        capacidades: Array.isArray(raw.funciones) ? raw.funciones : [],
      };

  // Patrono
  const patronoData = raw.patrono && typeof raw.patrono === 'object'
    ? {
        nombre: raw.patrono.nombre || '',
        cargo: raw.patrono.cargo || raw.patrono.titulo || `Patrono del ${raw.nombre || ''}`,
        fotografia: raw.patrono.fotografia || raw.patrono.imagen || '',
        biografia: raw.patrono.biografia || raw.patrono.resena || '',
        fecha: raw.patrono.fecha || raw.fechaConmemorativa || '',
        infoAdicional: raw.patrono.infoAdicional || raw.motivoFecha || '',
      }
    : {
        nombre: typeof raw.patrono === 'string' ? raw.patrono : '',
        cargo: raw.patronoTitulo || `Patrono del ${raw.nombre || ''}`,
        fotografia: raw.patronoImagen || '',
        biografia: raw.patronoResena || '',
        fecha: raw.fechaConmemorativa || '',
        infoAdicional: raw.motivoFecha || '',
      };

  // Origen Histórico
  const origenData = raw.origenHistorico && typeof raw.origenHistorico === 'object'
    ? {
        titulo: raw.origenHistorico.titulo || 'Origen Histórico',
        texto: raw.origenHistorico.texto || raw.origen || '',
        fecha: raw.origenHistorico.fecha || raw.fechaConmemorativa || '',
        imagen: raw.origenHistorico.imagen || raw.hero || '',
        fuente: raw.origenHistorico.fuente || 'Ejército del Perú',
      }
    : {
        titulo: 'Origen Histórico',
        texto: raw.origen || '',
        fecha: raw.fechaConmemorativa || '',
        imagen: raw.hero || '',
        fuente: 'Ejército del Perú',
      };

  // Personajes / Héroes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawPersonajes = Array.isArray(raw.personajes) ? raw.personajes : (Array.isArray(raw.heroes) ? raw.heroes : []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const personajes: PersonajeHistorico[] = rawPersonajes.map((p: any, pIdx: number) => ({
    id: p.id || `per-${pIdx + 1}`,
    nombre: p.nombre || 'Personaje',
    tipo: p.tipo === 'FALLECIDO_EN_ACCION' ? 'FALLECIDO_EN_ACCION' : 'HEROE',
    rango: p.rango || p.titulo || '',
    fecha: p.fecha || '',
    conflicto: p.conflicto || '',
    fotografia: p.fotografia || p.imagen || '',
    resena: p.resena || '',
    hechoHistorico: p.hechoHistorico || '',
    orden: p.orden || pIdx + 1,
    publicado: p.publicado !== false,
    language: p.language || undefined,
  }));

  // Language support
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialArma = (initialArmasData.armas || []).find((x: any) => x.id === id) || (initialArmasData.servicios || []).find((x: any) => x.id === id);
  const langEs = raw.language?.es || {};
  const langEn = raw.language?.en || {};
  const langQu = raw.language?.qu || {};

  const cleanLema = lema.replace(/^[“"¡\s]+|[”"!\s]+$/g, '').trim();

  if (id === 'administrativo') {
    escudoData.imagen = '';
    patronoData.fotografia = '';
  }

  return {
    id,
    slug: raw.slug || id,
    nombre: raw.nombre || 'Arma / Servicio',
    nombreCorto: raw.nombreCorto || raw.tituloCorto || raw.nombre || '',
    tipo,
    descripcionBreve: raw.descripcionBreve || raw.motivoFecha || '',
    estado: raw.estado === 'BORRADOR' || raw.estado === 'OCULTO' ? raw.estado : 'PUBLICADO',
    orden: raw.orden || index + 1,
    lema: cleanLema,
    colorHex: raw.colorHex || raw.color || '#10b981',
    colorNombre: raw.colorNombre || raw.vivoColor || 'Verde',
    colorDescripcion: raw.colorDescripcion || `Color distintivo: ${raw.vivoColor || 'Verde'}`,
    imagenPrincipal: id === 'administrativo' ? '' : (raw.imagenPrincipal || escudoData.imagen || ''),
    imagenPortada: raw.imagenPortada || raw.hero || patronoData.fotografia || '',
    secciones,
    escudo: escudoData,
    misionEmpleo: misionEmpleoData,
    patrono: patronoData,
    origenHistorico: origenData,
    personajes,
    galeria: Array.isArray(raw.galeria) ? raw.galeria : [],
    ppt: buildPptSequence(escudoData.imagen, patronoData.fotografia, misionEmpleoData.imagen),
    language: {
      es: {
        nombre: langEs.nombre || raw.nombre || '',
        lema: (langEs.lema || cleanLema).replace(/^[“"¡\s]+|[”"!\s]+$/g, '').trim(),
        mision: langEs.mision || misionEmpleoData.mision,
        empleo: langEs.empleo || misionEmpleoData.empleo,
        origen: langEs.origen || origenData.texto,
        patronoResena: langEs.patronoResena || patronoData.biografia,
        escudoResena: langEs.escudoResena || escudoData.descripcion,
        motivo: langEs.motivo || raw.motivoFecha || '',
        vivo: langEs.vivo || raw.colorNombre || raw.vivoColor || '',
        colorDescripcion: langEs.colorDescripcion || raw.colorDescripcion || initialArma?.language?.es?.colorDescripcion,
        capacidades: (Array.isArray(langEs.capacidades) && langEs.capacidades.length > 0)
          ? langEs.capacidades
          : (Array.isArray(initialArma?.language?.es?.capacidades) && initialArma.language.es.capacidades.length > 0)
          ? initialArma.language.es.capacidades
          : misionEmpleoData.capacidades,
      },
      en: {
        nombre: langEn.nombre || raw.nombre || '',
        lema: (langEn.lema || cleanLema).replace(/^[“"¡\s]+|[”"!\s]+$/g, '').trim(),
        mision: langEn.mision || misionEmpleoData.mision,
        empleo: langEn.empleo || misionEmpleoData.empleo,
        origen: langEn.origen || origenData.texto,
        patronoResena: langEn.patronoResena || patronoData.biografia,
        escudoResena: langEn.escudoResena || escudoData.descripcion,
        motivo: langEn.motivo || raw.motivoFecha || '',
        vivo: langEn.vivo || raw.colorNombre || raw.vivoColor || '',
        colorDescripcion: langEn.colorDescripcion || initialArma?.language?.en?.colorDescripcion,
        capacidades: (Array.isArray(langEn.capacidades) && langEn.capacidades.length > 0)
          ? langEn.capacidades
          : (Array.isArray(initialArma?.language?.en?.capacidades) && initialArma.language.en.capacidades.length > 0)
          ? initialArma.language.en.capacidades
          : [],
      },
      qu: {
        nombre: langQu.nombre || raw.nombre || '',
        lema: (langQu.lema || cleanLema).replace(/^[“"¡\s]+|[”"!\s]+$/g, '').trim(),
        mision: langQu.mision || misionEmpleoData.mision,
        empleo: langQu.empleo || misionEmpleoData.empleo,
        origen: langQu.origen || origenData.texto,
        patronoResena: langQu.patronoResena || patronoData.biografia,
        escudoResena: langQu.escudoResena || escudoData.descripcion,
        motivo: langQu.motivo || raw.motivoFecha || '',
        vivo: langQu.vivo || raw.colorNombre || raw.vivoColor || '',
        colorDescripcion: langQu.colorDescripcion || initialArma?.language?.qu?.colorDescripcion,
        capacidades: (Array.isArray(langQu.capacidades) && langQu.capacidades.length > 0)
          ? langQu.capacidades
          : (Array.isArray(initialArma?.language?.qu?.capacidades) && initialArma.language.qu.capacidades.length > 0)
          ? initialArma.language.qu.capacidades
          : [],
      },
    },
  };
}

export function buildArmasFrom(raw: unknown): ArmaServicio[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = raw as { armas?: any[]; servicios?: any[] };
  const armasList = (data.armas || []).map((a, i) => normalizeArmaItem(a, 'ARMA', i));
  const serviciosList = (data.servicios || []).map((s, i) => normalizeArmaItem(s, 'SERVICIO', armasList.length + i));
  return [...armasList, ...serviciosList];
}

export const ArmasProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [armas, setArmas] = useState<ArmaServicio[]>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('cms_content_armas');
      if (local) {
        if (
          local.includes('Combatir directamente al enemigo') ||
          local.includes('Apoyar las operaciones mediante fuegos potentes') ||
          local.includes('Noériega') ||
          local.includes('Noévoa') ||
          !local.includes('fal-infanteria-89') ||
          !local.includes('fal_inf_1.png') ||
          !local.includes('fal_cab_1.png') ||
          !local.includes('fal_com_1.png') ||
          !local.includes('Administrar el asesoramiento y apoyo jurídico') ||
          !local.includes('Amarillo Oro') ||
          !local.includes('Azul turquesa') ||
          !local.includes('#4472C4') ||
          !local.includes('#203864') ||
          !local.includes('#A40000') ||
          !local.includes('#0000FF') ||
          !local.includes('#385723') ||
          !local.includes('#FF6600') ||
          !local.includes('#5F2987') ||
          local.includes('https://images.unsplash.com/photo-1508614589041-895b88991e3e') ||
          local.includes('escudo_servicio_administrativo.jpg')
        ) {
          localStorage.removeItem('cms_content_armas');
        } else {
          try {
            return buildArmasFrom(JSON.parse(local));
          } catch {}
        }
      }
    }
    return buildArmasFrom(initialArmasData);
  });
  const [selectedItem, setSelectedItem] = useState<ArmaServicio | null>(null);
  const [activeFilter, setActiveFilter] = useState<'TODOS' | 'ARMA' | 'SERVICIO'>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [showHeroesModal, setShowHeroesModal] = useState<boolean>(false);
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);

  // Reiniciar al cambiar de ítem seleccionado
  useEffect(() => {
    setActiveSlide(0);
    setShowHeroesModal(false);
    setActiveVideo(null);
  }, [selectedItem?.id]);

  const nextSlide = () => setActiveSlide((prev) => (prev < 2 ? prev + 1 : 0));
  const prevSlide = () => setActiveSlide((prev) => (prev > 0 ? prev - 1 : 2));

  const reloadContent = async () => {
    try {
      const res = await fetch(`${CMS_URL}/api/content/armas`);
      if (res.ok) {
        const remote = await res.json();
        if (remote && (remote.armas || remote.servicios)) {
          const parsed = buildArmasFrom(remote);
          setArmas(parsed);
          localStorage.setItem('cms_content_armas', JSON.stringify(remote));
          if (selectedItem) {
            const updatedSelected = parsed.find((p) => p.id === selectedItem.id);
            if (updatedSelected) setSelectedItem(updatedSelected);
          }
          return;
        }
      }
    } catch {
      // Ignorar errores de red en fallback
    }

    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('cms_content_armas');
      if (local) {
        try {
          const parsed = buildArmasFrom(JSON.parse(local));
          setArmas(parsed);
          if (selectedItem) {
            const updatedSelected = parsed.find((p) => p.id === selectedItem.id);
            if (updatedSelected) setSelectedItem(updatedSelected);
          }
        } catch {}
      }
    }
  };

  useEffect(() => {
    reloadContent();
  }, []);

  const saveToBackend = async (newArmasList: ArmaServicio[]) => {
    const payload = {
      armas: newArmasList.filter((i) => i.tipo === 'ARMA'),
      servicios: newArmasList.filter((i) => i.tipo === 'SERVICIO'),
    };
    localStorage.setItem('cms_content_armas', JSON.stringify(payload));
    setArmas(newArmasList);
    try {
      await api.saveContent('armas', payload);
      return true;
    } catch {
      return true; // Still successful in local application storage
    }
  };

  const updateArma = async (updated: ArmaServicio): Promise<boolean> => {
    const newList = armas.map((a) => (a.id === updated.id ? updated : a));
    if (selectedItem?.id === updated.id) {
      setSelectedItem(updated);
    }
    return saveToBackend(newList);
  };

  const addArma = async (newArma: ArmaServicio): Promise<boolean> => {
    const newList = [...armas, newArma];
    return saveToBackend(newList);
  };

  const deleteArma = async (id: string): Promise<boolean> => {
    const newList = armas.filter((a) => a.id !== id);
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
    return saveToBackend(newList);
  };

  return (
    <ArmasContext.Provider
      value={{
        armas,
        selectedItem,
        setSelectedItem,
        activeFilter,
        setActiveFilter,
        searchQuery,
        setSearchQuery,
        activeSlide,
        setActiveSlide,
        nextSlide,
        prevSlide,
        showHeroesModal,
        setShowHeroesModal,
        activeVideo,
        setActiveVideo,
        updateArma,
        addArma,
        deleteArma,
        reloadContent,
      }}
    >
      {children}
    </ArmasContext.Provider>
  );
};

export const useArmas = () => {
  const ctx = useContext(ArmasContext);
  if (!ctx) throw new Error('useArmas must be used within ArmasProvider');
  return ctx;
};
