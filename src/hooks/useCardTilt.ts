'use client';

import { useEffect, useRef } from 'react';

/**
 * Tilt 3D orientado al puntero. Traduce la posición del cursor sobre la card a
 * cuatro variables CSS: `--tx`/`--ty` (-1..1, rotación) y `--mx`/`--my` (%, centro
 * del specular). Throttle con `requestAnimationFrame`; listeners atados al
 * propio nodo (no consume CPU mientras nada interactúa). Respeta
 * `prefers-reduced-motion` desinstalándose.
 */
export function useCardTilt() {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof window === 'undefined') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let rafId = 0;
    let pending: { px: number; py: number } | null = null;

    const apply = () => {
      rafId = 0;
      if (!pending) return;
      const rect = node.getBoundingClientRect();
      // Normalizamos a [-1, 1] respecto al centro. El centro es (0, 0).
      const tx = (pending.px / rect.width) * 2 - 1;
      const ty = (pending.py / rect.height) * 2 - 1;
      const mx = (pending.px / rect.width) * 100;
      const my = (pending.py / rect.height) * 100;
      const style = node.style;
      style.setProperty('--tx', tx.toFixed(3));
      style.setProperty('--ty', ty.toFixed(3));
      style.setProperty('--mx', `${mx.toFixed(2)}%`);
      style.setProperty('--my', `${my.toFixed(2)}%`);
    };

    const onMove = (e: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      pending = { px: e.clientX - rect.left, py: e.clientY - rect.top };
      if (!rafId) rafId = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      pending = null;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      // Devolvemos las variables a los valores neutros. Como hay `transition`
      // en `.card-3d-inner`, la carta vuelve suavemente a su posición de reposo.
      const style = node.style;
      style.setProperty('--tx', '0');
      style.setProperty('--ty', '0');
      style.setProperty('--mx', '50%');
      style.setProperty('--my', '50%');
    };

    node.addEventListener('pointermove', onMove);
    node.addEventListener('pointerleave', onLeave);
    // En dispositivos táctiles, `pointercancel` también dispara cuando el
    // gesto se interrumpe (ej. scroll comienza). Tratarlo como leave evita
    // que la carta se quede "tilted" tras un tap fallido.
    node.addEventListener('pointercancel', onLeave);

    return () => {
      node.removeEventListener('pointermove', onMove);
      node.removeEventListener('pointerleave', onLeave);
      node.removeEventListener('pointercancel', onLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return ref;
}
