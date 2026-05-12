import type { GenerationId, PokemonSummary, PokemonTypeName } from '@/types/pokemon';

export interface FilterCriteria {
  search: string;
  types: PokemonTypeName[];
  generations: GenerationId[];
}

/**
 * Lógica pura de filtrado + búsqueda del listado.
 *
 * Búsqueda numérica: el término todo dígitos → match por id (cruda o padded
 * a 4). Búsqueda texto → match por nombre + expansión a línea evolutiva
 * (Pikachu revela también Pichu/Raichu) usando un mapa de adyacencia
 * precomputado.
 *
 * Multi-select de tipos / generaciones con semántica OR.
 *
 * Vive separado del hook para poder testearlo sin mockear SWR/Zustand.
 */
export function filterPokemon(
  dataset: readonly PokemonSummary[],
  adjacency: ReadonlyMap<number, number[]> | undefined,
  criteria: FilterCriteria,
): PokemonSummary[] {
  if (dataset.length === 0) return [];

  const term = criteria.search.trim().toLowerCase();
  const isNumericSearch = term.length > 0 && /^\d+$/.test(term);

  let evolutionMatched: Set<number> | null = null;
  if (term.length > 0 && !isNumericSearch) {
    const directMatches = dataset.filter((p) => p.name.includes(term));
    const idsToExpand = directMatches.map((p) => p.speciesId);
    const expanded = new Set<number>(idsToExpand);
    if (adjacency) {
      for (const id of idsToExpand) {
        const family = adjacency.get(id);
        if (family) for (const sid of family) expanded.add(sid);
      }
    }
    evolutionMatched = expanded;
  }

  const result = dataset.filter((p) => {
    if (criteria.types.length > 0 && !p.types.some((t) => criteria.types.includes(t))) return false;
    if (criteria.generations.length > 0 && !criteria.generations.includes(p.generation)) return false;

    if (term.length > 0) {
      if (isNumericSearch) {
        const idStr = p.id.toString();
        const padded = idStr.padStart(4, '0');
        return idStr.includes(term) || padded.includes(term);
      }
      if (p.name.includes(term)) return true;
      if (evolutionMatched && evolutionMatched.has(p.speciesId)) return true;
      return false;
    }
    return true;
  });

  // Matches que empiezan por el término van primero (UX clásica de buscadores).
  if (term.length > 0 && !isNumericSearch) {
    result.sort((a, b) => {
      const aStarts = a.name.startsWith(term);
      const bStarts = b.name.startsWith(term);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.id - b.id;
    });
  }

  return result;
}
