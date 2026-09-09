import type { FiltrosPedido, FiltrosProduto, FiltrosUsuario } from './tipos';

/**
 * Todas as chaves do TanStack Query em um lugar só. Chave espalhada em string literal pelo
 * código é fonte garantida de invalidação errada.
 */
export const qk = {
  produtos: {
    todos: ['produtos'] as const,
    lista: (f: FiltrosProduto) => ['produtos', 'lista', f] as const,
    detalhe: (id: string) => ['produtos', 'detalhe', id] as const,
    disponibilidade: (id: string, data: string) =>
      ['produtos', id, 'disponibilidade', data] as const,
  },
  categorias: {
    todas: ['categorias'] as const,
    arvore: (incluirInativas = false) => ['categorias', 'arvore', { incluirInativas }] as const,
  },
  carrinho: {
    atual: ['carrinho'] as const,
  },
  pedidos: {
    todos: ['pedidos'] as const,
    meus: (f: FiltrosPedido) => ['pedidos', 'meus', f] as const,
    detalhe: (id: string) => ['pedidos', 'detalhe', id] as const,
    admin: (f: FiltrosPedido) => ['pedidos', 'admin', f] as const,
  },
  usuarios: {
    todos: ['usuarios'] as const,
    lista: (f: FiltrosUsuario) => ['usuarios', 'lista', f] as const,
  },
  dashboard: {
    todos: ['dashboard'] as const,
    resumo: (de?: string, ate?: string) => ['dashboard', 'resumo', { de, ate }] as const,
    top: (de?: string, ate?: string, limite = 10) =>
      ['dashboard', 'top', { de, ate, limite }] as const,
  },
};
