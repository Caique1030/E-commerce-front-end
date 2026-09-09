'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { EmptyState } from '@/components/estados/EmptyState';
import { ErrorState } from '@/components/estados/ErrorState';
import { CartLineSkeleton } from '@/components/estados/Skeletons';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Dialog';
import { useCarrinho } from '@/lib/hooks/use-carrinho';
import { useSessao } from '@/providers/sessao-provider';
import { useUiStore } from '@/stores/ui-store';
import { CartLineConnected } from '../CartLineConnected';
import { OrderSummary } from '../OrderSummary/OrderSummary';
import * as S from './style';

/**
 * Drawer lateral do carrinho: adicionar sem perder o lugar no catálogo.
 * A linha recém-adicionada entra destacada e rola até ficar visível.
 */
export function CartDrawer() {
  const aberto = useUiStore((s) => s.drawerCarrinhoAberto);
  const definir = useUiStore((s) => s.definirDrawerCarrinho);
  const itemDestacadoId = useUiStore((s) => s.itemDestacadoId);
  const fechar = () => definir(false);
  const router = useRouter();
  const { status, ehCliente } = useSessao();
  const carrinho = useCarrinho();

  const temIndisponivel = carrinho.data?.itens.some((i) => !i.disponivel) ?? false;
  const vazio = carrinho.isSuccess && carrinho.data.itens.length === 0;

  function irPara(destino: string) {
    fechar();
    router.push(destino);
  }

  let conteudo: ReactNode;

  if (status === 'carregando') {
    conteudo = (
      <S.List>
        <CartLineSkeleton />
        <CartLineSkeleton />
      </S.List>
    );
  } else if (status === 'anonimo') {
    conteudo = (
      <EmptyState
        illustration="cart"
        title="Entre para ver seu carrinho."
        description="Os itens ficam guardados na sua conta."
        action={
          <>
            <Button onClick={() => irPara('/entrar?voltar=/carrinho')}>Entrar</Button>
            <Button variant="secondary" onClick={() => irPara('/criar-conta?voltar=/carrinho')}>
              Criar conta
            </Button>
          </>
        }
      />
    );
  } else if (!ehCliente) {
    conteudo = (
      <EmptyState
        title="Contas da equipe não compram."
        description="Entre com uma conta de cliente para testar o carrinho. As contas de teste estão no README."
        action={
          <Button variant="secondary" onClick={() => irPara('/entrar')}>
            Trocar de conta
          </Button>
        }
      />
    );
  } else if (carrinho.isPending) {
    conteudo = (
      <S.List>
        <CartLineSkeleton />
        <CartLineSkeleton />
      </S.List>
    );
  } else if (carrinho.isError) {
    conteudo = (
      <S.ErrorWrap>
        <ErrorState
          error={carrinho.error}
          title="Não foi possível carregar o carrinho."
          onRetry={() => void carrinho.refetch()}
          retrying={carrinho.isFetching}
          compact
        />
      </S.ErrorWrap>
    );
  } else if (vazio) {
    conteudo = (
      <EmptyState
        illustration="cart"
        title="Seu carrinho está vazio."
        action={<Button onClick={() => irPara('/')}>Ver produtos</Button>}
      />
    );
  } else {
    conteudo = (
      <S.List>
        {carrinho.data.itens.map((item) => (
          <CartLineConnected
            key={item.id}
            item={item}
            compact
            highlighted={item.id === itemDestacadoId}
            onNavigate={fechar}
          />
        ))}
      </S.List>
    );
  }

  const rodape =
    carrinho.isSuccess && carrinho.data.itens.length > 0 && ehCliente ? (
      <S.Footer>
        {temIndisponivel && (
          <S.Warning role="status">
            Um item saiu de venda. Remova-o para finalizar a compra.
          </S.Warning>
        )}
        <OrderSummary
          subtotalCentavos={carrinho.data.subtotalCentavos}
          totalItens={carrinho.data.totalItens}
          compact
        />
        <Button size="lg" onClick={() => irPara('/checkout')} disabled={temIndisponivel}>
          Finalizar compra
        </Button>
        <S.FullCartLink href="/carrinho" onClick={fechar}>
          Ver carrinho completo
        </S.FullCartLink>
      </S.Footer>
    ) : undefined;

  return (
    <Drawer
      open={aberto}
      onOpenChange={definir}
      title="Carrinho"
      description="Itens que você adicionou. Altere quantidades ou finalize a compra."
      footer={rodape}
    >
      {conteudo}
    </Drawer>
  );
}
