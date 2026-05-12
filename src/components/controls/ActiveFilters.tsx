'use client';

import { useFiltersStore, selectHasActiveFilter } from '@/store/filters';
import { GENERATIONS } from '@/lib/pokemon/generations';
import { useT } from '@/lib/i18n/useT';
import type { DictKey } from '@/lib/i18n/dictionaries';

/**
 * Resumen visual de los filtros activos. Se renderiza UN CHIP por cada elemento
 * seleccionado (un tipo, una generación, el término de búsqueda).
 *
 * Se oculta entera cuando no hay filtros activos — sin ruido visual cuando
 * no aporta nada.
 *
 * Los chips son removibles individualmente; el botón "limpiar todo" hace un
 * reset completo del store.
 */
export function ActiveFilters() {
  const hasAny = useFiltersStore(selectHasActiveFilter);
  const search = useFiltersStore((s) => s.search);
  const types = useFiltersStore((s) => s.types);
  const generations = useFiltersStore((s) => s.generations);
  const setSearch = useFiltersStore((s) => s.setSearch);
  const toggleType = useFiltersStore((s) => s.toggleType);
  const toggleGeneration = useFiltersStore((s) => s.toggleGeneration);
  const reset = useFiltersStore((s) => s.reset);
  const t = useT();

  if (!hasAny) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="text-ink-300">{t('filter.active')}</span>
      {search && <RemovableChip onRemove={() => setSearch('')} label={`“${search}”`} />}
      {types.map((typeName) => (
        <RemovableChip
          key={`type-${typeName}`}
          onRemove={() => toggleType(typeName)}
          label={`${t('filter.type.label')}: ${t(`type.${typeName}` as DictKey)}`}
        />
      ))}
      {generations.map((genId) => {
        const info = GENERATIONS.find((g) => g.id === genId);
        if (!info) return null;
        return (
          <RemovableChip
            key={`gen-${genId}`}
            onRemove={() => toggleGeneration(genId)}
            label={`${t('filter.gen_short')} ${info.id} · ${info.region}`}
          />
        );
      })}
      <button
        type="button"
        onClick={reset}
        className="ml-1 text-flame-300 hover:text-flame-200 underline underline-offset-2"
      >
        {t('filter.clear_all')}
      </button>
    </div>
  );
}

function RemovableChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-overlay/10 bg-overlay/[0.04] px-2 py-0.5">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Eliminar filtro ${label}`}
        className="text-ink-300 hover:text-ink-50"
      >
        ×
      </button>
    </span>
  );
}
