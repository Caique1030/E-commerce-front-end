import type { Metadata } from 'next';
import { MyOrders } from '@/views/MyOrders/MyOrders';

export const metadata: Metadata = { title: 'Meus pedidos' };

export default function MeusPedidosPage() {
  return <MyOrders />;
}
