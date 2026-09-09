'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CartLineConnected } from '@/components/carrinho/CartLineConnected';
import { OrderSummary } from '@/components/carrinho/OrderSummary/OrderSummary';
import { EmptyState } from '@/components/estados/EmptyState';
import { ErrorState } from '@/components/estados/ErrorState';
import { CartLineSkeleton } from '@/components/estados/Skeletons';
import { SessionGuard } from '@/components/layout/SessionGuard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Dialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCarrinho, useEsvaziarCarrinho } from '@/lib/hooks/use-carrinho';
import * as S from './style';

function PageSkeleton() {
  return (
    <S.Root aria-busy>
      <div>
        <S.SkeletonTitle>
          <Skeleton className="h-8 w-40" />
        </S.SkeletonTitle>
        <S.List>
          <CartLineSkeleton />
          <CartLineSkeleton />
          <CartLineSkeleton />
        </S.List>
      </div>
      <Skeleton className="h-48" />
    </S.Root>
  );
}

/** Revisão do carrinho em página cheia, antes do checkout. */
export function Cart() {
  return (
    <SessionGuard require="cliente" fallback={<PageSkeleton />}>
      <CartContent />
    </SessionGuard>
  );
}

function CartContent() {
  const carrinho = useCarrinho();
  const esvaziar = useEsvaziarCarrinho();
  const [confirmando, setConfirmando] = useState(false);

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

  const { itens, subtotalCentavos, totalItens } = carrinho.data;
  const temIndisponivel = itens.some((i) => !i.disponivel);

  if (itens.length === 0) {
    return (
      <EmptyState
        illustration="cart"
        title="Seu carrinho está vazio."
        action={
          <Button as={Link} href="/">
            Ver produtos
          </Button>
        }
      />
    );
  }

  return (
    <S.Root>
      <section aria-labelledby="titulo-carrinho">
        <S.TitleRow>
          <S.Title id="titulo-carrinho">Carrinho</S.Title>
          <Button variant="link" size="sm" onClick={() => setConfirmando(true)}>
            Esvaziar carrinho
          </Button>
          <Modal
            open={confirmando}
            onOpenChange={setConfirmando}
            title="Esvaziar o carrinho?"
            description="Todos os itens serão removidos. Você pode adicioná-los de novo depois."
            footer={
              <>
                <Button variant="secondary" onClick={() => setConfirmando(false)}>
                  Manter itens
                </Button>
                <Button
                  variant="danger"
                  loading={esvaziar.isPending}
                  onClick={() =>
                    esvaziar.mutate(undefined, { onSuccess: () => setConfirmando(false) })
                  }
                >
                  Esvaziar
                </Button>
              </>
            }
          >
            <S.ModalText>
              {totalItens} {totalItens === 1 ? 'unidade sairá' : 'unidades sairão'} do carrinho.
            </S.ModalText>
          </Modal>
        </S.TitleRow>

        {temIndisponivel && (
          <S.Notice role="status">
            Um item saiu de venda desde que você o adicionou. Remova-o para continuar.
          </S.Notice>
        )}

        <S.List>
          {itens.map((item) => (
            <CartLineConnected key={item.id} item={item} />
          ))}
        </S.List>
      </section>

      <S.Aside aria-label="Resumo do carrinho">
        <S.SummaryCard>
          <S.SummaryTitle>Resumo</S.SummaryTitle>
          <OrderSummary subtotalCentavos={subtotalCentavos} totalItens={totalItens} />
          <Button
            as={Link}
            href="/checkout"
            size="lg"
            aria-disabled={temIndisponivel || undefined}
            tabIndex={temIndisponivel ? -1 : undefined}
            className={temIndisponivel ? 'pointer-events-none' : undefined}
          >
            Finalizar compra
          </Button>
          <S.ContinueLink href="/">Continuar comprando</S.ContinueLink>
        </S.SummaryCard>
      </S.Aside>
    </S.Root>
  );
}
