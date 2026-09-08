'use client';

import { CalendarDays, ChevronRight, Minus, Plus, ShieldCheck, Truck } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import { Erro } from '@/components/estados/erro';
import { EsqueletoDetalheProduto } from '@/components/estados/skeletons';
import { Badge } from '@/components/ui/badge';
import { Botao } from '@/components/ui/botao';
import { Esqueleto } from '@/components/ui/esqueleto';
import { ImagemProduto } from '@/components/ui/imagem-produto';
import { Preco } from '@/components/ui/preco';
import { trilhaDaCategoria } from '@/lib/api/categorias';
import { slotsPorDia } from '@/lib/agenda';
import { FRETE_GRATIS_MINIMO_CENTAVOS, parcelamento, temFreteGratis } from '@/lib/comercial';
import { centavosParaBRL, formatarDuracao } from '@/lib/formatadores';
import { useAcaoAdicionar } from '@/lib/hooks/use-acao-adicionar';
import { useArvoreCategorias } from '@/lib/hooks/use-categorias';
import { useProduto } from '@/lib/hooks/use-produtos';
import type { Produto } from '@/lib/tipos';
import { cn } from '@/lib/utils';

/**
 * Só produtos BOOKING mostram a agenda, mas o import estático fazia toda página de produto
 * baixar o calendário e o date-fns (parse/format + locale pt-BR) junto. Carregado sob demanda,
 * quem vende produto físico não paga por isso.
 */
const SeletorAgendamento = dynamic(
  () => import('./seletor-agendamento').then((m) => m.SeletorAgendamento),
  { ssr: false, loading: () => <Esqueleto className="h-64 w-full" /> },
);

/** Ilha interativa da página do produto. Os dados já chegam hidratados do servidor. */
export function DetalheProduto({ id }: { id: string }) {
  const consulta = useProduto(id);

  if (consulta.isPending) return <EsqueletoDetalheProduto />;
  if (consulta.isError) {
    return (
      <Erro
        erro={consulta.error}
        titulo="Não foi possível carregar o produto."
        aoTentarDeNovo={() => void consulta.refetch()}
        tentandoDeNovo={consulta.isFetching}
      />
    );
  }
  return <Conteudo produto={consulta.data} />;
}

