'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { EmptyState } from '@/components/estados/EmptyState';
import { ErrorState } from '@/components/estados/ErrorState';
import { TableSkeleton } from '@/components/estados/Skeletons';
import { SessionGuard } from '@/components/layout/SessionGuard';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { Price } from '@/components/ui/Price';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatarDataHora, pluralizar } from '@/lib/formatadores';
import { useMeusPedidos } from '@/lib/hooks/use-pedidos';
import * as S from './style';

const LIMITE = 10;

function PageSkeleton() {
  return (
    <S.Skeletons aria-busy>
      <Skeleton className="h-8 w-48" />
      <TableSkeleton rows={4} columns={4} />
    </S.Skeletons>
  );
}

/** Meus pedidos: lista paginada pela URL (?page=). */
export function MyOrders() {
  return (
    <SessionGuard require="cliente" fallback={<PageSkeleton />}>
      <Suspense fallback={<PageSkeleton />}>
        <OrdersList />
      </Suspense>
    </SessionGuard>
  );
}

function OrdersList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Math.max(1, Number(searchParams.get('page') ?? 1) || 1);
  const pedidos = useMeusPedidos({ page, limit: LIMITE });

  return (
    <S.Root aria-labelledby="titulo-pedidos">
      <S.Title id="titulo-pedidos">Meus pedidos</S.Title>

      {pedidos.isPending ? (
        <TableSkeleton rows={4} columns={4} />
      ) : pedidos.isError ? (
        <ErrorState
          error={pedidos.error}
          title="Não foi possível carregar seus pedidos."
          onRetry={() => void pedidos.refetch()}
          retrying={pedidos.isFetching}
        />
      ) : pedidos.data.data.length === 0 ? (
        <EmptyState
          illustration="orders"
          title="Você ainda não fez pedidos."
          description="Quando finalizar uma compra, ela aparece aqui com o status atualizado."
          action={
            <Button as={Link} href="/">
              Ver produtos
            </Button>
          }
        />
      ) : (
        <>
          <S.List>
            {pedidos.data.data.map((p) => (
              <li key={p.id}>
                <S.OrderLink
                  href={`/meus-pedidos/${p.id}`}
                  aria-label={`Pedido ${p.codigo}, ${pluralizar(p.totalItens, 'item', 'itens')}`}
                >
                  <S.Info>
                    <S.Code>{p.codigo}</S.Code>
                    <S.Meta>
                      {formatarDataHora(p.criadoEm)} · {pluralizar(p.totalItens, 'item', 'itens')}
                    </S.Meta>
                  </S.Info>
                  <StatusBadge status={p.status} className="hidden sm:inline-flex" />
                  <Price centavos={p.totalCentavos} variant="line" />
                  <S.Chevron size={16} aria-hidden />
                </S.OrderLink>
              </li>
            ))}
          </S.List>
          <Pagination
            page={page}
            totalPages={pedidos.data.meta.totalPages}
            onChange={(p) => router.push(p > 1 ? `/meus-pedidos?page=${p}` : '/meus-pedidos')}
            className="justify-center"
          />
        </>
      )}
    </S.Root>
  );
}
