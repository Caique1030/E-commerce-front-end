import type { Metadata } from 'next';
import { AdminProductForm } from '@/views/AdminProductForm/AdminProductForm';

export const metadata: Metadata = { title: 'Editar produto' };

export default async function EditarProdutoPage({ params }: PageProps<'/admin/produtos/[id]'>) {
  const { id } = await params;
  return <AdminProductForm produtoId={id} />;
}