function Conteudo({ produto }: { produto: Produto }) {
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
    <article className="flex flex-col gap-4">
      <nav aria-label="Você está em" className="text-apoio text-suave">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:text-acao hover:underline">
              Loja
            </Link>
          </li>
          {trilha.map((c) => (
            <li key={c.id} className="flex items-center gap-1">
              <ChevronRight className="size-3.5" aria-hidden />
              <Link href={`/categoria/${c.slug}`} className="hover:text-acao hover:underline">
                {c.nome}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <div className="painel grid gap-8 p-4 sm:p-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10">
        {/* A foto não passa de 28rem: acima disso ela empurra a caixa de compra para fora da tela. */}
        <div
          className={cn(
            'rounded-card mx-auto w-full max-w-[28rem] self-start overflow-hidden',
            booking && 'border-t-agenda border-t-[3px]',
          )}
        >
          <ImagemProduto
            src={produto.imagemUrl}
            nome={produto.nome}
            tipo={produto.tipo}
            duracaoMin={produto.duracaoMin}
            capacidadeSlot={produto.capacidadeSlot}
            sizes="(min-width: 1024px) 28rem, 100vw"
            prioridade
            className={cn(!booking && 'aspect-square')}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            {booking ? (
              <Badge variante="agenda" icone={<CalendarDays className="size-3" aria-hidden />}>
                Serviço agendado
              </Badge>
            ) : (
              <p className="text-apoio text-suave">
                {produto.marca ?? produto.categoria.nome}
                <span className="text-borda-forte mx-1.5" aria-hidden>
                  ·
                </span>
                <span className="preco">SKU {produto.sku}</span>
              </p>
            )}
            <h1 className="text-h1 text-balance">{produto.nome}</h1>
          </div>

          <div className="flex flex-col gap-1">
            <Preco centavos={produto.precoCentavos} variante="principal" />
            {parcelas && (
              <p className="text-corpo text-tinta-2">
                em{' '}
                <span className="preco text-verde font-semibold">
                  {parcelas.vezes}x {centavosParaBRL(parcelas.valorCentavos)}
                </span>{' '}
                sem juros
              </p>
            )}
            {booking && produto.duracaoMin ? (
              <p className="text-apoio text-suave">
                {formatarDuracao(produto.duracaoMin)} por atendimento
                {produto.capacidadeSlot ? ` · até ${produto.capacidadeSlot} por horário` : ''}
                {` · ${slotsPorDia(produto.duracaoMin)} horários por dia`}
              </p>
            ) : (
              <p
                className={cn(
                  'text-apoio',
                  produto.estoque <= 0
                    ? 'text-alerta font-semibold'
                    : produto.estoque <= 5
                      ? 'text-aviso font-semibold'
                      : 'text-suave',
                )}
              >
                {produto.estoque <= 0
                  ? 'Esgotado'
                  : produto.estoque <= 5
                    ? `Últimas ${produto.estoque} unidades`
                    : `${produto.estoque} em estoque`}
              </p>
            )}
          </div>

          {!booking && (
            <p
              className={cn(
                'text-corpo flex items-center gap-2 font-semibold',
                freteGratis ? 'text-verde' : 'text-tinta-2',
              )}
            >
              <Truck className="size-4 shrink-0" aria-hidden />
              {freteGratis
                ? 'Frete grátis para todo o Brasil'
                : `Frete grátis em compras a partir de ${centavosParaBRL(FRETE_GRATIS_MINIMO_CENTAVOS)}`}
            </p>
          )}

          {booking ? (
            <SeletorAgendamento
              produto={produto}
              aoConfirmar={(agendadoPara, qtd) =>
                executar({ produtoId: produto.id, quantidade: qtd, agendadoPara })
              }
              confirmando={pendente}
              desabilitado={sessaoCarregando}
            />
          ) : (
            <div className="border-borda flex flex-col gap-3 border-t pt-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-apoio text-suave" id="rotulo-quantidade">
                  Quantidade
                </span>
                <div
                  className="rounded-campo border-borda-forte bg-branco flex h-12 items-center border"
                  role="group"
                  aria-labelledby="rotulo-quantidade"
                >
                  <button
                    type="button"
                    onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                    disabled={quantidade <= 1 || esgotado}
                    className="hover:text-acao disabled:text-suave/50 flex size-12 items-center justify-center"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus className="size-4" aria-hidden />
                  </button>
                  <span
                    className="preco text-corpo w-12 text-center font-semibold"
                    aria-live="polite"
                  >
                    {quantidade}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantidade((q) => Math.min(maxQuantidade, q + 1))}
                    disabled={quantidade >= maxQuantidade || esgotado}
                    className="hover:text-acao disabled:text-suave/50 flex size-12 items-center justify-center"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus className="size-4" aria-hidden />
                  </button>
                </div>
              </div>
              <Botao
                tamanho="lg"
                disabled={esgotado || sessaoCarregando}
                carregando={pendente}
                onClick={() => executar({ produtoId: produto.id, quantidade })}
              >
                {esgotado ? 'Esgotado' : pendente ? 'Adicionando…' : 'Adicionar ao carrinho'}
              </Botao>
              <p className="text-apoio text-suave flex items-center gap-2">
                <ShieldCheck className="size-4 shrink-0" aria-hidden />
                Você acompanha cada mudança de status em Meus pedidos.
              </p>
            </div>
          )}
        </div>
      </div>

      <section aria-labelledby="titulo-descricao" className="painel p-4 sm:p-6">
        <h2 id="titulo-descricao" className="text-h2">
          Descrição
        </h2>
        <p className="text-corpo text-tinta-2 mt-2 max-w-prose whitespace-pre-line">
          {produto.descricao}
        </p>
      </section>
    </article>
  );
}
