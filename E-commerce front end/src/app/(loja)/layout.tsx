import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { DrawerCarrinho } from '@/components/carrinho/drawer-carrinho';
import { Cabecalho } from '@/components/layout/cabecalho';
import { RetomarIntencao } from '@/components/layout/retomar-intencao';
import { Rodape } from '@/components/layout/rodape';
import { arvoreCategoriasServidor } from '@/lib/api/servidor';
import { criarQueryClient } from '@/lib/query-client';
import { qk } from '@/lib/query-keys';

/**
 * A árvore é dado do layout (barra lateral do catálogo e menu do mobile), não de uma página: ela
 * precisa estar no cache antes do loading.tsx da rota. Quando a primeira montagem de
 * ArvoreCategorias acontecia no fallback, a query nascia vazia e o HydrationBoundary da página
 * encontrava uma query já existente — nesse caso ele adia a hidratação para um efeito, que não
 * roda no servidor. O servidor mandava o esqueleto e o cliente hidratava com a árvore pronta:
 * divergência de hidratação.
 *
 * Cliente próprio de propósito: desidratar o cliente compartilhado da requisição arrastaria junto
 * as queries da página (inclusive as pendentes) e recriaria o mesmo problema para elas.
 */
async function estadoDaArvore() {
  const arvore = await arvoreCategoriasServidor();
  const qc = criarQueryClient();
  if (arvore) qc.setQueryData(qk.categorias.arvore(false), arvore);
  return dehydrate(qc);
}

/** Chrome da loja: cabeçalho, conteúdo, rodapé e o drawer do carrinho (montado uma vez). */
export default async function LojaLayout({ children }: { children: ReactNode }) {
  return (
    <HydrationBoundary state={await estadoDaArvore()}>
      <a
        href="#conteudo"
        className="focus:rounded-campo focus:bg-branco focus:text-corpo focus:shadow-flutuante sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:px-3 focus:py-2"
      >
        Pular para o conteúdo
      </a>
      <Cabecalho />
      <main id="conteudo" className="conteudo flex-1 py-4 lg:py-5" tabIndex={-1}>
        {children}
      </main>
      <Rodape />
      <DrawerCarrinho />
      <RetomarIntencao />
    </HydrationBoundary>
  );
}
