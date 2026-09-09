import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { SHOWCASE_FILTERS } from '@/components/home/Showcase/Showcase';
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
import { Home } from '@/views/Home/Home';

export const metadata: Metadata = {
  title: `${NOME_LOJA} — ${DESCRICAO_LOJA}`,
};

/** Busca, filtro, categoria, ordenação ou página na URL: o cliente já está procurando algo. */
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
      : Object.values(SHOWCASE_FILTERS).map((f) => qc.prefetchQuery(opcoesListaProdutos(f)))),
  ]);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <Home procurando={procurando} />
    </HydrationBoundary>
  );
}
