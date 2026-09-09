import type { Metadata } from 'next';
import { AdminOrders } from '@/views/AdminOrders/AdminOrders';

export const metadata: Metadata = { title: 'Pedidos' };

export default function AdminPedidosPage() {
  return <AdminOrders />;
}
