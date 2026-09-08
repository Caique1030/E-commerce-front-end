import { Package } from 'lucide-react';
import Image from 'next/image';
import type { TipoProduto } from '@/lib/tipos';
import { cn } from '@/lib/utils';
import { FaixaAgenda } from './faixa-agenda';

interface ImagemProdutoProps {
  src: string | null;
  /** Nome do produto (a imagem é informativa: o alt é o nome). */
  nome: string;
  tipo: TipoProduto;
  duracaoMin?: number | null;
  capacidadeSlot?: number | null;
  /** `sizes` do next/image para o contexto (grade, detalhe, miniatura). */
  sizes: string;
  prioridade?: boolean;
  className?: string;
  /** Miniatura: só a foto ou o ícone, sem legenda na faixa. */
  miniatura?: boolean;
}

/**
 * Imagem 4:3 do produto. Serviços agendados sem foto mostram a faixa de agenda; produtos
 * físicos sem foto mostram um ícone neutro. Nunca um retângulo cinza sem significado.
 */
export function ImagemProduto({
  src,
  nome,
  tipo,
  duracaoMin,
  capacidadeSlot,
  sizes,
  prioridade = false,
  className,
  miniatura = false,
}: ImagemProdutoProps) {
  return (
    <div className={cn('bg-papel-2 relative aspect-[4/3] w-full overflow-hidden', className)}>
      {src ? (
        <Image
          src={src}
          alt={nome}
          fill
          sizes={sizes}
          priority={prioridade}
          className="object-contain p-2"
        />
      ) : tipo === 'BOOKING' && duracaoMin ? (
        <FaixaAgenda
          duracaoMin={duracaoMin}
          capacidadeSlot={capacidadeSlot}
          variante={miniatura ? 'mini' : 'card'}
          comLegenda={!miniatura}
          className={miniatura ? 'bg-agenda-suave h-full w-full justify-center px-2' : undefined}
        />
      ) : (
        <div className="text-suave/60 flex h-full w-full items-center justify-center" aria-hidden>
          <Package className={miniatura ? 'size-5' : 'size-10'} strokeWidth={1.25} />
        </div>
      )}
    </div>
  );
}
