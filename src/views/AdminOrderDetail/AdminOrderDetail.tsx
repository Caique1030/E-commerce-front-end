'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ChangeStatus } from '@/components/admin/ChangeStatus/ChangeStatus';
import { EmptyState } from '@/components/estados/EmptyState';
import { ErrorState } from '@/components/estados/ErrorState';
import {
  OrderHeader,
  OrderItems,
  OrderTimeline,
} from '@/components/pedido/OrderDetails/OrderDetails';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ehApiError } from '@/lib/api/cliente';
import { usePedido } from '@/lib/hooks/use-pedidos';
import * as S from './style';

function PageSkeleton() {
  return (
    <S.SkeletonRoot aria-busy>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-72 w-full" />
    </S.SkeletonRoot>
  );
}

/** Pedido visto pela equipe: itens e totais à esquerda, troca de status e histórico à direita. */
export function AdminOrderDetail({ id }: { id: string }) {
  const pedido = usePedido(id);

  if (pedido.isPending) return <PageSkeleton />;
  if (pedido.isError) {
    if (ehApiError(pedido.error) && pedido.error.status === 404) {
      return (
        <EmptyState
          illustration="orders"
          title="Pedido não encontrado."
          action={
            <Button as={Link} href="/admin/pedidos" variant="secondary">
              Ver pedidos
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
      <S.BackLink href="/admin/pedidos">
        <ArrowLeft size={16} aria-hidden />
        Pedidos
      </S.BackLink>
      <OrderHeader pedido={p} showCustomer />

      <S.Grid>
        <S.ItemsPanel aria-label="Itens">
          <OrderItems pedido={p} />
          <S.Totals pedido={p} />
        </S.ItemsPanel>

        <S.Side>
          <S.SidePanel aria-labelledby="titulo-status">
            <S.PanelTitle id="titulo-status" $spacing="sm">
              Mudar status
            </S.PanelTitle>
            <ChangeStatus pedidoId={p.id} statusAtual={p.status} />
          </S.SidePanel>
          <S.SidePanel aria-labelledby="titulo-historico">
            <S.PanelTitle id="titulo-historico" $spacing="md">
              Histórico
            </S.PanelTitle>
            <OrderTimeline historico={p.historico} />
          </S.SidePanel>
        </S.Side>
      </S.Grid>
    </S.Root>
  );
}
