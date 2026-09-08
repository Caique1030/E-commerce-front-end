import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { EsqueletoGrade } from '@/components/estados/skeletons';
import { LayoutCatalogo } from '@/components/layout/layout-catalogo';
import { Catalogo } from '@/components/produto/catalogo';
import { encontrarPorSlug, trilhaDaCategoria } from '@/lib/api/categorias';
import { opcoesListaProdutos } from '@/lib/api/produtos';
import { arvoreCategoriasServidor } from '@/lib/api/servidor';
import { getQueryClientServidor } from '@/lib/query-client.server';
import { qk } from '@/lib/query-keys';
import { filtrosParaApi, lerFiltrosCatalogo } from '@/lib/schemas/catalogo';

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
  const arvore = await arvoreCategoriasServidor();
  const categoria = arvore ? encontrarPorSlug(arvore, slug) : undefined;
  if (arvore && !categoria) notFound();

  const filtros = lerFiltrosCatalogo(sp);
  const qc = getQueryClientServidor();
  if (arvore) qc.setQueryData(qk.categorias.arvore(false), arvore);
  await qc.prefetchQuery(opcoesListaProdutos(filtrosParaApi(filtros, slug)));

  const trilha = arvore && categoria ? trilhaDaCategoria(arvore, categoria.caminho) : [];
  const filhos = categoria?.filhos ?? [];

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <LayoutCatalogo>
        <div className="flex flex-col gap-4">
          <nav aria-label="Você está em" className="text-apoio text-suave">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href="/" className="hover:text-tinta hover:underline">
                  Tudo na loja
                </Link>
              </li>
              {trilha.map((c, i) => (
                <li key={c.id} className="flex items-center gap-1">
                  <ChevronRight className="size-3.5" aria-hidden />
                  {i === trilha.length - 1 ? (
                    <span aria-current="page" className="text-tinta">
                      {c.nome}
                    </span>
                  ) : (
                    <Link
                      href={`/categoria/${c.slug}`}
                      className="hover:text-tinta hover:underline"
                    >
                      {c.nome}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          {filhos.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Subcategorias">
              {filhos.map((f) => (
                <li key={f.id}>
                  <Link
                    href={`/categoria/${f.slug}`}
                    className="border-borda-forte bg-branco text-apoio hover:border-tinta inline-flex h-8 items-center rounded-full border px-3"
                  >
                    {f.nome}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Suspense fallback={<EsqueletoGrade />}>
            <Catalogo titulo={categoria?.nome ?? slug} categoriaFixa={slug} />
          </Suspense>
        </div>
      </LayoutCatalogo>
    </HydrationBoundary>
  );
}
