import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

/** Esqueletos com a forma real de cada tela. */

export function ProductCardSkeleton() {
  return (
    <div className="rounded-card bg-branco shadow-card flex flex-col overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-2 p-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="mt-2 h-7 w-28" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-2 h-10 w-full" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({
  count = 8,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4', className)}
      aria-busy
      aria-label="Carregando produtos"
    >
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CategoryTreeSkeleton() {
  return (
    <div className="flex flex-col gap-3 py-1" aria-hidden>
      {Array.from({ length: 9 }, (_, i) => (
        <Skeleton key={i} className={cn('h-4', i % 3 === 0 ? 'w-32' : 'ml-3 w-24')} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]" aria-busy>
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-4/5" />
        <Skeleton className="h-7 w-3/5" />
        <Skeleton className="mt-3 h-7 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-4 h-12 w-full" />
        <Skeleton className="mt-6 h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function CartLineSkeleton() {
  return (
    <div className="flex gap-3 py-4" aria-hidden>
      <Skeleton className="h-16 w-20 shrink-0" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="mt-1 h-8 w-28" />
      </div>
      <Skeleton className="h-5 w-20" />
    </div>
  );
}

export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div
      className="rounded-card border-borda bg-branco shadow-card overflow-hidden border"
      aria-busy
    >
      <div className="border-borda bg-papel-2 flex gap-4 border-b px-3 py-3">
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="border-borda flex gap-4 border-b px-3 py-3.5 last:border-b-0">
          {Array.from({ length: columns }, (_, c) => (
            <Skeleton key={c} className={cn('h-4 flex-1', c === 0 && 'flex-[2]')} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-card border-borda bg-branco shadow-card border p-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-7 w-32" />
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="flex flex-col gap-5" aria-busy>
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}
