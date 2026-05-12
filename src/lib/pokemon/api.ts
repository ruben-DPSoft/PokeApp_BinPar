import type {
  EvolutionNode,
  GenerationId,
  PokemonAbility,
  PokemonDetail,
  PokemonMove,
  PokemonSummary,
  PokemonTypeName,
} from '@/types/pokemon';
import {
  GENERATIONS,
  MAX_NATIONAL_DEX,
  getGenerationIdForPokemon,
} from './generations';
import { spriteArtwork, spritePixel } from './sprites';

/* ─────────────────────────────────────────────────────────────────────────────
 * Cliente HTTP fino sobre fetch nativo. Usamos `next: { revalidate }` para que
 * RSC cachee la respuesta 24 h por defecto (los datos de PokéAPI son inmutables
 * salvo nuevas gens). SWR en cliente gestiona la dedupe del lado del navegador.
 * ─────────────────────────────────────────────────────────────────────────── */

const API = 'https://pokeapi.co/api/v2';

interface FetchOptions {
  revalidate?: number;
}

async function api<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${API}${path}`;
  const init: RequestInit & { next?: { revalidate?: number } } = {
    next: { revalidate: opts.revalidate ?? 60 * 60 * 24 },
  };
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`PokéAPI ${res.status}: ${url}`);
  return (await res.json()) as T;
}

/** Extrae el id numérico de una URL PokéAPI estilo ".../pokemon-species/25/". */
export function idFromUrl(url: string): number {
  const m = url.match(/\/(\d+)\/?$/);
  return m && m[1] ? parseInt(m[1], 10) : 0;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Tipos crudos de la PokéAPI — sólo los campos que consumimos.
 * ─────────────────────────────────────────────────────────────────────────── */

interface RawPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number | null;
  types: { type: { name: PokemonTypeName } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  abilities: { ability: { name: string; url: string }; is_hidden: boolean }[];
  moves: {
    move: { name: string; url: string };
    version_group_details: {
      level_learned_at: number;
      move_learn_method: { name: string };
    }[];
  }[];
  species: { url: string };
}

interface RawSpecies {
  id: number;
  name: string;
  evolution_chain: { url: string };
  flavor_text_entries: RawFlavorEntry[];
  generation: { name: string };
}

interface RawFlavorEntry {
  flavor_text: string;
  language: { name: string };
  version: { name: string };
}

interface RawChain {
  species: { name: string; url: string };
  evolution_details: {
    min_level: number | null;
    trigger: { name: string };
    item: { name: string } | null;
    min_happiness: number | null;
    min_affection: number | null;
    time_of_day: string;
    location: { name: string } | null;
  }[];
  evolves_to: RawChain[];
}

interface RawEvolution {
  id: number;
  chain: RawChain;
}

interface RawFlavorByGroup {
  flavor_text: string;
  language: { name: string };
  version_group: { name: string };
}

interface RawAbility {
  names: { name: string; language: { name: string } }[];
  flavor_text_entries: RawFlavorByGroup[];
}

interface RawMove {
  names: { name: string; language: { name: string } }[];
  flavor_text_entries: RawFlavorByGroup[];
  type: { name: PokemonTypeName };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Prioridades de versión para elegir flavor texts más modernos.
 * Habilidades y movimientos vienen marcados por `version_group.name` (agrupa
 * Red/Blue, Gold/Silver…); la Pokédex viene por `version.name` (juegos sueltos).
 * ─────────────────────────────────────────────────────────────────────────── */

const VERSION_GROUP_PRIORITY: readonly string[] = [
  'scarlet-violet',
  'legends-arceus',
  'brilliant-diamond-and-shining-pearl',
  'sword-shield',
  'lets-go-pikachu-lets-go-eevee',
  'ultra-sun-ultra-moon',
  'sun-moon',
  'omega-ruby-alpha-sapphire',
  'x-y',
  'black-2-white-2',
  'black-white',
  'heartgold-soulsilver',
  'platinum', 'diamond-pearl',
  'emerald', 'firered-leafgreen', 'ruby-sapphire',
  'crystal', 'gold-silver', 'yellow', 'red-blue',
];

const VERSION_PRIORITY: readonly string[] = [
  'scarlet', 'violet',
  'legends-arceus',
  'brilliant-diamond', 'shining-pearl',
  'sword', 'shield',
  'lets-go-pikachu', 'lets-go-eevee',
  'ultra-sun', 'ultra-moon',
  'sun', 'moon',
  'omega-ruby', 'alpha-sapphire',
  'x', 'y',
  'black-2', 'white-2',
  'black', 'white',
  'heartgold', 'soulsilver',
  'platinum', 'diamond', 'pearl',
  'emerald', 'firered', 'leafgreen', 'ruby', 'sapphire',
  'crystal', 'gold', 'silver',
  'yellow', 'red', 'blue',
];

/** Elige el flavor text más moderno disponible en el idioma pedido. */
export function pickFlavorByVersionGroup(
  entries: RawFlavorByGroup[],
  lang: 'es' | 'en',
): string {
  const inLang = entries.filter((e) => e.language.name === lang);
  if (inLang.length === 0) return '';

  const byGroup = new Map<string, RawFlavorByGroup>();
  for (const e of inLang) {
    if (!byGroup.has(e.version_group.name)) byGroup.set(e.version_group.name, e);
  }
  for (const group of VERSION_GROUP_PRIORITY) {
    const found = byGroup.get(group);
    if (found) return cleanFlavor(found.flavor_text);
  }
  return inLang[0] ? cleanFlavor(inLang[0].flavor_text) : '';
}

/** Elige la mejor entrada Pokédex en el idioma pedido, prefiriendo juegos
 *  modernos (Scarlet/Violet → … → Red/Blue). Devuelve '' si no hay ninguna. */
export function pickFlavorText(species: RawSpecies, lang: 'es' | 'en'): string {
  const entriesInLang = species.flavor_text_entries.filter((e) => e.language.name === lang);
  if (entriesInLang.length === 0) return '';

  const byVersion = new Map<string, RawFlavorEntry>();
  for (const entry of entriesInLang) {
    if (!byVersion.has(entry.version.name)) byVersion.set(entry.version.name, entry);
  }
  for (const version of VERSION_PRIORITY) {
    const entry = byVersion.get(version);
    if (entry) return cleanFlavor(entry.flavor_text);
  }
  const fallback = entriesInLang[0];
  return fallback ? cleanFlavor(fallback.flavor_text) : '';
}

/** Quita `\f` (form-feed heredado de Game Boy) y normaliza espacios. */
export function cleanFlavor(raw: string): string {
  return raw.replace(/\f|\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Adaptadores raw → dominio (puros, testeables).
 * ─────────────────────────────────────────────────────────────────────────── */

export function adaptSummary(raw: RawPokemon): PokemonSummary {
  return {
    id: raw.id,
    name: raw.name,
    sprite: spritePixel(raw.id),
    artwork: spriteArtwork(raw.id),
    types: raw.types.map((t) => t.type.name),
    generation: getGenerationIdForPokemon(raw.id),
    speciesId: idFromUrl(raw.species.url),
  };
}

export function adaptDetail(
  raw: RawPokemon,
  species: RawSpecies,
  chain: EvolutionNode[],
  abilities: PokemonAbility[],
  initialMoves: PokemonMove[],
): PokemonDetail {
  const statByName = (n: string) => raw.stats.find((s) => s.stat.name === n)?.base_stat ?? 0;

  const flavorEs = pickFlavorText(species, 'es');
  const flavorEn = pickFlavorText(species, 'en');

  return {
    ...adaptSummary(raw),
    height: raw.height,
    weight: raw.weight,
    baseExperience: raw.base_experience,
    abilities,
    stats: {
      hp: statByName('hp'),
      attack: statByName('attack'),
      defense: statByName('defense'),
      specialAttack: statByName('special-attack'),
      specialDefense: statByName('special-defense'),
      speed: statByName('speed'),
    },
    // Fallback cruzado: si falta una localización, usamos la otra.
    flavorText: { es: flavorEs || flavorEn, en: flavorEn || flavorEs },
    evolutionChain: chain,
    initialMoves,
  };
}

/** Aplana el árbol recursivo de PokéAPI a lista; ramas comparten `stage > 0`. */
export function flattenChain(node: RawChain, stage = 0, out: EvolutionNode[] = []): EvolutionNode[] {
  const id = idFromUrl(node.species.url);
  out.push({
    speciesId: id,
    name: node.species.name,
    sprite: spritePixel(id),
    stage,
    trigger: stage === 0 ? null : humanizeTrigger(node.evolution_details[0]),
  });
  for (const child of node.evolves_to) {
    flattenChain(child, stage + 1, out);
  }
  return out;
}

/** Mapa de slugs PokéAPI → nombre oficial localizado en español. Cubre las
 *  piedras evolutivas y los objetos de intercambio más comunes; cualquier
 *  slug no mapeado cae al título-case inglés. */
const ITEM_ES_LABELS: Record<string, string> = {
  'water-stone': 'Piedra Agua',
  'fire-stone': 'Piedra Fuego',
  'thunder-stone': 'Piedra Trueno',
  'leaf-stone': 'Piedra Hoja',
  'moon-stone': 'Piedra Lunar',
  'sun-stone': 'Piedra Solar',
  'shiny-stone': 'Piedra Día',
  'dusk-stone': 'Piedra Noche',
  'dawn-stone': 'Piedra Alba',
  'ice-stone': 'Piedra Hielo',
  'oval-stone': 'Piedra Oval',
  'kings-rock': 'Roca del Rey',
  'metal-coat': 'Manto Férreo',
  'dragon-scale': 'Escama Dragón',
  upgrade: 'Mejora',
  'dubious-disc': 'Disco Extraño',
  electirizer: 'Electrizador',
  magmarizer: 'Magmarizador',
  protector: 'Protector',
  'reaper-cloth': 'Tela Terrible',
  'razor-claw': 'Garra Afilada',
  'razor-fang': 'Colmillo Agudo',
  'prism-scale': 'Escama Bella',
  'deep-sea-tooth': 'Diente Profundo',
  'deep-sea-scale': 'Escama Profunda',
};

function titleCase(slug: string): string {
  return slug
    .split('-')
    .map((p) => (p.length === 0 ? p : p[0]!.toUpperCase() + p.slice(1)))
    .join(' ');
}

function localizeItem(slug: string): { es: string; en: string } {
  return { es: ITEM_ES_LABELS[slug] ?? titleCase(slug), en: titleCase(slug) };
}

/**
 * Devuelve la etiqueta del trigger en ambos idiomas. Mismo patrón que
 * `flavorText` / `abilities.names`: el server-side calcula los dos, el
 * cliente elige por locale sin re-fetch.
 *
 * Las condiciones se evalúan de la más específica (item, location) a la más
 * genérica (level-up) para diferenciar Espeon/Umbreon por `time_of_day` y
 * Leafeon/Glaceon por `location`.
 */
export function humanizeTrigger(
  details: RawChain['evolution_details'][number] | undefined,
): { es: string; en: string } | null {
  if (!details) return null;

  const item = details.item?.name;
  const location = details.location?.name;
  const tod = details.time_of_day;

  if (item) return localizeItem(item);

  if (location) {
    const place = titleCase(location);
    return { es: `En ${place}`, en: `At ${place}` };
  }

  if (details.min_happiness != null) {
    if (tod === 'day') return { es: 'Alta amistad (día)', en: 'High friendship (day)' };
    if (tod === 'night') return { es: 'Alta amistad (noche)', en: 'High friendship (night)' };
    return { es: 'Alta amistad', en: 'High friendship' };
  }

  if (details.min_affection != null) return { es: 'Alto afecto', en: 'High affection' };

  if (details.min_level) {
    if (tod === 'day') {
      return { es: `Nivel ${details.min_level} (día)`, en: `Level ${details.min_level} (day)` };
    }
    if (tod === 'night') {
      return { es: `Nivel ${details.min_level} (noche)`, en: `Level ${details.min_level} (night)` };
    }
    return { es: `Nivel ${details.min_level}`, en: `Level ${details.min_level}` };
  }

  if (details.trigger.name === 'trade') return { es: 'Intercambio', en: 'Trade' };
  if (details.trigger.name === 'shed') return { es: 'Caso especial', en: 'Special case' };
  if (details.trigger.name === 'level-up') {
    if (tod === 'day') return { es: 'Subir nivel (día)', en: 'Level up (day)' };
    if (tod === 'night') return { es: 'Subir nivel (noche)', en: 'Level up (night)' };
    return { es: 'Subir nivel', en: 'Level up' };
  }

  const fallback = titleCase(details.trigger.name);
  return { es: fallback, en: fallback };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Hidratación de habilidades y movimientos (necesitan fetch extra cada uno
 * porque PokéAPI no localiza nombre ni devuelve tipo desde `/pokemon/{id}`).
 * Se lanzan en paralelo desde `fetchPokemonDetail` con `Promise.all`.
 * ─────────────────────────────────────────────────────────────────────────── */

async function hydrateAbilities(raw: RawPokemon['abilities']): Promise<PokemonAbility[]> {
  return Promise.all(
    raw.map(async (a) => {
      const key = a.ability.name;
      const fallback = key.replace(/-/g, ' ');
      try {
        const data = await api<RawAbility>(a.ability.url);
        const pickByLang = (lang: string) =>
          data.names.find((n) => n.language.name === lang)?.name;
        const descEs = pickFlavorByVersionGroup(data.flavor_text_entries, 'es');
        const descEn = pickFlavorByVersionGroup(data.flavor_text_entries, 'en');
        return {
          key,
          names: {
            es: pickByLang('es') || pickByLang('en') || fallback,
            en: pickByLang('en') || pickByLang('es') || fallback,
          },
          description: { es: descEs || descEn, en: descEn || descEs },
          isHidden: a.is_hidden,
        };
      } catch {
        return {
          key,
          names: { es: fallback, en: fallback },
          description: { es: '', en: '' },
          isHidden: a.is_hidden,
        };
      }
    }),
  );
}

/** Top 6 movimientos por menor nivel de aprendizaje (level-up only). */
async function pickInitialMoves(raw: RawPokemon['moves']): Promise<PokemonMove[]> {
  const candidates = raw
    .map((m) => {
      let earliest = Number.POSITIVE_INFINITY;
      for (const v of m.version_group_details) {
        if (v.move_learn_method.name === 'level-up' && v.level_learned_at >= 1) {
          earliest = Math.min(earliest, v.level_learned_at);
        }
      }
      return Number.isFinite(earliest)
        ? { url: m.move.url, key: m.move.name, level: earliest }
        : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => a.level - b.level)
    .slice(0, 6);

  return Promise.all(
    candidates.map(async (c) => {
      const fallback = c.key.replace(/-/g, ' ');
      try {
        const data = await api<RawMove>(c.url);
        const pickByLang = (lang: string) =>
          data.names.find((n) => n.language.name === lang)?.name;
        const descEs = pickFlavorByVersionGroup(data.flavor_text_entries, 'es');
        const descEn = pickFlavorByVersionGroup(data.flavor_text_entries, 'en');
        return {
          key: c.key,
          names: {
            es: pickByLang('es') || pickByLang('en') || fallback,
            en: pickByLang('en') || pickByLang('es') || fallback,
          },
          description: { es: descEs || descEn, en: descEn || descEs },
          type: data.type.name,
          level: c.level,
        };
      } catch {
        return {
          key: c.key,
          names: { es: fallback, en: fallback },
          description: { es: '', en: '' },
          type: 'normal' as PokemonTypeName,
          level: c.level,
        };
      }
    }),
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Listado masivo. En lugar de 1025 fetches a `/pokemon/{id}`, usamos 18 a
 * `/type/{name}` (cada uno trae todos los Pokémon del tipo) + 1 a la lista
 * canónica de nombres. Total: 19 vs 1025. La generación se deriva del id sin
 * llamadas (rangos hard-codeados en `generations.ts`).
 * ─────────────────────────────────────────────────────────────────────────── */

interface RawTypeIndex {
  pokemon: { pokemon: { name: string; url: string } }[];
}

export async function fetchAllPokemonSummaries(): Promise<PokemonSummary[]> {
  const typesById = new Map<number, PokemonTypeName[]>();

  const TYPE_NAMES: PokemonTypeName[] = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
  ];

  await Promise.all(
    TYPE_NAMES.map(async (typeName) => {
      const data = await api<RawTypeIndex>(`/type/${typeName}`);
      for (const entry of data.pokemon) {
        const id = idFromUrl(entry.pokemon.url);
        if (id <= 0 || id > MAX_NATIONAL_DEX) continue;
        const list = typesById.get(id);
        if (list) list.push(typeName);
        else typesById.set(id, [typeName]);
      }
    }),
  );

  interface ListResp { results: { name: string; url: string }[] }
  const list = await api<ListResp>(`/pokemon?limit=${MAX_NATIONAL_DEX}`);

  const summaries: PokemonSummary[] = [];
  for (const item of list.results) {
    const id = idFromUrl(item.url);
    if (id <= 0 || id > MAX_NATIONAL_DEX) continue;
    const types = typesById.get(id);
    if (!types || types.length === 0) continue;

    summaries.push({
      id,
      name: item.name,
      sprite: spritePixel(id),
      artwork: spriteArtwork(id),
      types,
      generation: getGenerationIdForPokemon(id),
      speciesId: id,
    });
  }

  summaries.sort((a, b) => a.id - b.id);
  return summaries;
}

export async function fetchPokemonDetail(idOrName: number | string): Promise<PokemonDetail> {
  const raw = await api<RawPokemon>(`/pokemon/${idOrName}`);
  const species = await api<RawSpecies>(raw.species.url);
  const evo = await api<RawEvolution>(species.evolution_chain.url);

  const [abilities, initialMoves] = await Promise.all([
    hydrateAbilities(raw.abilities),
    pickInitialMoves(raw.moves),
  ]);

  return adaptDetail(raw, species, flattenChain(evo.chain), abilities, initialMoves);
}

export async function fetchEvolutionChainBySpeciesId(speciesId: number): Promise<EvolutionNode[]> {
  const species = await api<RawSpecies>(`/pokemon-species/${speciesId}`);
  const evo = await api<RawEvolution>(species.evolution_chain.url);
  return flattenChain(evo.chain);
}

/** Mapa speciesId → ids de toda su línea evolutiva. Lo usa la búsqueda para
 *  expandir un match por nombre a toda la familia (Pikachu ↔ Pichu/Raichu). */
export async function fetchEvolutionAdjacency(): Promise<Map<number, number[]>> {
  interface ChainListResp { results: { url: string }[] }
  const list = await api<ChainListResp>(`/evolution-chain?limit=600`);
  const adjacency = new Map<number, number[]>();

  await Promise.all(
    list.results.map(async ({ url }) => {
      try {
        const evo = await api<RawEvolution>(url);
        const ids = flattenChain(evo.chain).map((n) => n.speciesId);
        for (const id of ids) {
          adjacency.set(id, ids);
        }
      } catch {
        // Algunas chains rotas en la API → ignorar en lugar de romper todo.
      }
    }),
  );

  return adjacency;
}

export { GENERATIONS };
export type { GenerationId, RawPokemon, RawSpecies };
