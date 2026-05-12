'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Locale } from '@/lib/i18n/dictionaries';

/**
 * Store del idioma activo.
 *
 * Análogo al store de tema: se persiste en localStorage y un script inline en
 * <head> sincroniza `<html lang>` antes de la hidratación para que el navegador
 * y los lectores de pantalla anuncien el idioma correcto desde el primer paint.
 *
 * Por qué Zustand y no Context: los componentes consumen vía selector
 * (`useLocaleStore(s => s.locale)`) y sólo se re-renderizan los que dependen
 * de `locale`. Con Context, cambiar idioma re-renderizaría toda la app.
 */
interface LocaleState {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggle: () => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: 'es',
      setLocale: (l) => {
        set({ locale: l });
        applyToDocument(l);
      },
      toggle: () => {
        const next: Locale = get().locale === 'es' ? 'en' : 'es';
        set({ locale: next });
        applyToDocument(next);
      },
    }),
    {
      name: 'pokedex.locale.v1',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) applyToDocument(state.locale);
      },
    },
  ),
);

function applyToDocument(locale: Locale): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = locale;
}
