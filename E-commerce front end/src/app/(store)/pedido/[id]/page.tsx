import type { Metadata } from 'next';
import { OrderConfirmation } from '@/views/OrderConfirmation/OrderConfirmation';

export const metadata: Metadata = { title: 'Pedido confirmado' };

export default async function PedidoPage({ params }: PageProps<'/pedido/[id]'>) {
  const { id } = await params;
  return <OrderConfirmation id={id} />;
}
