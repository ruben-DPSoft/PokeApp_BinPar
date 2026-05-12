'use client';

import { useEffect, useRef } from 'react';
import { useFilteredPokemon } from '@/hooks/useFilteredPokemon';
import { useAllPokemon } from '@/hooks/usePokemonData';
import { useFiltersStore } from '@/store/filters';
import { useRestoreScroll } from '@/hooks/useRestoreScroll';
import { useT } from '@/lib/i18n/useT';
import { CardsView } from './CardsView';
import { TableView } from './TableView';
import { PokedexView } from './PokedexView';
import { CardSkeleton } from '@/components/common/Skeleton';

const PAGE_SIZE = 60;

/**
 * "Vista contenedora" del listado. Es responsabilidad suya:
 *   1. Decidir qué subcomponente de vista renderizar (cards/table/pokedex).
 *   2. Aplicar la paginación incremental con un IntersectionObserver al final
 *      del listado — cargamos más Pokémon cuando el usuario se acerca.
 *   3. Restaurar el scroll al volver del detalle.
 *
 * Lo separamos del Server Component (page.tsx) porque todo lo que vive aquí
 * depende del store de cliente. El listado completo se hidrata muy rápido
 * porque la descarga inicial de datos se hace una sola vez vía SWR.
 */
export function PokemonListing() {
  const { pokemon, totalMatching, isLoading, error } = useFilteredPokemon();
  const all = useAllPokemon();
  const viewMode = useFiltersStore((s) => s.viewMode);
  const visibleCount = useFiltersStore((s) => s.visibleCount);
  const setVisibleCount = useFiltersStore((s) => s.setVisibleCount);
  const t = useT();

  useRestoreScroll(!isLoading && pokemon.length > 0);

  const sentinel = useRef<HTMLDivElement>(null);

  // En modo Pokédex queremos mostrar TODO de un golpe (la rejilla es densa).
  const sliced = viewMode === 'pokedex' ? pokemon : pokemon.slice(0, visibleCount);

  // Paginación incremental — observer al final de la lista.
  useEffect(() => {
    if (viewMode === 'pokedex') return;
    const node = sentinel.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && visibleCount < pokemon.length) {
            setVisibleCount(Math.min(visibleCount + PAGE_SIZE, pokemon.length));
          }
        }
      },
      { rootMargin: '600px 0px' },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [viewMode, visibleCount, pokemon.length, setVisibleCount]);

  if (error) {
    return (
      <div className="panel p-6 text-center">
        <p className="text-flame-300 font-semibold">{t('list.error.title')}</p>
        <p className="text-sm text-ink-300 mt-1">{error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (totalMatching === 0) {
    return (
      <div className="panel p-8 text-center">
        <p className="display text-xl text-ink-50">{t('list.empty.title')}</p>
        <p className="mt-2 text-sm text-ink-300">{t('list.empty.body')}</p>
      </div>
    );
  }

  return (
    <>
      <p className="text-xs text-ink-300 mb-3">
        <span className="font-mono text-ink-100">{totalMatching}</span> {t('list.results')}
        {viewMode !== 'pokedex' && visibleCount < totalMatching && (
          <>
            {' '}
            · {t('list.showing')} <span className="font-mono text-ink-100">{sliced.length}</span>
          </>
        )}
      </p>

      {viewMode === 'cards' && <CardsView pokemon={sliced} />}
      {viewMode === 'table' && <TableView pokemon={sliced} />}
      {viewMode === 'pokedex' && (
        <PokedexView pokemon={pokemon} allPokemon={all.data ?? []} />
      )}

      {viewMode !== 'pokedex' && visibleCount < pokemon.length && (
        <div ref={sentinel} className="h-20 grid place-items-center text-ink-300 text-sm">
          {t('list.loading_more')}
        </div>
      )}
    </>
  );
}
