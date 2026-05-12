'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { PokemonSummary } from '@/types/pokemon';
import { useAllPokemon } from '@/hooks/usePokemonData';
import { useT } from '@/lib/i18n/useT';
import { useGameStore } from '@/store/game';
import { usePokedexStore } from '@/store/pokedex';
import { useFiltersStore } from '@/store/filters';
import { PokemonSprite } from '@/components/common/PokemonSprite';
import { TypeBadge } from '@/components/common/TypeBadge';
import { TypeFilter } from '@/components/controls/TypeFilter';
import { GenerationFilter } from '@/components/controls/GenerationFilter';
import { ActiveFilters } from '@/components/controls/ActiveFilters';
import { TYPE_COLOR, cn, formatDex, prettyName } from '@/lib/utils';
import { levenshtein, normalizeGuess, typoTolerance } from '@/lib/game/match';

const RECENT_BUFFER = 30;

type Mode = 'easy' | 'normal' | 'hard';

const MODE_DURATIONS: Record<Mode, number> = {
  easy: 20_000,
  normal: 15_000,
  hard: 10_000,
};

type Phase = 'playing' | 'revealed';
type Outcome = 'correct' | 'failed';

interface RoundState {
  pokemon: PokemonSummary;
  phase: Phase;
  outcome: Outcome | null;
  capturedNow: boolean;
}

/**
 * Mini-juego "¿Quién es ese Pokémon?".
 *
 * Tres modos:
 *  - easy:   sólo 1ª generación, 15 s
 *  - normal: filtrado por tipo/generación del store (los mismos que el listado), 10 s
 *  - hard:   pool completo, 10 s
 *
 * Hay que elegir modo antes de empezar; entre rondas (estado "revealed") se
 * puede cambiar, lo que reinicia con el nuevo pool/duración.
 */
