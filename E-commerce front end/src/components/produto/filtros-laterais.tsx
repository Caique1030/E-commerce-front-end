'use client';

import { useFiltrosCatalogo } from '@/lib/hooks/use-filtros-catalogo';
import { Filtros } from './filtros';

/** Filtros da barra lateral (desktop). No mobile, o mesmo componente abre num modal. */
export function FiltrosLaterais() {
  const { filtros, atualizar, limpar, temFiltros } = useFiltrosCatalogo();
  return (
    <Filtros filtros={filtros} aoAtualizar={atualizar} aoLimpar={limpar} temFiltros={temFiltros} />
  );
}
