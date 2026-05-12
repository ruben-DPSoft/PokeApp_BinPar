'use client';

import { useCallback } from 'react';
import { useLocaleStore } from '@/store/locale';
import { DICTIONARIES, type DictKey } from './dictionaries';

/**
 * Hook de traducción.
 *
 * Uso:
 *   const t = useT();
 *   t('detail.back')                   // → 'Volver al listado' / 'Back to the list'
 *   t('detail.toggle.add', { name })   // → 'Añadir Pikachu a tu Pokédex'
 *
 * Interpolación: las claves del diccionario admiten `{placeholder}` y se
 * sustituyen por los valores de `vars`. Es deliberadamente minimalista —
 * no soportamos pluralización ICU porque la app sólo tiene un par de casos
 * con números (y los manejamos en el call site con concatenación).
 */
type Vars = Record<string, string | number>;

export function useT(): (key: DictKey, vars?: Vars) => string {
  const locale = useLocaleStore((s) => s.locale);

  return useCallback(
    (key: DictKey, vars?: Vars): string => {
      const raw = DICTIONARIES[locale][key] ?? key;
      if (!vars) return raw;
      return Object.keys(vars).reduce<string>(
        (out, k) => out.replace(new RegExp(`\\{${k}\\}`, 'g'), String(vars[k])),
        raw,
      );
    },
    [locale],
  );
}
