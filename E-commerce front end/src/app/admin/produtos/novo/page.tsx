import type { Metadata } from 'next';
import { PaginaAdmin } from '@/components/admin/chrome-admin';
import { FormularioProduto } from '@/components/admin/formulario-produto';

export const metadata: Metadata = { title: 'Novo produto' };

export default function NovoProdutoPage() {
  return (
    <PaginaAdmin
      titulo="Novo produto"
      descricao="Produto físico com estoque ou serviço com agenda."
    >
      <FormularioProduto />
    </PaginaAdmin>
  );
}
