import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { EsqueletoGrade } from '@/components/estados/skeletons';
import { FILTROS_VITRINE, Vitrine } from '@/components/home/vitrine';
import { LayoutCatalogo } from '@/components/layout/layout-catalogo';
import { Catalogo } from '@/components/produto/catalogo';
import { opcoesArvoreCategorias } from '@/lib/api/categorias';
import { opcoesListaProdutos } from '@/lib/api/produtos';
import { DESCRICAO_LOJA, NOME_LOJA } from '@/lib/constantes';
import { getQueryClientServidor } from '@/lib/query-client.server';
import {
  filtrosParaApi,
  lerFiltrosCatalogo,
  temFiltrosAtivos,
  type FiltrosCatalogo,
} from '@/lib/schemas/catalogo';

export const metadata: Metadata = {
  title: `${NOME_LOJA} — ${DESCRICAO_LOJA}`,
};

/**
 * A vitrine é o estado de repouso da home: URL limpa, nada escolhido ainda. Qualquer sinal de
 * que o cliente já está procurando algo — busca, filtro, categoria, ordenação ou página — troca
 * a home pela lista com a barra lateral, que é onde essa procura se resolve.
 */
function estaProcurando(f: FiltrosCatalogo): boolean {
  return temFiltrosAtivos(f) || !!f.categoria || f.ordenar !== 'recente' || f.page > 1;
}

/**
 * Home. O servidor busca a primeira página do catálogo (com os filtros da URL) e a árvore de
 * categorias; na vitrine busca também os três trilhos. O cliente hidrata o cache do TanStack
 * Query e assume dali em diante.
 */
export default async function HomePage({ searchParams }: PageProps<'/'>) {
  const filtros = lerFiltrosCatalogo(await searchParams);
  const procurando = estaProcurando(filtros);
  const qc = getQueryClientServidor();

  await Promise.all([
    qc.prefetchQuery(opcoesListaProdutos(filtrosParaApi(filtros))),
    qc.prefetchQuery(opcoesArvoreCategorias()),
    ...(procurando
      ? []
      : Object.values(FILTROS_VITRINE).map((f) => qc.prefetchQuery(opcoesListaProdutos(f)))),
  ]);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      {procurando ? (
        <LayoutCatalogo>
          <Suspense fallback={<EsqueletoGrade />}>
            <Catalogo titulo="Resultados" />
          </Suspense>
        </LayoutCatalogo>
      ) : (
        <div className="flex flex-col gap-4">
          <h1 className="sr-only">
            {NOME_LOJA} — {DESCRICAO_LOJA}
          </h1>
          <Vitrine />
          <Suspense fallback={<EsqueletoGrade />}>
            <Catalogo titulo="Tudo na loja" nivelTitulo={2} />
          </Suspense>
        </div>
      )}
    </HydrationBoundary>
  );
}
