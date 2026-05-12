'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Store de la "colección personal" (modo Pokédex).
 *
 * A diferencia del store de filtros, este SÍ se persiste en localStorage: la
 * colección de Pokémon que el usuario ha marcado como "capturados" debe
 * sobrevivir entre sesiones. Es la analogía con el Pokédex de los juegos:
 * cuando cierras la consola y vuelves, tu progreso sigue ahí.
 *
 * Diseño:
 *  - Usamos un Set internamente para inserciones/borrados O(1) y `has` rápido.
 *  - Persistimos como array (los Set no son JSON-serializables).
 *  - `version` permite forzar invalidación si el esquema cambia en el futuro.
 */
interface PokedexState {
  owned: Set<number>;
  toggle: (id: number) => void;
  markMany: (ids: number[]) => void;
  clear: () => void;
  isOwned: (id: number) => boolean;
}

interface PersistShape {
  owned: number[];
}

export const usePokedexStore = create<PokedexState>()(
  persist(
    (set, get) => ({
      owned: new Set<number>(),
      toggle: (id) =>
        set((state) => {
          const next = new Set(state.owned);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return { owned: next };
        }),
      markMany: (ids) =>
        set((state) => {
          const next = new Set(state.owned);
          for (const id of ids) next.add(id);
          return { owned: next };
        }),
      clear: () => set({ owned: new Set() }),
      isOwned: (id) => get().owned.has(id),
    }),
    {
      name: 'pokedex.collection.v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Serializamos Set ↔ array porque JSON no admite Set nativamente.
      partialize: (state): PersistShape => ({ owned: Array.from(state.owned) }),
      merge: (persisted, current) => {
        const shape = persisted as Partial<PersistShape> | undefined;
        const list = shape?.owned ?? [];
        return { ...current, owned: new Set(list) };
      },
    },
  ),
);
