'use client';

import Link from 'next/link';
import type { PokemonSummary } from '@/types/pokemon';
import { TYPE_COLOR, prettyName } from '@/lib/utils';
import { PokemonSprite } from '@/components/common/PokemonSprite';
import { TypeDisc } from '@/components/common/TypeDisc';
import { GENERATIONS } from '@/lib/pokemon/generations';
import { useCardTilt } from '@/hooks/useCardTilt';
import { useT } from '@/lib/i18n/useT';

interface PokemonCardProps {
  pokemon: PokemonSummary;
}

/**
 * Card estilo "carta TCG editorial". Layout:
 *   - Watermark Pokéball + número Dex gigante de fondo.
 *   - Nombre arriba; sprite en el centro (paralaje 3D vía `useCardTilt`).
 *   - Bottom row: discos de tipo (izq.) + Gen·Región (der.), centrados entre sí.
 */
export function PokemonCard({ pokemon }: PokemonCardProps) {
  const tiltRef = useCardTilt();
  const t = useT();

  const primary = pokemon.types[0] ?? 'normal';
  const secondary = pokemon.types[1] ?? primary;
  const generation = GENERATIONS.find((g) => g.id === pokemon.generation);
  const name = prettyName(pokemon.name);

  const gradient = `linear-gradient(145deg, ${TYPE_COLOR[primary]} 0%, color-mix(in srgb, ${TYPE_COLOR[secondary]}, black 30%) 100%)`;

  // Desincroniza el brillo ambiente entre cartas (12 fases × 0.66 s = 8 s ciclo).
  const shineDelay = `${(pokemon.id % 12) * -0.66}s`;
  // El número va sin "#" en la marca de agua (cuatro dígitos pad-left).
  const dexDigits = String(pokemon.id).padStart(4, '0');

  return (
    <Link
      ref={tiltRef}
      href={`/pokemon/${pokemon.id}`}
      aria-label={name}
      className="card-3d rounded-2xl"
    >
      <div className="card-3d-inner" style={{ background: gradient }}>
        <div className="card-3d-watermark" aria-hidden />

        {/* Número Dex gigante de fondo — mismo recurso visual que el hero del
            detalle, escalado al tamaño de la card. */}
        <span className="card-3d-dex-bg" aria-hidden>
          {dexDigits}
        </span>

        {/* Nombre arriba */}
        <h3 className="card-3d-name">{name}</h3>

        {/* Ilustración centrada */}
        <div className="card-3d-image-layer">
          <PokemonSprite
            src={pokemon.artwork}
            fallbackId={pokemon.id}
            alt={name}
            className="max-w-full max-h-full w-auto h-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* Fila inferior: discos del tipo a la izquierda, generación+región
            a la derecha. Los envuelvo en un flex con `items-center` para que
            los textos queden VERTICALMENTE CENTRADOS contra los discos —
            antes ambos colgaban del `bottom-2` y sus centros estaban a
            distinta altura por la diferencia de tamaños. */}
        <div className="card-3d-bottom-row">
          <div className="card-3d-types-corner">
            {pokemon.types.map((typeName) => (
              <TypeDisc key={typeName} type={typeName} />
            ))}
          </div>
          {generation && (
            <div className="card-3d-gen-corner">
              <span className="card-3d-gen-num">{t('filter.gen_short')} {generation.id}</span>
              <span className="card-3d-gen-region">{generation.region}</span>
            </div>
          )}
        </div>

        <div className="card-3d-shine" style={{ animationDelay: shineDelay }} aria-hidden />
        <div className="card-3d-specular" aria-hidden />
      </div>
    </Link>
  );
}
