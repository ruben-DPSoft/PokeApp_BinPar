'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useT } from '@/lib/i18n/useT';
import { usePokemonDetail } from '@/hooks/usePokemonData';
import type { PokemonDetail } from '@/types/pokemon';
import { TYPE_COLOR } from '@/lib/utils';
import { PokemonSlot } from './PokemonSlot';
import { StatsRadar } from './StatsRadar';
import { StatsBars } from './StatsBars';
import { ComparatorSummary } from './ComparatorSummary';

/** Colores por defecto cuando aún no hay Pokémon seleccionados — amarillo y
 *  naranja del proyecto, claramente distinguibles entre sí. */
const DEFAULT_COLOR_A = '#f8d030';
const DEFAULT_COLOR_B = '#ed4a08';

/** Paleta de fallback para resolver colisiones (cuando ambos Pokémon tienen
 *  el mismo tipo primario y ninguna alternativa secundaria funciona).
 *  Cuatro colores muy distintos entre sí para garantizar contraste. */
const FALLBACK_PALETTE = ['#ed4a08', '#3aa6ff', '#5fc46a', '#a890f0'];

function pickAltColor(usedColor: string): string {
  const used = usedColor.toLowerCase();
  return FALLBACK_PALETTE.find((c) => c.toLowerCase() !== used) ?? '#ed4a08';
}

/**
 * Deriva los colores del comparador a partir del tipo primario de cada
 * Pokémon. Si ambos comparten color, intenta usar el tipo secundario de B;
 * si tampoco resuelve, cae a la paleta de fallback.
 */
function deriveColors(
  a: PokemonDetail | undefined,
  b: PokemonDetail | undefined,
): { a: string; b: string } {
  const colorA = a ? TYPE_COLOR[a.types[0] ?? 'normal'] : DEFAULT_COLOR_A;
  let colorB = b ? TYPE_COLOR[b.types[0] ?? 'normal'] : DEFAULT_COLOR_B;
  if (a && b && colorA === colorB) {
    const secondary = b.types[1];
    if (secondary && TYPE_COLOR[secondary] !== colorA) {
      colorB = TYPE_COLOR[secondary];
    } else {
      colorB = pickAltColor(colorA);
    }
  }
  return { a: colorA, b: colorB };
}

/**
 * Vista del comparador. Estado en URL (`?a=25&b=6`) para que sea shareable.
 * Defaults a Pikachu vs Charizard si no vienen params.
 */
export function ComparatorView() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sin defaults: empezamos vacío y dejamos que el usuario elija. La URL
  // mantiene el estado si compartes el enlace (`?a=25&b=6` sí precarga).
  const [idA, setIdA] = useState<number | null>(parseId(searchParams.get('a')));
  const [idB, setIdB] = useState<number | null>(parseId(searchParams.get('b')));

  // Sincroniza estado → URL. `router.replace` para no apilar entradas en history.
  useEffect(() => {
    const sp = new URLSearchParams();
    if (idA != null) sp.set('a', String(idA));
    if (idB != null) sp.set('b', String(idB));
    const qs = sp.toString();
    router.replace(qs ? `/compare?${qs}` : '/compare', { scroll: false });
  }, [idA, idB, router]);

  const detailA = usePokemonDetail(idA);
  const detailB = usePokemonDetail(idB);

  const swap = useCallback(() => {
    setIdA(idB);
    setIdB(idA);
  }, [idA, idB]);

  const colors = useMemo(
    () => deriveColors(detailA.data, detailB.data),
    [detailA.data, detailB.data],
  );

  const bothReady = !!detailA.data && !!detailB.data;

  // Datos para radar y barras — sólo si ambos están listos.
  const statRows = useMemo(() => {
    if (!detailA.data || !detailB.data) return [];
    const a = detailA.data.stats;
    const b = detailB.data.stats;
    return [
      { key: 'hp', label: t('detail.stats.hp'), a: a.hp, b: b.hp },
      { key: 'attack', label: t('detail.stats.attack'), a: a.attack, b: b.attack },
      { key: 'defense', label: t('detail.stats.defense'), a: a.defense, b: b.defense },
      { key: 'sp_attack', label: t('detail.stats.sp_attack'), a: a.specialAttack, b: b.specialAttack },
      { key: 'sp_defense', label: t('detail.stats.sp_defense'), a: a.specialDefense, b: b.specialDefense },
      { key: 'speed', label: t('detail.stats.speed'), a: a.speed, b: b.speed },
    ];
  }, [detailA.data, detailB.data, t]);

  return (
    <article className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="display text-3xl sm:text-4xl font-black text-ink-50">{t('compare.title')}</h1>
          <p className="mt-1 text-sm text-ink-300 max-w-prose">{t('compare.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={swap}
          disabled={!bothReady}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-overlay/15 bg-overlay/[0.04] hover:bg-overlay/[0.08] text-ink-100 font-semibold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
          {t('compare.swap')}
        </button>
      </header>

      {/* Slots A vs B con VS en medio (en sm+) */}
      <section className="grid sm:grid-cols-[1fr_auto_1fr] items-stretch gap-3 sm:gap-2">
        <PokemonSlot
          id={idA}
          accent={colors.a}
          onChange={setIdA}
          excludeId={idB}
        />
        <div className="hidden sm:flex items-center justify-center px-1">
          <img
            src="/assets/vs.png"
            alt={t('compare.vs')}
            className="w-14 h-14 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
          />
        </div>
        <PokemonSlot
          id={idB}
          accent={colors.b}
          onChange={setIdB}
          excludeId={idA}
        />
      </section>

      {bothReady && detailA.data && detailB.data ? (
        <>
          <section className="grid lg:grid-cols-2 gap-4">
            <div className="panel-strong p-4 sm:p-5">
              <StatsRadar
                rows={statRows}
                nameA={detailA.data.name}
                nameB={detailB.data.name}
                colorA={colors.a}
                colorB={colors.b}
              />
            </div>
            <div className="panel-strong p-4 sm:p-5">
              <header className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h2 className="display text-lg font-bold text-ink-50">{t('compare.stats.heading')}</h2>
                <div className="flex items-center gap-3 text-xs text-ink-300">
                  <Legend color={colors.a} name={prettyish(detailA.data.name)} />
                  <Legend color={colors.b} name={prettyish(detailB.data.name)} />
                </div>
              </header>
              <StatsBars rows={statRows} colorA={colors.a} colorB={colors.b} />
            </div>
          </section>

          <ComparatorSummary a={detailA.data} b={detailB.data} colorA={colors.a} colorB={colors.b} />
        </>
      ) : detailA.isLoading || detailB.isLoading ? (
        <div className="panel-strong p-10 text-center text-ink-200 animate-pulse">…</div>
      ) : (
        <div className="panel-strong p-10 text-center text-ink-200">
          {t('compare.pick_both')}
        </div>
      )}
    </article>
  );
}

function Legend({ color, name }: { color: string; name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden className="w-3 h-3 rounded-full" style={{ background: color }} />
      <span className="capitalize">{name}</span>
    </span>
  );
}

function parseId(raw: string | null): number | null {
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function prettyish(name: string): string {
  return name.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}
