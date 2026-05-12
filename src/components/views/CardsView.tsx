'use client';

import type { PokemonSummary } from '@/types/pokemon';
import { PokemonCard } from './PokemonCard';

interface CardsViewProps {
  pokemon: PokemonSummary[];
}

/**
 * Grid responsivo de cards. Breakpoints elegidos a propósito:
 *   <640px  → 2 cols (móvil)
 *   <1024px → 3 cols (tablet)
 *   <1280px → 4 cols
 *   ≥1280px → 5 cols (escritorio amplio)
 */
export function CardsView({ pokemon }: CardsViewProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {pokemon.map((p) => (
        <PokemonCard key={p.id} pokemon={p} />
      ))}
    </div>
  );
}
