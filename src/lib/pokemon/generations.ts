import type { GenerationId, GenerationInfo } from '@/types/pokemon';

/**
 * Rangos de IDs por generación.
 *
 * Estos límites son inmutables (la PokéAPI los respeta), así que los hard-codeamos
 * en lugar de hacer una llamada extra. Esto nos permite:
 *   - calcular la generación de un Pokémon sin llamadas adicionales (O(1) lookup).
 *   - filtrar por generación sin descargar la endpoint /generation.
 *
 * Si en el futuro Game Freak añade una décima generación, basta con extender
 * esta tabla — todo el resto sigue funcionando.
 */
export const GENERATIONS: readonly GenerationInfo[] = [
  { id: 1, range: [1, 151], region: 'Kanto' },
  { id: 2, range: [152, 251], region: 'Johto' },
  { id: 3, range: [252, 386], region: 'Hoenn' },
  { id: 4, range: [387, 493], region: 'Sinnoh' },
  { id: 5, range: [494, 649], region: 'Teselia' },
  { id: 6, range: [650, 721], region: 'Kalos' },
  { id: 7, range: [722, 809], region: 'Alola' },
  { id: 8, range: [810, 905], region: 'Galar' },
  { id: 9, range: [906, 1025], region: 'Paldea' },
] as const;

/** Último ID "nacional" que cubre la app. Más allá hay formas especiales que añaden ruido. */
export const MAX_NATIONAL_DEX = 1025;

export function getGenerationById(id: number): GenerationInfo | null {
  return GENERATIONS.find((g) => id >= g.range[0] && id <= g.range[1]) ?? null;
}

export function getGenerationIdForPokemon(pokemonId: number): GenerationId {
  const gen = getGenerationById(pokemonId);
  // El listado se limita a MAX_NATIONAL_DEX, así que esta rama es defensiva.
  if (!gen) return 1;
  return gen.id;
}
