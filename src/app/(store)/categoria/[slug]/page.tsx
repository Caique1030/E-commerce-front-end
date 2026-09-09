import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { encontrarPorSlug, trilhaDaCategoria } from '@/lib/api/categorias';
import { opcoesListaProdutos } from '@/lib/api/produtos';
import { arvoreCategoriasServidor } from '@/lib/api/servidor';
import { getQueryClientServidor } from '@/lib/query-client.server';
import { qk } from '@/lib/query-keys';
import { filtrosParaApi, lerFiltrosCatalogo } from '@/lib/schemas/catalogo';
import { Category } from '@/views/Category/Category';

export async function generateMetadata({
  params,
}: PageProps<'/categoria/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const arvore = await arvoreCategoriasServidor();
  const categoria = arvore ? encontrarPorSlug(arvore, slug) : undefined;
  return { title: categoria?.nome ?? 'Categoria' };
}

/** Filtra por `caminho`: a categoria e todas as subcategorias. */
export default async function CategoriaPage({
  params,
  searchParams,
}: PageProps<'/categoria/[slug]'>) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const filtros = lerFiltrosCatalogo(sp);
  const qc = getQueryClientServidor();

  // A lista depende só do slug e dos filtros, nunca da árvore: as duas chamadas vão juntas.
  // Em série o TTFB era a soma das duas latências.
  const [arvore] = await Promise.all([
    arvoreCategoriasServidor(),
    qc.prefetchQuery(opcoesListaProdutos(filtrosParaApi(filtros, slug))),
  ]);

  const categoria = arvore ? encontrarPorSlug(arvore, slug) : undefined;
  if (arvore && !categoria) notFound();
  if (arvore) qc.setQueryData(qk.categorias.arvore(false), arvore);

  const trilha = arvore && categoria ? trilhaDaCategoria(arvore, categoria.caminho) : [];
  const filhos = categoria?.filhos ?? [];

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <Category slug={slug} categoria={categoria} trilha={trilha} filhos={filhos} />
    </HydrationBoundary>
  );
}
