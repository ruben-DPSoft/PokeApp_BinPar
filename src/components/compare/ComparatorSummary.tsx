'use client';

import type { PokemonDetail } from '@/types/pokemon';
import { useT } from '@/lib/i18n/useT';
import { PokemonSprite } from '@/components/common/PokemonSprite';
import { cn, prettyName } from '@/lib/utils';

interface ComparatorSummaryProps {
  a: PokemonDetail;
  b: PokemonDetail;
  colorA: string;
  colorB: string;
}

export function ComparatorSummary({ a, b, colorA, colorB }: ComparatorSummaryProps) {
  const t = useT();
  const totalA = sumStats(a);
  const totalB = sumStats(b);
  return (
    <section className="panel-strong p-4 sm:p-5">
      <div className="grid sm:grid-cols-[auto_1fr_1fr] gap-4 items-center">
        <div className="hidden sm:flex flex-col items-center justify-center gap-1 pr-3 sm:pr-5 sm:border-r sm:border-overlay/10">
          <span
            aria-hidden
            className="grid place-items-center w-10 h-10 rounded-xl bg-ink-900/60 border border-overlay/10 text-ink-200"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          </span>
          <p className="display text-sm font-bold text-ink-50">{t('compare.summary.heading')}</p>
          <p className="text-[10px] text-ink-400 text-center max-w-[140px] leading-tight">
            {t('compare.summary.help')}
          </p>
        </div>

        <SummaryCard pokemon={a} total={totalA} color={colorA} />
        <SummaryCard pokemon={b} total={totalB} color={colorB} />
      </div>
    </section>
  );
}

function SummaryCard({
  pokemon,
  total,
  color,
}: {
  pokemon: PokemonDetail;
  total: number;
  color: string;
}) {
  const t = useT();
  return (
    <div
      className={cn('flex items-center gap-3 rounded-xl border bg-ink-900/40 p-3')}
      style={{ borderColor: `${color}55` }}
    >
      <span className="w-12 h-12 rounded-lg bg-overlay/[0.04] grid place-items-center shrink-0">
        <PokemonSprite
          src={pokemon.artwork}
          fallbackId={pokemon.id}
          alt=""
          className="w-10 h-10 object-contain"
        />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink-50 capitalize truncate">
          {prettyName(pokemon.name)}
        </p>
        <p className="text-[10px] uppercase tracking-wider text-ink-300">
          {t('compare.summary.total')}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="display text-2xl font-black tabular-nums" style={{ color }}>
          {total}
        </p>
        <p className="text-[10px] text-ink-400 font-mono">{t('compare.summary.total_max')}</p>
      </div>
    </div>
  );
}

function sumStats(p: PokemonDetail): number {
  const s = p.stats;
  return s.hp + s.attack + s.defense + s.specialAttack + s.specialDefense + s.speed;
}
