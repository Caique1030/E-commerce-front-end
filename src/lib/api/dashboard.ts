import type { ResumoDashboard, TopProduto } from '@/lib/tipos';
import { api } from './cliente';

export const dashboardApi = {
  resumo: (de?: string, ate?: string) =>
    api<ResumoDashboard>('/dashboard/resumo', { query: { de, ate } }),

  topProdutos: (de?: string, ate?: string, limite = 10) =>
    api<TopProduto[]>('/dashboard/top-produtos', { query: { de, ate, limite } }),
};
