'use client';

import Link from 'next/link';
import type { EvolutionNode } from '@/types/pokemon';
import { PokemonSprite } from '@/components/common/PokemonSprite';
import { cn, formatDex, prettyName } from '@/lib/utils';
import { useT } from '@/lib/i18n/useT';
import { useLocaleStore } from '@/store/locale';

interface EvolutionChainProps {
  chain: EvolutionNode[];
  /** speciesId del Pokémon actual — se marca con neón + escalado. */
  currentSpeciesId: number;
}

/**
 * Línea evolutiva en horizontal con cards compactas y flechas entre etapas.
 *
 * El trigger se muestra EN CADA card (no centralizado entre stages), porque
 * en ramificaciones como Eevee cada evolución tiene su propio trigger
 * (Water Stone, Thunder Stone, Fire Stone, alta amistad de día, etc.).
 *
 * Pokémon actual: marcado SIN texto. Neón flame doble (borde + halo) y
 * `scale-105` lo destacan claramente sin necesidad de etiqueta "aquí".
 */
export function EvolutionChain({ chain, currentSpeciesId }: EvolutionChainProps) {
  const t = useT();
  const locale = useLocaleStore((s) => s.locale);

  const stages = new Map<number, EvolutionNode[]>();
  for (const node of chain) {
    const list = stages.get(node.stage) ?? [];
    list.push(node);
    stages.set(node.stage, list);
  }
  const sortedStages = Array.from(stages.entries()).sort(([a], [b]) => a - b);

  if (sortedStages.length <= 1 && (sortedStages[0]?.[1].length ?? 0) <= 1) {
    return <p className="text-sm text-ink-300">{t('detail.evolution.none')}</p>;
  }

  return (
    // gap-y-4 garantiza separación vertical clara cuando los stages envuelven
    // a una nueva fila (caso Eevee con 8 evoluciones en viewports estrechos).
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-x-3 gap-y-4 flex-wrap">
      {sortedStages.map(([stage, nodes], idx) => (
        <div key={stage} className="flex items-start sm:items-center gap-2 sm:gap-3">
          {/* `flex-wrap` interno + `gap-3` para que las 8 evoluciones de Eevee
              se acomoden en varias filas con respiro vertical. */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
            {nodes.map((node) => (
              <EvolutionEntry
                key={node.speciesId}
                node={node}
                isCurrent={node.speciesId === currentSpeciesId}
                locale={locale}
              />
            ))}
          </div>
          {idx < sortedStages.length - 1 && (
            <div className="hidden sm:flex items-center text-ink-300" aria-hidden>
              <svg width="28" height="20" viewBox="0 0 32 20" fill="none">
                <path
                  d="M2 10 H 26 M22 5 L28 10 L22 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
          {idx < sortedStages.length - 1 && (
            <div className="sm:hidden text-ink-300 text-xs" aria-hidden>
              ↓
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function EvolutionEntry({
  node,
  isCurrent,
  locale,
}: {
  node: EvolutionNode;
  isCurrent: boolean;
  locale: 'es' | 'en';
}) {
  const triggerLabel = node.trigger?.[locale] ?? '';
  return (
    <Link
      href={`/pokemon/${node.speciesId}`}
      aria-current={isCurrent ? 'page' : undefined}
      className={cn(
        'group relative rounded-2xl p-3 border w-28 sm:w-32 text-center transition',
        isCurrent
          ? 'border-2 border-flame-400 bg-flame-500/[0.15] shadow-[0_0_0_2px_rgba(237,74,8,0.35),0_0_22px_rgba(237,74,8,0.55)] scale-[1.06]'
          : 'border-overlay/10 bg-overlay/[0.03] hover:border-overlay/30 hover:bg-overlay/[0.06]',
      )}
    >
      {/* Trigger por nodo — sin truncar, permitimos wrap a 2 líneas con
          `leading-tight` para mantener altura razonable. */}
      {triggerLabel && (
        <p className="text-[10px] uppercase tracking-wide text-ink-300 mb-1 leading-tight break-words">
          {triggerLabel}
        </p>
      )}
      <div className="aspect-square grid place-items-center">
        <PokemonSprite
          src={node.sprite}
          fallbackId={node.speciesId}
          alt={prettyName(node.name)}
          className="w-20 h-20 sm:w-24 sm:h-24"
        />
      </div>
      <p
        className={cn(
          'text-xs font-mono',
          isCurrent ? 'text-flame-200' : 'text-ink-300',
        )}
      >
        {formatDex(node.speciesId)}
      </p>
      <p className={cn('text-sm font-semibold', isCurrent ? 'text-ink-50' : 'text-ink-100')}>
        {prettyName(node.name)}
      </p>
    </Link>
  );
}
