'use client';

import { useState, type FormEvent } from 'react';
import { Botao } from '@/components/ui/botao';
import type { FiltrosCatalogo } from '@/lib/schemas/catalogo';
import type { TipoProduto } from '@/lib/tipos';
import { cn } from '@/lib/utils';

interface FiltrosProps {
  filtros: FiltrosCatalogo;
  aoAtualizar: (mudancas: Partial<FiltrosCatalogo>) => void;
  aoLimpar: () => void;
  temFiltros: boolean;
  /** Fecha o modal no mobile depois de aplicar. */
  aoAplicar?: () => void;
  className?: string;
}

const opcoesTipo: { valor: TipoProduto | ''; rotulo: string }[] = [
  { valor: '', rotulo: 'Tudo' },
  { valor: 'SIMPLE', rotulo: 'Produtos' },
  { valor: 'BOOKING', rotulo: 'Serviços agendados' },
];

/** Tipo e faixa de preço. O tipo aplica na hora; o preço aplica ao enviar (evita disparar a cada dígito). */
export function Filtros({
  filtros,
  aoAtualizar,
  aoLimpar,
  temFiltros,
  aoAplicar,
  className,
}: FiltrosProps) {
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
    aoAtualizar({
      precoMin: pMin !== undefined && !Number.isNaN(pMin) ? pMin : undefined,
      precoMax: pMax !== undefined && !Number.isNaN(pMax) ? pMax : undefined,
    });
    aoAplicar?.();
  }

  const campo =
    'preco h-9 w-full rounded-campo border border-borda-forte bg-branco px-2.5 text-apoio hover:border-tinta-3 focus:border-acao focus:outline-none';

  return (
    <div className={cn('flex flex-col gap-5', className)}>
      <fieldset>
        <legend className="text-apoio text-suave mb-2 font-medium tracking-wide uppercase">
          Tipo
        </legend>
        <div className="flex flex-col gap-1">
          {opcoesTipo.map((o) => {
            const ativo = (filtros.tipo ?? '') === o.valor;
            return (
              <label
                key={o.valor}
                className={cn(
                  'rounded-campo text-corpo hover:bg-papel-2 flex min-h-9 cursor-pointer items-center gap-2.5 px-2',
                  ativo && 'bg-acao-suave text-acao font-medium',
                )}
              >
                <input
                  type="radio"
                  name="tipo"
                  value={o.valor}
                  checked={ativo}
                  onChange={() => {
                    aoAtualizar({ tipo: (o.valor || undefined) as TipoProduto | undefined });
                    aoAplicar?.();
                  }}
                  className="accent-acao"
                />
                {o.rotulo}
              </label>
            );
          })}
        </div>
      </fieldset>

      <form onSubmit={aplicarPreco}>
        <fieldset>
          <legend className="text-apoio text-suave mb-2 font-medium tracking-wide uppercase">
            Preço (R$)
          </legend>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="preco-min">
              Preço mínimo em reais
            </label>
            <input
              id="preco-min"
              inputMode="decimal"
              placeholder="mín."
              value={min}
              onChange={(e) => setMin(e.target.value)}
              className={campo}
            />
            <span className="text-suave" aria-hidden>
              –
            </span>
            <label className="sr-only" htmlFor="preco-max">
              Preço máximo em reais
            </label>
            <input
              id="preco-max"
              inputMode="decimal"
              placeholder="máx."
              value={max}
              onChange={(e) => setMax(e.target.value)}
              className={campo}
            />
          </div>
          <Botao type="submit" variante="secundario" tamanho="sm" className="mt-2 w-full">
            Aplicar preço
          </Botao>
        </fieldset>
      </form>

      {temFiltros && (
        <Botao
          variante="link"
          tamanho="sm"
          className="self-start"
          onClick={() => {
            aoLimpar();
            aoAplicar?.();
          }}
        >
          Limpar filtros
        </Botao>
      )}
    </div>
  );
}
