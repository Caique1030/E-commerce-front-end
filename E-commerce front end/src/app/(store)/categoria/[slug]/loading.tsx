import { ProductGridSkeleton } from '@/components/estados/Skeletons';
import { CatalogLayout } from '@/components/layout/CatalogLayout/CatalogLayout';
import { Skeleton } from '@/components/ui/Skeleton';

export default function CarregandoCategoria() {
  return (
    <CatalogLayout>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-8 w-56" />
        <ProductGridSkeleton />
      </div>
    </CatalogLayout>
  );
}
