import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { KIOSK_CONFIG } from '../config/kioskConfig';

export type KioskScreen = 'ATTRACT' | 'ACTIVE';
const SYNC_CHANNEL_NAME = 'ejercito_kiosk_sync';

interface KioskShellContextType {
  screen: KioskScreen;
  wakeUp: () => void;
  goToAttract: () => void;
  timeRemaining: number;
  highContrast: boolean;
  toggleHighContrast: () => void;
  largeText: boolean;
  toggleLargeText: () => void;
}

const KioskShellContext = createContext<KioskShellContextType | undefined>(undefined);

export const KioskShellProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [screen, setScreen] = useState<KioskScreen>('ATTRACT');
  const [timeRemaining, setTimeRemaining] = useState(KIOSK_CONFIG.INACTIVITY_TIMEOUT_SECONDS);
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'WAKE_UP') {
          setScreen('ACTIVE');
          setTimeRemaining(KIOSK_CONFIG.INACTIVITY_TIMEOUT_SECONDS);
        } else if (type === 'GOTO_ATTRACT') {
          setScreen('ATTRACT');
          setTimeRemaining(KIOSK_CONFIG.INACTIVITY_TIMEOUT_SECONDS);
        } else if (type === 'RESET_TIMER') {
          setTimeRemaining(KIOSK_CONFIG.INACTIVITY_TIMEOUT_SECONDS);
        } else if (type === 'SET_HIGH_CONTRAST') {
          setHighContrast(!!payload);
        } else if (type === 'SET_LARGE_TEXT') {
          setLargeText(!!payload);
        }
      };

      return () => {
        channelRef.current = null;
        channel.close();
      };
    }
  }, []);

  const resetTimer = useCallback((broadcast = true) => {
    setTimeRemaining(KIOSK_CONFIG.INACTIVITY_TIMEOUT_SECONDS);
    if (broadcast && channelRef.current) {
      channelRef.current.postMessage({ type: 'RESET_TIMER' });
    }
  }, []);

  const goToAttract = useCallback((broadcast = true) => {
    setScreen('ATTRACT');
    setTimeRemaining(KIOSK_CONFIG.INACTIVITY_TIMEOUT_SECONDS);
    if (broadcast && channelRef.current) {
      channelRef.current.postMessage({ type: 'GOTO_ATTRACT' });
    }
  }, []);

  const wakeUp = useCallback((broadcast = true) => {
    setScreen('ACTIVE');
    setTimeRemaining(KIOSK_CONFIG.INACTIVITY_TIMEOUT_SECONDS);
    if (broadcast && channelRef.current) {
      channelRef.current.postMessage({ type: 'WAKE_UP' });
    }
  }, []);

  const toggleHighContrast = useCallback(() => {
    setHighContrast((prev) => {
      const next = !prev;
      if (channelRef.current) {
        channelRef.current.postMessage({ type: 'SET_HIGH_CONTRAST', payload: next });
      }
      return next;
    });
  }, []);

  const toggleLargeText = useCallback(() => {
    setLargeText((prev) => {
      const next = !prev;
      if (channelRef.current) {
        channelRef.current.postMessage({ type: 'SET_LARGE_TEXT', payload: next });
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const handler = () => {
      if (screen === 'ACTIVE') resetTimer(true);
    };
    window.addEventListener('pointerdown', handler);
    window.addEventListener('touchstart', handler);
    return () => {
      window.removeEventListener('pointerdown', handler);
      window.removeEventListener('touchstart', handler);
    };
  }, [screen, resetTimer]);

  useEffect(() => {
    if (screen !== 'ACTIVE') return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          goToAttract(true);
          return KIOSK_CONFIG.INACTIVITY_TIMEOUT_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [screen, goToAttract]);

  // Auto-update checker
  const initialVersionRef = useRef<string | null>(null);

  const checkForUpdates = useCallback(async () => {
    try {
      const res = await fetch(`/version.json?_t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const serverVer = String(data.timestamp || data.version);
        if (!initialVersionRef.current) {
          initialVersionRef.current = serverVer;
        } else if (initialVersionRef.current !== serverVer) {
          console.log('[AutoUpdate] Nueva versión detectada:', serverVer, 'Recargando...');
          window.location.reload();
        }
      }
    } catch {
      // Ignorar fallas temporales de conexión
    }
  }, []);

  useEffect(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  useEffect(() => {
    if (screen === 'ATTRACT') {
      checkForUpdates();
      const interval = setInterval(checkForUpdates, 30000);
      return () => clearInterval(interval);
    }
  }, [screen, checkForUpdates]);

  return (
    <KioskShellContext.Provider
      value={{
        screen,
        wakeUp,
        goToAttract,
        timeRemaining,
        highContrast,
        toggleHighContrast,
        largeText,
        toggleLargeText,
      }}
    >
      {children}
    </KioskShellContext.Provider>
  );
};

export const useKioskShell = () => {
  const ctx = useContext(KioskShellContext);
  if (!ctx) throw new Error('useKioskShell must be used within KioskShellProvider');
  return ctx;
};

