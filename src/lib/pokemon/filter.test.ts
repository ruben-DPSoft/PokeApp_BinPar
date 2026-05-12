import { describe, expect, it } from 'vitest';
import type { PokemonSummary } from '@/types/pokemon';
import { filterPokemon } from './filter';

// Pool sintético — datos mínimos para testear cada rama del filtro.
const DATASET: PokemonSummary[] = [
  mk(1, 'bulbasaur', ['grass', 'poison'], 1, 1),
  mk(2, 'ivysaur', ['grass', 'poison'], 1, 1),
  mk(3, 'venusaur', ['grass', 'poison'], 1, 1),
  mk(4, 'charmander', ['fire'], 1, 4),
  mk(25, 'pikachu', ['electric'], 1, 25),
  mk(26, 'raichu', ['electric'], 1, 25),
  mk(150, 'mewtwo', ['psychic'], 1, 150),
  mk(151, 'mew', ['psychic'], 1, 151),
  mk(155, 'cyndaquil', ['fire'], 2, 155),
  mk(252, 'treecko', ['grass'], 3, 252),
];

// Adyacencia evolutiva: Pikachu/Raichu (25), Bulbasaur trio (1)
const ADJACENCY = new Map<number, number[]>([
  [1, [1, 2, 3]],
  [2, [1, 2, 3]],
  [3, [1, 2, 3]],
  [25, [25, 26]],
  [26, [25, 26]],
]);

describe('filterPokemon', () => {
  it('sin criterios devuelve el dataset entero', () => {
    const out = filterPokemon(DATASET, ADJACENCY, { search: '', types: [], generations: [] });
    expect(out).toHaveLength(DATASET.length);
  });

  it('filtra por tipo con semántica OR entre múltiples tipos', () => {
    const out = filterPokemon(DATASET, ADJACENCY, {
      search: '',
      types: ['fire', 'psychic'],
      generations: [],
    });
    expect(out.map((p) => p.name).sort()).toEqual(['charmander', 'cyndaquil', 'mew', 'mewtwo']);
  });

  it('filtra por generación', () => {
    const out = filterPokemon(DATASET, ADJACENCY, {
      search: '',
      types: [],
      generations: [2, 3],
    });
    expect(out.map((p) => p.name)).toEqual(['cyndaquil', 'treecko']);
  });

  it('búsqueda numérica matchea id cruda y con padding a 4', () => {
    const cruda = filterPokemon(DATASET, ADJACENCY, { search: '25', types: [], generations: [] });
    expect(cruda.map((p) => p.id)).toContain(25);

    const padded = filterPokemon(DATASET, ADJACENCY, { search: '0025', types: [], generations: [] });
    expect(padded.map((p) => p.id)).toEqual([25]);

    // "1" coincide con cualquier id que contenga "1" o "0001"
    const partial = filterPokemon(DATASET, ADJACENCY, { search: '1', types: [], generations: [] });
    expect(partial.map((p) => p.id)).toEqual(expect.arrayContaining([1, 150, 151, 155]));
  });

  it('búsqueda por nombre expande a toda la familia evolutiva', () => {
    // Buscar "pika" matchea Pikachu directo, y la expansión revela también Raichu.
    const out = filterPokemon(DATASET, ADJACENCY, { search: 'pika', types: [], generations: [] });
    expect(out.map((p) => p.name).sort()).toEqual(['pikachu', 'raichu']);
  });

  it('matches que empiezan por el término van primero (UX prefix-first)', () => {
    // Añadimos un Pokémon cuyo nombre contiene "saur" en medio.
    const dataset: PokemonSummary[] = [
      mk(3, 'venusaur', ['grass'], 1, 1),
      mk(1, 'bulbasaur', ['grass'], 1, 1),
      mk(2, 'ivysaur', ['grass'], 1, 1),
      mk(304, 'aron', ['steel'], 3, 304),
    ];
    // Búsqueda "iv" debería poner ivysaur primero (empieza por "iv") frente
    // a cualquier otro que sólo lo contenga.
    const out = filterPokemon(dataset, undefined, { search: 'iv', types: [], generations: [] });
    expect(out[0]?.name).toBe('ivysaur');
  });

  it('combina filtros (tipo AND búsqueda)', () => {
    const out = filterPokemon(DATASET, ADJACENCY, {
      search: 'char',
      types: ['fire'],
      generations: [],
    });
    expect(out.map((p) => p.name)).toEqual(['charmander']);
  });
});

function mk(
  id: number,
  name: string,
  types: PokemonSummary['types'],
  gen: PokemonSummary['generation'],
  speciesId: number,
): PokemonSummary {
  return {
    id,
    name,
    sprite: `https://example.com/${id}.png`,
    artwork: `https://example.com/${id}-hd.png`,
    types,
    generation: gen,
    speciesId,
  };
}
