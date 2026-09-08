import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PaginaAdmin } from '@/components/admin/chrome-admin';
import { TabelaProdutos } from '@/components/admin/tabela-produtos';
import { EsqueletoTabela } from '@/components/estados/skeletons';

export const metadata: Metadata = { title: 'Produtos' };

export default function AdminProdutosPage() {
  return (
    <PaginaAdmin titulo="Produtos" descricao="Catálogo completo, inclusive itens inativos.">
      <Suspense fallback={<EsqueletoTabela colunas={7} />}>
        <TabelaProdutos />
      </Suspense>
    </PaginaAdmin>
  );
}
