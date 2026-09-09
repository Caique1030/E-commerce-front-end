import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { StoreShell } from '@/components/layout/StoreShell/StoreShell';
import { arvoreCategoriasServidor } from '@/lib/api/servidor';
import { criarQueryClient } from '@/lib/query-client';
import { qk } from '@/lib/query-keys';

/**
 * A árvore é dado do layout (barra lateral do catálogo e menu do mobile), não de uma página: ela
 * precisa estar no cache antes do loading.tsx da rota. Quando a primeira montagem de
 * CategoryTree acontecia no fallback, a query nascia vazia e o HydrationBoundary da página
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

export default async function LojaLayout({ children }: { children: ReactNode }) {
  return (
    <HydrationBoundary state={await estadoDaArvore()}>
      <StoreShell>{children}</StoreShell>
    </HydrationBoundary>
  );
}
