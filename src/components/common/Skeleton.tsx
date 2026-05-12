import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

/** Bloque animado para placeholders mientras cargan datos. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-md bg-gradient-to-r from-overlay/5 via-overlay/10 to-overlay/5 bg-[length:200%_100%] animate-pulse-slow',
        className,
      )}
      aria-hidden
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="panel p-4 h-56 flex flex-col gap-3">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="flex-1 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
