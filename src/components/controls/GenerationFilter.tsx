'use client';

import { useState } from 'react';
import { useFiltersStore } from '@/store/filters';
import { GENERATIONS } from '@/lib/pokemon/generations';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/useT';
import type { GenerationId } from '@/types/pokemon';
import { CollapsibleHeader, Chevron } from './CollapsibleHeader';

/**
 * Filtro de generación multi-select. `md+`: rejilla full-width de 9 "monedas
 * TCG"; `<md`: selector colapsable.
 *
 * Las gens no tienen color oficial — uso una rampa derivada de tipos asociados
 * a cada región (ver `GEN_HUES`).
 */
const GEN_HUES: Record<GenerationId, string> = {
  1: '#ed4a08', // flame brand (Kanto — el original)
  2: '#f7b500', // electric — Johto
  3: '#3aa6ff', // water blue — Hoenn (tema marítimo)
  4: '#7038f8', // dragon purple — Sinnoh
  5: '#3ea748', // leaf — Teselia
  6: '#ee99ac', // fairy pink — Kalos (introdujo el tipo hada)
  7: '#f08030', // fire orange — Alola (tema tropical/volcán)
  8: '#705898', // ghost purple — Galar
  9: '#c03028', // fighting red — Paldea (la más reciente)
};

export function GenerationFilter() {
  const selected = useFiltersStore((s) => s.generations);
  const toggle = useFiltersStore((s) => s.toggleGeneration);
  const open = useFiltersStore((s) => s.generationsOpen);
  const setOpen = useFiltersStore((s) => s.setGenerationsOpen);
  const t = useT();

  return (
    <section role="group" aria-label={t('filter.generation.aria')}>
      <CollapsibleHeader
        label={t('filter.generation.label')}
        badgeCount={selected.length}
        open={open}
        onToggle={() => setOpen(!open)}
      />

      {open && (
        <div className="mt-2">
          {/* Mobile: selector */}
          <div className="md:hidden">
            <GenerationMobileSelector />
          </div>

          {/* Desktop: rejilla full-width */}
          <div className="hidden md:grid grid-cols-9 gap-2 w-full">
            {GENERATIONS.map((g) => (
              <GenCoin
                key={g.id}
                id={g.id as GenerationId}
                region={g.region}
                active={selected.includes(g.id as GenerationId)}
                onToggle={() => toggle(g.id as GenerationId)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/** Moneda de generación: pill cuadrada con número grande + región abajo,
 *  gradiente oscuro de `GEN_HUES[id]`, neón cuando está activa. */
interface GenCoinProps {
  id: GenerationId;
  region: string;
  active: boolean;
  onToggle: () => void;
}

function GenCoin({ id, region, active, onToggle }: GenCoinProps) {
  const hue = GEN_HUES[id];
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onToggle}
      className={cn('gen-coin', active && 'gen-coin-active')}
      style={{ ['--gen-color' as string]: hue }}
    >
      <span className="gen-coin-num">{id}</span>
      <span className="gen-coin-region">{region}</span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Selector móvil de generaciones
 * ────────────────────────────────────────────────────────────────────────────*/

function GenerationMobileSelector() {
  const selected = useFiltersStore((s) => s.generations);
  const toggle = useFiltersStore((s) => s.toggleGeneration);
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
            ? t('filter.all_fem')
            : selected.length === 1
              ? t('filter.selected_count', { count: selected.length })
              : t('filter.selected_count_plural', { count: selected.length })}
        </span>
        <Chevron open={open} />
      </button>

      {open && (
        <div className="p-2 grid grid-cols-3 gap-2 border-t border-overlay/10">
          {GENERATIONS.map((g) => (
            <GenCoin
              key={g.id}
              id={g.id as GenerationId}
              region={g.region}
              active={selected.includes(g.id as GenerationId)}
              onToggle={() => toggle(g.id as GenerationId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
