'use client';

import { CalendarDays, ChevronLeft, ChevronRight, Truck } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import { Esqueleto } from '@/components/ui/esqueleto';
import { ImagemProduto } from '@/components/ui/imagem-produto';
import { Preco } from '@/components/ui/preco';
import { parcelamento, temFreteGratis } from '@/lib/comercial';
import { centavosParaBRL, formatarDuracao } from '@/lib/formatadores';
import { usePrefetchProduto, useProdutos } from '@/lib/hooks/use-produtos';
import type { FiltrosProduto, Produto } from '@/lib/tipos';
import { cn } from '@/lib/utils';

/*
 * As faixas da célula do trilho. Toda célula tem todas elas, com conteúdo ou sem: é isso que
 * mantém foto, nome, preço e benefício na mesma altura do primeiro ao último card. Cada altura
 * é o line-height do seu papel na escala tipográfica, então nada aperta nem sobra.
 */
const FAIXA_ROTULO = 'min-h-[0.875rem]'; /* text-micro, 1 linha */
const FAIXA_NOME = 'min-h-[2.25rem]'; /* text-apoio, 2 linhas */
const FAIXA_PRECO = 'min-h-[1.875rem]'; /* text-preco-md, 1 linha */
const FAIXA_APOIO = 'min-h-[1.125rem]'; /* text-apoio, 1 linha */

/** Uma coluna do trilho vale 10rem no toque e 12rem no desktop — sempre a mesma, em qualquer tela. */
const SIZES_TRILHO = '(min-width: 1024px) 12rem, (min-width: 640px) 11.5rem, 10rem';

interface TrilhoProps {
  titulo: string;
  descricao?: string;
  /** Mesmos filtros do prefetch no servidor: a chave da query precisa bater. */
  filtros: FiltrosProduto;
  /** Para onde vai o "Ver todos" — a mesma lista, agora com filtros e paginação. */
  verTodosHref: string;
  /** 'agenda' pinta o cabeçalho de violeta: é o trilho dos serviços com hora marcada. */
  tom?: 'neutro' | 'agenda';
  className?: string;
}

/**
 * Célula do trilho. A ordem de leitura é a mesma do card da grade — rótulo, nome, preço,
 * parcelamento, benefício — para que o mesmo produto não se apresente de dois jeitos na mesma
 * página. As duas faixas de apoio ficam reservadas mesmo quando o produto não tem o que dizer
 * nelas: é o espaço vazio que segura o alinhamento do trilho inteiro.
 */
function CardTrilho({
  produto,
  aoPrefetch,
  enquadramento,
}: {
  produto: Produto;
  aoPrefetch: (id: string) => void;
  /** Vem do trilho, não do produto: o enquadramento é igual para toda a faixa. */
  enquadramento: 'conter' | 'preencher';
}) {
  const booking = produto.tipo === 'BOOKING';
  const parcelas = parcelamento(produto.precoCentavos);
  const freteGratis = !booking && temFreteGratis(produto.precoCentavos);
  const rotulo = booking ? 'Serviço agendado' : (produto.marca ?? produto.categoria.nome);

  return (
    <Link
      href={`/produto/${produto.id}`}
      onMouseEnter={() => aoPrefetch(produto.id)}
      onFocus={() => aoPrefetch(produto.id)}
      className="group hover:bg-papel-2/60 flex h-full w-full flex-col p-3"
    >
      <ImagemProduto
        src={produto.imagemUrl}
        nome={produto.nome}
        tipo={produto.tipo}
        duracaoMin={produto.duracaoMin}
        capacidadeSlot={produto.capacidadeSlot}
        semFoto="neutro"
        enquadramento={enquadramento}
        sizes={SIZES_TRILHO}
        className="aspect-square"
      />

      <p
        className={cn(
          'text-micro mt-2 truncate tracking-wide uppercase',
          FAIXA_ROTULO,
          booking ? 'text-agenda font-bold' : 'text-suave',
        )}
      >
        {rotulo}
      </p>

      <p className={cn('text-apoio text-tinta-2 line-clamp-2 group-hover:underline', FAIXA_NOME)}>
        {produto.nome}
      </p>

      <div className={cn('mt-2 flex items-end', FAIXA_PRECO)}>
        <Preco centavos={produto.precoCentavos} variante="card" className="flex-nowrap" />
      </div>

      <p className={cn('text-apoio text-tinta-3', FAIXA_APOIO)}>
        {parcelas && (
          <>
            em{' '}
            <span className="preco text-verde font-semibold">
              {parcelas.vezes}x {centavosParaBRL(parcelas.valorCentavos)}
            </span>{' '}
            sem juros
          </>
        )}
      </p>

      <p
        className={cn(
          'text-apoio flex items-center gap-1 font-bold',
          FAIXA_APOIO,
          booking ? 'text-agenda' : 'text-verde',
        )}
      >
        {booking && produto.duracaoMin ? (
          <>
            <CalendarDays className="size-3.5 shrink-0" aria-hidden />
            {formatarDuracao(produto.duracaoMin)}
          </>
        ) : freteGratis ? (
          <>
            <Truck className="size-3.5 shrink-0" aria-hidden />
            Frete grátis
          </>
        ) : null}
      </p>
    </Link>
  );
}

