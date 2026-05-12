'use client';

interface StatsBarsProps {
  rows: { key: string; label: string; a: number; b: number }[];
  colorA: string;
  colorB: string;
}

/** Eje x conceptual 0-200 — cubre con holgura las stats más altas (típico
 *  max ≈ 180 en Pokémon ofensivos extremos). */
const MAX = 200;
const TICKS = [0, 50, 100, 150, 200];

/**
 * Barras horizontales con dos series por fila. Implementadas en CSS puro
 * (no Recharts) para tener control fino sobre tipografía, valores numéricos
 * en línea y el escalado consistente.
 */
export function StatsBars({ rows, colorA, colorB }: StatsBarsProps) {
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.key} className="grid grid-cols-[110px_1fr] gap-3 items-center">
          <span className="text-xs sm:text-sm text-ink-200 font-medium">{r.label}</span>
          <div className="space-y-1">
            <Bar value={r.a} color={colorA} />
            <Bar value={r.b} color={colorB} />
          </div>
        </div>
      ))}

      {/* Escala numérica de referencia */}
      <div className="grid grid-cols-[110px_1fr] gap-3 pt-1">
        <span aria-hidden />
        <div className="relative h-4">
          {TICKS.map((tick) => (
            <span
              key={tick}
              className="absolute top-0 -translate-x-1/2 text-[10px] text-ink-400 font-mono tabular-nums"
              style={{ left: `${(tick / MAX) * 100}%` }}
            >
              {tick}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Bar({ value, color }: { value: number; color: string }) {
  const pct = Math.min(100, (value / MAX) * 100);
  return (
    <div className="flex items-center gap-2">
      <div
        className="relative h-2 flex-1 rounded-full overflow-hidden bg-ink-900/60 border border-overlay/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={MAX}
        aria-valuenow={value}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
      </div>
      <span className="font-mono tabular-nums text-xs text-ink-100 w-7 text-right">{value}</span>
    </div>
  );
}
