import { describe, expect, it } from 'vitest';
import {
  adaptDetail,
  adaptSummary,
  cleanFlavor,
  flattenChain,
  humanizeTrigger,
  idFromUrl,
  pickFlavorText,
  type RawPokemon,
  type RawSpecies,
} from './api';

describe('idFromUrl', () => {
  it('extrae el id de URLs de PokéAPI con o sin barra final', () => {
    expect(idFromUrl('https://pokeapi.co/api/v2/pokemon-species/25/')).toBe(25);
    expect(idFromUrl('https://pokeapi.co/api/v2/pokemon/151')).toBe(151);
    expect(idFromUrl('not-a-url')).toBe(0);
  });
});

describe('cleanFlavor', () => {
  it('quita form-feed/newlines y colapsa espacios', () => {
    expect(cleanFlavor('Genera\fpartículas\nde electricidad\rcuando se enoja.')).toBe(
      'Genera partículas de electricidad cuando se enoja.',
    );
    expect(cleanFlavor('  doble   espacio  ')).toBe('doble espacio');
  });
});

describe('adaptSummary', () => {
  it('mapea los campos crudos al modelo de dominio y deriva la generación del id', () => {
    const raw: RawPokemon = makeRawPokemon({
      id: 25,
      name: 'pikachu',
      types: [{ type: { name: 'electric' } }],
      species: { url: 'https://pokeapi.co/api/v2/pokemon-species/25/' },
    });
    const summary = adaptSummary(raw);
    expect(summary).toMatchObject({
      id: 25,
      name: 'pikachu',
      types: ['electric'],
      generation: 1,
      speciesId: 25,
    });
    // Las URLs de sprite/artwork las arma `sprites.ts`; aquí basta con que existan.
    expect(summary.sprite).toContain('25');
    expect(summary.artwork).toContain('25');
  });
});

describe('adaptDetail', () => {
  it('encuentra cada stat por nombre canónico y arma flavorText con fallback cruzado', () => {
    const raw: RawPokemon = makeRawPokemon({
      id: 25,
      name: 'pikachu',
      stats: [
        { base_stat: 35, stat: { name: 'hp' } },
        { base_stat: 55, stat: { name: 'attack' } },
        { base_stat: 40, stat: { name: 'defense' } },
        { base_stat: 50, stat: { name: 'special-attack' } },
        { base_stat: 50, stat: { name: 'special-defense' } },
        { base_stat: 90, stat: { name: 'speed' } },
      ],
    });
    const species: RawSpecies = {
      id: 25,
      name: 'pikachu',
      evolution_chain: { url: 'x' },
      generation: { name: 'generation-i' },
      flavor_text_entries: [
        // Sólo entrada en inglés — la española debe caer al fallback.
        { flavor_text: 'When startled it lets off electricity.', language: { name: 'en' }, version: { name: 'scarlet' } },
      ],
    };
    const detail = adaptDetail(raw, species, [], [], []);
    expect(detail.stats).toEqual({
      hp: 35, attack: 55, defense: 40,
      specialAttack: 50, specialDefense: 50, speed: 90,
    });
    // Fallback: el ES vacío usa el EN.
    expect(detail.flavorText.es).toContain('startled');
    expect(detail.flavorText.en).toContain('startled');
  });
});

describe('flattenChain', () => {
  it('aplana ramas y marca cada eslabón con su stage', () => {
    const chain = {
      species: { name: 'bulbasaur', url: '/pokemon-species/1/' },
      evolution_details: [],
      evolves_to: [{
        species: { name: 'ivysaur', url: '/pokemon-species/2/' },
        evolution_details: [{ min_level: 16, trigger: { name: 'level-up' }, item: null, min_happiness: null, min_affection: null, time_of_day: '', location: null }],
        evolves_to: [{
          species: { name: 'venusaur', url: '/pokemon-species/3/' },
          evolution_details: [{ min_level: 32, trigger: { name: 'level-up' }, item: null, min_happiness: null, min_affection: null, time_of_day: '', location: null }],
          evolves_to: [],
        }],
      }],
    };
    const out = flattenChain(chain);
    expect(out.map((n) => ({ id: n.speciesId, stage: n.stage }))).toEqual([
      { id: 1, stage: 0 },
      { id: 2, stage: 1 },
      { id: 3, stage: 2 },
    ]);
    expect(out[1]?.trigger).toEqual({ es: 'Nivel 16', en: 'Level 16' });
  });
});

