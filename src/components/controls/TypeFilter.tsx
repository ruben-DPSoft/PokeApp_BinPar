'use client';

import { useFiltersStore } from '@/store/filters';
import { TYPE_COLOR, cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/useT';
import { typeSymbolIcon } from '@/lib/pokemon/sprites';
import type { PokemonTypeName } from '@/types/pokemon';
import type { DictKey } from '@/lib/i18n/dictionaries';
import { CollapsibleHeader, Chevron } from './CollapsibleHeader';
import { useState } from 'react';

const ROW_TOP: readonly PokemonTypeName[] = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground',
];
const ROW_BOTTOM: readonly PokemonTypeName[] = [
  'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
];
const ALL_TYPES = [...ROW_TOP, ...ROW_BOTTOM] as const;

/**
 * Offset del patrón ladrillo, derivado a `(100% + gap) / 19`. Ver historia en
 * el comentario previo de este archivo: con margin simétrico (mr en fila 1,
 * ml en fila 2), ambas filas quedan dentro del contenedor sin recortes.
 */
const BRICK_SHIFT = 'calc((100% + 0.5rem) / 19)';

/**
 * pickGlyphFill decide blanco u oscuro para el glifo según la luminancia del
 * color del tipo. Mismo umbral que TypeBadge — los 18 colores quedan repartidos
 * casi 50/50 entre glifo blanco (tipos oscuros) y oscuro (tipos claros).
 */
function pickGlyphFillId(hex: string): 'white' | 'dark' {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 158 ? 'dark' : 'white';
}

/**
 * Filtro de tipo multi-select con tres layouts:
 *  - `xl+`     → ladrillo 9+9.
 *  - `md-xl`   → rejilla 6 cols.
 *  - `<md`     → selector colapsable con rejilla 3×6.
 *
 * Cada botón usa fondo oscuro derivado del color del tipo (`color-mix` con
 * negro 22-48%); activo añade halo de neón vía `box-shadow` multi-capa.
 * Varios tipos activos brillan con su propio color sin solapamiento.
 */
export function TypeFilter() {
  const selected = useFiltersStore((s) => s.types);
  const toggle = useFiltersStore((s) => s.toggleType);
  const open = useFiltersStore((s) => s.typesOpen);
  const setOpen = useFiltersStore((s) => s.setTypesOpen);
  const t = useT();

  const renderButton = (typeName: PokemonTypeName) => (
    <TypeTcgButton
      key={typeName}
      type={typeName}
      label={t(`type.${typeName}` as DictKey)}
      active={selected.includes(typeName)}
      onToggle={() => toggle(typeName)}
    />
  );

  return (
    <section role="group" aria-label={t('filter.type.aria')}>
      <CollapsibleHeader
        label={t('filter.type.label')}
        badgeCount={selected.length}
        open={open}
        onToggle={() => setOpen(!open)}
      />

      {open && (
        <div className="mt-2">
          {/* Mobile (<md): selector colapsable */}
          <div className="md:hidden">
            <TypeMobileSelector />
          </div>

          {/* md-xl: rejilla 6 columnas con texto */}
          <div className="hidden md:block xl:hidden">
            <div className="grid grid-cols-6 gap-2">
              {ALL_TYPES.map(renderButton)}
            </div>
          </div>

          {/* xl+: patrón ladrillo 9+9 con margin simétrico */}
          <div className="hidden xl:block space-y-2">
            <div className="grid grid-cols-9 gap-2" style={{ marginRight: BRICK_SHIFT }}>
              {ROW_TOP.map(renderButton)}
            </div>
            <div className="grid grid-cols-9 gap-2" style={{ marginLeft: BRICK_SHIFT }}>
              {ROW_BOTTOM.map(renderButton)}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Botón individual de tipo (md+)
 * ────────────────────────────────────────────────────────────────────────────*/

interface TypeTcgButtonProps {
  type: PokemonTypeName;
  label: string;
  active: boolean;
  onToggle: () => void;
}

function TypeTcgButton({ type, label, active, onToggle }: TypeTcgButtonProps) {
  const color = TYPE_COLOR[type];
  const filterUrl = `url(#glyph-fill-${pickGlyphFillId(color)})`;

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onToggle}
      className={cn('type-tcg-btn', active && 'type-tcg-btn-active')}
      style={{ ['--type-color' as string]: color }}
    >
      <span className="type-tcg-disc">
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
      <span className="type-tcg-label">{label}</span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Selector móvil — `<details>` colapsable + rejilla compacta
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Por debajo de md (768px) los botones laterales con texto no caben. En lugar
 * de truncar o miniaturizar, monto un selector tipo dropdown:
 *  - Cabecera con el resumen ("Tipo · 3 seleccionados") + chevron.
 *  - Click abre una rejilla 3×6 con todos los tipos, cada uno con su disco y
 *    nombre. El usuario marca/desmarca con tap directo.
 *  - Los chips activos se ven en `ActiveFilters` aunque el selector esté cerrado.
 */
function TypeMobileSelector() {
  const selected = useFiltersStore((s) => s.types);
  const toggle = useFiltersStore((s) => s.toggleType);
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl bg-overlay/[0.04] border border-overlay/10">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-ink-100"
      >
        <span>
          {selected.length === 0
            ? t('filter.all')
            : `${selected.length} ${
                selected.length === 1 ? t('filter.selected_count', { count: selected.length }) : t('filter.selected_count_plural', { count: selected.length })
              }`}
        </span>
        <Chevron open={open} />
      </button>

      {open && (
        <div className="p-2 grid grid-cols-3 gap-2 border-t border-overlay/10">
          {ALL_TYPES.map((typeName) => {
            const color = TYPE_COLOR[typeName];
            const filterUrl = `url(#glyph-fill-${pickGlyphFillId(color)})`;
            const isActive = selected.includes(typeName);
            return (
              <button
                key={typeName}
                type="button"
                aria-pressed={isActive}
                onClick={() => toggle(typeName)}
                className={cn(
                  'type-tcg-btn type-tcg-btn-mobile',
                  isActive && 'type-tcg-btn-active',
                )}
                style={{ ['--type-color' as string]: color }}
              >
                <span className="type-tcg-disc">
                  <img
                    src={typeSymbolIcon(typeName)}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    decoding="async"
                    className="type-tcg-glyph"
                    style={{ filter: filterUrl }}
                  />
                </span>
                <span className="type-tcg-label">{t(`type.${typeName}` as DictKey)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
