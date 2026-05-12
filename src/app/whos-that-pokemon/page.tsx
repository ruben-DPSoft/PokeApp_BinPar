import type { Metadata } from 'next';
import { WhoIsThatPokemon } from '@/components/game/WhoIsThatPokemon';

export const metadata: Metadata = {
  title: "Who's That Pokémon? · Pokédex",
  description:
    "Adivina el Pokémon antes de que se acabe el tiempo. ¿Cuántos puedes acertar en silueta? Mini-juego de la Pokédex.",
};

export default function WhosThatPokemonPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <WhoIsThatPokemon />
    </main>
  );
}
