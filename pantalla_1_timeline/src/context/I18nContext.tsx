import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import langData from '../data/languages.json';
import type { SupportedLanguage } from '../config/kioskConfig';
import { CMS_URL } from '../admin/api';

export type Translations = (typeof langData)['es'];
const SYNC_CHANNEL_NAME = 'ejercito_kiosk_sync';

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('es');
  const [remote, setRemote] = useState<Record<string, Translations> | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Cargar traducciones remotas del CMS (es/en/qu) con fallback al JSON local
  useEffect(() => {
    let active = true;
    fetch(`${CMS_URL}/api/languages/timeline`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: unknown) => {
        if (active && data) setRemote(data as Record<string, Translations>);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'SET_LANGUAGE' && payload) {
          setLanguageState(payload as SupportedLanguage);
        }
      };

      return () => {
        channelRef.current = null;
        channel.close();
      };
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (channelRef.current) {
      channelRef.current.postMessage({ type: 'SET_LANGUAGE', payload: lang });
    }
  };

  const base = langData as Record<string, Translations>;
  const baseLang = base[language] || base['es'];
  const remoteLang = remote?.[language];
  const translations: Translations = { ...baseLang, ...(remoteLang || {}) };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t: translations }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};

