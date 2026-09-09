'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/estados/EmptyState';
import { ErrorState } from '@/components/estados/ErrorState';
import { SessionGuard } from '@/components/layout/SessionGuard';
import {
  OrderHeader,
  OrderItems,
  OrderTimeline,
  OrderTotals,
} from '@/components/pedido/OrderDetails/OrderDetails';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ehApiError } from '@/lib/api/cliente';
import { usePedido } from '@/lib/hooks/use-pedidos';
import { VisuallyHidden } from '@/styles/primitives';
import * as S from './style';

function PageSkeleton() {
  return (
    <S.Skeletons aria-busy>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-64 w-full" />
    </S.Skeletons>
  );
}

/** Um pedido do cliente: itens, totais e a linha do tempo de status. */
export function MyOrderDetail({ id }: { id: string }) {
  return (
    <SessionGuard require="cliente" fallback={<PageSkeleton />}>
      <Detail id={id} />
    </SessionGuard>
  );
}

function Detail({ id }: { id: string }) {
  const pedido = usePedido(id);

  if (pedido.isPending) return <PageSkeleton />;
  if (pedido.isError) {
    if (ehApiError(pedido.error) && pedido.error.status === 404) {
      return (
        <EmptyState
          illustration="orders"
          title="Pedido não encontrado."
          action={
            <Button as={Link} href="/meus-pedidos" variant="secondary">
              Ver meus pedidos
            </Button>
          }
        />
      );
    }
    return (
      <ErrorState
        error={pedido.error}
        title="Não foi possível carregar o pedido."
        onRetry={() => void pedido.refetch()}
        retrying={pedido.isFetching}
      />
    );
  }

  const p = pedido.data;

  return (
    <S.Root>
      <S.BackLink href="/meus-pedidos">
        <ArrowLeft size={16} aria-hidden />
        Meus pedidos
      </S.BackLink>

      <OrderHeader pedido={p} />

      <S.Grid>
        <S.ItemsCard aria-labelledby="titulo-itens">
          <VisuallyHidden as="h2" id="titulo-itens">
            Itens
          </VisuallyHidden>
          <OrderItems pedido={p} />
          <OrderTotals pedido={p} className="py-4" />
        </S.ItemsCard>

        <S.SideCard aria-labelledby="titulo-historico">
          <S.SideTitle id="titulo-historico">Acompanhamento</S.SideTitle>
          <OrderTimeline historico={p.historico} />
        </S.SideCard>
      </S.Grid>
    </S.Root>
  );
}
