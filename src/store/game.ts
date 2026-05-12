'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Estado del mini-juego "Who's That Pokémon?".
 *
 * Sólo persistimos `bestStreak` — la racha actual es de sesión: si recargas
 * la página, empiezas de cero, pero tu mejor marca se queda. Misma filosofía
 * que el `pokedex` store: lo que es logro permanente se guarda; lo que es
 * estado en vuelo no.
 */
interface GameState {
  bestStreak: number;
  setBestStreak: (n: number) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      bestStreak: 0,
      setBestStreak: (n) => set({ bestStreak: n }),
    }),
    {
      name: 'whos-that-pokemon.v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
