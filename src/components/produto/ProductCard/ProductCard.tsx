'use client';

import { CalendarDays, Truck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Price } from '@/components/ui/Price';
import { ProductImage } from '@/components/ui/ProductImage';
import { parcelamento, temFreteGratis } from '@/lib/comercial';
import { centavosParaBRL, formatarDuracao } from '@/lib/formatadores';
import type { Produto } from '@/lib/tipos';
import * as S from './style';

export interface ProductCardProps {
  produto: Produto;
  /** As 4 primeiras imagens da grade carregam com priority. */
  priority?: boolean;
  onAdd?: (produto: Produto) => void;
  adding?: boolean;
  onPrefetch?: (id: string) => void;
  className?: string;
}

function textoEstoque(estoque: number): { texto: string; tom: S.StockTone } {
  if (estoque <= 0) return { texto: 'Esgotado', tom: 'esgotado' };
  if (estoque <= 5) return { texto: `Últimas ${estoque} unidades`, tom: 'alerta' };
  return { texto: `${estoque} em estoque`, tom: 'normal' };
}

/**
 * Card de produto. Muda conforme o tipo: um você compra (azul), o outro você agenda (violeta),
 * com faixa superior, rótulo e ícone — cor nunca sozinha. O card branco só se separa do fundo
 * cinza pela sombra, que cresce no hover.
 */
export function ProductCard({
  produto,
  priority = false,
  onAdd,
  adding = false,
  onPrefetch,
  className,
}: ProductCardProps) {
  const booking = produto.tipo === 'BOOKING';
  const href = `/produto/${produto.id}`;
  const estoque = textoEstoque(produto.estoque);
  const esgotado = !booking && produto.estoque <= 0;
  const parcelas = parcelamento(produto.precoCentavos);
  const freteGratis = !booking && temFreteGratis(produto.precoCentavos);

  return (
    <S.Root
      $booking={booking}
      className={className}
      onMouseEnter={() => onPrefetch?.(produto.id)}
      onFocus={() => onPrefetch?.(produto.id)}
      aria-labelledby={`produto-${produto.id}`}
    >
      <S.ImageLink href={href} tabIndex={-1} aria-hidden>
        <ProductImage
          src={produto.imagemUrl}
          nome={produto.nome}
          tipo={produto.tipo}
          duracaoMin={produto.duracaoMin}
          capacidadeSlot={produto.capacidadeSlot}
          sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 45vw"
          priority={priority}
          className="aspect-square"
        />
      </S.ImageLink>

      <S.Body>
        <S.Label $booking={booking}>
          {booking ? (
            <>
              <CalendarDays size={14} aria-hidden />
              Serviço agendado
            </>
          ) : (
            (produto.marca ?? produto.categoria.nome)
          )}
        </S.Label>

        <S.Title id={`produto-${produto.id}`}>
          <S.TitleLink href={href}>{produto.nome}</S.TitleLink>
        </S.Title>

        <S.Pricing>
          <Price centavos={produto.precoCentavos} variant="card" />
          {parcelas && (
            <S.Installments>
              em{' '}
              <S.InstallmentsValue>
                {parcelas.vezes}x {centavosParaBRL(parcelas.valorCentavos)}
              </S.InstallmentsValue>{' '}
              sem juros
            </S.Installments>
          )}
          {freteGratis && (
            <S.FreeShipping>
              <Truck size={14} aria-hidden />
              Frete grátis
            </S.FreeShipping>
          )}
          {booking && produto.duracaoMin ? (
            <S.Duration>
              {formatarDuracao(produto.duracaoMin)}
              {produto.capacidadeSlot ? ` · até ${produto.capacidadeSlot} por horário` : ''}
            </S.Duration>
          ) : null}
          {!booking && <S.Stock $tone={estoque.tom}>{estoque.texto}</S.Stock>}
        </S.Pricing>

        <S.Footer>
          {booking ? (
            <Button
              as={Link}
              href={href}
              variant="schedule"
              className="w-full"
              aria-label={`Escolher data para ${produto.nome}`}
            >
              Escolher data
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={() => onAdd?.(produto)}
              disabled={esgotado || !onAdd}
              loading={adding}
              aria-label={
                esgotado ? `${produto.nome} esgotado` : `Adicionar ${produto.nome} ao carrinho`
              }
            >
              {esgotado ? 'Esgotado' : 'Adicionar'}
            </Button>
          )}
        </S.Footer>
      </S.Body>
    </S.Root>
  );
}
