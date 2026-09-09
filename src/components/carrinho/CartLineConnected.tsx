'use client';

import { useAtualizarQuantidade, useRemoverItem } from '@/lib/hooks/use-carrinho';
import type { ItemCarrinho } from '@/lib/tipos';
import { CartLine, type CartLineProps } from './CartLine/CartLine';

type Props = Omit<CartLineProps, 'onQuantityChange' | 'onRemove' | 'busy'> & {
  item: ItemCarrinho;
};

/** Liga a linha presentacional às mutações otimistas. */
export function CartLineConnected(props: Props) {
  const atualizar = useAtualizarQuantidade();
  const remover = useRemoverItem();

  return (
    <CartLine
      {...props}
      onQuantityChange={(itemId, quantidade) => atualizar.mutate({ itemId, quantidade })}
      onRemove={(itemId) => remover.mutate(itemId)}
      busy={atualizar.isPending || remover.isPending}
    />
  );
}
