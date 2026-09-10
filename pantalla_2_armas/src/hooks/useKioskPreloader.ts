import { useEffect, useState } from 'react';
import type { ArmaServicio } from '../context/ArmasContext';

export function useKioskPreloader(armas: ArmaServicio[]) {
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  useEffect(() => {
    if (!armas || armas.length === 0) return;

    // Recolectar todas las URLs únicas de imágenes de la pantalla
    const urls = new Set<string>();

    armas.forEach((arma) => {
      if (arma.imagenPrincipal) urls.add(arma.imagenPrincipal);
      if (arma.imagenPortada) urls.add(arma.imagenPortada);
      if (arma.escudo?.imagen) urls.add(arma.escudo.imagen);
      if (arma.patrono?.fotografia) urls.add(arma.patrono.fotografia);
      if (arma.misionEmpleo?.imagen) urls.add(arma.misionEmpleo.imagen);

      (arma.personajes || []).forEach((p) => {
        if (p.fotografia) urls.add(p.fotografia);
      });

      (arma.galeria || []).forEach((g) => {
        if (g.url) urls.add(g.url);
      });
    });

    const urlList = Array.from(urls).filter((u) => u && !u.startsWith('data:'));
    setTotalCount(urlList.length);

    if (urlList.length === 0) {
      setIsComplete(true);
      return;
    }

    let loaded = 0;
    const CONCURRENCY = 6;
    let index = 0;

    const loadNext = async () => {
      while (index < urlList.length) {
        const currentUrl = urlList[index++];
        try {
          // 1. Fetch para que el Service Worker lo guarde en CacheStorage
          await fetch(currentUrl, { mode: 'no-cors' }).catch(() => {});

          // 2. Pre-decodificar en memoria de imagen
          const img = new Image();
          img.src = currentUrl;
          if (img.decode) {
            await img.decode().catch(() => {});
          }
        } catch {
          // Ignorar fallos individuales para no bloquear el lote
        } finally {
          loaded++;
          setLoadedCount(loaded);
        }
      }
    };

    const workers = Array.from({ length: Math.min(CONCURRENCY, urlList.length) }, () => loadNext());

    Promise.all(workers).then(() => {
      setIsComplete(true);
      console.log(`[Kiosk Preloader] Precargadas exitosamente ${urlList.length} imágenes en caché.`);
    });
  }, [armas]);

  return { loadedCount, totalCount, isComplete };
}
