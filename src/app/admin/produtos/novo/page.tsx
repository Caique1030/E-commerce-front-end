import type { Metadata } from 'next';
import { AdminProductForm } from '@/views/AdminProductForm/AdminProductForm';

export const metadata: Metadata = { title: 'Novo produto' };

export default function NovoProdutoPage() {
  return <AdminProductForm />;
}
