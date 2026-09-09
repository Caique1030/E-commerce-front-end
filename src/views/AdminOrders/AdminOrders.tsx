import { Suspense } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader/AdminPageHeader';
import { OrdersTable } from '@/components/admin/OrdersTable/OrdersTable';
import { TableSkeleton } from '@/components/estados/Skeletons';
import * as S from './style';

/** Todos os pedidos da loja; a tabela lê status e página dos search params, por isso o Suspense. */
export function AdminOrders() {
  return (
    <S.Root>
      <AdminPageHeader
        title="Pedidos"
        description="Todos os pedidos da loja. Mude o status respeitando o fluxo: pendente → pago → separando → enviado → entregue."
      >
        <Suspense fallback={<TableSkeleton columns={6} />}>
          <OrdersTable />
        </Suspense>
      </AdminPageHeader>
    </S.Root>
  );
}
