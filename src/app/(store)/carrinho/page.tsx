import type { Metadata } from 'next';
import { Cart } from '@/views/Cart/Cart';

export const metadata: Metadata = { title: 'Carrinho' };

export default function CarrinhoPage() {
  return <Cart />;
}