export function WhoIsThatPokemon() {
  const t = useT();
  const { data, isLoading, error } = useAllPokemon();
  const toggle = usePokedexStore((s) => s.toggle);
  const owned = usePokedexStore((s) => s.owned);
  const bestStreak = useGameStore((s) => s.bestStreak);
  const setBestStreak = useGameStore((s) => s.setBestStreak);
  const selectedTypes = useFiltersStore((s) => s.types);
  const selectedGenerations = useFiltersStore((s) => s.generations);

  const [mode, setMode] = useState<Mode | null>(null);
  const [round, setRound] = useState<RoundState | null>(null);
  const [guess, setGuess] = useState('');
  // El timeLeft inicial es irrelevante hasta que arranque una ronda; lo
  // re-fijamos en `startRound` con la duración del modo activo.
  const [timeLeft, setTimeLeft] = useState(MODE_DURATIONS.normal);
  const [streak, setStreak] = useState(0);
  const [shake, setShake] = useState(false);
  // Flag de "el último intento fue incorrecto" — tiñe el borde del input en
  // rojo hasta que el usuario edite el texto. Conservamos lo escrito para que
  // pueda corregir un typo sin reescribir todo.
  const [wrong, setWrong] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);
  const recentRef = useRef<number[]>([]);

  // Pool derivado del modo activo + filtros (sólo en normal).
  const pool = useMemo<PokemonSummary[]>(() => {
    if (!data || !mode) return [];
    if (mode === 'easy') return data.filter((p) => p.generation === 1);
    if (mode === 'hard') return data;
    // normal — respeta filtros del store (semántica OR dentro de cada eje, AND entre ejes)
    return data.filter((p) => {
      const typeOk =
        selectedTypes.length === 0 || p.types.some((tp) => selectedTypes.includes(tp));
      const genOk =
        selectedGenerations.length === 0 || selectedGenerations.includes(p.generation);
      return typeOk && genOk;
    });
  }, [data, mode, selectedTypes, selectedGenerations]);

  const roundMs = mode ? MODE_DURATIONS[mode] : MODE_DURATIONS.normal;

  const pickRandom = useCallback((): PokemonSummary | null => {
    if (pool.length === 0) return null;
    const recent = recentRef.current;
    let pick: PokemonSummary | undefined;
    for (let i = 0; i < 30; i++) {
      const candidate = pool[Math.floor(Math.random() * pool.length)];
      if (candidate && !recent.includes(candidate.id)) {
        pick = candidate;
        break;
      }
    }
    if (!pick) pick = pool[Math.floor(Math.random() * pool.length)];
    if (!pick) return null;
    recentRef.current = [pick.id, ...recent].slice(0, RECENT_BUFFER);
    return pick;
  }, [pool]);

  const startRound = useCallback(() => {
    const pick = pickRandom();
    if (!pick) {
      setRound(null);
      return;
    }
    setRound({ pokemon: pick, phase: 'playing', outcome: null, capturedNow: false });
    setGuess('');
    setWrong(false);
    setTimeLeft(roundMs);
  }, [pickRandom, roundMs]);

  // Auto-arrancar la primera ronda cuando se elige un modo (y hay pool).
  useEffect(() => {
    if (mode && pool.length > 0 && !round) startRound();
  }, [mode, pool.length, round, startRound]);

  // Cuenta atrás. `setInterval` con cadencia 100 ms — suficiente para una
  // animación fluida del ring (la transición CSS de 80 ms suaviza entre ticks)
  // y evita un bug observado donde encadenando `requestAnimationFrame` los
  // `setState` quedaban diferidos en React 18 concurrent hasta la próxima
  // interacción del usuario (tecleo, click) y el ring sólo "saltaba" entonces.
  useEffect(() => {
    if (!round || round.phase !== 'playing') return;
    const start = performance.now();
    const id = window.setInterval(() => {
      const elapsed = performance.now() - start;
      const remaining = Math.max(0, roundMs - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        window.clearInterval(id);
        setRound((r) => (r ? { ...r, phase: 'revealed', outcome: 'failed' } : r));
        setStreak(0);
      }
    }, 100);
    return () => window.clearInterval(id);
    // Intencional: dependemos sólo de pokemon.id + phase + roundMs, no del
    // objeto `round` completo, para no reiniciar el timer al revelar/setear
    // capturedNow (que mutarían `round` pero no la identidad del Pokémon).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round?.pokemon.id, round?.phase, roundMs]);

  // Foco al input al empezar ronda; foco al botón "Siguiente" al revelar.
  useEffect(() => {
    if (!round) return;
    if (round.phase === 'playing') {
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      requestAnimationFrame(() => nextBtnRef.current?.focus());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round?.phase, round?.pokemon.id]);

  const selectMode = (m: Mode) => {
    // No-op si ya es el modo activo y hay ronda en curso (no romper la partida).
    if (m === mode && round) return;
    setMode(m);
    // Forzamos un re-pick: limpiamos ronda y recent buffer para que el efecto
    // de auto-arranque la cree con el nuevo pool/duración.
    setRound(null);
    recentRef.current = [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!round || round.phase !== 'playing') return;
    const target = normalizeGuess(round.pokemon.name);
    const guessed = normalizeGuess(guess);
    if (!guessed) return;
    // Acepta exacto o "casi" — distancia de edición ≤ umbral por longitud.
    const isMatch = levenshtein(guessed, target) <= typoTolerance(target.length);
    if (isMatch) {
      const capturedNow = !owned.has(round.pokemon.id);
      if (capturedNow) toggle(round.pokemon.id);
      const next = streak + 1;
      setStreak(next);
      if (next > bestStreak) setBestStreak(next);
      setRound({ ...round, phase: 'revealed', outcome: 'correct', capturedNow });
    } else {
      // Mantén lo escrito + sacudida + borde rojo persistente hasta edición.
      setShake(true);
      setWrong(true);
      window.setTimeout(() => setShake(false), 380);
    }
  };

  const handleGuessChange = (s: string) => {
    // Editar limpia el estado "wrong" — el borde rojo desaparece al primer
    // cambio para señalar "vale, lo estás corrigiendo".
    if (wrong) setWrong(false);
    setGuess(s);
  };

  const giveUp = () => {
    if (!round || round.phase !== 'playing') return;
    setRound({ ...round, phase: 'revealed', outcome: 'failed' });
    setStreak(0);
  };

  if (error) {
    return (
      <div className="panel-strong p-6 text-center">
        <p className="text-ink-100">{t('list.error.title')}</p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="panel-strong p-10 text-center">
        <p className="text-ink-200 animate-pulse">{t('game.loading')}</p>
      </div>
    );
  }

  return (
    <article className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="display text-2xl sm:text-3xl font-black text-ink-50">
            {t('game.title')}
          </h1>
          <p className="mt-1 text-sm text-ink-300 max-w-prose">{t('game.subtitle')}</p>
        </div>
        <div className="inline-flex items-center gap-2 shrink-0">
          <ScoreChip label={t('game.streak.current')} value={streak} accent="flame" />
          <ScoreChip label={t('game.streak.best')} value={bestStreak} accent="leaf" />
        </div>
      </header>

      {/* Selector de modo — siempre visible. Deshabilitado durante la ronda
          para no romperla; en "revealed" o sin partida iniciada, clicar otro
          modo arranca una ronda nueva con su pool/duración. */}
      <ModePicker
        active={mode}
        onSelect={selectMode}
        disabled={round?.phase === 'playing'}
      />

      {/* Filtros sólo visibles cuando el modo activo es "normal". Reutilizamos
          los componentes del listado que leen del mismo store: cualquier filtro
          que el usuario tuviera ya se aplica también aquí, y viceversa. */}
      {mode === 'normal' && (
        <section className="panel-strong p-4 sm:p-5 space-y-4">
          <h2 className="text-xs uppercase tracking-wider text-ink-300">
            {t('game.mode.filters_heading')}
          </h2>
          <TypeFilter />
          <GenerationFilter />
          <ActiveFilters />
        </section>
      )}

      {!mode ? (
        <div className="panel-strong p-10 text-center text-ink-200">
          <p>{t('game.mode.pick_prompt')}</p>
        </div>
      ) : !round ? (
        // Modo elegido pero pool vacío (filtros muy restrictivos en normal).
        <div className="panel-strong p-10 text-center text-ink-200">
          <p>{t('game.mode.pool_empty')}</p>
        </div>
      ) : (
        <GameStage
          round={round}
          timeLeft={timeLeft}
          roundMs={roundMs}
          shake={shake}
          wrong={wrong}
          guess={guess}
          onGuessChange={handleGuessChange}
          onSubmit={handleSubmit}
          onGiveUp={giveUp}
          onNext={startRound}
          inputRef={inputRef}
          nextBtnRef={nextBtnRef}
          tFn={t}
        />
      )}
    </article>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 *  Subcomponentes
 * ──────────────────────────────────────────────────────────────────────────*/

function ModePicker({
  active,
  onSelect,
  disabled,
}: {
  active: Mode | null;
  onSelect: (m: Mode) => void;
  disabled: boolean;
}) {
  const t = useT();
  const modes: { id: Mode; accent: 'leaf' | 'electric' | 'flame' }[] = [
    { id: 'easy', accent: 'leaf' },
    { id: 'normal', accent: 'electric' },
    { id: 'hard', accent: 'flame' },
  ];
  return (
    <div
      role="radiogroup"
      aria-label={t('game.mode.label')}
      className="grid grid-cols-1 sm:grid-cols-3 gap-2"
    >
      {modes.map((m) => {
        const isActive = active === m.id;
        const accentBorder =
          m.accent === 'leaf'
            ? 'border-leaf-400/60'
            : m.accent === 'electric'
              ? 'border-electric-400/60'
              : 'border-flame-400/60';
        const accentText =
          m.accent === 'leaf'
            ? 'text-leaf-400'
            : m.accent === 'electric'
              ? 'text-electric-400'
              : 'text-flame-300';
        return (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={disabled && !isActive}
            onClick={() => onSelect(m.id)}
            className={cn(
              'panel p-3 sm:p-4 text-left transition-all',
              isActive
                ? `${accentBorder} bg-overlay/[0.06]`
                : 'hover:border-overlay/30 hover:bg-overlay/[0.04]',
              disabled && !isActive && 'opacity-40 cursor-not-allowed',
            )}
          >
            <p
              className={cn(
                'display text-base sm:text-lg font-bold',
                isActive ? accentText : 'text-ink-100',
              )}
            >
              {t(`game.mode.${m.id}` as const)}
            </p>
            <p className="text-xs text-ink-300 mt-0.5">
              {t(`game.mode.${m.id}.caption` as const)}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function GameStage({
  round,
  timeLeft,
  roundMs,
  shake,
  wrong,
  guess,
  onGuessChange,
  onSubmit,
  onGiveUp,
  onNext,
  inputRef,
  nextBtnRef,
  tFn,
}: {
  round: RoundState;
  timeLeft: number;
  roundMs: number;
  shake: boolean;
  wrong: boolean;
  guess: string;
  onGuessChange: (s: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onGiveUp: () => void;
  onNext: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  nextBtnRef: React.RefObject<HTMLButtonElement>;
  tFn: ReturnType<typeof useT>;
}) {
  const { pokemon, phase, outcome, capturedNow } = round;
  const seconds = Math.ceil(timeLeft / 1000);
  const progress = timeLeft / roundMs;
  const ringColor = progress > 0.5 ? '#5fc46a' : progress > 0.25 ? '#ffd23f' : '#ed4a08';
  const CIRC = 2 * Math.PI * 46;
  const primary = pokemon.types[0] ?? 'normal';
  const secondary = pokemon.types[1] ?? primary;
  const isCorrect = outcome === 'correct';
  const isRevealed = phase === 'revealed';

  return (
    <section
      className="relative panel-strong p-5 sm:p-8 overflow-hidden"
      style={{
        backgroundImage: isRevealed
          ? `radial-gradient(circle at 80% 0%, ${TYPE_COLOR[primary]}33, transparent 55%), radial-gradient(circle at 10% 100%, ${TYPE_COLOR[secondary]}24, transparent 50%)`
          : undefined,
        transition: 'background-image 400ms ease',
      }}
    >
      <div className="relative mx-auto aspect-square w-full max-w-sm">
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 100 100"
          aria-hidden
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="rgb(var(--overlay) / 0.08)"
            strokeWidth="2"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke={isRevealed ? 'rgb(var(--overlay) / 0.15)' : ringColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={isRevealed ? 0 : CIRC * (1 - progress)}
            style={{ transition: 'stroke 300ms, stroke-dashoffset 80ms linear' }}
          />
        </svg>

        <div className="absolute inset-[10%] grid place-items-center">
          <PokemonSprite
            src={pokemon.artwork}
            fallbackId={pokemon.id}
            alt={isRevealed ? prettyName(pokemon.name) : ''}
            silhouette={!isRevealed}
            loading="eager"
            className={cn(
              'w-full h-full object-contain transition-all duration-500',
              isRevealed && 'drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]',
              isRevealed && isCorrect && 'animate-pop',
            )}
          />
        </div>

        {!isRevealed && (
          <div
            className={cn(
              'absolute top-1 right-1 sm:top-2 sm:right-2 grid place-items-center w-12 h-12 rounded-full font-mono font-black text-lg tabular-nums',
              'bg-ink-900/70 border border-overlay/15 backdrop-blur-sm',
              progress <= 0.25 && 'text-flame-300 animate-pulse',
              progress > 0.25 && progress <= 0.5 && 'text-electric-400',
              progress > 0.5 && 'text-ink-100',
            )}
            aria-live="polite"
            aria-label={tFn('game.time_left', { n: seconds })}
          >
            {seconds}
          </div>
        )}
      </div>

      <div className="mt-6 max-w-md mx-auto">
        {!isRevealed ? (
          <form onSubmit={onSubmit} className="space-y-3">
            <div className={cn('flex gap-2', shake && 'animate-shake')}>
              <input
                ref={inputRef}
                type="text"
                value={guess}
                onChange={(e) => onGuessChange(e.target.value)}
                placeholder={tFn('game.input.placeholder')}
                aria-label={tFn('game.input.aria')}
                aria-invalid={wrong || undefined}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className={cn(
                  'flex-1 px-4 py-2.5 rounded-xl bg-ink-900/60 border text-ink-50 placeholder:text-ink-400 focus:outline-none focus:ring-2 transition-colors',
                  wrong
                    ? 'border-red-500/70 focus:border-red-400 focus:ring-red-500/30'
                    : 'border-overlay/15 focus:border-flame-400/60 focus:ring-flame-400/30',
                )}
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-flame-500 hover:bg-flame-400 text-white font-semibold transition-colors"
              >
                {tFn('game.submit')}
              </button>
            </div>
            <div className="flex items-center justify-between text-xs text-ink-300">
              <span>{tFn('game.hint')}</span>
              <button
                type="button"
                onClick={onGiveUp}
                className="text-ink-300 hover:text-flame-300 underline-offset-2 hover:underline transition-colors"
              >
                {tFn('game.give_up')}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-3">
            <p
              className={cn(
                'display text-2xl sm:text-3xl font-black',
                isCorrect ? 'text-leaf-400' : 'text-flame-300',
              )}
            >
              {isCorrect
                ? tFn('game.reveal.correct', { name: prettyName(pokemon.name) })
                : tFn('game.reveal.failed', { name: prettyName(pokemon.name) })}
            </p>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="font-mono text-sm text-ink-300">{formatDex(pokemon.id)}</span>
              {pokemon.types.map((typeName) => (
                <TypeBadge key={typeName} type={typeName} />
              ))}
            </div>

            {capturedNow && (
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-flame-300 bg-flame-500/10 border border-flame-400/30 rounded-full px-3 py-1">
                <span aria-hidden>★</span> {tFn('game.captured_now')}
              </p>
            )}

            <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
              <button
                ref={nextBtnRef}
                type="button"
                onClick={onNext}
                className="px-5 py-2.5 rounded-xl bg-flame-500 hover:bg-flame-400 text-white font-semibold transition-colors"
              >
                {tFn('game.next')} →
              </button>
              <Link
                href={`/pokemon/${pokemon.id}`}
                className="px-4 py-2.5 rounded-xl border border-overlay/15 text-ink-100 hover:bg-overlay/5 transition-colors"
              >
                {tFn('game.view_detail')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ScoreChip({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: 'flame' | 'leaf';
}) {
  return (
    <div
      className={cn(
        'inline-flex items-baseline gap-1.5 px-3 py-1.5 rounded-xl border bg-ink-900/40',
        accent === 'flame' ? 'border-flame-400/30' : 'border-leaf-400/30',
      )}
    >
      <span className="text-[10px] uppercase tracking-wider text-ink-300">{label}</span>
      <span
        className={cn(
          'font-mono font-black tabular-nums text-lg',
          accent === 'flame' ? 'text-flame-300' : 'text-leaf-400',
        )}
      >
        {value}
      </span>
    </div>
  );
}
