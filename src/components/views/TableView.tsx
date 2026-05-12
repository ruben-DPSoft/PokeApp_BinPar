'use client';

import Link from 'next/link';
import type { PokemonSummary } from '@/types/pokemon';
import { formatDex, prettyName } from '@/lib/utils';
import { TypeBadge } from '@/components/common/TypeBadge';
import { PokemonSprite } from '@/components/common/PokemonSprite';
import { GENERATIONS } from '@/lib/pokemon/generations';

interface TableViewProps {
  pokemon: PokemonSummary[];
}

/**
 * Vista densa estilo "tabla". En móvil mantenemos columnas mínimas (id +
 * nombre + tipos) y empujamos la generación a una fila secundaria para que
 * siga siendo legible sin scroll horizontal — es la única vista donde una
 * tabla "real" tendría sentido. Implementamos como grid CSS, no <table>,
 * porque dar comportamiento responsive a una <table> nativa es complicado.
 */
export function TableView({ pokemon }: TableViewProps) {
  return (
    <div className="panel-strong overflow-hidden">
      {/* Cabecera (sólo escritorio).
          Columnas: el `1fr` vive en Tipos (no en Nombre) — un nombre eats-the-slack
          dejaba un hueco visible entre el texto y los badges en pantallas anchas.
          Tipos sí tolera el espacio extra (las píldoras se reparten con gap),
          y Generación va al borde derecho con justify-self:end. */}
      <div className="hidden md:grid grid-cols-[60px_80px_minmax(160px,240px)_1fr_auto] gap-4 px-4 py-2.5 border-b border-overlay/10 bg-overlay/[0.03] text-[11px] uppercase tracking-wider text-ink-300">
        <span>Sprite</span>
        <span>Dex</span>
        <span>Nombre</span>
        <span>Tipos</span>
        <span className="justify-self-end">Generación</span>
      </div>
      <ul className="divide-y divide-overlay/5">
        {pokemon.map((p) => {
          const gen = GENERATIONS.find((g) => g.id === p.generation);
          return (
            <li key={p.id}>
              <Link
                href={`/pokemon/${p.id}`}
                className="grid grid-cols-[60px_1fr] md:grid-cols-[60px_80px_minmax(160px,240px)_1fr_auto] gap-3 md:gap-4 items-center px-3 sm:px-4 py-2 hover:bg-overlay/[0.05] transition-colors"
              >
                <div className="w-12 h-12 grid place-items-center rounded-lg bg-overlay/[0.04]">
                  <PokemonSprite
                    src={p.sprite}
                    fallbackId={p.id}
                    alt={prettyName(p.name)}
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div className="hidden md:block font-mono text-sm text-ink-300">
                  {formatDex(p.id)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm sm:text-base font-semibold text-ink-50 truncate">
                    {prettyName(p.name)}
                  </p>
                  <div className="md:hidden mt-1 flex items-center gap-2 text-[11px] text-ink-300">
                    <span className="font-mono">{formatDex(p.id)}</span>
                    {gen && <span>· Gen {gen.id}</span>}
                  </div>
                  <div className="md:hidden mt-1 flex flex-wrap gap-1">
                    {p.types.map((t) => (
                      <TypeBadge key={t} type={t} />
                    ))}
                  </div>
                </div>
                <div className="hidden md:flex flex-wrap gap-1.5">
                  {p.types.map((t) => (
                    <TypeBadge key={t} type={t} />
                  ))}
                </div>
                <div className="hidden md:block text-sm text-ink-200 justify-self-end whitespace-nowrap">
                  {gen && (
                    <>
                      <span className="font-semibold">Gen {gen.id}</span>{' '}
                      <span className="text-ink-400">· {gen.region}</span>
                    </>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
