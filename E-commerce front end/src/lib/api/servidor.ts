import 'server-only';
import { cache } from 'react';
import type { Categoria, Produto } from '@/lib/tipos';
import { ehUuid } from '@/lib/utils';
import { categoriasApi } from './categorias';
import { ehApiError } from './cliente';
import { produtosApi } from './produtos';

/**
 * Buscas feitas em Server Components. `cache()` deduplica dentro de uma mesma requisição
 * (generateMetadata e a página pedem o mesmo produto e a API é chamada uma vez).
 *
 *  - null: não existe (404) → a página chama notFound()
 *  - undefined: a API não respondeu → a página renderiza a ilha cliente, que mostra o erro com "Tentar de novo"
 */
export const buscarProdutoServidor = cache(
  async (id: string): Promise<Produto | null | undefined> => {
    if (!ehUuid(id)) return null;
    try {
      return await produtosApi.buscar(id);
    } catch (erro) {
      if (ehApiError(erro) && erro.status === 404) return null;
      return undefined;
    }
  },
);

export const arvoreCategoriasServidor = cache(async (): Promise<Categoria[] | undefined> => {
  try {
    return await categoriasApi.arvore();
  } catch {
    return undefined;
  }
});
