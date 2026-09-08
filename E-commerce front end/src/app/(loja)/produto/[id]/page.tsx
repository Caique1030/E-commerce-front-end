import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DetalheProduto } from '@/components/produto/detalhe-produto';
import { opcoesArvoreCategorias } from '@/lib/api/categorias';
import { buscarProdutoServidor } from '@/lib/api/servidor';
import { NOME_LOJA } from '@/lib/constantes';
import { centavosParaBRL, resumir } from '@/lib/formatadores';
import { getQueryClientServidor } from '@/lib/query-client.server';
import { qk } from '@/lib/query-keys';

export async function generateMetadata({ params }: PageProps<'/produto/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const produto = await buscarProdutoServidor(id);
  if (!produto) return { title: produto === null ? 'Produto não encontrado' : 'Produto' };

  const descricao = `${centavosParaBRL(produto.precoCentavos)} · ${resumir(produto.descricao, 140)}`;
  return {
    title: produto.nome,
    description: descricao,
    openGraph: {
      title: `${produto.nome} · ${NOME_LOJA}`,
      description: descricao,
      type: 'website',
      images: produto.imagemUrl ? [{ url: produto.imagemUrl, alt: produto.nome }] : [],
    },
  };
}

/**
 * Página do produto: Server Component busca os dados (SEO e primeiro render completos) e
 * entrega à ilha cliente já hidratada, que cuida de quantidade, agenda e carrinho.
 */
export default async function ProdutoPage({ params }: PageProps<'/produto/[id]'>) {
  const { id } = await params;
  const produto = await buscarProdutoServidor(id);
  if (produto === null) notFound();

  const qc = getQueryClientServidor();
  if (produto) qc.setQueryData(qk.produtos.detalhe(id), produto);
  await qc.prefetchQuery(opcoesArvoreCategorias());

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <DetalheProduto id={id} />
    </HydrationBoundary>
  );
}
