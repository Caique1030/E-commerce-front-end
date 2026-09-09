import { ProductGridSkeleton } from '@/components/estados/Skeletons';
import { Skeleton } from '@/components/ui/Skeleton';

/** A home espera o prefetch do catálogo antes de renderizar; sem isto a tela ficava em branco. */
export default function CarregandoHome() {
  return (
    <div className="flex flex-col gap-4" aria-busy>
      <Skeleton className="rounded-card h-[15rem] w-full sm:h-[17rem] lg:h-[19rem]" />
      <Skeleton className="rounded-card h-28 w-full" />
      <ProductGridSkeleton />
    </div>
  );
}