describe('humanizeTrigger', () => {
  it('devuelve null cuando no hay details', () => {
    expect(humanizeTrigger(undefined)).toBeNull();
  });

  it('cubre los triggers más comunes de la PokéAPI en ES y EN', () => {
    expect(humanizeTrigger({ min_level: 16, trigger: { name: 'level-up' }, item: null, min_happiness: null, min_affection: null, time_of_day: '', location: null }))
      .toEqual({ es: 'Nivel 16', en: 'Level 16' });
    expect(humanizeTrigger({ min_level: null, trigger: { name: 'use-item' }, item: { name: 'fire-stone' }, min_happiness: null, min_affection: null, time_of_day: '', location: null }))
      .toEqual({ es: 'Piedra Fuego', en: 'Fire Stone' });
    expect(humanizeTrigger({ min_level: null, trigger: { name: 'level-up' }, item: null, min_happiness: 220, min_affection: null, time_of_day: '', location: null }))
      .toEqual({ es: 'Alta amistad', en: 'High friendship' });
    expect(humanizeTrigger({ min_level: null, trigger: { name: 'trade' }, item: null, min_happiness: null, min_affection: null, time_of_day: '', location: null }))
      .toEqual({ es: 'Intercambio', en: 'Trade' });
  });

  it('diferencia Espeon/Umbreon por time_of_day cuando ambos tienen min_happiness', () => {
    const base = { min_level: null, trigger: { name: 'level-up' }, item: null, min_affection: null, location: null };
    expect(humanizeTrigger({ ...base, min_happiness: 220, time_of_day: 'day' }))
      .toEqual({ es: 'Alta amistad (día)', en: 'High friendship (day)' });
    expect(humanizeTrigger({ ...base, min_happiness: 220, time_of_day: 'night' }))
      .toEqual({ es: 'Alta amistad (noche)', en: 'High friendship (night)' });
  });

  it('captura la location para Leafeon/Glaceon (level-up con location distinta)', () => {
    const base = { min_level: null, trigger: { name: 'level-up' }, item: null, min_happiness: null, min_affection: null, time_of_day: '' };
    expect(humanizeTrigger({ ...base, location: { name: 'eterna-forest' } }))
      .toEqual({ es: 'En Eterna Forest', en: 'At Eterna Forest' });
  });

  it('localiza los slugs no mapeados al título-case en ambos idiomas', () => {
    expect(humanizeTrigger({ min_level: null, trigger: { name: 'use-item' }, item: { name: 'rare-candy' }, min_happiness: null, min_affection: null, time_of_day: '', location: null }))
      .toEqual({ es: 'Rare Candy', en: 'Rare Candy' });
  });
});

describe('pickFlavorText', () => {
  it('prefiere juegos modernos (Scarlet) sobre antiguos (Red) cuando hay varias entradas', () => {
    const species: RawSpecies = {
      id: 25,
      name: 'pikachu',
      evolution_chain: { url: 'x' },
      generation: { name: 'generation-i' },
      flavor_text_entries: [
        { flavor_text: 'RED descripción antigua', language: { name: 'es' }, version: { name: 'red' } },
        { flavor_text: 'SCARLET descripción moderna', language: { name: 'es' }, version: { name: 'scarlet' } },
      ],
    };
    expect(pickFlavorText(species, 'es')).toContain('moderna');
  });

  it('devuelve cadena vacía si no hay entradas en el idioma pedido', () => {
    const species: RawSpecies = {
      id: 25,
      name: 'pikachu',
      evolution_chain: { url: 'x' },
      generation: { name: 'generation-i' },
      flavor_text_entries: [
        { flavor_text: 'EN only', language: { name: 'en' }, version: { name: 'red' } },
      ],
    };
    expect(pickFlavorText(species, 'es')).toBe('');
  });
});

/* ────────────── Helpers de fabricación de fixtures ────────────── */

function makeRawPokemon(overrides: Partial<RawPokemon> = {}): RawPokemon {
  return {
    id: 1,
    name: 'mock',
    height: 4,
    weight: 60,
    base_experience: 50,
    types: [{ type: { name: 'normal' } }],
    stats: [],
    abilities: [],
    moves: [],
    species: { url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
    ...overrides,
  };
}
