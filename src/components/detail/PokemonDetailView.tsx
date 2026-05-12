'use client';

import Link from 'next/link';
import type { PokemonDetail } from '@/types/pokemon';
import { GENERATIONS } from '@/lib/pokemon/generations';
import { TYPE_COLOR, formatDex, prettyName } from '@/lib/utils';
import { TypeBadge } from '@/components/common/TypeBadge';
import { TypeDisc } from '@/components/common/TypeDisc';
import { InfoTooltip } from '@/components/common/InfoTooltip';
import { PokemonSprite } from '@/components/common/PokemonSprite';
import { StatBar } from '@/components/common/StatBar';
import { EvolutionChain } from './EvolutionChain';
import { PokedexToggleClient } from './PokedexToggleClient';
import { useT } from '@/lib/i18n/useT';
import { useLocaleStore } from '@/store/locale';

interface PokemonDetailViewProps {
  pokemon: PokemonDetail;
}

/**
 * Vista de detalle.
 *
 * Es un Client Component porque consume `useT` para que las etiquetas (Altura,
 * Peso, Habilidades, Estadísticas base, etc.) cambien al alternar idioma sin
 * recargar. Los datos del Pokémon vienen ya resueltos desde el Server Component
 * `page.tsx`, así que conservamos el SSR del fetch — Next renderiza también
 * los Client Components en el servidor; sólo la hidratación es en cliente.
 */
