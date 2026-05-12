'use client';

import { useEffect, useRef } from 'react';
import { useFiltersStore } from '@/store/filters';

/**
 * Restaura el scroll del listado cuando montas el componente, y guarda la
 * posición continuamente. Esto cumple el requisito:
 *
 *   «Al volver desde una página de detalle al listado, deberá mantenerse el
 *    estado previo de la interfaz: filtros seleccionados, texto del buscador,
 *    estado general del listado.»
 *
 * Nota: usamos `requestAnimationFrame` para esperar a que el navegador haya
 * pintado las filas, si no `scrollTo` no funcionaría (la altura aún sería 0).
 */
export function useRestoreScroll(isReady: boolean): void {
  const savedY = useFiltersStore((s) => s.listScrollY);
  const setScroll = useFiltersStore((s) => s.setListScrollY);
  const restoredRef = useRef(false);

  // Restaurar
  useEffect(() => {
    if (!isReady || restoredRef.current) return;
    restoredRef.current = true;
    requestAnimationFrame(() => {
      window.scrollTo({ top: savedY, behavior: 'instant' as ScrollBehavior });
    });
  }, [isReady, savedY]);

  // Persistir mientras el componente está montado.
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScroll(window.scrollY);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [setScroll]);
}
