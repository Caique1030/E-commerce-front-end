'use client';

import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/estados/EmptyState';
import { ErrorState } from '@/components/estados/ErrorState';
import { SessionGuard } from '@/components/layout/SessionGuard';
import { OrderItems, OrderTotals } from '@/components/pedido/OrderDetails/OrderDetails';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ehApiError } from '@/lib/api/cliente';
import { usePedido } from '@/lib/hooks/use-pedidos';
import { useSessao } from '@/providers/sessao-provider';
import { VisuallyHidden } from '@/styles/primitives';
import * as S from './style';

function PageSkeleton() {
  return (
    <S.Skeletons aria-busy>
      <Skeleton className="size-14 rounded-full" />
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-80" />
      <Skeleton className="mt-4 h-64 w-full" />
    </S.Skeletons>
  );
}

/** Confirmação pós-compra. */
export function OrderConfirmation({ id }: { id: string }) {
  return (
    <SessionGuard fallback={<PageSkeleton />}>
      <Confirmation id={id} />
    </SessionGuard>
  );
}

function Confirmation({ id }: { id: string }) {
  const { ehEquipe } = useSessao();
  const pedido = usePedido(id);
  const mailpit = process.env.NEXT_PUBLIC_MAILPIT_URL;

  if (pedido.isPending) return <PageSkeleton />;
  if (pedido.isError) {
    if (ehApiError(pedido.error) && pedido.error.status === 404) {
      return (
        <EmptyState
          illustration="orders"
          title="Pedido não encontrado."
          description="Confira o endereço ou veja a lista dos seus pedidos."
          action={
            <Button
              as={Link}
              href={ehEquipe ? '/admin/pedidos' : '/meus-pedidos'}
              variant="secondary"
            >
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
      <S.Header>
        <S.Seal aria-hidden>
          <CheckCircle2 size={32} strokeWidth={1.75} />
        </S.Seal>
        <S.Title>Pedido confirmado</S.Title>
        <S.CodeLine>
          <S.Code>{p.codigo}</S.Code>
          <StatusBadge status={p.status} />
        </S.CodeLine>
        <S.Lead>
          Enviamos a confirmação para <S.Email>{p.cliente.email}</S.Email>.
          {mailpit && (
            <>
              {' '}
              Nesta demonstração, abra a{' '}
              <S.MailLink href={mailpit} target="_blank" rel="noreferrer">
                caixa de e-mails local
              </S.MailLink>
              .
            </>
          )}
        </S.Lead>
      </S.Header>

      <S.ItemsCard aria-labelledby="titulo-itens">
        <VisuallyHidden as="h2" id="titulo-itens">
          Itens
        </VisuallyHidden>
        <OrderItems pedido={p} />
        <OrderTotals pedido={p} className="py-4" />
      </S.ItemsCard>

      <S.Actions>
        {!ehEquipe && (
          <Button as={Link} href={`/meus-pedidos/${p.id}`} variant="secondary">
            Acompanhar pedido
          </Button>
        )}
        <Button as={Link} href="/">
          Continuar comprando
        </Button>
      </S.Actions>
    </S.Root>
  );
}
