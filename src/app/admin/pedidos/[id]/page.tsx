import type { Metadata } from 'next';
import { AdminOrderDetail } from '@/views/AdminOrderDetail/AdminOrderDetail';

export const metadata: Metadata = { title: 'Pedido' };

export default async function AdminPedidoPage({ params }: PageProps<'/admin/pedidos/[id]'>) {
  const { id } = await params;
  return <AdminOrderDetail id={id} />;
}
