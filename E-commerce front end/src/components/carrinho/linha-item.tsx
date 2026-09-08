'use client';

import { CalendarDays, Minus, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { FaixaAgenda } from '@/components/ui/faixa-agenda';
import { ImagemProduto } from '@/components/ui/imagem-produto';
import { Preco } from '@/components/ui/preco';
import { formatarAgendamentoCurto } from '@/lib/formatadores';
import type { ItemCarrinho } from '@/lib/tipos';
import { cn } from '@/lib/utils';

const QUANTIDADE_MAX = 99;

export interface LinhaItemProps {
  item: ItemCarrinho;
  /** Duração do serviço para a faixa em miniatura (o item do carrinho não traz). */
  duracaoMin?: number | null;
  aoAlterarQuantidade: (itemId: string, quantidade: number) => void;
  aoRemover: (itemId: string) => void;
  ocupado?: boolean;
  destacado?: boolean;
  somenteLeitura?: boolean;
  compacto?: boolean;
  /** Fecha o drawer ao clicar no nome (navegar para o produto). */
  aoNavegar?: () => void;
}

/**
 * Linha do carrinho (drawer e página). Presentacional: recebe callbacks, não conhece hooks.
 * Quantidade zero dispara remoção, como no back.
 */
export function LinhaItem({
  item,
  duracaoMin,
  aoAlterarQuantidade,
  aoRemover,
  ocupado = false,
  destacado = false,
  somenteLeitura = false,
  compacto = false,
  aoNavegar,
}: LinhaItemProps) {
  const [texto, setTexto] = useState(String(item.quantidade));
  const [quantidadeAnterior, setQuantidadeAnterior] = useState(item.quantidade);
  const ref = useRef<HTMLLIElement>(null);

  // A quantidade mudou por fora (otimismo, resposta do servidor): ajusta o campo durante o render.
  if (item.quantidade !== quantidadeAnterior) {
    setQuantidadeAnterior(item.quantidade);
    setTexto(String(item.quantidade));
  }

  useEffect(() => {
    if (destacado) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [destacado]);

  const nome = item.produto.nome;
  const booking = item.produto.tipo === 'BOOKING';
  const indisponivel = !item.disponivel;

  function aplicar(q: number) {
    const limpo = Math.max(0, Math.min(QUANTIDADE_MAX, Math.floor(q)));
    if (Number.isNaN(limpo)) {
      setTexto(String(item.quantidade));
      return;
    }
    if (limpo !== item.quantidade) aoAlterarQuantidade(item.id, limpo);
    else setTexto(String(item.quantidade));
  }

  return (
    <li
      ref={ref}
      className={cn(
        'flex gap-3 py-4',
        destacado && 'animate-destaque rounded-card -mx-2 px-2',
        indisponivel && 'opacity-90',
      )}
      aria-busy={ocupado || undefined}
    >
      <Link
        href={`/produto/${item.produto.id}`}
        onClick={aoNavegar}
        className={cn(
          'rounded-campo border-borda shrink-0 overflow-hidden border',
          compacto ? 'w-20' : 'w-24 sm:w-28',
        )}
        tabIndex={-1}
        aria-hidden
      >
        <ImagemProduto
          src={item.produto.imagemUrl}
          nome={nome}
          tipo={item.produto.tipo}
          duracaoMin={duracaoMin}
          sizes="112px"
          miniatura
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/produto/${item.produto.id}`}
              onClick={aoNavegar}
              className={cn(
                'text-corpo line-clamp-2 font-medium hover:underline',
                booking && 'text-tinta',
              )}
            >
              {nome}
            </Link>
            {booking && item.agendadoPara && (
              <p className="text-apoio text-agenda mt-0.5 flex items-center gap-1.5">
                <CalendarDays className="size-3.5 shrink-0" aria-hidden />
                <span>{formatarAgendamentoCurto(item.agendadoPara)}</span>
                {duracaoMin ? (
                  <FaixaAgenda
                    duracaoMin={duracaoMin}
                    horarioEscolhido={item.agendadoPara}
                    variante="mini"
                    className="ml-1 hidden sm:flex"
                  />
                ) : null}
              </p>
            )}
            {indisponivel && (
              <Badge variante="alerta" className="mt-1">
                Não está mais à venda
              </Badge>
            )}
            {item.precoAlterado && !indisponivel && (
              <p className="text-apoio text-aviso mt-0.5">
                Preço atualizado desde que você adicionou.
              </p>
            )}
          </div>
          <Preco
            centavos={item.subtotalCentavos}
            variante="linha"
            className="shrink-0 text-right"
            anteriorCentavos={
              item.precoAlterado ? item.precoNoCarrinhoCentavos * item.quantidade : undefined
            }
          />
        </div>

        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          {somenteLeitura ? (
            <p className="text-apoio text-suave">
              {item.quantidade} × <Preco centavos={item.precoUnitCentavos} variante="apoio" />
            </p>
          ) : (
            <div className="flex items-center gap-1">
              <div
                className="rounded-campo border-borda-forte bg-branco flex h-8 items-center border"
                role="group"
                aria-label={`Quantidade de ${nome}`}
              >
                <button
                  type="button"
                  onClick={() => aplicar(item.quantidade - 1)}
                  disabled={ocupado || indisponivel}
                  className="rounded-l-campo text-tinta hover:bg-papel-2 disabled:text-suave flex size-8 items-center justify-center"
                  aria-label={
                    item.quantidade === 1
                      ? `Diminuir quantidade de ${nome} para zero`
                      : `Diminuir quantidade de ${nome}`
                  }
                >
                  {item.quantidade === 1 ? (
                    <Trash2 className="size-3.5" aria-hidden />
                  ) : (
                    <Minus className="size-3.5" aria-hidden />
                  )}
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  onBlur={() => aplicar(Number(texto))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      aplicar(Number(texto));
                    }
                  }}
                  disabled={ocupado || indisponivel}
                  className="preco border-borda-forte text-apoio disabled:text-suave h-full w-10 border-x bg-transparent text-center font-medium focus:outline-none"
                  aria-label={`Quantidade de ${nome}`}
                />
                <button
                  type="button"
                  onClick={() => aplicar(item.quantidade + 1)}
                  disabled={ocupado || indisponivel || item.quantidade >= QUANTIDADE_MAX}
                  className="rounded-r-campo text-tinta hover:bg-papel-2 disabled:text-suave flex size-8 items-center justify-center"
                  aria-label={`Aumentar quantidade de ${nome}`}
                >
                  <Plus className="size-3.5" aria-hidden />
                </button>
              </div>
              {!compacto && (
                <span className="text-apoio text-suave ml-1 hidden sm:inline">
                  <Preco centavos={item.precoUnitCentavos} variante="apoio" /> cada
                </span>
              )}
            </div>
          )}

          {!somenteLeitura && (
            <button
              type="button"
              onClick={() => aoRemover(item.id)}
              disabled={ocupado}
              className="text-apoio text-suave hover:text-alerta disabled:text-suave underline-offset-4 hover:underline"
              aria-label={`Remover ${nome} do carrinho`}
            >
              Remover
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
