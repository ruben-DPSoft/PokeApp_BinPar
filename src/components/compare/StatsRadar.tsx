'use client';

import { useEffect, useState } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';

interface StatsRadarProps {
  rows: { key: string; label: string; a: number; b: number }[];
  nameA: string;
  nameB: string;
  colorA: string;
  colorB: string;
}

/** Radar chart de las 6 stats canónicas. Dos series con relleno translúcido,
 *  eje radial fijo a 0..150 (suficiente para la mayoría de Pokémon).
 *
 *  Mount flag: el `ResponsiveContainer` mide el padre nada más montarse. Si
 *  el primer paint llega antes de que el layout esté computado (caso típico
 *  cuando el chart aparece tras un conditional render como `bothReady ? …`),
 *  obtiene `width/height = -1` y emite un warning. Diferimos el render del
 *  chart un tick (`useEffect` post-commit) para que el wrapper ya tenga
 *  dimensiones reales cuando Recharts intente medirlo. */
export function StatsRadar({ rows, nameA, nameB, colorA, colorB }: StatsRadarProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const data = rows.map((r) => ({ stat: r.label, A: r.a, B: r.b }));

  return (
    <div className="w-full h-72 sm:h-80">
      {mounted && (
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <RadarChart data={data} outerRadius="75%">
            <PolarGrid stroke="rgb(255 255 255 / 0.12)" />
            <PolarAngleAxis
              dataKey="stat"
              tick={{ fill: 'rgb(var(--ink-200))', fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 150]}
              tick={{ fill: 'rgb(var(--ink-400))', fontSize: 9 }}
              stroke="rgb(255 255 255 / 0.15)"
            />
            <Radar
              name={nameA}
              dataKey="A"
              stroke={colorA}
              fill={colorA}
              fillOpacity={0.32}
              isAnimationActive={false}
            />
            <Radar
              name={nameB}
              dataKey="B"
              stroke={colorB}
              fill={colorB}
              fillOpacity={0.32}
              isAnimationActive={false}
            />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
