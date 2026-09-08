import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PaginaAdmin } from '@/components/admin/chrome-admin';
import { TabelaPedidos } from '@/components/admin/tabela-pedidos';
import { EsqueletoTabela } from '@/components/estados/skeletons';

export const metadata: Metadata = { title: 'Pedidos' };

export default function AdminPedidosPage() {
  return (
    <PaginaAdmin
      titulo="Pedidos"
      descricao="Todos os pedidos da loja. Mude o status respeitando o fluxo: pendente → pago → separando → enviado → entregue."
    >
      <Suspense fallback={<EsqueletoTabela colunas={6} />}>
        <TabelaPedidos />
      </Suspense>
    </PaginaAdmin>
  );
}
