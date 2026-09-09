'use client';

import { useId, useState } from 'react';
import { centavosParaBRL, formatarData, pluralizar } from '@/lib/formatadores';
import * as S from './style';

export interface PontoSerie {
  /** YYYY-MM-DD */
  data: string;
  faturamentoCentavos: number;
  pedidos: number;
}

export interface BarChartProps {
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

function compact(centavos: number): string {
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
export function BarChart({ pontos, className }: BarChartProps) {
  const [modo, setModo] = useState<'grafico' | 'tabela'>('grafico');
  const [ativo, setAtivo] = useState<number | null>(null);
  const idTitulo = useId();

  const maximo = Math.max(0, ...pontos.map((p) => p.faturamentoCentavos));
  const linhas = escala(maximo);
  const topo = linhas[linhas.length - 1] || 1;
  const passoRotulo = Math.max(1, Math.ceil(pontos.length / 6));

  return (
    <S.Root aria-labelledby={idTitulo} className={className}>
      <S.Header>
        <div>
          <S.Title id={idTitulo}>Faturamento por dia</S.Title>
          <S.Subtitle>Pedidos não cancelados, no horário de Brasília.</S.Subtitle>
        </div>
        <S.ModeToggle role="group" aria-label="Modo de exibição">
          {(['grafico', 'tabela'] as const).map((m) => (
            <S.ModeButton
              key={m}
              type="button"
              onClick={() => setModo(m)}
              aria-pressed={modo === m}
              $active={modo === m}
            >
              {m === 'grafico' ? 'Gráfico' : 'Tabela'}
            </S.ModeButton>
          ))}
        </S.ModeToggle>
      </S.Header>

      {pontos.length === 0 ? (
        <S.Empty>Nenhuma venda no período.</S.Empty>
      ) : modo === 'tabela' ? (
        <S.TableScroll>
          <S.DataTable>
            <thead>
              <S.HeadRow>
                <S.HeadCell scope="col">Dia</S.HeadCell>
                <S.HeadCell scope="col" $right>
                  Pedidos
                </S.HeadCell>
                <S.HeadCell scope="col" $right>
                  Faturamento
                </S.HeadCell>
              </S.HeadRow>
            </thead>
            <tbody>
              {pontos.map((p) => (
                <S.BodyRow key={p.data}>
                  <S.Cell>{formatarData(`${p.data}T12:00:00Z`)}</S.Cell>
                  <S.Cell $right>{p.pedidos}</S.Cell>
                  <S.Cell $right>{centavosParaBRL(p.faturamentoCentavos)}</S.Cell>
                </S.BodyRow>
              ))}
            </tbody>
          </S.DataTable>
        </S.TableScroll>
      ) : (
        <S.ChartArea>
          {/* eixo Y: linhas recessivas com rótulo à esquerda */}
          <S.Plot>
            {linhas.map((v) => {
              const pct = (v / topo) * 100;
              return (
                <S.GridLine key={v} style={{ bottom: `${pct}%` }} aria-hidden>
                  <S.GridLabel>{compact(v)}</S.GridLabel>
                </S.GridLine>
              );
            })}

            <S.Bars aria-label="Barras de faturamento por dia">
              {pontos.map((p, i) => {
                const altura = (p.faturamentoCentavos / topo) * 100;
                const rotulo = `${formatarData(`${p.data}T12:00:00Z`)}: ${centavosParaBRL(p.faturamentoCentavos)}, ${pluralizar(p.pedidos, 'pedido', 'pedidos')}`;
                return (
                  <S.BarSlot key={p.data}>
                    <S.BarButton
                      type="button"
                      aria-label={rotulo}
                      onPointerEnter={() => setAtivo(i)}
                      onPointerLeave={() => setAtivo((a) => (a === i ? null : a))}
                      onFocus={() => setAtivo(i)}
                      onBlur={() => setAtivo((a) => (a === i ? null : a))}
                    >
                      <S.Bar
                        $active={ativo === i}
                        style={{
                          height: `${Math.max(altura, p.faturamentoCentavos > 0 ? 1 : 0)}%`,
                        }}
                        aria-hidden
                      />
                    </S.BarButton>
                    {ativo === i && (
                      <S.Tooltip role="tooltip">
                        <S.TooltipValue>{centavosParaBRL(p.faturamentoCentavos)}</S.TooltipValue>
                        <S.TooltipMeta>
                          {formatarData(`${p.data}T12:00:00Z`)} ·{' '}
                          {pluralizar(p.pedidos, 'pedido', 'pedidos')}
                        </S.TooltipMeta>
                      </S.Tooltip>
                    )}
                  </S.BarSlot>
                );
              })}
            </S.Bars>
          </S.Plot>

          <S.Axis aria-hidden>
            {pontos.map((p, i) => (
              <S.AxisLabel key={p.data}>
                {i % passoRotulo === 0 || i === pontos.length - 1
                  ? formatarData(`${p.data}T12:00:00Z`).slice(0, 5)
                  : ''}
              </S.AxisLabel>
            ))}
          </S.Axis>
        </S.ChartArea>
      )}
    </S.Root>
  );
}
