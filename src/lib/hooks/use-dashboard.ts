'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard';
import { qk } from '@/lib/query-keys';
import { useSessao } from '@/providers/sessao-provider';

export function useResumoDashboard(de?: string, ate?: string) {
  const { status, ehEquipe } = useSessao();
  return useQuery({
    queryKey: qk.dashboard.resumo(de, ate),
    queryFn: () => dashboardApi.resumo(de, ate),
    enabled: status === 'autenticado' && ehEquipe,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useTopProdutos(de?: string, ate?: string, limite = 10) {
  const { status, ehEquipe } = useSessao();
  return useQuery({
    queryKey: qk.dashboard.top(de, ate, limite),
    queryFn: () => dashboardApi.topProdutos(de, ate, limite),
    enabled: status === 'autenticado' && ehEquipe,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
