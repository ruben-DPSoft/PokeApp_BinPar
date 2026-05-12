import { Skeleton } from '@/components/common/Skeleton';

/**
 * Loading UI mientras `fetchPokemonDetail` se resuelve. Next renderiza este
 * componente automáticamente entre la transición a la ruta y la respuesta
 * del servidor — sustituye al "flash blanco".
 */
export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <Skeleton className="h-6 w-32 mb-6" />
      <div className="panel-strong p-8 grid lg:grid-cols-[auto_1fr] gap-8">
        <Skeleton className="w-64 h-64 rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-12 w-72" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-24 w-full max-w-xl" />
        </div>
      </div>
      <div className="grid lg:grid-cols-[2fr_1fr] gap-6 mt-6">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}
