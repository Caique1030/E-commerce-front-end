'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import type { FiltrosCatalogo } from '@/lib/schemas/catalogo';
import type { TipoProduto } from '@/lib/tipos';
import * as S from './style';

interface FiltersProps {
  filtros: FiltrosCatalogo;
  onUpdate: (mudancas: Partial<FiltrosCatalogo>) => void;
  onClear: () => void;
  hasFilters: boolean;
  /** Fecha o modal no mobile depois de aplicar. */
  onApply?: () => void;
  className?: string;
}

const opcoesTipo: { valor: TipoProduto | ''; rotulo: string }[] = [
  { valor: '', rotulo: 'Tudo' },
  { valor: 'SIMPLE', rotulo: 'Produtos' },
  { valor: 'BOOKING', rotulo: 'Serviços agendados' },
];

/** Tipo e faixa de preço. O tipo aplica na hora; o preço aplica ao enviar (evita disparar a cada dígito). */
export function Filters({
  filtros,
  onUpdate,
  onClear,
  hasFilters,
  onApply,
  className,
}: FiltersProps) {
  const minDaUrl = filtros.precoMin?.toString() ?? '';
  const maxDaUrl = filtros.precoMax?.toString() ?? '';
  const [min, setMin] = useState(minDaUrl);
  const [max, setMax] = useState(maxDaUrl);
  const [anterior, setAnterior] = useState({ min: minDaUrl, max: maxDaUrl });

  // A URL mudou por fora (chip removido, limpar filtros): ajusta durante o render.
  if (anterior.min !== minDaUrl || anterior.max !== maxDaUrl) {
    setAnterior({ min: minDaUrl, max: maxDaUrl });
    setMin(minDaUrl);
    setMax(maxDaUrl);
  }

  function aplicarPreco(e: FormEvent) {
    e.preventDefault();
    const pMin = min.trim() ? Number(min.replace(',', '.')) : undefined;
    const pMax = max.trim() ? Number(max.replace(',', '.')) : undefined;
    onUpdate({
      precoMin: pMin !== undefined && !Number.isNaN(pMin) ? pMin : undefined,
      precoMax: pMax !== undefined && !Number.isNaN(pMax) ? pMax : undefined,
    });
    onApply?.();
  }

  return (
    <S.Root className={className}>
      <fieldset>
        <S.Legend>Tipo</S.Legend>
        <S.TypeList>
          {opcoesTipo.map((o) => {
            const ativo = (filtros.tipo ?? '') === o.valor;
            return (
              <S.TypeOption key={o.valor} $active={ativo}>
                <S.Radio
                  type="radio"
                  name="tipo"
                  value={o.valor}
                  checked={ativo}
                  onChange={() => {
                    onUpdate({ tipo: (o.valor || undefined) as TipoProduto | undefined });
                    onApply?.();
                  }}
                />
                {o.rotulo}
              </S.TypeOption>
            );
          })}
        </S.TypeList>
      </fieldset>

      <form onSubmit={aplicarPreco}>
        <fieldset>
          <S.Legend>Preço (R$)</S.Legend>
          <S.PriceRow>
            <S.SrLabel htmlFor="preco-min">Preço mínimo em reais</S.SrLabel>
            <S.PriceInput
              id="preco-min"
              inputMode="decimal"
              placeholder="mín."
              value={min}
              onChange={(e) => setMin(e.target.value)}
            />
            <S.Dash aria-hidden>–</S.Dash>
            <S.SrLabel htmlFor="preco-max">Preço máximo em reais</S.SrLabel>
            <S.PriceInput
              id="preco-max"
              inputMode="decimal"
              placeholder="máx."
              value={max}
              onChange={(e) => setMax(e.target.value)}
            />
          </S.PriceRow>
          <Button type="submit" variant="secondary" size="sm" className="mt-2 w-full">
            Aplicar preço
          </Button>
        </fieldset>
      </form>

      {hasFilters && (
        <Button
          variant="link"
          size="sm"
          className="self-start"
          onClick={() => {
            onClear();
            onApply?.();
          }}
        >
          Limpar filtros
        </Button>
      )}
    </S.Root>
  );
}
