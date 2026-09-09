import type { Metadata } from 'next';
import { AdminCategories } from '@/views/AdminCategories/AdminCategories';

export const metadata: Metadata = { title: 'Categorias' };

export default function AdminCategoriasPage() {
  return <AdminCategories />;
}
