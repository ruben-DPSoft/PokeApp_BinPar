'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Theme = 'dark' | 'light';

/**
 * Store del tema activo.
 *
 * Persistencia en localStorage bajo la clave `pokedex.theme.v1`. Esa misma
 * clave se lee desde un script inline en <head> (ver `layout.tsx`) para
 * fijar `[data-theme=...]` antes de que React hidrate; así evitamos el
 * "flash of wrong theme" cuando un usuario con tema claro recarga la página.
 *
 * En SSR no hay `window`/`localStorage`, así que el valor inicial siempre
 * será 'dark'. El middleware `persist` lo reemplaza durante la hidratación
 * en cliente — pero como el `<html data-theme>` ya está bien, no se nota.
 */
interface ThemeState {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      setTheme: (t) => {
        set({ theme: t });
        applyToDocument(t);
      },
      toggle: () => {
        const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: next });
        applyToDocument(next);
      },
    }),
    {
      name: 'pokedex.theme.v1',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Al re-hidratar, garantizamos que el atributo del documento
        // refleja lo que hay en el store (por si alguien lo modificó manualmente).
        if (state) applyToDocument(state.theme);
      },
    },
  ),
);

function applyToDocument(theme: Theme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = theme;
}
