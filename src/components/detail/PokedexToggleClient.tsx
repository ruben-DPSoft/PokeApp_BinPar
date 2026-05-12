'use client';

import { useEffect, useState } from 'react';
import { usePokedexStore } from '@/store/pokedex';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/useT';

interface PokedexToggleClientProps {
  id: number;
}

/**
 * Toggle compacto para marcar/desmarcar el Pokémon como capturado.
 * Indicador a la izquierda: ○ cuando no está, Pokéball oficial cuando sí.
 * Anti-flash: durante el primer paint (antes de leer localStorage) muestra
 * el estado neutro y queda deshabilitado.
 */
export function PokedexToggleClient({ id }: PokedexToggleClientProps) {
  const owned = usePokedexStore((s) => s.owned.has(id));
  const toggle = usePokedexStore((s) => s.toggle);
  const t = useT();

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  return (
    <button
      type="button"
      onClick={() => toggle(id)}
      aria-pressed={hydrated ? owned : undefined}
      disabled={!hydrated}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-sm font-semibold transition',
        !hydrated && 'opacity-50 cursor-progress',
        hydrated && owned
          ? 'bg-flame-500/15 border border-flame-400/50 text-flame-100 hover:bg-flame-500/25'
          : 'bg-ink-50 text-ink-900 border border-ink-50 hover:bg-ink-100',
      )}
    >
      {hydrated && owned ? (
        <img
          src="/assets/Pok%C3%A9_Ball_icon.svg"
          alt=""
          aria-hidden
          className="w-5 h-5 shrink-0"
        />
      ) : (
        <span aria-hidden className="text-base leading-none">○</span>
      )}
      <span>{hydrated && owned ? t('detail.toggle.remove') : t('detail.toggle.add')}</span>
    </button>
  );
}
