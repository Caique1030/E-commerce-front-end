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
        'rounded-campo hover:bg-tinta/10 relative flex size-10 items-center justify-center',
        className,
      )}
      aria-label={`Abrir carrinho, ${pluralizar(total, 'item', 'itens')}`}
    >
      <ShoppingCart className="size-6" aria-hidden strokeWidth={1.75} />
      {total > 0 && (
        <span
          className="preco bg-acao text-micro text-branco ring-amarelo absolute top-0.5 right-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 font-bold ring-2"
          aria-hidden
        >
          {total > 99 ? '99+' : total}
        </span>
      )}
    </button>
  );
}
