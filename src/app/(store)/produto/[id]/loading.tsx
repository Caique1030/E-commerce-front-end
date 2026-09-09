import { ProductDetailSkeleton } from '@/components/estados/Skeletons';
import { Skeleton } from '@/components/ui/Skeleton';

export default function CarregandoProduto() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-3 w-56" />
      <ProductDetailSkeleton />
    </div>
  );
}
