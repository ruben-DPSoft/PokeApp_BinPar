'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { PokemonSummary } from '@/types/pokemon';
import { TYPE_COLOR, formatDex, prettyName } from '@/lib/utils';
import { PokemonSprite } from '@/components/common/PokemonSprite';
import { TypeDisc } from '@/components/common/TypeDisc';
import { usePokedexStore } from '@/store/pokedex';
import { PokedexStats } from './PokedexStats';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/useT';

interface PokedexViewProps {
  /** Lista filtrada que el usuario está viendo en ese momento. */
  pokemon: PokemonSummary[];
  /** Dataset completo, para que las estadísticas no estén sesgadas por filtros. */
  allPokemon: PokemonSummary[];
}

/**
 * Modo "Pokédex": el usuario puede marcar/desmarcar Pokémon como capturados,
 * y el panel superior muestra estadísticas agregadas de su colección.
 *
 * Diseño:
 *  - Las "fichas" son más compactas que las cards normales — el foco está en
 *    el progreso, no en el detalle visual.
 *  - Los Pokémon no capturados se muestran "siluetados" para invitar a marcar.
 *  - El click en la ficha NO navega al detalle: aquí el primary action es
 *    marcar/desmarcar. Para ir al detalle, hay un botón secundario.
 */
export function PokedexView({ pokemon, allPokemon }: PokedexViewProps) {
  const owned = usePokedexStore((s) => s.owned);
  const toggle = usePokedexStore((s) => s.toggle);
  const [showOnlyOwned, setShowOnlyOwned] = useState<'all' | 'owned' | 'missing'>('all');
  const t = useT();

  const visible = useMemo(() => {
    if (showOnlyOwned === 'all') return pokemon;
    return pokemon.filter((p) =>
      showOnlyOwned === 'owned' ? owned.has(p.id) : !owned.has(p.id),
    );
  }, [pokemon, owned, showOnlyOwned]);

  return (
    <div className="space-y-4">
      <PokedexStats allPokemon={allPokemon} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex p-1 rounded-xl bg-ink-700/60 border border-overlay/10">
          {(['all', 'owned', 'missing'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setShowOnlyOwned(mode)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition',
                showOnlyOwned === mode
                  ? 'bg-flame-500 text-white'
                  : 'text-ink-200 hover:text-ink-50 hover:bg-overlay/5',
              )}
            >
              {t(`pokedex.tab.${mode}`)}
            </button>
          ))}
        </div>
        <p className="text-xs text-ink-300">{t('pokedex.help')}</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3">
        {visible.map((p) => (
          <PokedexEntry
            key={p.id}
            pokemon={p}
            owned={owned.has(p.id)}
            onToggle={() => toggle(p.id)}
          />
        ))}
      </div>

      {visible.length === 0 && (
        <p className="text-center text-ink-300 py-12">{t('pokedex.empty.filtered')}</p>
      )}
    </div>
  );
}

function PokedexEntry({
  pokemon,
  owned,
  onToggle,
}: {
  pokemon: PokemonSummary;
  owned: boolean;
  onToggle: () => void;
}) {
  const color = TYPE_COLOR[pokemon.types[0] ?? 'normal'];
  const t = useT();
  const name = prettyName(pokemon.name);
  return (
    <div
      className={cn(
        'relative panel p-2 sm:p-3 transition-all',
        owned ? 'border-flame-500/60 bg-flame-500/[0.06]' : 'opacity-90 hover:opacity-100',
      )}
      style={
        owned
          ? {
              backgroundImage: `radial-gradient(circle at 50% 0%, ${color}33, transparent 60%)`,
            }
          : undefined
      }
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={owned ? t('pokedex.entry.toggle_remove', { name }) : t('pokedex.entry.toggle_add', { name })}
        aria-pressed={owned}
        className="block w-full text-left group"
      >
        <div className="flex items-center text-[10px] font-mono text-ink-300">
          <span>{formatDex(pokemon.id)}</span>
          {/* El indicador de capturado (●/○) ya no es necesario: el borde,
              el tinte de fondo, el sprite a color y los tipos visibles
              comunican el estado. La esquina superior derecha la ocupa el
              acceso al detalle. */}
        </div>
        <div className="relative aspect-square my-1 grid place-items-center">
          <PokemonSprite
            src={pokemon.artwork}
            fallbackId={pokemon.id}
            alt={prettyName(pokemon.name)}
            silhouette={!owned}
            className={cn(
              'w-20 sm:w-24 h-auto transition-transform duration-300',
              owned && 'group-hover:scale-105 drop-shadow-[0_6px_18px_rgba(237,74,8,0.35)]',
            )}
          />
        </div>
        <p className="text-xs sm:text-sm font-semibold text-ink-50 text-center truncate">
          {prettyName(pokemon.name)}
        </p>
      </button>

      {/* Tipos solo capturados — sólo glifos (TypeDisc), justificados al centro
          y a mayor tamaño que las antiguas TypeBadge para ganar prominencia
          sin texto. El tooltip lo aporta TypeDisc vía `title`/`aria-label`. */}
      {owned && (
        <div className="mt-1 flex justify-center items-center flex-wrap gap-1.5">
          {pokemon.types.map((typeName) => (
            <TypeDisc key={typeName} type={typeName} className="w-8 h-8 sm:w-9 sm:h-9" />
          ))}
        </div>
      )}

      {/* Atajo a la ficha de detalle — lupa con marco circular, en la posición
          que antes ocupaba el punto de capturado. Sale del flujo del <button>
          de toggle para no propagarle el click. */}
      <Link
        href={`/pokemon/${pokemon.id}`}
        aria-label={t('pokedex.entry.view_detail')}
        title={t('pokedex.entry.view_detail')}
        className="absolute top-1.5 right-1.5 inline-grid place-items-center w-7 h-7 rounded-full bg-overlay/[0.06] border border-overlay/15 text-ink-200 hover:text-flame-300 hover:bg-overlay/[0.12] hover:border-flame-400/50 transition-colors"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.5" y2="16.5" />
        </svg>
      </Link>
    </div>
  );
}
