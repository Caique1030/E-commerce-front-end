'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pedidosApi } from '@/lib/api/pedidos';
import { qk } from '@/lib/query-keys';
import type { AlterarStatusPedido } from '@/lib/schemas/pedido';
import type { FiltrosPedido } from '@/lib/tipos';
import { useSessao } from '@/providers/sessao-provider';

export function useMeusPedidos(filtros: FiltrosPedido) {
  const { status } = useSessao();
  return useQuery({
    queryKey: qk.pedidos.meus(filtros),
    queryFn: () => pedidosApi.listar(filtros),
    enabled: status === 'autenticado',
    placeholderData: keepPreviousData,
  });
}

export function usePedidosAdmin(filtros: FiltrosPedido) {
  const { status, ehEquipe } = useSessao();
  return useQuery({
    queryKey: qk.pedidos.admin(filtros),
    queryFn: () => pedidosApi.listar(filtros),
    enabled: status === 'autenticado' && ehEquipe,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

export function usePedido(id: string) {
  const { status } = useSessao();
  return useQuery({
    queryKey: qk.pedidos.detalhe(id),
    queryFn: () => pedidosApi.buscar(id),
    enabled: status === 'autenticado' && !!id,
  });
}

/**
 * Finalizar compra. Nunca faz retry (a configuração global já garante; aqui é explícito):
 * um retry automático de checkout é como um duplo-clique involuntário.
 */
export function useFinalizarCompra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (chaveIdempotencia: string) => pedidosApi.finalizar(chaveIdempotencia),
    retry: false,
    onSuccess: (pedido) => {
      qc.setQueryData(qk.pedidos.detalhe(pedido.id), pedido);
      void qc.invalidateQueries({ queryKey: qk.carrinho.atual });
      void qc.invalidateQueries({ queryKey: qk.pedidos.todos });
      // Estoque mudou: listas e detalhes de produto não valem mais.
      void qc.invalidateQueries({ queryKey: qk.produtos.todos });
    },
  });
}

export function useAlterarStatusPedido(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados: AlterarStatusPedido) => pedidosApi.alterarStatus(id, dados),
    onSuccess: (pedido) => {
      qc.setQueryData(qk.pedidos.detalhe(id), pedido);
      void qc.invalidateQueries({ queryKey: qk.pedidos.todos });
      void qc.invalidateQueries({ queryKey: qk.dashboard.todos });
      // Cancelar devolve estoque.
      if (pedido.status === 'CANCELADO') void qc.invalidateQueries({ queryKey: qk.produtos.todos });
    },
  });
}
