import type { Metadata } from 'next';
import { Checkout } from '@/views/Checkout/Checkout';

export const metadata: Metadata = { title: 'Finalizar compra' };

export default function CheckoutPage() {
  return <Checkout />;
}
