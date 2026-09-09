import type { AlterarStatusPedido } from '@/lib/schemas/pedido';
import type { FiltrosPedido, Paginado, Pedido, ResumoPedido } from '@/lib/tipos';
import { api } from './cliente';

export const pedidosApi = {
  /** O "finalizar compra": sem corpo; a chave de idempotência protege contra o duplo clique. */
  finalizar: (chaveIdempotencia: string) =>
    api<Pedido>('/pedidos', {
      method: 'POST',
      headers: { 'Idempotency-Key': chaveIdempotencia },
    }),

  listar: (filtros: FiltrosPedido) =>
    api<Paginado<ResumoPedido>>('/pedidos', { query: { ...filtros } }),

  buscar: (id: string) => api<Pedido>(`/pedidos/${id}`),

  alterarStatus: (id: string, dados: AlterarStatusPedido) =>
    api<Pedido>(`/pedidos/${id}/status`, { method: 'PATCH', body: dados }),
};
