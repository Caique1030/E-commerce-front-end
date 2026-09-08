'use client';

import { useAcaoAdicionar } from '@/lib/hooks/use-acao-adicionar';
import { usePrefetchProduto } from '@/lib/hooks/use-produtos';
import type { Produto } from '@/lib/tipos';
import { cn } from '@/lib/utils';
import { CardProduto } from './card-produto';

interface GradeProdutosProps {
  produtos: Produto[];
  className?: string;
  /** Página atual: só a primeira tem imagens prioritárias. */
  primeiraPagina?: boolean;
}

export function GradeProdutos({ produtos, className, primeiraPagina = true }: GradeProdutosProps) {
  const { executar, pendenteParaProduto } = useAcaoAdicionar();
  const prefetch = usePrefetchProduto();

  return (
    <ul className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4', className)}>
      {produtos.map((p, i) => (
        <li key={p.id} className="flex">
          <CardProduto
            produto={p}
            prioridade={primeiraPagina && i < 4}
            aoAdicionar={(produto) => executar({ produtoId: produto.id, quantidade: 1 })}
            adicionando={pendenteParaProduto(p.id)}
            aoPrefetch={prefetch}
            className="w-full"
          />
        </li>
      ))}
    </ul>
  );
}
