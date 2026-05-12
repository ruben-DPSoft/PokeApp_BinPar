import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ComparatorView } from '@/components/compare/ComparatorView';

export const metadata: Metadata = {
  title: 'Comparativa · Pokédex',
  description:
    'Compara dos Pokémon lado a lado: tipos, estadísticas base con radar chart y barras, totales y resumen.',
};

export default function ComparePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* `useSearchParams` (en ComparatorView) requiere Suspense boundary
          en App Router para no romper la generación estática. */}
      <Suspense fallback={null}>
        <ComparatorView />
      </Suspense>
    </main>
  );
}
