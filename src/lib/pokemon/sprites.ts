/**
 * URLs de sprites servidos desde el CDN de github.com/PokeAPI/sprites.
 *
 * Llamamos directamente al CDN para evitar hacer una request al backend de la
 * PokéAPI por cada sprite (sería 1000+ llamadas innecesarias). Las URLs son
 * determinísticas a partir del id del Pokémon o del tipo.
 */
import type { PokemonTypeName } from '@/types/pokemon';

const POKEMON_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

/** Sprite frontal pixel-art (96x96). Ligero, ideal para listas largas. */
export function spritePixel(id: number): string {
  return `${POKEMON_BASE}/${id}.png`;
}

/** Official artwork (HD ~475x475). Para hero/detalle/cards. */
export function spriteArtwork(id: number): string {
  return `${POKEMON_BASE}/other/official-artwork/${id}.png`;
}

/** Sprite "dream world" SVG. Algunos ids no existen, lo dejamos como opcional. */
export function spriteDreamWorld(id: number): string {
  return `${POKEMON_BASE}/other/dream-world/${id}.svg`;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Iconos oficiales de tipo
 *
 * PokéAPI guarda dos sabores por cada juego/generación:
 *   - name_icon  → pill horizontal con el nombre del tipo escrito (estilo TCG).
 *   - symbol_icon → sólo el glifo (la llama, la gota, ...) en una hexágono.
 *
 * Usamos Scarlet/Violet (Gen 9) porque es el set más moderno y consistente
 * con el look 2022+. Si en el futuro Game Freak lanza una nueva tanda, basta
 * cambiar `TYPE_SET` para migrar TODA la UI a otra estética.
 *
 * Los IDs son los canónicos del juego (Normal=1, Fire=10, ...). Los hard-codeamos
 * porque son inmutables — la alternativa sería pedirlos al endpoint /type/{name}
 * y arrastrar 18 fetches sólo para resolver iconos. No tiene sentido.
 * ────────────────────────────────────────────────────────────────────────── */

const TYPE_SPRITES_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types';
const TYPE_SET = 'generation-ix/scarlet-violet';

export const TYPE_ID: Record<PokemonTypeName, number> = {
  normal: 1,
  fighting: 2,
  flying: 3,
  poison: 4,
  ground: 5,
  rock: 6,
  bug: 7,
  ghost: 8,
  steel: 9,
  fire: 10,
  water: 11,
  grass: 12,
  electric: 13,
  psychic: 14,
  ice: 15,
  dragon: 16,
  dark: 17,
  fairy: 18,
};

/** Glifo del tipo, sin texto. Para chips y filtros. */
export function typeSymbolIcon(t: PokemonTypeName): string {
  return `${TYPE_SPRITES_BASE}/${TYPE_SET}/small/${TYPE_ID[t]}.png`;
}

/** Pill oficial con texto del tipo. Para impactos visuales grandes (detalle). */
export function typeNameIcon(t: PokemonTypeName): string {
  return `${TYPE_SPRITES_BASE}/${TYPE_SET}/${TYPE_ID[t]}.png`;
}
