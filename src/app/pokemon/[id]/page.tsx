import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchPokemonDetail } from '@/lib/pokemon/api';
import { PokemonDetailView } from '@/components/detail/PokemonDetailView';
import { prettyName } from '@/lib/utils';

interface PageParams {
  params: { id: string };
}

/**
 * Página de detalle. Server Component:
 *   - Resolvemos el Pokémon en el servidor con fetch + caché de Next.
 *   - Generamos metadata SEO dinámica con su nombre y tipo principal.
 *   - Si el id no existe, devolvemos 404 nativo.
 *
 * Aceptamos tanto numéricos (`/pokemon/25`) como nombres (`/pokemon/pikachu`),
 * porque la PokéAPI soporta ambos como key del endpoint.
 */
export default async function PokemonDetailPage({ params }: PageParams) {
  try {
    const pokemon = await fetchPokemonDetail(params.id);
    return <PokemonDetailView pokemon={pokemon} />;
  } catch {
    notFound();
  }
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  try {
    const pokemon = await fetchPokemonDetail(params.id);
    const name = prettyName(pokemon.name);
    // Para SEO usamos la descripción en castellano (idioma "fuente" del proyecto).
    // Los crawlers no ejecutan JS suficiente para distinguir el idioma del
    // usuario aquí, así que servir una versión estable es lo correcto.
    return {
      title: `${name} · Pokédex`,
      description: pokemon.flavorText.es || `Ficha de ${name} con stats, tipos y línea evolutiva.`,
    };
  } catch {
    return { title: 'Pokémon no encontrado' };
  }
}
