'use client';

import { useFiltersStore } from '@/store/filters';
import { useT } from '@/lib/i18n/useT';

/** Buscador. Sincroniza el input con el store; el filtrado (por nombre,
 *  línea evolutiva o número) ocurre en `useFilteredPokemon`. */
export function SearchBar() {
  const search = useFiltersStore((s) => s.search);
  const setSearch = useFiltersStore((s) => s.setSearch);
  const t = useT();

  return (
    <label className="relative flex items-center w-full">
      <span className="absolute left-4 text-ink-300" aria-hidden>
        {/* Lupa SVG inline — evitamos cargar un set de iconos para una sola pieza. */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t('search.placeholder')}
        aria-label={t('search.aria_label')}
        className="
          w-full
          pl-11 pr-4 py-3
          rounded-2xl
          bg-ink-700/50 border border-overlay/10
          text-ink-50 placeholder:text-ink-400
          focus:border-flame-500/50 focus:bg-ink-700/80 focus:outline-none focus:ring-4 focus:ring-flame-500/15
          transition-shadow
        "
      />
      {search.length > 0 && (
        <button
          type="button"
          onClick={() => setSearch('')}
          aria-label={t('search.clear')}
          className="absolute right-3 text-ink-300 hover:text-ink-50 rounded-full hover:bg-overlay/10 w-7 h-7 grid place-items-center"
        >
          ×
        </button>
      )}
    </label>
  );
}
