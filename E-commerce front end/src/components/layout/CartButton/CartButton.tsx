'use client';

import { ShoppingCart } from 'lucide-react';
import { useCarrinho } from '@/lib/hooks/use-carrinho';
import { pluralizar } from '@/lib/formatadores';
import { useSessao } from '@/providers/sessao-provider';
import { useUiStore } from '@/stores/ui-store';
import * as S from './style';

/** Ícone do carrinho com contador. A equipe não compra, então nem vê o botão. */
export function CartButton({ className }: { className?: string }) {
  const { ehEquipe } = useSessao();
  const { data } = useCarrinho();
  const abrir = useUiStore((s) => s.abrirDrawerCarrinho);
  const total = data?.totalItens ?? 0;

  if (ehEquipe) return null;

  return (
    <S.Root
      type="button"
      onClick={() => abrir()}
      className={className}
      aria-label={`Abrir carrinho, ${pluralizar(total, 'item', 'itens')}`}
    >
      <ShoppingCart size={24} aria-hidden strokeWidth={1.75} />
      {total > 0 && <S.Counter aria-hidden>{total > 99 ? '99+' : total}</S.Counter>}
    </S.Root>
  );
}
