'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import {
  filtrosParaApi,
  filtrosParaQuery,
  lerFiltrosCatalogo,
  temFiltrosAtivos,
  type FiltrosCatalogo,
} from '@/lib/schemas/catalogo';

/**
 * Filtros do catálogo vivem na URL: link compartilhável, botão voltar funcionando e
 * recarregamento preservando o contexto, sem estado global.
 */
export function useFiltrosCatalogo(categoriaFixa?: string) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filtros = useMemo(() => lerFiltrosCatalogo(searchParams), [searchParams]);
  const filtrosApi = useMemo(
    () => filtrosParaApi(filtros, categoriaFixa),
    [filtros, categoriaFixa],
  );

  /** Mudança de filtro volta para a página 1 e substitui a entrada do histórico. */
  const atualizar = useCallback(
    (mudancas: Partial<FiltrosCatalogo>) => {
      const proximo = { ...filtros, ...mudancas, page: 1 };
      router.replace(`${pathname}${filtrosParaQuery(proximo)}`, { scroll: false });
    },
    [filtros, pathname, router],
  );

  /** Mudança de página entra no histórico e rola para o topo da grade. */
  const mudarPagina = useCallback(
    (page: number) => {
      router.push(`${pathname}${filtrosParaQuery({ ...filtros, page })}`, { scroll: true });
    },
    [filtros, pathname, router],
  );

  const limpar = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  return {
    filtros,
    filtrosApi,
    atualizar,
    mudarPagina,
    limpar,
    temFiltros: temFiltrosAtivos(filtros),
  };
}
