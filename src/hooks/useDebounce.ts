'use client';

import { useEffect, useState } from 'react';

/**
 * Debounce simple para valores. Lo usamos en la barra de búsqueda para no
 * filtrar el array de 1000+ Pokémon en cada keystroke — esperamos ~120ms.
 *
 * Por qué 120ms y no 300ms: el filtrado es local (no hace request), así que
 * podemos permitirnos un debounce corto y dar una sensación más reactiva.
 */
export function useDebounce<T>(value: T, delayMs = 120): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
