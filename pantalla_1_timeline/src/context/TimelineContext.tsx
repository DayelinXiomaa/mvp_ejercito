import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import initialEvents from '../data/timeline.json';
import { CMS_URL } from '../admin/api';

export interface TimelineEvent {
  id: number;
  year: number;
  month: string;
  displayDate?: string;
  actionText?: string;
  title: string;
  subtitle: string;
  thumbnail: string;
  image: string;
  gallery: string[];
  audio?: string;
  video?: string;
  description: string;
  location: string;
  category: string;
  hero: string;
  coordinates: { lat: number; lng: number };
  language: {
    es: { title: string; subtitle: string; description: string; actionText?: string };
    en: { title: string; subtitle: string; description: string; actionText?: string };
    qu: { title: string; subtitle: string; description: string; actionText?: string };
  };
}

export interface YearRange {
  key: string;
  label: string;
  from: number | null;
  to: number | null;
}

export const YEAR_RANGES: YearRange[] = [
  { key: 'TODOS', label: 'Todos los Hitos', from: null, to: null },
  { key: '1821-1879', label: '1821 – 1879', from: 1821, to: 1879 },
  { key: '1880-1900', label: '1880 – 1900', from: 1880, to: 1900 },
  { key: '1901-1950', label: '1901 – 1950', from: 1901, to: 1950 },
  { key: '1951-1980', label: '1951 – 1980', from: 1951, to: 1980 },
  { key: '1981-2000', label: '1981 – 2000', from: 1981, to: 2000 },
  { key: 'ACTUALIDAD', label: 'Actualidad', from: 2001, to: null },
];

export function eventBelongsToRange(ev: TimelineEvent, range: YearRange): boolean {
  if (range.from === null) return true;
  if (ev.id === 0) return true;
  if (ev.year < range.from) return false;
  if (range.to !== null && ev.year > range.to) return false;
  return true;
}

export interface ActiveVideo {
  url: string;
  title: string;
  event?: TimelineEvent;
}

interface TimelineContextType {
  events: TimelineEvent[];
  selectedEvent: TimelineEvent | null;
  setSelectedEvent: (ev: TimelineEvent | null) => void;
  activeVideo: ActiveVideo | null;
  setActiveVideo: (video: ActiveVideo | null) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  activeRange: string;
  setActiveRange: (range: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  cmsOpen: boolean;
  setCmsOpen: (open: boolean) => void;
  addEvent: (ev: Omit<TimelineEvent, 'id'>) => void;
  updateEvent: (ev: TimelineEvent) => void;
  deleteEvent: (id: number) => void;
}

const TimelineContext = createContext<TimelineContextType | undefined>(undefined);

export const TimelineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<TimelineEvent[]>(initialEvents as TimelineEvent[]);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [activeVideo, setActiveVideo] = useState<ActiveVideo | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('TODOS');
  const [activeRange, setActiveRange] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cmsOpen, setCmsOpen] = useState<boolean>(false);

  // Cargar contenido remoto del CMS si el servidor está disponible (fallback: JSON local)
  useEffect(() => {
    let active = true;
    fetch(`${CMS_URL}/api/content/timeline`)
      .then((r) => (r.ok ? r.json() : null))
      .then((remote: unknown) => {
        const arr = (remote as { events?: unknown } | null)?.events;
        if (active && Array.isArray(arr) && arr.length > 0) {
          setEvents(arr as TimelineEvent[]);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const addEvent = (newEvent: Omit<TimelineEvent, 'id'>) => {
    const nextId = events.length > 0 ? Math.max(...events.map((e) => e.id)) + 1 : 1;
    const created = { ...newEvent, id: nextId };
    setEvents((prev) => [...prev, created].sort((a, b) => a.year - b.year));
  };

  const updateEvent = (updated: TimelineEvent) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e)).sort((a, b) => a.year - b.year)
    );
  };

  const deleteEvent = (id: number) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    if (selectedEvent?.id === id) setSelectedEvent(null);
  };

  return (
    <TimelineContext.Provider
      value={{
        events,
        selectedEvent,
        setSelectedEvent,
        activeVideo,
        setActiveVideo,
        activeCategory,
        setActiveCategory,
        activeRange,
        setActiveRange,
        searchQuery,
        setSearchQuery,
        cmsOpen,
        setCmsOpen,
        addEvent,
        updateEvent,
        deleteEvent,
      }}
    >
      {children}
    </TimelineContext.Provider>
  );
};

export const useTimeline = () => {
  const ctx = useContext(TimelineContext);
  if (!ctx) throw new Error('useTimeline must be used within TimelineProvider');
  return ctx;
};
