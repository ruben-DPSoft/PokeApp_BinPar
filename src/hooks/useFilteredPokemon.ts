'use client';

import { useMemo } from 'react';
import type { PokemonSummary } from '@/types/pokemon';
import { useFiltersStore } from '@/store/filters';
import { filterPokemon } from '@/lib/pokemon/filter';
import { useDebounce } from './useDebounce';
import { useAllPokemon, useEvolutionAdjacency } from './usePokemonData';

interface UseFilteredPokemonResult {
  pokemon: PokemonSummary[];
  totalMatching: number;
  isLoading: boolean;
  error: Error | undefined;
}

/** Wrapper de React sobre `filterPokemon` — conecta SWR + Zustand al filtro puro. */
export function useFilteredPokemon(): UseFilteredPokemonResult {
  const all = useAllPokemon();
  const adjacency = useEvolutionAdjacency();

  const search = useFiltersStore((s) => s.search);
  const types = useFiltersStore((s) => s.types);
  const generations = useFiltersStore((s) => s.generations);

  const debouncedSearch = useDebounce(search, 120);

  const filtered = useMemo<PokemonSummary[]>(
    () => filterPokemon(all.data ?? [], adjacency.data, {
      search: debouncedSearch,
      types,
      generations,
    }),
    [all.data, adjacency.data, debouncedSearch, types, generations],
  );

  return {
    pokemon: filtered,
    totalMatching: filtered.length,
    isLoading: all.isLoading,
    error: all.error,
  };
}
