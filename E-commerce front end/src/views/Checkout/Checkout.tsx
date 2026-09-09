'use client';

import Link from 'next/link';
import { CheckoutForm } from '@/components/carrinho/CheckoutForm/CheckoutForm';
import { EmptyState } from '@/components/estados/EmptyState';
import { ErrorState } from '@/components/estados/ErrorState';
import { CartLineSkeleton } from '@/components/estados/Skeletons';
import { SessionGuard } from '@/components/layout/SessionGuard';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCarrinho } from '@/lib/hooks/use-carrinho';
import * as S from './style';

function PageSkeleton() {
  return (
    <S.Skeletons aria-busy>
      <div>
        <S.SkeletonTitle>
          <Skeleton className="h-8 w-48" />
        </S.SkeletonTitle>
        <S.SkeletonList>
          <CartLineSkeleton />
          <CartLineSkeleton />
        </S.SkeletonList>
      </div>
      <Skeleton className="h-80" />
    </S.Skeletons>
  );
}

/** Checkout: só clientes, com o carrinho já carregado. */
export function Checkout() {
  return (
    <SessionGuard require="cliente" fallback={<PageSkeleton />}>
      <CheckoutContent />
    </SessionGuard>
  );
}

function CheckoutContent() {
  const carrinho = useCarrinho();

  if (carrinho.isPending) return <PageSkeleton />;
  if (carrinho.isError) {
    return (
      <ErrorState
        error={carrinho.error}
        title="Não foi possível carregar o carrinho."
        onRetry={() => void carrinho.refetch()}
        retrying={carrinho.isFetching}
      />
    );
  }
  if (carrinho.data.itens.length === 0) {
    return (
      <EmptyState
        illustration="cart"
        title="Seu carrinho está vazio."
        description="Adicione produtos para finalizar uma compra."
        action={
          <Button as={Link} href="/">
            Ver produtos
          </Button>
        }
      />
    );
  }
  return <CheckoutForm carrinho={carrinho.data} />;
}
