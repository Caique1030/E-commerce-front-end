import type { Metadata } from 'next';
import { MyOrderDetail } from '@/views/MyOrderDetail/MyOrderDetail';

export const metadata: Metadata = { title: 'Pedido' };

export default async function MeuPedidoPage({ params }: PageProps<'/meus-pedidos/[id]'>) {
  const { id } = await params;
  return <MyOrderDetail id={id} />;
}
