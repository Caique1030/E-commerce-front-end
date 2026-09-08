import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { EsqueletoGrade } from '@/components/estados/skeletons';
import { LayoutCatalogo } from '@/components/layout/layout-catalogo';
import { Catalogo } from '@/components/produto/catalogo';
import { opcoesArvoreCategorias } from '@/lib/api/categorias';
import { opcoesListaProdutos } from '@/lib/api/produtos';
import { DESCRICAO_LOJA, NOME_LOJA } from '@/lib/constantes';
import { getQueryClientServidor } from '@/lib/query-client.server';
import { filtrosParaApi, lerFiltrosCatalogo } from '@/lib/schemas/catalogo';

export const metadata: Metadata = {
  title: `${NOME_LOJA} — ${DESCRICAO_LOJA}`,
};

/**
 * Home = catálogo. O servidor busca a primeira página (com os filtros da URL) e a árvore de
 * categorias; o cliente hidrata o cache do TanStack Query e assume dali em diante.
 */
export default async function HomePage({ searchParams }: PageProps<'/'>) {
  const filtros = lerFiltrosCatalogo(await searchParams);
  const qc = getQueryClientServidor();

  await Promise.all([
    qc.prefetchQuery(opcoesListaProdutos(filtrosParaApi(filtros))),
    qc.prefetchQuery(opcoesArvoreCategorias()),
  ]);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <LayoutCatalogo>
        <Suspense fallback={<EsqueletoGrade />}>
          <Catalogo titulo="Tudo na loja" />
        </Suspense>
      </LayoutCatalogo>
    </HydrationBoundary>
  );
}
