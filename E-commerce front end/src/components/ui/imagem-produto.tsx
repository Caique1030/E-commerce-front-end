import { CalendarDays, Package } from 'lucide-react';
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
  /**
   * O que desenhar quando o produto não tem foto.
   *  - 'agenda' (padrão): serviços mostram a faixa de agenda, a assinatura do que é agendável.
   *  - 'neutro': só uma marca centrada no mesmo quadro branco da foto. O trilho usa este,
   *    porque lá as molduras precisam ser idênticas de ponta a ponta.
   */
  semFoto?: 'agenda' | 'neutro';
  /**
   * Como a foto ocupa o quadro.
   *  - 'conter' (padrão): a foto inteira aparece, com respiro em volta. É o certo para produto,
   *    que vem recortado no branco e não pode perder a borda.
   *  - 'preencher': a foto cobre o quadro de ponta a ponta. É o certo para serviço, que é foto
   *    de ambiente e some quando encolhe no meio de tanto branco.
   */
  enquadramento?: 'conter' | 'preencher';
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
  semFoto = 'agenda',
  enquadramento = 'conter',
}: ImagemProdutoProps) {
  const neutro = semFoto === 'neutro';
  const preencher = enquadramento === 'preencher';
  const Marca = tipo === 'BOOKING' ? CalendarDays : Package;

  return (
    <div className={cn('bg-branco relative aspect-[4/3] w-full overflow-hidden', className)}>
      {src ? (
        <Image
          src={src}
          alt={nome}
          fill
          sizes={sizes}
          priority={prioridade}
          className={cn(
            'transition-transform duration-200 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100',
            preencher ? 'object-cover' : 'object-contain p-3',
          )}
        />
      ) : !neutro && tipo === 'BOOKING' && duracaoMin ? (
        <FaixaAgenda
          duracaoMin={duracaoMin}
          capacidadeSlot={capacidadeSlot}
          variante={miniatura ? 'mini' : 'card'}
          comLegenda={!miniatura}
          className={miniatura ? 'bg-agenda-suave h-full w-full justify-center px-2' : undefined}
        />
      ) : (
        <div
          className={cn(
            'flex h-full w-full items-center justify-center',
            /* Quadro que preenche não pode ter um vizinho branco vazio: sem foto, o fundo vem junto. */
            neutro && !preencher ? 'text-borda-forte' : 'bg-papel-2 text-suave/60',
          )}
          aria-hidden
        >
          <Marca className={miniatura ? 'size-5' : 'size-10'} strokeWidth={1.25} />
        </div>
      )}
    </div>
  );
}