export function PokemonDetailView({ pokemon }: PokemonDetailViewProps) {
  const t = useT();
  // Servimos la descripción Pokédex en el idioma activo. La payload ya
  // contiene ambas variantes (ver `PokemonDetail.flavorText`), así que el
  // cambio de idioma es instantáneo y no requiere re-fetch.
  const locale = useLocaleStore((s) => s.locale);
  const flavorText = pokemon.flavorText[locale];
  const generation = GENERATIONS.find((g) => g.id === pokemon.generation);
  const primary = pokemon.types[0] ?? 'normal';
  const secondary = pokemon.types[1] ?? primary;

  const total =
    pokemon.stats.hp +
    pokemon.stats.attack +
    pokemon.stats.defense +
    pokemon.stats.specialAttack +
    pokemon.stats.specialDefense +
    pokemon.stats.speed;

  return (
    <article className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Toolbar superior: volver al listado (izquierda) + toggle Pokédex (derecha).
          El toggle sale del hero — al estar fuera tiene su propio espacio y no
          compite con la jerarquía visual de nombre/número/tipos. */}
      <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-ink-200 hover:text-ink-50 group"
        >
          <span
            aria-hidden
            className="w-7 h-7 grid place-items-center rounded-full bg-overlay/5 border border-overlay/10 group-hover:bg-overlay/10"
          >
            ←
          </span>
          {t('detail.back')}
        </Link>
        <PokedexToggleClient id={pokemon.id} />
      </div>

      {/* HERO panel */}
      <section
        className="relative panel-strong overflow-hidden p-6 sm:p-8 lg:p-10"
        style={{
          backgroundImage: `radial-gradient(circle at 80% 0%, ${TYPE_COLOR[primary]}33, transparent 55%), radial-gradient(circle at 10% 100%, ${TYPE_COLOR[secondary]}24, transparent 50%)`,
        }}
      >
        <span
          aria-hidden
          className="absolute -top-6 -right-4 display text-[10rem] sm:text-[14rem] font-black tracking-tighter text-overlay/[0.04] select-none pointer-events-none leading-none"
        >
          {formatDex(pokemon.id).replace('#', '')}
        </span>

        <div className="relative grid lg:grid-cols-[auto_1fr] gap-8 items-center">
          <div className="relative w-full max-w-xs mx-auto lg:mx-0 aspect-square grid place-items-center rounded-3xl bg-ink-900/40 border border-overlay/10">
            <div className="scanline" />
            <PokemonSprite
              src={pokemon.artwork}
              fallbackId={pokemon.id}
              alt={prettyName(pokemon.name)}
              loading="eager"
              className="w-64 sm:w-72 h-auto drop-shadow-[0_16px_30px_rgba(0,0,0,0.55)]"
            />
          </div>

          <div>
            <p className="font-mono text-sm text-ink-300">{formatDex(pokemon.id)}</p>
            <h1 className="display text-4xl sm:text-5xl lg:text-6xl font-black text-ink-50 mt-1">
              {prettyName(pokemon.name)}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
              {pokemon.types.map((typeName) => (
                <TypeBadge key={typeName} type={typeName} size="md" />
              ))}
              {generation && (
                <span className="chip">
                  {t('filter.gen_short')} {generation.id} · {generation.region}
                </span>
              )}
            </div>

            {flavorText && (
              <p className="mt-5 text-sm sm:text-base text-ink-100 max-w-2xl leading-relaxed">
                {flavorText}
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Stat label={t('detail.height')} value={`${(pokemon.height / 10).toFixed(1)} m`} />
              <Stat label={t('detail.weight')} value={`${(pokemon.weight / 10).toFixed(1)} kg`} />
              <Stat label={t('detail.base_exp')} value={pokemon.baseExperience ?? '—'} />
              <Stat label={t('detail.total_stats')} value={total} />
            </div>
          </div>
        </div>
      </section>

      {/* STATS + ABILITIES. `relative z-30` permite que los tooltips de
          habilidades escapen del orden DOM y se pinten sobre las secciones
          posteriores (que tienen backdrop-filter y crean stacking context). */}
      <section className="relative z-30 grid lg:grid-cols-[2fr_1fr] gap-4 sm:gap-6 mt-6">
        <div className="panel-strong p-5 sm:p-6">
          <h2 className="display text-xl font-bold text-ink-50 mb-4">{t('detail.stats.heading')}</h2>
          <div className="space-y-3">
            <StatBar label={t('detail.stats.hp')} value={pokemon.stats.hp} />
            <StatBar label={t('detail.stats.attack')} value={pokemon.stats.attack} />
            <StatBar label={t('detail.stats.defense')} value={pokemon.stats.defense} />
            <StatBar label={t('detail.stats.sp_attack')} value={pokemon.stats.specialAttack} />
            <StatBar label={t('detail.stats.sp_defense')} value={pokemon.stats.specialDefense} />
            <StatBar label={t('detail.stats.speed')} value={pokemon.stats.speed} />
          </div>
        </div>

        <div className="panel-strong p-5 sm:p-6">
          <h2 className="display text-xl font-bold text-ink-50 mb-4">{t('detail.abilities.heading')}</h2>
          <ul className="space-y-2">
            {pokemon.abilities.map((a) => (
              <li key={a.key}>
                <InfoTooltip
                  content={a.description[locale]}
                  triggerClassName="flex items-center justify-between rounded-xl border border-overlay/10 bg-overlay/[0.04] hover:bg-overlay/[0.07] px-3 py-2 transition-colors"
                >
                  <span className="capitalize text-ink-100">{a.names[locale]}</span>
                  {a.isHidden && (
                    <span className="text-[10px] uppercase tracking-wider text-flame-300">
                      {t('detail.abilities.hidden')}
                    </span>
                  )}
                </InfoTooltip>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* MOVIMIENTOS INICIALES. z-20 < stats/habilidades (z-30) pero > evolución
          (z-10), así sus tooltips se pintan sobre la cadena evolutiva. */}
      <section className="relative z-20 panel-strong p-5 sm:p-6 mt-6">
        <h2 className="display text-xl font-bold text-ink-50 mb-4">{t('detail.moves.heading')}</h2>
        {pokemon.initialMoves.length === 0 ? (
          <p className="text-sm text-ink-300">{t('detail.moves.empty')}</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {pokemon.initialMoves.map((m) => (
              <li key={m.key}>
                <InfoTooltip
                  content={m.description[locale]}
                  triggerClassName="flex items-center gap-3 rounded-xl border border-overlay/10 bg-overlay/[0.04] hover:bg-overlay/[0.07] px-3 py-2 transition-colors"
                >
                  <TypeDisc type={m.type} className="w-7 h-7 shrink-0" />
                  <span className="flex-1 text-ink-100 capitalize truncate">{m.names[locale]}</span>
                  <span className="font-mono text-xs text-ink-300 shrink-0">
                    {t('detail.moves.level_prefix')} {m.level}
                  </span>
                </InfoTooltip>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* EVOLUCIÓN. Última sección con z-10 — no tiene tooltips propios, así
          que sólo necesita quedar por debajo de las anteriores. */}
      <section className="relative z-10 panel-strong p-5 sm:p-6 mt-6">
        <h2 className="display text-xl font-bold text-ink-50 mb-4">{t('detail.evolution.heading')}</h2>
        <EvolutionChain chain={pokemon.evolutionChain} currentSpeciesId={pokemon.speciesId} />
      </section>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-overlay/10 bg-overlay/[0.03] px-3 py-2">
      <p className="text-[10px] uppercase tracking-widest text-ink-300">{label}</p>
      <p className="text-sm font-semibold text-ink-50">{value}</p>
    </div>
  );
}
