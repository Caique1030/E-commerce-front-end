import { Suspense, type ReactNode } from 'react';
import { CategoryTreeSkeleton } from '@/components/estados/Skeletons';
import { SidebarFilters } from '@/components/produto/SidebarFilters/SidebarFilters';
import { CategoryTree } from '../CategoryTree/CategoryTree';
import * as S from './style';

/**
 * Catálogo primeiro: árvore de categorias à esquerda, grade à direita.
 * No mobile a árvore vai para o menu e os filtros para um modal (ver Catalog).
 */
export function CatalogLayout({ children }: { children: ReactNode }) {
  return (
    <S.Root>
      <S.Sidebar aria-label="Navegação do catálogo">
        <S.SidebarPanel>
          <Suspense fallback={<CategoryTreeSkeleton />}>
            <CategoryTree />
          </Suspense>
          <S.FiltersSection>
            <Suspense fallback={null}>
              <SidebarFilters />
            </Suspense>
          </S.FiltersSection>
        </S.SidebarPanel>
      </S.Sidebar>
      <S.Main>{children}</S.Main>
    </S.Root>
  );
}
