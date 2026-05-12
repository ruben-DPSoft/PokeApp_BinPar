import { STAT_MAX, cn } from '@/lib/utils';

interface StatBarProps {
  label: string;
  value: number;
  /** Color hex; si se omite, se interpola automáticamente. */
  color?: string;
  className?: string;
}

/**
 * Barra horizontal para stats. El color varía según el valor:
 *   - rojo (<60) — flojo
 *   - amarillo (60-90) — medio
 *   - verde (>90) — alto
 * Esto da feedback visual inmediato sin necesidad de leer el número.
 */
function autoColor(value: number): string {
  if (value < 60) return '#ed4a08';   // flame-500
  if (value < 90) return '#f7b500';   // electric-500
  return '#3ea748';                   // leaf-500
}

export function StatBar({ label, value, color, className }: StatBarProps) {
  const pct = Math.min(100, Math.round((value / STAT_MAX) * 100));
  const fill = color ?? autoColor(value);

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="w-28 shrink-0 text-xs uppercase tracking-wider text-ink-300">
        {label}
      </span>
      <span className="w-10 tabular-nums text-right text-sm font-mono text-ink-100">
        {value}
      </span>
      <div className="flex-1 h-2 rounded-full bg-overlay/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${fill}aa, ${fill})` }}
          aria-hidden
        />
      </div>
    </div>
  );
}
