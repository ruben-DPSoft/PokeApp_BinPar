'use client';

import { useFiltersStore } from '@/store/filters';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/useT';
import { Chevron } from './CollapsibleHeader';

interface FiltersPanelProps {
  searchBar: React.ReactNode;
  viewModeToggle: React.ReactNode;
  typeFilter: React.ReactNode;
  generationFilter: React.ReactNode;
  activeFilters: React.ReactNode;
}

/**
 * Contenedor cliente del bloque de filtros.
 *
 * Resuelve dos cosas que la versión anterior tenía repartidas:
 *  1. Estructura visual: SearchBar + ViewModeToggle siempre visibles arriba;
 *     debajo, la sección colapsable con tipos, generación y chips activos.
 *  2. Colapso global del panel (botón "Ocultar/mostrar filtros"). Sólo se ve
 *     por debajo de `md` — en pantallas grandes el colapso global no aporta
 *     valor (hay sitio de sobra para los filtros).
 *
 * El estado del colapso vive en el store de filtros (`panelOpen`), así que
 * sobrevive a navegaciones cliente igual que los propios filtros.
 */
export function FiltersPanel({
  searchBar,
  viewModeToggle,
  typeFilter,
  generationFilter,
  activeFilters,
}: FiltersPanelProps) {
  const open = useFiltersStore((s) => s.panelOpen);
  const setOpen = useFiltersStore((s) => s.setPanelOpen);
  const t = useT();

  return (
    <div className="flex flex-col gap-4">
      {/* Fila siempre visible: búsqueda + view-mode + (en móvil) toggle global */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex-1 min-w-0">{searchBar}</div>

        <div className="flex items-center justify-between lg:justify-end gap-2">
          {/* Botón global de colapso — sólo visible en mobile/tablet */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? t('filter.panel.hide') : t('filter.panel.show')}
            className={cn(
              'md:hidden inline-flex items-center gap-1.5 rounded-xl border border-overlay/10 bg-overlay/5 hover:bg-overlay/10',
              'px-3 py-1.5 text-xs font-semibold text-ink-100 transition',
            )}
          >
            {open ? t('filter.panel.hide') : t('filter.panel.show')}
            <Chevron open={open} />
          </button>

          <div className="lg:shrink-0">{viewModeToggle}</div>
        </div>
      </div>

      {/* Sección colapsable: en md+ siempre visible (el botón global está oculto);
          en <md, se respeta el estado `panelOpen`. */}
      <div className={cn('flex flex-col gap-4', !open && 'hidden md:flex')}>
        <div className="min-w-0">{typeFilter}</div>
        <div className="min-w-0">{generationFilter}</div>
        {activeFilters}
      </div>
    </div>
  );
}
