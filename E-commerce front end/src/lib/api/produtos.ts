import { queryOptions } from '@tanstack/react-query';
import { qk } from '@/lib/query-keys';
import type { AtualizarProduto, CriarProduto } from '@/lib/schemas/produto';
import type { FiltrosProduto, Paginado, Produto, Slot } from '@/lib/tipos';
import { api } from './cliente';

/** Catálogo é público e muda devagar: no servidor entra no cache de dados do Next. */
const REVALIDAR_CATALOGO = 60;

export const produtosApi = {
  listar: (filtros: FiltrosProduto) =>
    api<Paginado<Produto>>('/produtos', { query: { ...filtros }, revalidar: REVALIDAR_CATALOGO }),

  buscar: (id: string) => api<Produto>(`/produtos/${id}`, { revalidar: REVALIDAR_CATALOGO }),

  disponibilidade: (id: string, data: string) =>
    api<Slot[]>(`/produtos/${id}/disponibilidade`, { query: { data } }),

  criar: (dados: CriarProduto) => api<Produto>('/produtos', { method: 'POST', body: dados }),

  atualizar: (id: string, dados: AtualizarProduto) =>
    api<Produto>(`/produtos/${id}`, { method: 'PATCH', body: dados }),

  remover: (id: string) => api<void>(`/produtos/${id}`, { method: 'DELETE' }),
};

/** Opções compartilhadas entre o prefetch no servidor e o hook no cliente (mesma chave). */
export const opcoesListaProdutos = (filtros: FiltrosProduto) =>
  queryOptions({
    queryKey: qk.produtos.lista(filtros),
    queryFn: () => produtosApi.listar(filtros),
  });

export const opcoesDetalheProduto = (id: string) =>
  queryOptions({
    queryKey: qk.produtos.detalhe(id),
    queryFn: () => produtosApi.buscar(id),
  });

/** Vaga é dado que muda enquanto o usuário pensa: nunca considerada fresca. */
export const opcoesDisponibilidade = (id: string, data: string) =>
  queryOptions({
    queryKey: qk.produtos.disponibilidade(id, data),
    queryFn: () => produtosApi.disponibilidade(id, data),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
