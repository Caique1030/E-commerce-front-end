'use client';

import { ShoppingCart } from 'lucide-react';
import { useCarrinho } from '@/lib/hooks/use-carrinho';
import { pluralizar } from '@/lib/formatadores';
import { useSessao } from '@/providers/sessao-provider';
import { useUiStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';

/** Ícone do carrinho com contador. A equipe não compra, então nem vê o botão. */
export function BotaoCarrinho({ className }: { className?: string }) {
  const { ehEquipe } = useSessao();
  const { data } = useCarrinho();
  const abrir = useUiStore((s) => s.abrirDrawerCarrinho);
  const total = data?.totalItens ?? 0;

  if (ehEquipe) return null;

  return (
    <button
      type="button"
      onClick={() => abrir()}
      className={cn(
        'rounded-campo text-corpo hover:bg-papel-2 relative flex h-10 items-center gap-2 px-2.5',
        className,
      )}
      aria-label={`Abrir carrinho, ${pluralizar(total, 'item', 'itens')}`}
    >
      <ShoppingCart className="size-5" aria-hidden strokeWidth={1.75} />
      <span className="hidden sm:inline">Carrinho</span>
      {total > 0 && (
        <span
          className="preco bg-verde-nota text-micro text-branco absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 font-semibold sm:static sm:h-auto sm:min-w-0 sm:rounded-full sm:px-1.5 sm:py-0.5"
          aria-hidden
        >
          {total > 99 ? '99+' : total}
        </span>
      )}
    </button>
  );
}
