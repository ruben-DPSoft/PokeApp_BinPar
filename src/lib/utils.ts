import type { PokemonTypeName } from '@/types/pokemon';

/** Concatena clases ignorando falsy. Equivalente a `clsx` sin dependencia extra. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Formato "#0025" — padding a 4 dígitos para que todos los IDs (1-1025+)
 *  tengan la misma longitud y queden alineados en tablas/cards. */
export function formatDex(id: number): string {
  return `#${id.toString().padStart(4, '0')}`;
}

/** Capitaliza un nombre (pikachu → Pikachu, mr-mime → Mr Mime). */
export function prettyName(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** Devuelve el max teórico de cada stat (canon competitivo). Para barras. */
export const STAT_MAX = 255;

/**
 * Tabla de colores hex por tipo. Idéntica a la tailwind.config.ts pero accesible
 * desde JS — útil para gradientes inline (cards con dos tipos, p.ej.).
 */
export const TYPE_COLOR: Record<PokemonTypeName, string> = {
  normal: '#a8a878',
  fire: '#f08030',
  water: '#6890f0',
  electric: '#f8d030',
  grass: '#78c850',
  ice: '#98d8d8',
  fighting: '#c03028',
  poison: '#a040a0',
  ground: '#e0c068',
  flying: '#a890f0',
  psychic: '#f85888',
  bug: '#a8b820',
  rock: '#b8a038',
  ghost: '#705898',
  dragon: '#7038f8',
  dark: '#705848',
  steel: '#b8b8d0',
  fairy: '#ee99ac',
};

/**
 * Etiquetas en español de los tipos.
 *
 * @deprecated A partir de la introducción de i18n, prefiere `useT()` con la
 * clave `type.${typeName}` para obtener la etiqueta en el idioma activo. Se
 * mantiene como fallback estático para contextos no-cliente (logs, tests).
 */
export const TYPE_LABEL: Record<PokemonTypeName, string> = {
  normal: 'Normal',
  fire: 'Fuego',
  water: 'Agua',
  electric: 'Eléctrico',
  grass: 'Planta',
  ice: 'Hielo',
  fighting: 'Lucha',
  poison: 'Veneno',
  ground: 'Tierra',
  flying: 'Volador',
  psychic: 'Psíquico',
  bug: 'Bicho',
  rock: 'Roca',
  ghost: 'Fantasma',
  dragon: 'Dragón',
  dark: 'Siniestro',
  steel: 'Acero',
  fairy: 'Hada',
};
