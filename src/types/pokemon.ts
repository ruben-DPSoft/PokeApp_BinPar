/**
 * Tipos de dominio que usa la aplicación.
 *
 * No reflejan 1:1 las respuestas de la PokéAPI: en la capa de API normalizamos
 * lo que necesitamos a estos modelos para que el resto de la aplicación trabaje
 * con estructuras estables y mínimas. Si la PokéAPI cambia algo internamente,
 * solo cambia el adaptador.
 */

export type PokemonTypeName =
  | 'normal'
  | 'fire'
  | 'water'
  | 'electric'
  | 'grass'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy';

export type GenerationId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface GenerationInfo {
  id: GenerationId;
  /** Rango inclusivo de IDs de Pokémon que pertenecen a esta generación. */
  range: readonly [number, number];
  /** Nombre legible (Kanto, Johto, ...). */
  region: string;
}

/**
 * Stats canónicas. Mantenemos el mismo orden con el que la PokéAPI las devuelve
 * para que sean directamente representables en una "radar/bar chart".
 */
export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

/**
 * Vista ligera de un Pokémon — la que usamos en el listado.
 *
 * Pensada para ser barata: sprites pequeños, sin árboles evolutivos, etc.
 * Se renderizan cientos a la vez, así que mantenerla compacta importa.
 */
export interface PokemonSummary {
  id: number;
  name: string;
  /** Sprite oficial del frontal en pixel-art. */
  sprite: string;
  /** Sprite renderizado HD (official-artwork). Lo usamos en cards y detalle. */
  artwork: string;
  types: PokemonTypeName[];
  generation: GenerationId;
  /** Id de la especie para resolver la cadena evolutiva sin llamar de nuevo. */
  speciesId: number;
}

/**
 * Vista completa de un Pokémon — la usamos solo en la página de detalle.
 */
export interface PokemonDetail extends PokemonSummary {
  height: number; // decímetros (como devuelve la API)
  weight: number; // hectogramos
  baseExperience: number | null;
  abilities: PokemonAbility[];
  stats: PokemonStats;
  /**
   * Texto Pokédex en cada idioma soportado.
   *
   * Servimos ambas variantes en el payload del detalle (en lugar de pre-elegir
   * una en servidor) para que el cliente pueda alternar idioma sin re-fetch:
   * con ~150-300 caracteres por entrada, el coste extra de tráfico es marginal
   * y la UX gana mucho — la descripción cambia al toggle de idioma como el
   * resto de la interfaz.
   *
   * Si no hay descripción en un idioma, se rellena con la del otro (fallback).
   */
  flavorText: { es: string; en: string };
  /** Especies que forman la cadena evolutiva del Pokémon actual. */
  evolutionChain: EvolutionNode[];
  /** Hasta 6 movimientos aprendidos a los niveles más bajos. */
  initialMoves: PokemonMove[];
}

export interface PokemonAbility {
  /** Slug canónico inglés (key estable para React + debug). */
  key: string;
  /** Nombre localizado en cada idioma soportado, con fallback cruzado. */
  names: { es: string; en: string };
  /** Flavor text del juego más moderno disponible, por idioma. */
  description: { es: string; en: string };
  isHidden: boolean;
}

/**
 * Movimiento "inicial" — aprendido por nivel-up en una fase temprana. La UI
 * muestra los 6 con el nivel más bajo de aprendizaje (un overview, no la
 * lista completa de ~80 movimientos por Pokémon).
 */
export interface PokemonMove {
  key: string;
  names: { es: string; en: string };
  description: { es: string; en: string };
  type: PokemonTypeName;
  /** Nivel mínimo de aprendizaje entre todas las versiones de juego. */
  level: number;
}

/**
 * Nodo plano de cadena evolutiva (árbol PokéAPI aplanado a lista). Ramas
 * (Eevee, Tyrogue) comparten el mismo `stage > 0`.
 */
export interface EvolutionNode {
  speciesId: number;
  name: string;
  sprite: string;
  /** 0 = base, 1 = primera evolución, 2 = segunda. */
  stage: number;
  /** Texto humanizado del trigger en ambos idiomas (Piedra Agua / Water Stone,
   *  Nivel 16 / Level 16, etc.). `null` en el Pokémon base (stage 0). */
  trigger: { es: string; en: string } | null;
}
