'use client';

import { addDays, format, subDays } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { ErrorState } from '@/components/estados/ErrorState';
import { StatCardsSkeleton, TableSkeleton } from '@/components/estados/Skeletons';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, Td, Th } from '@/components/ui/Table';
import { ORDEM_STATUS, ROTULO_STATUS } from '@/lib/constantes';
import { centavosParaBRL, dataCivilHoje, formatarInteiro } from '@/lib/formatadores';
import { useResumoDashboard, useTopProdutos } from '@/lib/hooks/use-dashboard';
import type { ResumoDashboard } from '@/lib/tipos';
import { BarChart, type PontoSerie } from '../BarChart/BarChart';
import * as S from './style';

const PRESETS = [
  { label: '7 dias', dias: 7 },
  { label: '30 dias', dias: 30 },
  { label: '90 dias', dias: 90 },
  { label: 'Tudo', dias: 0 },
] as const;

function periodoDoPreset(dias: number): { de?: string; ate?: string } {
  if (dias === 0) return {};
  const hoje = dataCivilHoje();
  const de = format(subDays(new Date(`${hoje}T12:00:00`), dias - 1), 'yyyy-MM-dd');
  return { de, ate: hoje };
}

/** Preenche os dias sem venda com zero para o eixo do tempo não mentir. */
function preencherDias(
  serie: ResumoDashboard['serieDiaria'],
  de?: string,
  ate?: string,
): PontoSerie[] {
  if (serie.length === 0 && !(de && ate)) return [];
  const porDia = new Map(serie.map((p) => [p.data, p]));
  const inicio = de ?? serie[0].data;
  const fim = ate ?? serie[serie.length - 1].data;
  const saida: PontoSerie[] = [];
  let cursor = new Date(`${inicio}T12:00:00`);
  const limite = new Date(`${fim}T12:00:00`);
  let guarda = 0;
  while (cursor <= limite && guarda < 400) {
    const chave = format(cursor, 'yyyy-MM-dd');
    const p = porDia.get(chave);
    saida.push({
      data: chave,
      faturamentoCentavos: p?.faturamentoCentavos ?? 0,
      pedidos: p?.pedidos ?? 0,
    });
    cursor = addDays(cursor, 1);
    guarda++;
  }
  return saida;
}

