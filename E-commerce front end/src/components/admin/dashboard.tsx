'use client';

import { addDays, format, subDays } from 'date-fns';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { Erro } from '@/components/estados/erro';
import { EsqueletoCartoes, EsqueletoTabela } from '@/components/estados/skeletons';
import { Esqueleto } from '@/components/ui/esqueleto';
import { Tabela, Td, Th } from '@/components/ui/tabela';
import { ORDEM_STATUS, ROTULO_STATUS } from '@/lib/constantes';
import { centavosParaBRL, dataCivilHoje, formatarInteiro } from '@/lib/formatadores';
import { useResumoDashboard, useTopProdutos } from '@/lib/hooks/use-dashboard';
import type { ResumoDashboard } from '@/lib/tipos';
import { cn } from '@/lib/utils';
import { GraficoBarras, type PontoSerie } from './grafico-barras';

const PRESETS = [
  { rotulo: '7 dias', dias: 7 },
  { rotulo: '30 dias', dias: 30 },
  { rotulo: '90 dias', dias: 90 },
  { rotulo: 'Tudo', dias: 0 },
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
    <div className="flex flex-col gap-5">
      {/* Filtros: uma linha, acima de tudo; escopam todos os números abaixo. */}
      <div className="rounded-card border-borda bg-branco shadow-card flex flex-wrap items-center gap-3 border px-4 py-3">
        <div
          className="rounded-campo border-borda-forte text-apoio flex border p-0.5"
          role="group"
          aria-label="Período"
        >
          {PRESETS.map((p) => (
            <button
              key={p.rotulo}
              type="button"
              onClick={() => aplicar(periodoDoPreset(p.dias))}
              aria-pressed={presetAtivo?.rotulo === p.rotulo}
              className={cn(
                'rounded-[4px] px-2.5 py-1 font-medium',
                presetAtivo?.rotulo === p.rotulo
                  ? 'bg-tinta text-branco'
                  : 'text-suave hover:text-tinta',
              )}
            >
              {p.rotulo}
            </button>
          ))}
        </div>
        <form
          className="text-apoio flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const d = String(fd.get('de') || '') || undefined;
            const a = String(fd.get('ate') || '') || undefined;
            aplicar({ de: d, ate: a });
          }}
        >
          <label className="flex items-center gap-1.5">
            <span className="text-suave">De</span>
            <input
              type="date"
              name="de"
              defaultValue={de ?? ''}
              key={`de-${de}`}
              className="preco rounded-campo border-borda-forte bg-branco text-apoio h-8 border px-2"
            />
          </label>
          <label className="flex items-center gap-1.5">
            <span className="text-suave">até</span>
            <input
              type="date"
              name="ate"
              defaultValue={ate ?? ''}
              key={`ate-${ate}`}
              className="preco rounded-campo border-borda-forte bg-branco text-apoio h-8 border px-2"
            />
          </label>
          <button
            type="submit"
            className="rounded-campo border-borda-forte bg-branco hover:border-tinta h-8 border px-2.5 font-medium"
          >
            Aplicar
          </button>
        </form>
        {resumo.isFetching && !resumo.isPending && (
          <span className="text-micro text-suave ml-auto" aria-live="polite">
            Atualizando…
          </span>
        )}
      </div>

      {resumo.isPending ? (
        <EsqueletoCartoes />
      ) : resumo.isError ? (
        <Erro
          erro={resumo.error}
          titulo="Não foi possível carregar o resumo."
          aoTentarDeNovo={() => void resumo.refetch()}
          tentandoDeNovo={resumo.isFetching}
        />
      ) : (
        <div
          className={cn(
            'flex flex-col gap-5 transition-opacity',
            resumo.isPlaceholderData && 'opacity-60',
          )}
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <CartaoMetrica
              rotulo="Faturamento"
              valor={centavosParaBRL(resumo.data.faturamentoCentavos)}
              destaque
            />
            <CartaoMetrica rotulo="Pedidos" valor={formatarInteiro(resumo.data.pedidos)} />
            <CartaoMetrica
              rotulo="Ticket médio"
              valor={centavosParaBRL(resumo.data.ticketMedioCentavos)}
            />
            <CartaoMetrica
              rotulo="Itens vendidos"
              valor={formatarInteiro(resumo.data.itensVendidos)}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <GraficoBarras pontos={pontos} />

            <section
              aria-labelledby="titulo-status"
              className="rounded-card border-borda bg-branco shadow-card border p-5"
            >
              <h2 id="titulo-status" className="text-h2">
                Pedidos por status
              </h2>
              <p className="text-apoio text-suave mb-4">
                {formatarInteiro(totalPedidosStatus)} no período, incluindo cancelados.
              </p>
              <ul className="flex flex-col gap-2.5">
                {ORDEM_STATUS.map((s) => {
                  const n = resumo.data.porStatus[s] ?? 0;
                  return (
                    <li
                      key={s}
                      className="text-apoio grid grid-cols-[8rem_minmax(0,1fr)_2.5rem] items-center gap-3"
                    >
                      <span className="truncate">{ROTULO_STATUS[s]}</span>
                      <span className="bg-papel-2 h-3 overflow-hidden rounded-r-[4px]" aria-hidden>
                        <span
                          className={cn(
                            'block h-full rounded-r-[4px]',
                            s === 'CANCELADO' ? 'bg-alerta/70' : 'bg-tinta',
                          )}
                          style={{ width: `${(n / maxStatus) * 100}%` }}
                        />
                      </span>
                      <span className="preco text-right font-medium">{formatarInteiro(n)}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </div>
      )}

      <section aria-labelledby="titulo-top" className="flex flex-col gap-3">
        <h2 id="titulo-top" className="text-h2">
          Produtos mais vendidos
        </h2>
        {top.isPending ? (
          <EsqueletoTabela linhas={5} colunas={4} />
        ) : top.isError ? (
          <Erro
            erro={top.error}
            titulo="Não foi possível carregar o ranking."
            aoTentarDeNovo={() => void top.refetch()}
            compacto
          />
        ) : top.data.length === 0 ? (
          <p className="rounded-card border-borda bg-branco shadow-card text-corpo text-suave border p-6 text-center">
            Nenhuma venda no período.
          </p>
        ) : (
          <Tabela className={cn(top.isPlaceholderData && 'opacity-60')}>
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
                    <Link
                      href={`/admin/produtos/${p.produtoId}`}
                      className="font-medium hover:underline"
                    >
                      {p.nome}
                    </Link>
                  </Td>
                  <Td className="preco text-suave">{p.sku}</Td>
                  <Td className="preco text-right">{formatarInteiro(p.quantidadeVendida)}</Td>
                  <Td className="preco text-right">{centavosParaBRL(p.faturamentoCentavos)}</Td>
                </tr>
              ))}
            </tbody>
          </Tabela>
        )}
      </section>
    </div>
  );
}

function CartaoMetrica({
  rotulo,
  valor,
  destaque = false,
}: {
  rotulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-card border-borda bg-branco shadow-card border p-4',
        destaque && 'border-verde/30 bg-verde-suave/40',
      )}
    >
      <p className="text-apoio text-suave">{rotulo}</p>
      <p
        className={cn(
          'preco text-tinta mt-1 font-semibold',
          destaque ? 'text-[1.75rem] leading-8' : 'text-preco',
        )}
      >
        {valor}
      </p>
    </div>
  );
}

export function EsqueletoDashboard() {
  return (
    <div className="flex flex-col gap-5" aria-busy>
      <Esqueleto className="h-14 w-full" />
      <EsqueletoCartoes />
      <Esqueleto className="h-72 w-full" />
    </div>
  );
}
