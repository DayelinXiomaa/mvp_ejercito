import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import initialData from '../data/terrorismo.json';
import initialPeriodicos from '../data/archivos_periodisticos.json';
import { CMS_URL } from '../admin/api';

export type MainSection = 'HUB' | 'SENDERO_LUMINOSO' | 'MRTA' | 'OPERACIONES' | 'CRONOLOGIA' | 'ARCHIVOS_PERIODISTICOS';

export interface ArchivoPeriodistico {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string;
  imagen: string;
  fuente: string;
  coleccion: string;
}

export interface MultilingualText {
  es: string;
  en: string;
  qu: string;
}

export interface PhotoItem {
  url: string;
  alt: string;
  description: MultilingualText;
}

export interface TerrorismoTopic {
  id: string;
  page: number;
  slide_image: string;
  embedded_images: string[];
  photos?: PhotoItem[];
  title: MultilingualText;
  content: MultilingualText;
}

export interface OperacionItem extends TerrorismoTopic {
  target: 'Sendero Luminoso' | 'MRTA';
  period: string;
  subcategory: string;
  year: string;
}

export interface SectionData<T> {
  id: string;
  title: MultilingualText;
  subtitle: MultilingualText;
  cover_image: string;
  topics?: T[];
  items?: T[];
}

export interface TerrorismoData {
  sendero_luminoso: SectionData<TerrorismoTopic> & { topics: TerrorismoTopic[] };
  mrta: SectionData<TerrorismoTopic> & { topics: TerrorismoTopic[] };
  operaciones: SectionData<OperacionItem> & { items: OperacionItem[] };
}

interface TerrorismoContextType {
  data: TerrorismoData;
  setData: (d: TerrorismoData) => void;
  currentSection: MainSection;
  setCurrentSection: (s: MainSection) => void;
  selectedTopicIndex: number;
  setSelectedTopicIndex: (idx: number) => void;
  selectedOp: OperacionItem | null;
  setSelectedOp: (op: OperacionItem | null) => void;
  opTargetFilter: string;
  setOpTargetFilter: (f: string) => void;
  opPeriodFilter: string;
  setOpPeriodFilter: (p: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  fullscreenImage: { url: string; alt?: string; description?: string } | null;
  setFullscreenImage: (img: { url: string; alt?: string; description?: string } | null) => void;
  navigateTopic: (direction: 'next' | 'prev') => void;
  archivosPeriodisticos: ArchivoPeriodistico[];
  setArchivosPeriodisticos: (items: ArchivoPeriodistico[]) => void;
  selectedArchivoPeriodistico: ArchivoPeriodistico | null;
  setSelectedArchivoPeriodistico: (item: ArchivoPeriodistico | null) => void;
}

const TerrorismoContext = createContext<TerrorismoContextType | undefined>(undefined);

export const TerrorismoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<TerrorismoData>(initialData as unknown as TerrorismoData);
  const [currentSection, setCurrentSection] = useState<MainSection>('HUB');
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number>(0);
  const [selectedOp, setSelectedOp] = useState<OperacionItem | null>(null);
  const [opTargetFilter, setOpTargetFilter] = useState<string>('TODOS');
  const [opPeriodFilter, setOpPeriodFilter] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fullscreenImage, setFullscreenImage] = useState<{ url: string; alt?: string; description?: string } | null>(null);
  const [archivosPeriodisticos, setArchivosPeriodisticos] = useState<ArchivoPeriodistico[]>(initialPeriodicos as unknown as ArchivoPeriodistico[]);
  const [selectedArchivoPeriodistico, setSelectedArchivoPeriodistico] = useState<ArchivoPeriodistico | null>(null);

  // Sync with CMS remote if available
  useEffect(() => {
    let active = true;
    fetch(`${CMS_URL}/api/content/terrorismo`)
      .then((r) => (r.ok ? r.json() : null))
      .then((remote: unknown) => {
        if (active && remote && (remote as TerrorismoData).sendero_luminoso) {
          setData(remote as TerrorismoData);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const navigateTopic = (direction: 'next' | 'prev') => {
    let list: TerrorismoTopic[] = [];
    if (currentSection === 'SENDERO_LUMINOSO') {
      list = data.sendero_luminoso.topics;
    } else if (currentSection === 'MRTA') {
      list = data.mrta.topics;
    }
    if (!list.length) return;

    if (direction === 'next') {
      setSelectedTopicIndex((prev) => (prev < list.length - 1 ? prev + 1 : 0));
    } else {
      setSelectedTopicIndex((prev) => (prev > 0 ? prev - 1 : list.length - 1));
    }
  };

  return (
    <TerrorismoContext.Provider
      value={{
        data,
        setData,
        currentSection,
        setCurrentSection,
        selectedTopicIndex,
        setSelectedTopicIndex,
        selectedOp,
        setSelectedOp,
        opTargetFilter,
        setOpTargetFilter,
        opPeriodFilter,
        setOpPeriodFilter,
        searchQuery,
        setSearchQuery,
        fullscreenImage,
        setFullscreenImage,
        navigateTopic,
        archivosPeriodisticos,
        setArchivosPeriodisticos,
        selectedArchivoPeriodistico,
        setSelectedArchivoPeriodistico,
      }}
    >
      {children}
    </TerrorismoContext.Provider>
  );
};

export const useTerrorismo = () => {
  const ctx = useContext(TerrorismoContext);
  if (!ctx) throw new Error('useTerrorismo must be used within TerrorismoProvider');
  return ctx;
};
