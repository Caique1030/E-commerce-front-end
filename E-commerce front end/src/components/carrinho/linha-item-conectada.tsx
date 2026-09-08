'use client';

import { useAtualizarQuantidade, useRemoverItem } from '@/lib/hooks/use-carrinho';
import type { ItemCarrinho } from '@/lib/tipos';
import { LinhaItem, type LinhaItemProps } from './linha-item';

type Props = Omit<LinhaItemProps, 'aoAlterarQuantidade' | 'aoRemover' | 'ocupado'> & {
  item: ItemCarrinho;
};

/** Liga a linha presentacional às mutações otimistas. */
export function LinhaItemConectada(props: Props) {
  const atualizar = useAtualizarQuantidade();
  const remover = useRemoverItem();

  return (
    <LinhaItem
      {...props}
      aoAlterarQuantidade={(itemId, quantidade) => atualizar.mutate({ itemId, quantidade })}
      aoRemover={(itemId) => remover.mutate(itemId)}
      ocupado={false}
    />
  );
}
