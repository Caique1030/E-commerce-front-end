import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PaginaAdmin } from '@/components/admin/chrome-admin';
import { Dashboard, EsqueletoDashboard } from '@/components/admin/dashboard';

export const metadata: Metadata = { title: 'Resumo' };

export default function AdminHomePage() {
  return (
    <PaginaAdmin
      titulo="Resumo da operação"
      descricao="Vendas, pedidos e produtos mais vendidos no período."
    >
      <Suspense fallback={<EsqueletoDashboard />}>
        <Dashboard />
      </Suspense>
    </PaginaAdmin>
  );
}
