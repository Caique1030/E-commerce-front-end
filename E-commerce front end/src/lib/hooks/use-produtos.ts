'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { mensagemDeErro } from '@/lib/api/cliente';
import {
  opcoesDetalheProduto,
  opcoesDisponibilidade,
  opcoesListaProdutos,
  produtosApi,
} from '@/lib/api/produtos';
import { qk } from '@/lib/query-keys';
import type { AtualizarProduto, CriarProduto } from '@/lib/schemas/produto';
import type { FiltrosProduto } from '@/lib/tipos';
import { notificar } from '@/stores/ui-store';

/** Mantém a página anterior na tela enquanto a nova carrega: sem "piscar" ao filtrar. */
export function useProdutos(filtros: FiltrosProduto) {
  return useQuery({ ...opcoesListaProdutos(filtros), placeholderData: keepPreviousData });
}

export function useProduto(id: string) {
  return useQuery(opcoesDetalheProduto(id));
}

export function useDisponibilidade(id: string, data: string | null) {
  return useQuery({ ...opcoesDisponibilidade(id, data ?? ''), enabled: !!data });
}

/** Prefetch do detalhe ao passar o mouse no card: a página abre com os dados já em cache. */
export function usePrefetchProduto() {
  const qc = useQueryClient();
  return useCallback(
    (id: string) => void qc.prefetchQuery({ ...opcoesDetalheProduto(id), staleTime: 60_000 }),
    [qc],
  );
}

/* ---- Administração ---- */

export function useCriarProduto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados: CriarProduto) => produtosApi.criar(dados),
    onSuccess: () => void qc.invalidateQueries({ queryKey: qk.produtos.todos }),
  });
}

export function useAtualizarProduto(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados: AtualizarProduto) => produtosApi.atualizar(id, dados),
    onSuccess: (produto) => {
      qc.setQueryData(qk.produtos.detalhe(id), produto);
      void qc.invalidateQueries({ queryKey: qk.produtos.todos });
    },
  });
}

export function useRemoverProduto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => produtosApi.remover(id),
    onSuccess: () => {
      notificar({ tipo: 'sucesso', titulo: 'Produto removido.' });
      void qc.invalidateQueries({ queryKey: qk.produtos.todos });
    },
    onError: (erro) =>
      notificar({
        tipo: 'erro',
        titulo: 'O produto não foi removido.',
        descricao: mensagemDeErro(erro),
      }),
  });
}
