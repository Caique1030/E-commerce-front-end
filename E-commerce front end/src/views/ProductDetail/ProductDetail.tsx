'use client';

import { CalendarDays, ChevronRight, Minus, Plus, ShieldCheck, Truck } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { ErrorState } from '@/components/estados/ErrorState';
import { ProductDetailSkeleton } from '@/components/estados/Skeletons';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Price } from '@/components/ui/Price';
import { ProductImage } from '@/components/ui/ProductImage';
import { Skeleton } from '@/components/ui/Skeleton';
import { slotsPorDia } from '@/lib/agenda';
import { trilhaDaCategoria } from '@/lib/api/categorias';
import { FRETE_GRATIS_MINIMO_CENTAVOS, parcelamento, temFreteGratis } from '@/lib/comercial';
import { centavosParaBRL, formatarDuracao } from '@/lib/formatadores';
import { useAcaoAdicionar } from '@/lib/hooks/use-acao-adicionar';
import { useArvoreCategorias } from '@/lib/hooks/use-categorias';
import { useProduto } from '@/lib/hooks/use-produtos';
import type { Produto } from '@/lib/tipos';
import * as S from './style';

/**
 * Só produtos BOOKING mostram a agenda, mas o import estático fazia toda página de produto
 * baixar o calendário e o date-fns (parse/format + locale pt-BR) junto. Carregado sob demanda,
 * quem vende produto físico não paga por isso.
 */
const BookingPicker = dynamic(
  () => import('@/components/produto/BookingPicker/BookingPicker').then((m) => m.BookingPicker),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> },
);

/** Ilha interativa da página do produto. Os dados já chegam hidratados do servidor. */
export function ProductDetail({ id }: { id: string }) {
  const consulta = useProduto(id);

  if (consulta.isPending) return <ProductDetailSkeleton />;
  if (consulta.isError) {
    return (
      <ErrorState
        error={consulta.error}
        title="Não foi possível carregar o produto."
        onRetry={() => void consulta.refetch()}
        retrying={consulta.isFetching}
      />
    );
  }
  return <Content produto={consulta.data} />;
}

function tomEstoque(estoque: number): S.StockTone {
  if (estoque <= 0) return 'esgotado';
  if (estoque <= 5) return 'alerta';
  return 'normal';
}

