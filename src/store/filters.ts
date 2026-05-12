'use client';

import { create } from 'zustand';
import type { GenerationId, PokemonTypeName } from '@/types/pokemon';

export type ViewMode = 'cards' | 'table' | 'pokedex';

/**
 * Estado de UI del listado. Sólo en memoria — sobrevive a navegaciones cliente
 * pero no a recargas (lo pedía el enunciado).
 *
 * `types` y `generations` son arrays para multi-select con semántica OR; vacío
 * = sin filtro. `panelOpen` colapsa todo el bloque (útil en móvil); `typesOpen`
 * y `generationsOpen` colapsan cada filtro individualmente.
 */
interface FiltersState {
  search: string;
  types: PokemonTypeName[];
  generations: GenerationId[];
  viewMode: ViewMode;
  visibleCount: number;
  listScrollY: number;

  panelOpen: boolean;
  typesOpen: boolean;
  generationsOpen: boolean;

  setSearch: (s: string) => void;
  toggleType: (t: PokemonTypeName) => void;
  toggleGeneration: (g: GenerationId) => void;
  clearTypes: () => void;
  clearGenerations: () => void;
  setViewMode: (m: ViewMode) => void;
  setVisibleCount: (n: number) => void;
  setListScrollY: (y: number) => void;
  setPanelOpen: (o: boolean) => void;
  setTypesOpen: (o: boolean) => void;
  setGenerationsOpen: (o: boolean) => void;
  reset: () => void;
}

const INITIAL_VISIBLE = 60;

export const useFiltersStore = create<FiltersState>((set) => ({
  search: '',
  types: [],
  generations: [],
  viewMode: 'cards',
  visibleCount: INITIAL_VISIBLE,
  listScrollY: 0,

  panelOpen: true,
  typesOpen: true,
  generationsOpen: true,

  setSearch: (s) => set({ search: s, visibleCount: INITIAL_VISIBLE }),

  toggleType: (t) =>
    set((state) => ({
      types: state.types.includes(t)
        ? state.types.filter((x) => x !== t)
        : [...state.types, t],
      visibleCount: INITIAL_VISIBLE,
    })),

  toggleGeneration: (g) =>
    set((state) => ({
      generations: state.generations.includes(g)
        ? state.generations.filter((x) => x !== g)
        : [...state.generations, g],
      visibleCount: INITIAL_VISIBLE,
    })),

  clearTypes: () => set({ types: [], visibleCount: INITIAL_VISIBLE }),
  clearGenerations: () => set({ generations: [], visibleCount: INITIAL_VISIBLE }),

  setViewMode: (m) => set({ viewMode: m }),
  setVisibleCount: (n) => set({ visibleCount: n }),
  setListScrollY: (y) => set({ listScrollY: y }),
  setPanelOpen: (o) => set({ panelOpen: o }),
  setTypesOpen: (o) => set({ typesOpen: o }),
  setGenerationsOpen: (o) => set({ generationsOpen: o }),

  reset: () =>
    set({
      search: '',
      types: [],
      generations: [],
      visibleCount: INITIAL_VISIBLE,
      listScrollY: 0,
    }),
}));

/** ¿Hay algún filtro activo? Útil para mostrar la barra de chips activos. */
export const selectHasActiveFilter = (s: FiltersState): boolean =>
  s.search.length > 0 || s.types.length > 0 || s.generations.length > 0;
