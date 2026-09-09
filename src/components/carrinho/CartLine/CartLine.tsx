'use client';

import { CalendarDays, Minus, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Price } from '@/components/ui/Price';
import { ProductImage } from '@/components/ui/ProductImage';
import { formatarAgendamentoCurto } from '@/lib/formatadores';
import type { ItemCarrinho } from '@/lib/tipos';
import * as S from './style';

const QUANTIDADE_MAX = 99;

export interface CartLineProps {
  item: ItemCarrinho;
  onQuantityChange: (itemId: string, quantidade: number) => void;
  onRemove: (itemId: string) => void;
  busy?: boolean;
  highlighted?: boolean;
  readOnly?: boolean;
  compact?: boolean;
  /** Fecha o drawer ao clicar no nome (navegar para o produto). */
  onNavigate?: () => void;
}

/**
 * Linha do carrinho (drawer e página). Presentacional: recebe callbacks, não conhece hooks.
 * Quantidade zero dispara remoção, como no back.
 */
export function CartLine({
  item,
  onQuantityChange,
  onRemove,
  busy = false,
  highlighted = false,
  readOnly = false,
  compact = false,
  onNavigate,
}: CartLineProps) {
  const [texto, setTexto] = useState(String(item.quantidade));
  const [quantidadeAnterior, setQuantidadeAnterior] = useState(item.quantidade);
  const rootRef = useRef<HTMLLIElement>(null);

  // A quantidade mudou por fora (otimismo, resposta do servidor): ajusta o campo durante o render.
  if (item.quantidade !== quantidadeAnterior) {
    setQuantidadeAnterior(item.quantidade);
    setTexto(String(item.quantidade));
  }

  useEffect(() => {
    if (highlighted) rootRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [highlighted]);

  const nome = item.produto.nome;
  const booking = item.produto.tipo === 'BOOKING';
  const indisponivel = !item.disponivel;

  function aplicar(q: number) {
    const limpo = Math.max(0, Math.min(QUANTIDADE_MAX, Math.floor(q)));
    if (Number.isNaN(limpo)) {
      setTexto(String(item.quantidade));
      return;
    }
    if (limpo !== item.quantidade) onQuantityChange(item.id, limpo);
    else setTexto(String(item.quantidade));
  }

  /**
   * Campo vazio não é zero: `Number('')` é 0, e 0 significa remover. Apagar o campo para
   * redigitar voltaria a quantidade para a atual, nunca apagaria o item.
   */
  function aplicarTexto() {
    if (texto.trim() === '') {
      setTexto(String(item.quantidade));
      return;
    }
    aplicar(Number(texto));
  }

  return (
    <S.Root
      ref={rootRef}
      $highlighted={highlighted}
      $unavailable={indisponivel}
      className={highlighted ? 'animate-destaque' : undefined}
      aria-busy={busy || undefined}
    >
      <S.ImageLink
        href={`/produto/${item.produto.id}`}
        onClick={onNavigate}
        $compact={compact}
        tabIndex={-1}
        aria-hidden
      >
        <ProductImage
          src={item.produto.imagemUrl}
          nome={nome}
          tipo={item.produto.tipo}
          sizes="112px"
          thumbnail
        />
      </S.ImageLink>

      <S.Body>
        <S.Header>
          <S.Info>
            <S.NameLink
              href={`/produto/${item.produto.id}`}
              onClick={onNavigate}
              $booking={booking}
            >
              {nome}
            </S.NameLink>
            {booking && item.agendadoPara && (
              <S.Schedule>
                <S.Icon>
                  <CalendarDays size={14} aria-hidden />
                </S.Icon>
                <span>{formatarAgendamentoCurto(item.agendadoPara)}</span>
              </S.Schedule>
            )}
            {indisponivel && (
              <Badge variant="danger" className="mt-1">
                Não está mais à venda
              </Badge>
            )}
            {item.precoAlterado && !indisponivel && (
              <S.PriceChanged>Preço atualizado desde que você adicionou.</S.PriceChanged>
            )}
          </S.Info>
          <Price
            centavos={item.subtotalCentavos}
            variant="line"
            className="shrink-0 text-right"
            previousCentavos={
              item.precoAlterado ? item.precoNoCarrinhoCentavos * item.quantidade : undefined
            }
          />
        </S.Header>

        <S.Controls>
          {readOnly ? (
            <S.ReadOnlyQuantity>
              {item.quantidade} × <Price centavos={item.precoUnitCentavos} variant="muted" />
            </S.ReadOnlyQuantity>
          ) : (
            <S.QuantityRow>
              <S.Stepper role="group" aria-label={`Quantidade de ${nome}`}>
                <S.StepButton
                  type="button"
                  $side="left"
                  onClick={() => aplicar(item.quantidade - 1)}
                  disabled={busy || indisponivel}
                  aria-label={
                    item.quantidade === 1
                      ? `Diminuir quantidade de ${nome} para zero`
                      : `Diminuir quantidade de ${nome}`
                  }
                >
                  {item.quantidade === 1 ? (
                    <Trash2 size={14} aria-hidden />
                  ) : (
                    <Minus size={14} aria-hidden />
                  )}
                </S.StepButton>
                <S.QuantityInput
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  onBlur={aplicarTexto}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      aplicarTexto();
                    }
                  }}
                  disabled={busy || indisponivel}
                  aria-label={`Quantidade de ${nome}`}
                />
                <S.StepButton
                  type="button"
                  $side="right"
                  onClick={() => aplicar(item.quantidade + 1)}
                  disabled={busy || indisponivel || item.quantidade >= QUANTIDADE_MAX}
                  aria-label={`Aumentar quantidade de ${nome}`}
                >
                  <Plus size={14} aria-hidden />
                </S.StepButton>
              </S.Stepper>
              {!compact && (
                <S.UnitPrice>
                  <Price centavos={item.precoUnitCentavos} variant="muted" /> cada
                </S.UnitPrice>
              )}
            </S.QuantityRow>
          )}

          {!readOnly && (
            <S.RemoveButton
              type="button"
              onClick={() => onRemove(item.id)}
              disabled={busy}
              aria-label={`Remover ${nome} do carrinho`}
            >
              Remover
            </S.RemoveButton>
          )}
        </S.Controls>
      </S.Body>
    </S.Root>
  );
}
