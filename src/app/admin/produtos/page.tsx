import type { Metadata } from 'next';
import { AdminProducts } from '@/views/AdminProducts/AdminProducts';

export const metadata: Metadata = { title: 'Produtos' };

export default function AdminProdutosPage() {
  return <AdminProducts />;
}