export function Dashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const de = searchParams.get('de') ?? undefined;
  const ate = searchParams.get('ate') ?? undefined;

  const resumo = useResumoDashboard(de, ate);
  const top = useTopProdutos(de, ate, 8);

  const presetAtivo = PRESETS.find((p) => {
    const per = periodoDoPreset(p.dias);
    return per.de === de && per.ate === ate;
  });

  function aplicar(periodo: { de?: string; ate?: string }) {
    const q = new URLSearchParams();
    if (periodo.de) q.set('de', periodo.de);
    if (periodo.ate) q.set('ate', periodo.ate);
    const s = q.toString();
    router.replace(s ? `/admin?${s}` : '/admin', { scroll: false });
  }

  const pontos = useMemo(
    () => (resumo.data ? preencherDias(resumo.data.serieDiaria, de, ate) : []),
    [resumo.data, de, ate],
  );

  const totalPedidosStatus = resumo.data
    ? Object.values(resumo.data.porStatus).reduce((s, n) => s + n, 0)
    : 0;
  const maxStatus = resumo.data ? Math.max(1, ...Object.values(resumo.data.porStatus)) : 1;

  return (
    <S.Root>
      {/* Filtros: uma linha, acima de tudo; escopam todos os números abaixo. */}
      <S.FilterBar>
        <S.PresetGroup role="group" aria-label="Período">
          {PRESETS.map((p) => (
            <S.PresetButton
              key={p.label}
              type="button"
              onClick={() => aplicar(periodoDoPreset(p.dias))}
              aria-pressed={presetAtivo?.label === p.label}
              $active={presetAtivo?.label === p.label}
            >
              {p.label}
            </S.PresetButton>
          ))}
        </S.PresetGroup>
        <S.RangeForm
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const d = String(fd.get('de') || '') || undefined;
            const a = String(fd.get('ate') || '') || undefined;
            aplicar({ de: d, ate: a });
          }}
        >
          <S.RangeLabel>
            <S.RangeCaption>De</S.RangeCaption>
            <S.DateInput type="date" name="de" defaultValue={de ?? ''} key={`de-${de}`} />
          </S.RangeLabel>
          <S.RangeLabel>
            <S.RangeCaption>até</S.RangeCaption>
            <S.DateInput type="date" name="ate" defaultValue={ate ?? ''} key={`ate-${ate}`} />
          </S.RangeLabel>
          <S.ApplyButton type="submit">Aplicar</S.ApplyButton>
        </S.RangeForm>
        {resumo.isFetching && !resumo.isPending && (
          <S.Refreshing aria-live="polite">Atualizando…</S.Refreshing>
        )}
      </S.FilterBar>

      {resumo.isPending ? (
        <StatCardsSkeleton />
      ) : resumo.isError ? (
        <ErrorState
          error={resumo.error}
          title="Não foi possível carregar o resumo."
          onRetry={() => void resumo.refetch()}
          retrying={resumo.isFetching}
        />
      ) : (
        <S.Summary $dimmed={resumo.isPlaceholderData}>
          <S.MetricGrid>
            <MetricCard
              label="Faturamento"
              value={centavosParaBRL(resumo.data.faturamentoCentavos)}
              highlight
            />
            <MetricCard label="Pedidos" value={formatarInteiro(resumo.data.pedidos)} />
            <MetricCard
              label="Ticket médio"
              value={centavosParaBRL(resumo.data.ticketMedioCentavos)}
            />
            <MetricCard label="Itens vendidos" value={formatarInteiro(resumo.data.itensVendidos)} />
          </S.MetricGrid>

          <S.ChartsGrid>
            <BarChart pontos={pontos} />

            <S.StatusCard aria-labelledby="titulo-status">
              <S.SectionTitle id="titulo-status">Pedidos por status</S.SectionTitle>
              <S.StatusCaption>
                {formatarInteiro(totalPedidosStatus)} no período, incluindo cancelados.
              </S.StatusCaption>
              <S.StatusList>
                {ORDEM_STATUS.map((s) => {
                  const n = resumo.data.porStatus[s] ?? 0;
                  return (
                    <S.StatusRow key={s}>
                      <S.StatusName>{ROTULO_STATUS[s]}</S.StatusName>
                      <S.StatusTrack aria-hidden>
                        <S.StatusFill
                          $cancelled={s === 'CANCELADO'}
                          style={{ width: `${(n / maxStatus) * 100}%` }}
                        />
                      </S.StatusTrack>
                      <S.StatusCount>{formatarInteiro(n)}</S.StatusCount>
                    </S.StatusRow>
                  );
                })}
              </S.StatusList>
            </S.StatusCard>
          </S.ChartsGrid>
        </S.Summary>
      )}

      <S.TopSection aria-labelledby="titulo-top">
        <S.SectionTitle id="titulo-top">Produtos mais vendidos</S.SectionTitle>
        {top.isPending ? (
          <TableSkeleton rows={5} columns={4} />
        ) : top.isError ? (
          <ErrorState
            error={top.error}
            title="Não foi possível carregar o ranking."
            onRetry={() => void top.refetch()}
            compact
          />
        ) : top.data.length === 0 ? (
          <S.TopEmpty>Nenhuma venda no período.</S.TopEmpty>
        ) : (
          <Table className={top.isPlaceholderData ? 'opacity-60' : undefined}>
            <thead>
              <tr>
                <Th>Produto</Th>
                <Th>SKU</Th>
                <Th className="text-right">Unidades</Th>
                <Th className="text-right">Faturamento</Th>
              </tr>
            </thead>
            <tbody>
              {top.data.map((p) => (
                <tr key={p.produtoId}>
                  <Td>
                    <S.ProductLink href={`/admin/produtos/${p.produtoId}`}>{p.nome}</S.ProductLink>
                  </Td>
                  <Td className="preco">
                    <S.Sku>{p.sku}</S.Sku>
                  </Td>
                  <Td className="preco text-right">{formatarInteiro(p.quantidadeVendida)}</Td>
                  <Td className="preco text-right">{centavosParaBRL(p.faturamentoCentavos)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </S.TopSection>
    </S.Root>
  );
}

function MetricCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <S.MetricCard $highlight={highlight}>
      <S.MetricLabel>{label}</S.MetricLabel>
      <S.MetricValue $highlight={highlight}>{value}</S.MetricValue>
    </S.MetricCard>
  );
}

export function DashboardSkeleton() {
  return (
    <S.Root aria-busy>
      <Skeleton className="h-14 w-full" />
      <StatCardsSkeleton />
      <Skeleton className="h-72 w-full" />
    </S.Root>
  );
}
