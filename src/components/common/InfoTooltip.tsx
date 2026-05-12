'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface InfoTooltipProps {
  /** Texto que aparece en el popover. Si está vacío, el wrapper se vuelve
   *  inerte (no botón, sin tooltip) — útil para no romper el layout cuando
   *  PokéAPI no devuelve descripción para alguna habilidad/movimiento raro. */
  content: string;
  /** Contenido del propio "row" (lo que el usuario ve sin pasar el ratón). */
  children: React.ReactNode;
  /** Clases sobre el trigger (la fila clickable). */
  triggerClassName?: string;
  /** Clases sobre el wrapper externo (posicional). */
  className?: string;
}

/**
 * Popover con descripción. Dos modos de apertura combinados:
 *   - desktop (mouse/pen + teclado): hover/focus → abre, mouseleave/blur → cierra.
 *   - touch: tap → fija el popover (pinned). Cierra con tap fuera o ESC.
 *
 * El estado se descompone en `hovered` (transitorio) y `pinned` (toggle táctil).
 * Open = hovered || pinned. Así un usuario de ratón puede hacer click sin que
 * el tooltip se cierre por accidente, y un usuario táctil tiene control
 * explícito del pin sin depender de hover.
 *
 * `pointerType !== 'touch'` en pointerenter/leave evita el flicker en
 * Android, donde el tap genera eventos sintéticos de hover.
 */
export function InfoTooltip({ content, children, triggerClassName, className }: InfoTooltipProps) {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();

  const open = hovered || pinned;

  // Cuando está pinned: cerrar al tocar/clicar fuera o pulsar ESC.
  useEffect(() => {
    if (!pinned) return;
    const onPointer = (e: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setPinned(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPinned(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [pinned]);

  // Sin descripción → renderizamos como un wrapper estático, no como button.
  if (!content) {
    return <div className={cn(triggerClassName, className)}>{children}</div>;
  }

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-describedby={open ? tooltipId : undefined}
        aria-expanded={open}
        onPointerEnter={(e) => {
          if (e.pointerType !== 'touch') setHovered(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== 'touch') setHovered(false);
        }}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        onClick={() => setPinned((p) => !p)}
        className={cn('text-left w-full', triggerClassName)}
      >
        {children}
      </button>
      {open && (
        <div id={tooltipId} role="tooltip" className="info-tooltip">
          {content}
        </div>
      )}
    </div>
  );
}
