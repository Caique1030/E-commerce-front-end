import 'server-only';
import { cache } from 'react';
import { criarQueryClient } from './query-client';

/** Um QueryClient por requisição no servidor: prefetches de um mesmo render compartilham cache. */
export const getQueryClientServidor = cache(() => criarQueryClient());
