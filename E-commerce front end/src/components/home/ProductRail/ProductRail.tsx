'use client';

import { CalendarDays, ChevronLeft, ChevronRight, Truck } from 'lucide-react';
import { useRef } from 'react';
import { Price } from '@/components/ui/Price';
import { ProductImage } from '@/components/ui/ProductImage';
import { Skeleton } from '@/components/ui/Skeleton';
import { parcelamento, temFreteGratis } from '@/lib/comercial';
import { centavosParaBRL, formatarDuracao } from '@/lib/formatadores';
import { usePrefetchProduto, useProdutos } from '@/lib/hooks/use-produtos';
import type { FiltrosProduto, Produto } from '@/lib/tipos';
import * as S from './style';

/** Uma coluna do trilho vale 10rem no toque e 12rem no desktop — sempre a mesma, em qualquer tela. */
const SIZES_TRILHO = '(min-width: 1024px) 12rem, (min-width: 640px) 11.5rem, 10rem';

export interface ProductRailProps {
  title: string;
  description?: string;
  /** Mesmos filtros do prefetch no servidor: a chave da query precisa bater. */
  filtros: FiltrosProduto;
  /** Para onde vai o "Ver todos" — a mesma lista, agora com filtros e paginação. */
  seeAllHref: string;
  /** 'schedule' pinta o cabeçalho de violeta: é o trilho dos serviços com hora marcada. */
  tone?: S.RailTone;
  className?: string;
}

/**
 * Célula do trilho. A ordem de leitura é a mesma do card da grade — rótulo, nome, preço,
 * parcelamento, benefício — para que o mesmo produto não se apresente de dois jeitos na mesma
 * página. As duas faixas de apoio ficam reservadas mesmo quando o produto não tem o que dizer
 * nelas: é o espaço vazio que segura o alinhamento do trilho inteiro.
 */
function RailCard({
  produto,
  onPrefetch,
  fit,
}: {
  produto: Produto;
  onPrefetch: (id: string) => void;
  /** Vem do trilho, não do produto: o fit é igual para toda a faixa. */
  fit: 'contain' | 'cover';
}) {
  const booking = produto.tipo === 'BOOKING';
  const parcelas = parcelamento(produto.precoCentavos);
  const freteGratis = !booking && temFreteGratis(produto.precoCentavos);
  const rotulo = booking ? 'Serviço agendado' : (produto.marca ?? produto.categoria.nome);

  return (
    <S.Card
      href={`/produto/${produto.id}`}
      onMouseEnter={() => onPrefetch(produto.id)}
      onFocus={() => onPrefetch(produto.id)}
    >
      <ProductImage
        src={produto.imagemUrl}
        nome={produto.nome}
        tipo={produto.tipo}
        duracaoMin={produto.duracaoMin}
        capacidadeSlot={produto.capacidadeSlot}
        noPhoto="neutral"
        fit={fit}
        sizes={SIZES_TRILHO}
        className="aspect-square"
      />

      <S.Label $booking={booking}>{rotulo}</S.Label>

      <S.Name>{produto.nome}</S.Name>

      <S.PriceRow>
        <Price centavos={produto.precoCentavos} variant="card" className="flex-nowrap" />
      </S.PriceRow>

      <S.Installments>
        {parcelas && (
          <>
            em{' '}
            <S.InstallmentsValue>
              {parcelas.vezes}x {centavosParaBRL(parcelas.valorCentavos)}
            </S.InstallmentsValue>{' '}
            sem juros
          </>
        )}
      </S.Installments>

      <S.Benefit $booking={booking}>
        {booking && produto.duracaoMin ? (
          <>
            <CalendarDays size={14} aria-hidden />
            {formatarDuracao(produto.duracaoMin)}
          </>
        ) : freteGratis ? (
          <>
            <Truck size={14} aria-hidden />
            Frete grátis
          </>
        ) : null}
      </S.Benefit>
    </S.Card>
  );
}

/** Esqueleto com a forma exata da célula: quando os dados chegam, nada muda de lugar. */
function RailCardSkeleton() {
  return (
    <S.SkeletonCell>
      <Skeleton className="aspect-square w-full" />
      <S.SkeletonRow $row="label">
        <Skeleton />
      </S.SkeletonRow>
      <S.SkeletonRow $row="name">
        <Skeleton />
      </S.SkeletonRow>
      <S.SkeletonRow $row="price">
        <Skeleton />
      </S.SkeletonRow>
      <S.SkeletonRow $row="support">
        <Skeleton />
      </S.SkeletonRow>
    </S.SkeletonCell>
  );
}

/**
 * Faixa horizontal de produtos, no formato que o cliente já conhece de marketplace: um painel
 * branco, o título à esquerda, "Ver todos" à direita e os cards deslizando dentro.
 * As setas empurram o trilho por uma tela; no toque, o dedo faz o mesmo.
 */
export function ProductRail({
  title,
  description,
  filtros,
  seeAllHref,
  tone = 'neutral',
  className,
}: ProductRailProps) {
  const consulta = useProdutos(filtros);
  const prefetch = usePrefetchProduto();
  const trilhoRef = useRef<HTMLUListElement>(null);

  const rolar = (direcao: 1 | -1) => {
    const el = trilhoRef.current;
    if (!el) return;
    el.scrollBy({ left: direcao * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  const produtos = consulta.data?.data ?? [];
  const idTitulo = `trilho-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  if (!consulta.isPending && produtos.length === 0) return null;

  return (
    <S.Root aria-labelledby={idTitulo} className={className}>
      <S.Header $tone={tone}>
        <div>
          <S.Heading id={idTitulo}>
            {tone === 'schedule' && <CalendarDays size={20} aria-hidden />}
            {title}
          </S.Heading>
          {description && <S.Description $tone={tone}>{description}</S.Description>}
        </div>
        <S.SeeAll href={seeAllHref} $tone={tone}>
          Ver todos
        </S.SeeAll>
      </S.Header>

      {consulta.isPending ? (
        <S.SkeletonTrack aria-busy>
          {Array.from({ length: 8 }, (_, i) => (
            <RailCardSkeleton key={i} />
          ))}
        </S.SkeletonTrack>
      ) : (
        <S.Viewport>
          <S.Track ref={trilhoRef}>
            {produtos.map((p) => (
              <S.Cell key={p.id}>
                <RailCard
                  produto={p}
                  onPrefetch={prefetch}
                  fit={tone === 'schedule' ? 'cover' : 'contain'}
                />
              </S.Cell>
            ))}
          </S.Track>
          <S.Arrow
            type="button"
            $side="left"
            onClick={() => rolar(-1)}
            aria-label={`Voltar em ${title}`}
          >
            <ChevronLeft size={20} aria-hidden />
          </S.Arrow>
          <S.Arrow
            type="button"
            $side="right"
            onClick={() => rolar(1)}
            aria-label={`Avançar em ${title}`}
          >
            <ChevronRight size={20} aria-hidden />
          </S.Arrow>
        </S.Viewport>
      )}
    </S.Root>
  );
}
