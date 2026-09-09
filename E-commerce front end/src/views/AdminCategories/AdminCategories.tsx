import { AdminPageHeader } from '@/components/admin/AdminPageHeader/AdminPageHeader';
import { CategoryManager } from '@/components/admin/CategoryManager/CategoryManager';
import * as S from './style';

/** Árvore de categorias com criar, renomear, reordenar, desativar e excluir. */
export function AdminCategories() {
  return (
    <S.Root>
      <AdminPageHeader
        title="Categorias"
        description="Árvore de dois níveis. A ordem aqui é a ordem da loja."
      >
        <CategoryManager />
      </AdminPageHeader>
    </S.Root>
  );
}
