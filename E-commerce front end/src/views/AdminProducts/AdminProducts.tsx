import { Suspense } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader/AdminPageHeader';
import { ProductsTable } from '@/components/admin/ProductsTable/ProductsTable';
import { TableSkeleton } from '@/components/estados/Skeletons';
import * as S from './style';

/** Catálogo administrativo; a tabela lê os filtros dos search params, por isso o Suspense. */
export function AdminProducts() {
  return (
    <S.Root>
      <AdminPageHeader title="Produtos" description="Catálogo completo, inclusive itens inativos.">
        <Suspense fallback={<TableSkeleton columns={7} />}>
          <ProductsTable />
        </Suspense>
      </AdminPageHeader>
    </S.Root>
  );
}
