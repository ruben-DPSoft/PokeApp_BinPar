'use client';

import { useMemo } from 'react';
import type { PokemonSummary, PokemonTypeName } from '@/types/pokemon';
import { TYPE_COLOR } from '@/lib/utils';
import { GENERATIONS } from '@/lib/pokemon/generations';
import { usePokedexStore } from '@/store/pokedex';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/useT';
import type { DictKey } from '@/lib/i18n/dictionaries';

interface PokedexStatsProps {
  /** Dataset completo para calcular % independientemente del filtrado. */
  allPokemon: PokemonSummary[];
}

/**
 * Panel superior del modo Pokédex. Calcula y muestra estadísticas de la
 * colección en tiempo real:
 *
 *   - % de progreso global (capturados / total).
 *   - % por generación (cuántos has capturado por región).
 *   - Tipo "favorito" (el más representado en la colección).
 *   - Distribución por tipo (top 6 visualmente).
 *
 * Todo se computa client-side a partir del Set en el store; no hacemos
 * llamadas extra a la API.
 */
export function PokedexStats({ allPokemon }: PokedexStatsProps) {
  const owned = usePokedexStore((s) => s.owned);
  const clear = usePokedexStore((s) => s.clear);
  const t = useT();

  const stats = useMemo(() => {
    const total = allPokemon.length;
    const ownedList = allPokemon.filter((p) => owned.has(p.id));
    const ownedCount = ownedList.length;
    const ratio = total === 0 ? 0 : ownedCount / total;

    // Por generación
    const byGeneration = GENERATIONS.map((g) => {
      const inGen = allPokemon.filter((p) => p.generation === g.id);
      const ownedInGen = inGen.filter((p) => owned.has(p.id)).length;
      return {
        id: g.id,
        region: g.region,
        total: inGen.length,
        owned: ownedInGen,
        ratio: inGen.length === 0 ? 0 : ownedInGen / inGen.length,
      };
    });

    // Por tipo
    const byType = new Map<PokemonTypeName, number>();
    for (const p of ownedList) {
      for (const t of p.types) {
        byType.set(t, (byType.get(t) ?? 0) + 1);
      }
    }
    const typeRanking = Array.from(byType.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
    const favoriteType = typeRanking[0]?.[0] ?? null;

    return { total, ownedCount, ratio, byGeneration, typeRanking, favoriteType };
  }, [allPokemon, owned]);

  return (
    <section className="panel-strong p-5 sm:p-6 relative overflow-hidden">
      {/* Adorno: rejilla decorativa estilo "pantalla" */}
      <div className="absolute inset-0 bg-grid-faint bg-grid-32 opacity-30 pointer-events-none" />

      <div className="relative grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 items-start">
        {/* Bloque progreso global + barra grande */}
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink-300">
            <span className="led bg-flame-400 text-flame-400" />
            {t('pokedex.stats.status')}
          </div>
          <div className="mt-2 flex items-end gap-3">
            <p className="display text-4xl sm:text-5xl font-black text-ink-50 leading-none">
              {stats.ownedCount}
            </p>
            <p className="text-ink-300 mb-1">/ {stats.total} {t('pokedex.stats.caught_of')}</p>
          </div>

          <div className="mt-4 h-4 rounded-full bg-overlay/5 overflow-hidden border border-overlay/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-flame-500 via-flame-400 to-electric-400 transition-[width] duration-700"
              style={{ width: `${stats.ratio * 100}%` }}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={stats.total}
              aria-valuenow={stats.ownedCount}
            />
          </div>
          <p className="mt-2 text-xs text-ink-300">
            {Math.round(stats.ratio * 1000) / 10}% {t('pokedex.stats.completed')}
            {stats.favoriteType && (
              <>
                {' · '}
                {t('pokedex.stats.dominant_type')}{' '}
                <span style={{ color: TYPE_COLOR[stats.favoriteType] }} className="font-semibold">
                  {t(`type.${stats.favoriteType}` as DictKey)}
                </span>
              </>
            )}
          </p>

          {stats.ownedCount > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm(t('pokedex.stats.reset_confirm'))) clear();
              }}
              className="mt-4 text-xs text-ink-300 hover:text-flame-300 underline underline-offset-4"
            >
              {t('pokedex.stats.reset')}
            </button>
          )}
        </div>

        {/* Bloque: tipos favoritos */}
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-ink-300 mb-3">
            {t('pokedex.stats.types_dist')}
          </p>
          {stats.typeRanking.length === 0 ? (
            <p className="text-sm text-ink-400">{t('pokedex.stats.first_marks')}</p>
          ) : (
            <ul className="space-y-2">
              {stats.typeRanking.map(([type, count]) => {
                const max = stats.typeRanking[0]?.[1] ?? 1;
                const pct = max === 0 ? 0 : (count / max) * 100;
                return (
                  <li key={type} className="flex items-center gap-3 text-sm">
                    <span className="w-20 text-xs text-ink-200">{t(`type.${type}` as DictKey)}</span>
                    <div className="flex-1 h-2 bg-overlay/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: TYPE_COLOR[type] }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-xs text-ink-200">{count}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Bloque inferior: progreso por generación */}
      <div className="relative mt-6 grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
        {stats.byGeneration.map((g) => (
          <div
            key={g.id}
            className={cn(
              'rounded-xl p-2 border border-overlay/10 bg-overlay/[0.03]',
              g.owned > 0 && 'border-flame-500/30 bg-flame-500/[0.07]',
            )}
          >
            <p className="text-[10px] uppercase tracking-wider text-ink-300">{t('filter.gen_short')} {g.id}</p>
            <p className="text-[10px] text-ink-400">{g.region}</p>
            <p className="mt-1 text-sm font-bold text-ink-50 tabular-nums">
              {g.owned}
              <span className="text-ink-400 text-xs"> / {g.total}</span>
            </p>
            <div className="mt-1.5 h-1 bg-overlay/5 rounded overflow-hidden">
              <div
                className="h-full bg-flame-400"
                style={{ width: `${g.ratio * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
