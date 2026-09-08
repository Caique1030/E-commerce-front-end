import type { Metadata } from 'next';
import { PaginaAdmin } from '@/components/admin/chrome-admin';
import { GerenciarCategorias } from '@/components/admin/gerenciar-categorias';

export const metadata: Metadata = { title: 'Categorias' };

export default function AdminCategoriasPage() {
  return (
    <PaginaAdmin
      titulo="Categorias"
      descricao="Árvore de dois níveis. A ordem aqui é a ordem da loja."
    >
      <GerenciarCategorias />
    </PaginaAdmin>
  );
}
