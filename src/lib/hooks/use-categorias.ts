'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriasApi, opcoesArvoreCategorias } from '@/lib/api/categorias';
import { mensagemDeErro } from '@/lib/api/cliente';
import { qk } from '@/lib/query-keys';
import type { AtualizarCategoria, CriarCategoria } from '@/lib/schemas/categoria';
import { notificar } from '@/stores/ui-store';

export function useArvoreCategorias(incluirInativas = false) {
  return useQuery(opcoesArvoreCategorias(incluirInativas));
}

function useInvalidarCategorias() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: qk.categorias.todas });
    void qc.invalidateQueries({ queryKey: qk.produtos.todos });
  };
}

export function useCriarCategoria() {
  const invalidar = useInvalidarCategorias();
  return useMutation({
    mutationFn: (dados: CriarCategoria) => categoriasApi.criar(dados),
    onSuccess: () => {
      notificar({ tipo: 'sucesso', titulo: 'Categoria criada.' });
      invalidar();
    },
  });
}

/**
 * Sem `onError` de propósito: o modal que dispara esta mutação já trata a rejeição (erro no
 * campo quando o slug repete, toast no resto). Notificar aqui também rendia dois avisos para
 * a mesma falha — e divergia de `useCriarCategoria`, que sempre deixou o erro para quem chama.
 */
export function useAtualizarCategoria() {
  const invalidar = useInvalidarCategorias();
  return useMutation({
    mutationFn: ({ id, dados }: { id: string; dados: AtualizarCategoria }) =>
      categoriasApi.atualizar(id, dados),
    onSuccess: invalidar,
  });
}

export function useRemoverCategoria() {
  const invalidar = useInvalidarCategorias();
  return useMutation({
    mutationFn: (id: string) => categoriasApi.remover(id),
    onSuccess: () => {
      notificar({ tipo: 'sucesso', titulo: 'Categoria excluída.' });
      invalidar();
    },
    onError: (erro) =>
      notificar({
        tipo: 'erro',
        titulo: 'A categoria não foi excluída.',
        descricao: mensagemDeErro(erro),
      }),
  });
}
