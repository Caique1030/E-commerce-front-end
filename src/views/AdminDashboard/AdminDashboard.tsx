import { Suspense } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader/AdminPageHeader';
import { Dashboard, DashboardSkeleton } from '@/components/admin/Dashboard/Dashboard';
import * as S from './style';

/** Resumo da operação: o Dashboard lê o período dos search params, por isso o Suspense. */
export function AdminDashboard() {
  return (
    <S.Root>
      <AdminPageHeader
        title="Resumo da operação"
        description="Vendas, pedidos e produtos mais vendidos no período."
      >
        <Suspense fallback={<DashboardSkeleton />}>
          <Dashboard />
        </Suspense>
      </AdminPageHeader>
    </S.Root>
  );
}
