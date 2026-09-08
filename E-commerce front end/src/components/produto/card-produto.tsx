import { CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { Botao } from '@/components/ui/botao';
import { ImagemProduto } from '@/components/ui/imagem-produto';
import { Preco } from '@/components/ui/preco';
import { formatarDuracao } from '@/lib/formatadores';
import type { Produto } from '@/lib/tipos';
import { cn } from '@/lib/utils';

export interface CardProdutoProps {
  produto: Produto;
  /** As 4 primeiras imagens da grade carregam com prioridade. */
  prioridade?: boolean;
  aoAdicionar?: (produto: Produto) => void;
  adicionando?: boolean;
  aoPrefetch?: (id: string) => void;
  className?: string;
}

function textoEstoque(estoque: number): { texto: string; tom: 'normal' | 'alerta' | 'esgotado' } {
  if (estoque <= 0) return { texto: 'Esgotado', tom: 'esgotado' };
  if (estoque <= 5) return { texto: `Últimas ${estoque} unidades`, tom: 'alerta' };
  return { texto: `${estoque} em estoque`, tom: 'normal' };
}

/**
 * Card de produto. Muda conforme o tipo: um você compra (verde), o outro você agenda (violeta),
 * com faixa superior, rótulo e ícone — cor nunca sozinha. Sem sombra; hover só muda a borda.
 */
export function CardProduto({
  produto,
  prioridade = false,
  aoAdicionar,
  adicionando = false,
  aoPrefetch,
  className,
}: CardProdutoProps) {
  const booking = produto.tipo === 'BOOKING';
  const href = `/produto/${produto.id}`;
  const estoque = textoEstoque(produto.estoque);
  const esgotado = !booking && produto.estoque <= 0;

  return (
    <article
      className={cn(
        'group rounded-card border-borda bg-branco hover:border-tinta-3 flex flex-col overflow-hidden border transition-colors',
        booking && 'border-t-agenda hover:border-t-agenda border-t-[3px]',
        className,
      )}
      onMouseEnter={() => aoPrefetch?.(produto.id)}
      onFocus={() => aoPrefetch?.(produto.id)}
      aria-labelledby={`produto-${produto.id}`}
    >
      <Link href={href} tabIndex={-1} aria-hidden className="block">
        <ImagemProduto
          src={produto.imagemUrl}
          nome={produto.nome}
          tipo={produto.tipo}
          duracaoMin={produto.duracaoMin}
          capacidadeSlot={produto.capacidadeSlot}
          sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 45vw"
          prioridade={prioridade}
          className={cn('border-borda border-b', !booking && 'bg-branco')}
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-4">
        {booking ? (
          <p className="text-apoio text-agenda flex items-center gap-1.5 font-medium">
            <CalendarDays className="size-3.5" aria-hidden />
            Serviço agendado
          </p>
        ) : (
          <p className="text-apoio text-suave truncate">
            {produto.marca ?? produto.categoria.nome}
          </p>
        )}

        <h3 id={`produto-${produto.id}`} className="text-corpo leading-5 font-medium">
          <Link href={href} className="line-clamp-2 hover:underline">
            {produto.nome}
          </Link>
        </h3>

        {booking && produto.duracaoMin ? (
          <p className="text-apoio text-suave">
            {formatarDuracao(produto.duracaoMin)}
            {produto.capacidadeSlot ? ` · até ${produto.capacidadeSlot} por horário` : ''}
          </p>
        ) : null}

        <div className="mt-auto flex flex-col gap-1 pt-2">
          <Preco centavos={produto.precoCentavos} variante="card" />
          {!booking && (
            <p
              className={cn(
                'text-apoio',
                estoque.tom === 'normal' && 'text-suave',
                estoque.tom === 'alerta' && 'text-aviso',
                estoque.tom === 'esgotado' && 'text-alerta',
              )}
            >
              {estoque.texto}
            </p>
          )}
        </div>

        <div className="pt-3">
          {booking ? (
            <Botao asChild variante="agenda" className="w-full">
              <Link href={href} aria-label={`Escolher data para ${produto.nome}`}>
                Escolher data
              </Link>
            </Botao>
          ) : (
            <Botao
              className="w-full"
              onClick={() => aoAdicionar?.(produto)}
              disabled={esgotado || !aoAdicionar}
              carregando={adicionando}
              aria-label={
                esgotado ? `${produto.nome} esgotado` : `Adicionar ${produto.nome} ao carrinho`
              }
            >
              {esgotado ? 'Esgotado' : 'Adicionar'}
            </Botao>
          )}
        </div>
      </div>
    </article>
  );
}
