'use client';

import { useFiltrosCatalogo } from '@/lib/hooks/use-filtros-catalogo';
import { Filters } from '../Filters/Filters';

/** Filtros da barra lateral (desktop). No mobile, o mesmo componente abre num modal. */
export function SidebarFilters() {
  const { filtros, atualizar, limpar, temFiltros } = useFiltrosCatalogo();
  return (
    <Filters filtros={filtros} onUpdate={atualizar} onClear={limpar} hasFilters={temFiltros} />
  );
}
