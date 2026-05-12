'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAllPokemon, useEvolutionAdjacency, usePokemonDetail } from '@/hooks/usePokemonData';
import { useT } from '@/lib/i18n/useT';
import { filterPokemon } from '@/lib/pokemon/filter';
import { cn, formatDex, prettyName, TYPE_COLOR } from '@/lib/utils';
import { PokemonSprite } from '@/components/common/PokemonSprite';
import { TypeBadge } from '@/components/common/TypeBadge';

interface PokemonSlotProps {
  id: number | null;
  accent: string;
  onChange: (id: number | null) => void;
  /** Id del otro slot — se excluye del picker para que no dupliquen Pokémon. */
  excludeId: number | null;
}

/**
 * Slot del comparador.
 *  - Si `id == null` → estado vacío con CTA "Elegir Pokémon" que abre el picker.
 *  - Si `id != null` → muestra ficha resumida + botón "Cambiar" que reabre el picker.
 *
 * El picker es un buscador con dropdown que reutiliza `filterPokemon` para
 * coincidir el comportamiento de búsqueda del listado (numérica + nombre).
 */
export function PokemonSlot({ id, accent, onChange, excludeId }: PokemonSlotProps) {
  const t = useT();
  const detail = usePokemonDetail(id);
  const [pickerOpen, setPickerOpen] = useState(id == null);

  if (pickerOpen || id == null) {
    return (
      <SlotPicker
        excludeId={excludeId}
        onPick={(picked) => {
          onChange(picked);
          setPickerOpen(false);
        }}
        onCancel={id != null ? () => setPickerOpen(false) : undefined}
        accent={accent}
      />
    );
  }

  if (detail.isLoading || !detail.data) {
    return (
      <div className="panel p-4 sm:p-5 animate-pulse text-ink-300 min-h-[160px] grid place-items-center">
        …
      </div>
    );
  }

  const p = detail.data;
  const primary = p.types[0] ?? 'normal';
  const name = prettyName(p.name);

  return (
    <div
      className="panel-strong relative p-4 sm:p-5 flex items-center gap-4"
      style={{
        borderColor: accent,
        boxShadow: `0 0 0 1px ${accent}55, 0 8px 24px -12px ${accent}66`,
      }}
    >
      <div
        className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl grid place-items-center"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${TYPE_COLOR[primary]}44, transparent 70%)`,
        }}
      >
        <PokemonSprite
          src={p.artwork}
          fallbackId={p.id}
          alt={name}
          loading="eager"
          className="w-full h-full object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.5)]"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="display text-xl sm:text-2xl font-black text-ink-50 truncate">{name}</h2>
          <span className="font-mono text-xs text-ink-300">{formatDex(p.id)}</span>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {p.types.map((typeName) => (
            <TypeBadge key={typeName} type={typeName} />
          ))}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 max-w-xs">
          <Stat label={t('detail.height')} value={`${(p.height / 10).toFixed(1)} m`} />
          <Stat label={t('detail.weight')} value={`${(p.weight / 10).toFixed(1)} kg`} />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        title={t('compare.change')}
        aria-label={t('compare.change')}
        className="absolute top-2 right-2 inline-grid place-items-center w-7 h-7 rounded-full bg-ink-900/60 border border-overlay/15 text-ink-300 hover:text-ink-50 hover:bg-overlay/10 transition"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-ink-900/40 border border-overlay/10 px-2.5 py-1.5">
      <p className="text-[9px] uppercase tracking-widest text-ink-300">{label}</p>
      <p className="text-sm font-semibold text-ink-50">{value}</p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 *  Picker — buscador con dropdown
 * ──────────────────────────────────────────────────────────────────────────*/

function SlotPicker({
  excludeId,
  onPick,
  onCancel,
  accent,
}: {
  excludeId: number | null;
  onPick: (id: number) => void;
  onCancel?: () => void;
  accent: string;
}) {
  const t = useT();
  const all = useAllPokemon();
  const adjacency = useEvolutionAdjacency();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  // Sólo busca cuando hay ≥ 3 caracteres — evita renderizar miles de filas
  // al primer keystroke y respeta la intención del usuario (búsqueda real,
  // no exploración accidental).
  const trimmedQuery = query.trim();
  const canSearch = trimmedQuery.length >= 3;
  const matches = useMemo(() => {
    if (!canSearch) return [];
    const dataset = all.data ?? [];
    // Pasamos `adjacency.data` para que la búsqueda expanda a la familia
    // evolutiva (mismo comportamiento que el listado principal).
    const filtered = filterPokemon(dataset, adjacency.data, {
      search: trimmedQuery,
      types: [],
      generations: [],
    });
    return filtered
      .filter((p) => p.id !== excludeId)
      .slice(0, 8);
  }, [all.data, adjacency.data, trimmedQuery, canSearch, excludeId]);

  return (
    <div
      className="panel-strong p-4 sm:p-5 min-h-[160px] flex flex-col gap-3"
      style={{
        borderColor: accent,
        boxShadow: `0 0 0 1px ${accent}33`,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-wider text-ink-300">{t('compare.empty.cta')}</p>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-ink-300 hover:text-ink-50"
          >
            ✕
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('compare.search.placeholder')}
        autoComplete="off"
        spellCheck={false}
        className="px-3 py-2 rounded-xl bg-ink-900/60 border border-overlay/15 text-ink-50 placeholder:text-ink-400 focus:outline-none focus:border-flame-400/60 focus:ring-2 focus:ring-flame-400/30 text-sm"
      />

      <ul className="space-y-1 max-h-56 overflow-y-auto">
        {!canSearch ? null : matches.length === 0 ? (
          <li className="text-xs text-ink-400 py-2">{t('compare.search.no_results')}</li>
        ) : (
          matches.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onPick(p.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-left',
                  'hover:bg-overlay/[0.06] transition-colors',
                )}
              >
                <span className="w-9 h-9 grid place-items-center rounded-md bg-overlay/[0.04] shrink-0">
                  <PokemonSprite
                    src={p.sprite}
                    fallbackId={p.id}
                    alt=""
                    className="w-8 h-8 object-contain"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-50 capitalize truncate">
                    {prettyName(p.name)}
                  </p>
                  <p className="font-mono text-[10px] text-ink-400">{formatDex(p.id)}</p>
                </span>
                <span className="flex gap-1 shrink-0">
                  {p.types.slice(0, 2).map((tp) => (
                    <span
                      key={tp}
                      aria-hidden
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: TYPE_COLOR[tp] }}
                    />
                  ))}
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
