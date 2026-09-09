'use client';

import { useAcaoAdicionar } from '@/lib/hooks/use-acao-adicionar';
import { usePrefetchProduto } from '@/lib/hooks/use-produtos';
import type { Produto } from '@/lib/tipos';
import { ProductCard } from '../ProductCard/ProductCard';
import * as S from './style';

interface ProductGridProps {
  produtos: Produto[];
  className?: string;
  /** Página atual: só a primeira tem imagens prioritárias. */
  firstPage?: boolean;
}

export function ProductGrid({ produtos, className, firstPage = true }: ProductGridProps) {
  const { executar, pendenteParaProduto } = useAcaoAdicionar();
  const prefetch = usePrefetchProduto();

  return (
    <S.Root className={className}>
      {produtos.map((p, i) => (
        <S.Item key={p.id}>
          <ProductCard
            produto={p}
            priority={firstPage && i < 4}
            onAdd={(produto) => executar({ produtoId: produto.id, quantidade: 1 })}
            adding={pendenteParaProduto(p.id)}
            onPrefetch={prefetch}
          />
        </S.Item>
      ))}
    </S.Root>
  );
}
