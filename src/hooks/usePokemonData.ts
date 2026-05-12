'use client';

import useSWR from 'swr';
import { fetchAllPokemonSummaries, fetchEvolutionAdjacency, fetchPokemonDetail } from '@/lib/pokemon/api';
import type { PokemonDetail, PokemonSummary } from '@/types/pokemon';

/**
 * Hooks que envuelven la capa de API con SWR.
 *
 * SWR nos da gratis:
 *  - Caché compartida entre componentes (no duplicamos la descarga).
 *  - Dedupe automático de requests en vuelo.
 *  - Revalidación sin parpadeo cuando el usuario vuelve a la pestaña.
 *
 * Para los datasets grandes (listado completo + adyacencia evolutiva),
 * deshabilitamos `revalidateOnFocus` — son datos estáticos y costosos.
 */

interface SWRResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

export function useAllPokemon(): SWRResult<PokemonSummary[]> {
  const { data, error, isLoading } = useSWR('pokemon:all', fetchAllPokemonSummaries, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 60 * 60 * 1000, // 1h
  });
  return { data, error, isLoading };
}

export function useEvolutionAdjacency(): SWRResult<Map<number, number[]>> {
  const { data, error, isLoading } = useSWR('pokemon:evolutions', fetchEvolutionAdjacency, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 60 * 60 * 1000,
  });
  return { data, error, isLoading };
}

export function usePokemonDetail(idOrName: string | number | null): SWRResult<PokemonDetail> {
  const key = idOrName != null ? ['pokemon:detail', idOrName] : null;
  const { data, error, isLoading } = useSWR(
    key,
    ([, k]) => fetchPokemonDetail(k as string | number),
    { revalidateOnFocus: false, dedupingInterval: 60 * 60 * 1000 },
  );
  return { data, error, isLoading };
}
