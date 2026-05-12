'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { spritePixel } from '@/lib/pokemon/sprites';

interface PokemonSpriteProps {
  src: string;
  alt: string;
  fallbackId?: number;
  className?: string;
  /** Si true, aplicamos un filtro para "siluetar" — usado en modo Pokédex. */
  silhouette?: boolean;
  loading?: 'eager' | 'lazy';
}

/**
 * Sprite con fallback automático y posibilidad de renderizar como silueta.
 *
 * El sprite HD del CDN (official-artwork) ocasionalmente no existe para
 * algunas formas especiales — en ese caso caemos al pixel-art clásico.
 *
 * Importante: usamos <img> y NO <Image> de next/image. Razón pragmática:
 *  - Necesitamos cientos de imágenes (toda la lista) y el optimizador de
 *    next/image generaría tráfico/coste innecesario sobre un CDN que ya está
 *    optimizado. Para una prueba técnica self-hosted, <img> con loading="lazy"
 *    es la opción más limpia.
 */
export function PokemonSprite({
  src,
  alt,
  fallbackId,
  className,
  silhouette = false,
  loading = 'lazy',
}: PokemonSpriteProps) {
  const [errored, setErrored] = useState(false);
  const finalSrc = errored && fallbackId != null ? spritePixel(fallbackId) : src;

  return (
    <img
      src={finalSrc}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => setErrored(true)}
      className={cn(
        'select-none pointer-events-none',
        // Silueta theme-aware: clara en oscuro, oscura en claro. El filtro lo
        // define `--silhouette-filter` en globals.css por tema.
        silhouette && '[filter:var(--silhouette-filter)] opacity-85',
        className,
      )}
    />
  );
}