function Content({ produto }: { produto: Produto }) {
  const booking = produto.tipo === 'BOOKING';
  const { executar, pendenteParaProduto, sessaoCarregando } = useAcaoAdicionar();
  const [quantidade, setQuantidade] = useState(1);
  const arvore = useArvoreCategorias();
  const trilha = arvore.data ? trilhaDaCategoria(arvore.data, produto.categoria.caminho) : [];
  const esgotado = !booking && produto.estoque <= 0;
  const maxQuantidade = Math.max(1, Math.min(99, produto.estoque));
  const pendente = pendenteParaProduto(produto.id);
  const parcelas = parcelamento(produto.precoCentavos);
  const freteGratis = !booking && temFreteGratis(produto.precoCentavos);

  return (
    <S.Root>
      <S.Breadcrumb aria-label="Você está em">
        <S.BreadcrumbList>
          <li>
            <S.BreadcrumbLink href="/">Loja</S.BreadcrumbLink>
          </li>
          {trilha.map((c) => (
            <S.BreadcrumbItem key={c.id}>
              <ChevronRight size={14} aria-hidden />
              <S.BreadcrumbLink href={`/categoria/${c.slug}`}>{c.nome}</S.BreadcrumbLink>
            </S.BreadcrumbItem>
          ))}
        </S.BreadcrumbList>
      </S.Breadcrumb>

      <S.Main>
        <S.ImageFrame $booking={booking}>
          <ProductImage
            src={produto.imagemUrl}
            nome={produto.nome}
            tipo={produto.tipo}
            duracaoMin={produto.duracaoMin}
            capacidadeSlot={produto.capacidadeSlot}
            sizes="(min-width: 1024px) 28rem, 100vw"
            priority
            className={booking ? undefined : 'aspect-square'}
          />
        </S.ImageFrame>

        <S.Info>
          <S.Heading>
            {booking ? (
              <Badge variant="schedule" icon={<CalendarDays size={12} aria-hidden />}>
                Serviço agendado
              </Badge>
            ) : (
              <S.Meta>
                {produto.marca ?? produto.categoria.nome}
                <S.MetaDot aria-hidden>·</S.MetaDot>
                <S.Sku>SKU {produto.sku}</S.Sku>
              </S.Meta>
            )}
            <S.Title>{produto.nome}</S.Title>
          </S.Heading>

          <S.PriceBlock>
            <Price centavos={produto.precoCentavos} variant="main" />
            {parcelas && (
              <S.Installments>
                em{' '}
                <S.InstallmentsValue>
                  {parcelas.vezes}x {centavosParaBRL(parcelas.valorCentavos)}
                </S.InstallmentsValue>{' '}
                sem juros
              </S.Installments>
            )}
            {booking && produto.duracaoMin ? (
              <S.Duration>
                {formatarDuracao(produto.duracaoMin)} por atendimento
                {produto.capacidadeSlot ? ` · até ${produto.capacidadeSlot} por horário` : ''}
                {` · ${slotsPorDia(produto.duracaoMin)} horários por dia`}
              </S.Duration>
            ) : (
              <S.Stock $tone={tomEstoque(produto.estoque)}>
                {produto.estoque <= 0
                  ? 'Esgotado'
                  : produto.estoque <= 5
                    ? `Últimas ${produto.estoque} unidades`
                    : `${produto.estoque} em estoque`}
              </S.Stock>
            )}
          </S.PriceBlock>

          {!booking && (
            <S.Shipping $free={freteGratis}>
              <Truck size={16} aria-hidden />
              {freteGratis
                ? 'Frete grátis para todo o Brasil'
                : `Frete grátis em compras a partir de ${centavosParaBRL(FRETE_GRATIS_MINIMO_CENTAVOS)}`}
            </S.Shipping>
          )}

          {booking ? (
            <BookingPicker
              produto={produto}
              onConfirm={(agendadoPara, qtd) =>
                executar({ produtoId: produto.id, quantidade: qtd, agendadoPara })
              }
              confirming={pendente}
              disabled={sessaoCarregando}
            />
          ) : (
            <S.Purchase>
              <S.QuantityRow>
                <S.QuantityLabel id="rotulo-quantidade">Quantidade</S.QuantityLabel>
                <S.Stepper role="group" aria-labelledby="rotulo-quantidade">
                  <S.StepButton
                    type="button"
                    onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                    disabled={quantidade <= 1 || esgotado}
                    aria-label="Diminuir quantidade"
                  >
                    <Minus size={16} aria-hidden />
                  </S.StepButton>
                  <S.StepValue aria-live="polite">{quantidade}</S.StepValue>
                  <S.StepButton
                    type="button"
                    onClick={() => setQuantidade((q) => Math.min(maxQuantidade, q + 1))}
                    disabled={quantidade >= maxQuantidade || esgotado}
                    aria-label="Aumentar quantidade"
                  >
                    <Plus size={16} aria-hidden />
                  </S.StepButton>
                </S.Stepper>
              </S.QuantityRow>
              <Button
                size="lg"
                disabled={esgotado || sessaoCarregando}
                loading={pendente}
                onClick={() => executar({ produtoId: produto.id, quantidade })}
              >
                {esgotado ? 'Esgotado' : pendente ? 'Adicionando…' : 'Adicionar ao carrinho'}
              </Button>
              <S.Reassurance>
                <ShieldCheck size={16} aria-hidden />
                Você acompanha cada mudança de status em Meus pedidos.
              </S.Reassurance>
            </S.Purchase>
          )}
        </S.Info>
      </S.Main>

      <S.DescriptionPanel aria-labelledby="titulo-descricao">
        <S.DescriptionTitle id="titulo-descricao">Descrição</S.DescriptionTitle>
        <S.DescriptionText>{produto.descricao}</S.DescriptionText>
      </S.DescriptionPanel>
    </S.Root>
  );
}
