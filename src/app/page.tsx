import { SearchBar } from '@/components/controls/SearchBar';
import { TypeFilter } from '@/components/controls/TypeFilter';
import { GenerationFilter } from '@/components/controls/GenerationFilter';
import { ViewModeToggle } from '@/components/controls/ViewModeToggle';
import { ActiveFilters } from '@/components/controls/ActiveFilters';
import { PokemonListing } from '@/components/views/PokemonListing';
import { HomeHero } from '@/components/layout/HomeHero';
import { FiltersPanel } from '@/components/controls/FiltersPanel';

/**
 * Página principal (Server Component "wrapper").
 *
 * El bloque de filtros se delega al cliente (`FiltersPanel`) porque necesita
 * estado para el colapso global. La sección sigue siendo `sticky` para que el
 * usuario tenga búsqueda/filtros siempre a un click al hacer scroll del grid.
 *
 * Layout (de arriba a abajo dentro del panel):
 *  - Fila 1: SearchBar + ViewModeToggle + botón global de mostrar/ocultar
 *  - Sección colapsable global: TypeFilter, GenerationFilter, ActiveFilters
 */
export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <HomeHero />

      <section className="panel-strong p-4 sm:p-5 sticky top-[72px] z-30 overflow-hidden">
        <FiltersPanel
          searchBar={<SearchBar />}
          viewModeToggle={<ViewModeToggle />}
          typeFilter={<TypeFilter />}
          generationFilter={<GenerationFilter />}
          activeFilters={<ActiveFilters />}
        />
      </section>

      <section className="mt-6 sm:mt-8">
        <PokemonListing />
      </section>
    </div>
  );
}
