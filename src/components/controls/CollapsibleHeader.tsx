'use client';

import { cn } from '@/lib/utils';

interface CollapsibleHeaderProps {
  label: string;
  badgeCount: number;
  open: boolean;
  onToggle: () => void;
}

/**
 * Cabecera de sección de filtros con botón de colapso integrado.
 *
 * Estructura: label uppercase a la izquierda + badge con conteo de items
 * seleccionados (sólo si hay) + chevron a la derecha. Toda la cabecera es un
 * botón clickable que dispara el toggle. Accesibilidad: `aria-expanded` indica
 * el estado del colapso al asistente; `aria-controls` se podría añadir si
 * envolvemos también el contenido y le ponemos id, pero por ahora basta con
 * el `aria-expanded` para que VoiceOver/NVDA lean "expandido/contraído".
 */
export function CollapsibleHeader({ label, badgeCount, open, onToggle }: CollapsibleHeaderProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className={cn(
        'w-full flex items-center justify-between gap-2 rounded-lg',
        'px-1 py-0.5 -mx-1',
        'text-[10px] uppercase tracking-[0.18em] text-ink-300',
        'hover:text-ink-100 transition-colors',
      )}
    >
      <span className="flex items-center gap-2">
        <span>{label}</span>
        {badgeCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-flame-500 text-white text-[10px] font-bold tracking-normal">
            {badgeCount}
          </span>
        )}
      </span>
      <Chevron open={open} />
    </button>
  );
}

/**
 * Flecha que rota 180° entre cerrado y abierto. Animada con `transition`.
 * Se exporta separadamente porque el selector móvil de tipos la reutiliza
 * sin la cabecera completa.
 */
export function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className={cn('shrink-0 transition-transform duration-200', open ? 'rotate-180' : 'rotate-0')}
    >
      <path
        d="M3 4.5l3 3 3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
