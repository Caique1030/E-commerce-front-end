import { QueryClient, defaultShouldDehydrateQuery, isServer } from '@tanstack/react-query';
import { ApiError } from './api/cliente';

/**
 * Configuração única do TanStack Query, usada no servidor (um cliente por requisição) e no
 * navegador (um cliente para a vida da página).
 */
export function criarQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000, // catálogo não muda a cada segundo
        gcTime: 5 * 60_000,
        // Não insiste em 4xx (é erro nosso ou do usuário); tenta de novo em rede/5xx.
        // No servidor não há retry: um prefetch falho não pode segurar a página por segundos.
        retry: (n, erro) =>
          isServer ? false : erro instanceof ApiError && erro.ehClienteError ? false : n < 2,
        refetchOnWindowFocus: false,
      },
      // Nunca repete uma mutação sozinho: um retry de POST /pedidos é um duplo clique involuntário.
      mutations: { retry: false },
      dehydrate: {
        shouldDehydrateQuery: (q) => defaultShouldDehydrateQuery(q) || q.state.status === 'pending',
      },
    },
  });
}

let clienteNavegador: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (isServer) return criarQueryClient();
  clienteNavegador ??= criarQueryClient();
  return clienteNavegador;
}
