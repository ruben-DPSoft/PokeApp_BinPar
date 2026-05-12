'use client';

import type { PokemonTypeName } from '@/types/pokemon';
import { TYPE_COLOR, cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/useT';
import { typeSymbolIcon } from '@/lib/pokemon/sprites';
import type { DictKey } from '@/lib/i18n/dictionaries';

interface TypeBadgeProps {
  type: PokemonTypeName;
  size?: 'sm' | 'md';
  className?: string;
}

/** Elige fill del glifo por luminancia: > 158 → oscuro, ≤ 158 → blanco.
 *  Duplicada (no compartida) para no acoplar `utils` a los IDs del SVG filter. */
function pickGlyphFillId(hex: string): 'white' | 'dark' {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return luma > 158 ? 'dark' : 'white';
}

/**
 * Badge de tipo compacta para Tabla y modo Pokédex. Pill con banner del color
 * del tipo + disco TCG interno con glifo (mismo SVG filter que TypeFilter).
 * Tamaño del disco sobrescrito con `w-5`/`w-6` (utility > component layer).
 *
 * Las cards del modo Cards usan `TypeDisc` (sólo el disco, sin pill).
 */
export function TypeBadge({ type, size = 'sm', className }: TypeBadgeProps) {
  const t = useT();
  const color = TYPE_COLOR[type];
  const label = t(`type.${type}` as DictKey);
  const isMd = size === 'md';
  const filterUrl = `url(#glyph-fill-${pickGlyphFillId(color)})`;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold text-white tracking-wide whitespace-nowrap',
        isMd
          ? 'gap-2.5 pl-1.5 pr-4 py-1.5 text-sm'
          : 'gap-1.5 pl-0.5 pr-2.5 py-0.5 text-[11px]',
        className,
      )}
      style={{
        background: `linear-gradient(180deg, ${color}, ${color}cc)`,
        boxShadow: `0 0 0 1px ${color}55, 0 2px 6px ${color}33`,
        // Un text-shadow sutil mejora la legibilidad del texto blanco sobre
        // tipos claros (eléctrico, hielo, hada, acero…).
        textShadow: '0 1px 1px rgba(0, 0, 0, 0.3)',
        ['--type-color' as string]: color,
      }}
      title={label}
    >
      <span className={cn('type-tcg-disc', isMd ? 'w-9 h-9' : 'w-5 h-5')}>
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
      {label}
    </span>
  );
}
