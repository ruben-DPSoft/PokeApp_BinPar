'use client';

import type { PokemonTypeName } from '@/types/pokemon';
import { TYPE_COLOR, cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/useT';
import { typeSymbolIcon } from '@/lib/pokemon/sprites';
import type { DictKey } from '@/lib/i18n/dictionaries';

interface TypeDiscProps {
  type: PokemonTypeName;
  className?: string;
}

/**
 * Disco TCG sin etiqueta — sólo el glifo del tipo. Para contextos donde el
 * texto sobra (corners de cards). El nombre se expone vía `aria-label` y
 * `title`. El tamaño lo fija el padre (`w-* h-*`).
 */
function pickGlyphFillId(hex: string): 'white' | 'dark' {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return luma > 158 ? 'dark' : 'white';
}

export function TypeDisc({ type, className }: TypeDiscProps) {
  const t = useT();
  const color = TYPE_COLOR[type];
  const label = t(`type.${type}` as DictKey);
  const filterUrl = `url(#glyph-fill-${pickGlyphFillId(color)})`;

  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn('type-tcg-disc', className)}
      style={{ ['--type-color' as string]: color }}
    >
      <img
        src={typeSymbolIcon(type)}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className="type-tcg-glyph"
        style={{ filter: filterUrl }}
      />
    </span>
  );
}
