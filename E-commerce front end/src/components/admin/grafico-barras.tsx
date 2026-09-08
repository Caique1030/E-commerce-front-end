'use client';

import { useId, useState } from 'react';
import { centavosParaBRL, formatarData, pluralizar } from '@/lib/formatadores';
import { cn } from '@/lib/utils';

export interface PontoSerie {
  /** YYYY-MM-DD */
  data: string;
  faturamentoCentavos: number;
  pedidos: number;
}

interface GraficoBarrasProps {
  pontos: PontoSerie[];
  className?: string;
}

/** Escala do eixo Y em valores redondos: no máximo 4 faixas (5 linhas, contando o zero). */
export function escala(maximo: number): number[] {
  if (maximo <= 0) return [0];
  const bruto = maximo / 4;
  const potencia = 10 ** Math.floor(Math.log10(bruto));
  const passo = [1, 2, 2.5, 5, 10].map((m) => m * potencia).find((p) => p >= bruto) ?? potencia;
  // Arredonda o topo para cima até o próximo passo. Somar um passo fixo criaria uma faixa
  // vazia sempre que o máximo já fosse múltiplo exato do passo.
  const faixas = Math.ceil(maximo / passo);
  return Array.from({ length: faixas + 1 }, (_, i) => i * passo);
}

function compacto(centavos: number): string {
  const reais = centavos / 100;
  if (reais >= 1_000_000) return `R$ ${(reais / 1_000_000).toFixed(1).replace('.', ',')} mi`;
  if (reais >= 1_000)
    return `R$ ${(reais / 1_000).toFixed(reais >= 10_000 ? 0 : 1).replace('.', ',')} mil`;
  return centavosParaBRL(centavos);
}

/**
 * Faturamento por dia: uma série, um matiz (verde), marcas finas com topo arredondado.
 * Cada barra é um botão: recebe foco, tem rótulo acessível e mostra o valor ao passar o mouse.
 * A visão em tabela garante que nenhum número dependa do hover.
 */
export function GraficoBarras({ pontos, className }: GraficoBarrasProps) {
  const [modo, setModo] = useState<'grafico' | 'tabela'>('grafico');
  const [ativo, setAtivo] = useState<number | null>(null);
  const idTitulo = useId();

  const maximo = Math.max(0, ...pontos.map((p) => p.faturamentoCentavos));
  const linhas = escala(maximo);
  const topo = linhas[linhas.length - 1] || 1;
  const passoRotulo = Math.max(1, Math.ceil(pontos.length / 6));

  return (
    <section
      aria-labelledby={idTitulo}
      className={cn('rounded-card border-borda bg-branco shadow-card border p-5', className)}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id={idTitulo} className="text-h2">
            Faturamento por dia
          </h2>
          <p className="text-apoio text-suave">Pedidos não cancelados, no horário de Brasília.</p>
        </div>
        <div
          className="rounded-campo border-borda-forte text-apoio flex border p-0.5"
          role="group"
          aria-label="Modo de exibição"
        >
          {(['grafico', 'tabela'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setModo(m)}
              aria-pressed={modo === m}
              className={cn(
                'rounded-[4px] px-2.5 py-1 font-medium',
                modo === m ? 'bg-tinta text-branco' : 'text-suave hover:text-tinta',
              )}
            >
              {m === 'grafico' ? 'Gráfico' : 'Tabela'}
            </button>
          ))}
        </div>
      </div>

      {pontos.length === 0 ? (
        <p className="text-corpo text-suave py-10 text-center">Nenhuma venda no período.</p>
      ) : modo === 'tabela' ? (
        <div className="overflow-x-auto">
          <table className="text-apoio w-full">
            <thead>
              <tr className="border-borda text-suave border-b text-left">
                <th scope="col" className="py-2 font-medium">
                  Dia
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  Pedidos
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  Faturamento
                </th>
              </tr>
            </thead>
            <tbody>
              {pontos.map((p) => (
                <tr key={p.data} className="border-borda border-b last:border-b-0">
                  <td className="preco py-1.5">{formatarData(`${p.data}T12:00:00Z`)}</td>
                  <td className="preco py-1.5 text-right">{p.pedidos}</td>
                  <td className="preco py-1.5 text-right">
                    {centavosParaBRL(p.faturamentoCentavos)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative">
          {/* eixo Y: linhas recessivas com rótulo à esquerda */}
          <div className="relative h-56 pl-14">
            {linhas.map((v) => {
              const pct = (v / topo) * 100;
              return (
                <div
                  key={v}
                  className="border-borda absolute right-0 left-14 border-t"
                  style={{ bottom: `${pct}%` }}
                  aria-hidden
                >
                  <span className="preco text-micro text-suave absolute -top-2.5 -left-14 w-12 text-right">
                    {compacto(v)}
                  </span>
                </div>
              );
            })}

            <ol
              className="relative flex h-full items-end gap-[2px]"
              aria-label="Barras de faturamento por dia"
            >
              {pontos.map((p, i) => {
                const altura = (p.faturamentoCentavos / topo) * 100;
                const rotulo = `${formatarData(`${p.data}T12:00:00Z`)}: ${centavosParaBRL(p.faturamentoCentavos)}, ${pluralizar(p.pedidos, 'pedido', 'pedidos')}`;
                return (
                  <li
                    key={p.data}
                    className="relative flex h-full min-w-0 flex-1 items-end justify-center"
                  >
                    <button
                      type="button"
                      aria-label={rotulo}
                      onPointerEnter={() => setAtivo(i)}
                      onPointerLeave={() => setAtivo((a) => (a === i ? null : a))}
                      onFocus={() => setAtivo(i)}
                      onBlur={() => setAtivo((a) => (a === i ? null : a))}
                      className="group focus-visible:bg-verde-suave/60 flex h-full w-full items-end justify-center rounded-t-[4px] focus:outline-none"
                    >
                      <span
                        className={cn(
                          'bg-verde block w-full max-w-6 rounded-t-[4px] transition-colors',
                          ativo === i && 'bg-verde-2',
                        )}
                        style={{
                          height: `${Math.max(altura, p.faturamentoCentavos > 0 ? 1 : 0)}%`,
                        }}
                        aria-hidden
                      />
                    </button>
                    {ativo === i && (
                      <div
                        role="tooltip"
                        className="rounded-campo border-borda bg-branco text-apoio shadow-flutuante pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 w-max -translate-x-1/2 border px-2.5 py-1.5"
                      >
                        <p className="preco text-tinta font-semibold">
                          {centavosParaBRL(p.faturamentoCentavos)}
                        </p>
                        <p className="text-micro text-suave">
                          {formatarData(`${p.data}T12:00:00Z`)} ·{' '}
                          {pluralizar(p.pedidos, 'pedido', 'pedidos')}
                        </p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>

          <ol className="text-micro text-suave mt-1.5 flex gap-[2px] pl-14" aria-hidden>
            {pontos.map((p, i) => (
              <li key={p.data} className="preco min-w-0 flex-1 truncate text-center">
                {i % passoRotulo === 0 || i === pontos.length - 1
                  ? formatarData(`${p.data}T12:00:00Z`).slice(0, 5)
                  : ''}
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
