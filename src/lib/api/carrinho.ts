import type { Carrinho } from '@/lib/tipos';
import { api } from './cliente';

export interface AdicionarItem {
  produtoId: string;
  quantidade: number;
  /** Obrigatório para BOOKING: início do slot em ISO 8601. */
  agendadoPara?: string;
}

/** Toda operação devolve o carrinho completo: o cache é substituído, nunca remontado. */
export const carrinhoApi = {
  obter: () => api<Carrinho>('/carrinho'),

  adicionar: (dados: AdicionarItem) =>
    api<Carrinho>('/carrinho/itens', { method: 'POST', body: dados }),

  atualizarItem: (itemId: string, quantidade: number) =>
    api<Carrinho>(`/carrinho/itens/${itemId}`, { method: 'PATCH', body: { quantidade } }),

  removerItem: (itemId: string) => api<Carrinho>(`/carrinho/itens/${itemId}`, { method: 'DELETE' }),

  esvaziar: () => api<Carrinho>('/carrinho', { method: 'DELETE' }),
};