/** Esqueleto com a forma exata da célula: quando os dados chegam, nada muda de lugar. */
function CelulaEsqueleto() {
  return (
    <div className="flex flex-col p-3">
      <Esqueleto className="aspect-square w-full" />
      <Esqueleto className={cn('mt-2 w-16', FAIXA_ROTULO)} />
      <Esqueleto className={cn('mt-1 w-full', FAIXA_NOME)} />
      <Esqueleto className={cn('mt-2 w-24', FAIXA_PRECO)} />
      <Esqueleto className={cn('mt-1 w-20', FAIXA_APOIO)} />
    </div>
  );
}

/**
 * Faixa horizontal de produtos, no formato que o cliente já conhece de marketplace: um painel
 * branco, o título à esquerda, "Ver todos" à direita e os cards deslizando dentro.
 * As setas empurram o trilho por uma tela; no toque, o dedo faz o mesmo.
 */
export function TrilhoProdutos({
  titulo,
  descricao,
  filtros,
  verTodosHref,
  tom = 'neutro',
  className,
}: TrilhoProps) {
  const consulta = useProdutos(filtros);
  const prefetch = usePrefetchProduto();
  const trilho = useRef<HTMLUListElement>(null);

  const rolar = (direcao: 1 | -1) => {
    const el = trilho.current;
    if (!el) return;
    el.scrollBy({ left: direcao * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  const produtos = consulta.data?.data ?? [];
  const idTitulo = `trilho-${titulo.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  if (!consulta.isPending && produtos.length === 0) return null;

  return (
    <section aria-labelledby={idTitulo} className={cn('painel overflow-hidden', className)}>
      <div
        className={cn(
          'flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-4',
          tom === 'agenda' ? 'bg-agenda text-branco rounded-t-[inherit]' : 'border-borda border-b',
        )}
      >
        <div>
          <h2 id={idTitulo} className="text-h2 flex items-center gap-2">
            {tom === 'agenda' && <CalendarDays className="size-5" aria-hidden />}
            {titulo}
          </h2>
          {descricao && (
            <p
              className={cn(
                'text-apoio mt-0.5',
                tom === 'agenda' ? 'text-branco/85' : 'text-suave',
              )}
            >
              {descricao}
            </p>
          )}
        </div>
        <Link
          href={verTodosHref}
          className={cn(
            'text-apoio font-semibold hover:underline',
            tom === 'agenda' ? 'text-branco' : 'text-acao',
          )}
        >
          Ver todos
        </Link>
      </div>

      {consulta.isPending ? (
        <div className="trilho" aria-busy>
          {Array.from({ length: 8 }, (_, i) => (
            <CelulaEsqueleto key={i} />
          ))}
        </div>
      ) : (
        <div className="relative">
          <ul ref={trilho} className="trilho">
            {produtos.map((p) => (
              <li key={p.id} className="flex">
                <CardTrilho
                  produto={p}
                  aoPrefetch={prefetch}
                  enquadramento={tom === 'agenda' ? 'preencher' : 'conter'}
                />
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => rolar(-1)}
            className="bg-branco text-tinta shadow-card-alto hover:bg-papel-2 absolute top-1/2 left-2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full lg:flex"
            aria-label={`Voltar em ${titulo}`}
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => rolar(1)}
            className="bg-branco text-tinta shadow-card-alto hover:bg-papel-2 absolute top-1/2 right-2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full lg:flex"
            aria-label={`Avançar em ${titulo}`}
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
      )}
    </section>
  );
}
