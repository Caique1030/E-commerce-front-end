import { queryOptions } from '@tanstack/react-query';
import { qk } from '@/lib/query-keys';
import type { AtualizarCategoria, CriarCategoria } from '@/lib/schemas/categoria';
import type { Categoria } from '@/lib/tipos';
import { api } from './cliente';

export const categoriasApi = {
  arvore: (incluirInativas = false) =>
    api<Categoria[]>('/categorias', {
      query: { incluirInativas: incluirInativas ? 'true' : undefined },
    }),

  criar: (dados: CriarCategoria) => api<Categoria>('/categorias', { method: 'POST', body: dados }),

  atualizar: (id: string, dados: AtualizarCategoria) =>
    api<Categoria>(`/categorias/${id}`, { method: 'PATCH', body: dados }),

  remover: (id: string) => api<void>(`/categorias/${id}`, { method: 'DELETE' }),
};

/** A árvore muda raramente: fica fresca por 10 minutos. */
export const opcoesArvoreCategorias = (incluirInativas = false) =>
  queryOptions({
    queryKey: qk.categorias.arvore(incluirInativas),
    queryFn: () => categoriasApi.arvore(incluirInativas),
    staleTime: 10 * 60_000,
  });

/** Achata a árvore preservando a ordem e o nível (para selects e breadcrumbs). */
export function achatarCategorias(arvore: Categoria[]): Categoria[] {
  const saida: Categoria[] = [];
  const visitar = (nos: Categoria[]) => {
    for (const no of nos) {
      saida.push(no);
      if (no.filhos?.length) visitar(no.filhos);
    }
  };
  visitar(arvore);
  return saida;
}

/** Caminho "eletronicos/smartphones" → [Eletrônicos, Smartphones] usando a árvore carregada. */
export function trilhaDaCategoria(arvore: Categoria[], caminho: string): Categoria[] {
  const todas = achatarCategorias(arvore);
  const trilha: Categoria[] = [];
  const partes = caminho.split('/');
  for (let i = 1; i <= partes.length; i++) {
    const prefixo = partes.slice(0, i).join('/');
    const no = todas.find((c) => c.caminho === prefixo);
    if (no) trilha.push(no);
  }
  return trilha;
}

export function encontrarPorSlug(arvore: Categoria[], slug: string): Categoria | undefined {
  return achatarCategorias(arvore).find((c) => c.slug === slug);
}
