'use client';

import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader/AdminPageHeader';
import { ProductForm } from '@/components/admin/ProductForm/ProductForm';
import { EmptyState } from '@/components/estados/EmptyState';
import { ErrorState } from '@/components/estados/ErrorState';
import { FormSkeleton } from '@/components/estados/Skeletons';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ehApiError } from '@/lib/api/cliente';
import { useProduto } from '@/lib/hooks/use-produtos';
import * as S from './style';

export interface AdminProductFormProps {
  /** Ausente = criação. */
  produtoId?: string;
}

/** Criação e edição de produto: sem id abre o formulário vazio; com id carrega o produto antes. */
export function AdminProductForm({ produtoId }: AdminProductFormProps) {
  if (!produtoId) {
    return (
      <S.Root>
        <AdminPageHeader
          title="Novo produto"
          description="Produto físico com estoque ou serviço com agenda."
        >
          <ProductForm />
        </AdminPageHeader>
      </S.Root>
    );
  }
  return <EditProduct id={produtoId} />;
}

/** Separado para o hook do produto só existir quando há id. */
function EditProduct({ id }: { id: string }) {
  const produto = useProduto(id);

  if (produto.isPending) {
    return (
      <S.Root>
        <AdminPageHeader title="Editar produto">
          <S.FormPanel>
            <FormSkeleton />
          </S.FormPanel>
        </AdminPageHeader>
      </S.Root>
    );
  }
  if (produto.isError) {
    if (ehApiError(produto.error) && produto.error.status === 404) {
      return (
        <EmptyState
          title="Produto não encontrado."
          action={
            <Button as={Link} href="/admin/produtos" variant="secondary">
              Ver produtos
            </Button>
          }
        />
      );
    }
    return (
      <ErrorState
        error={produto.error}
        title="Não foi possível carregar o produto."
        onRetry={() => void produto.refetch()}
        retrying={produto.isFetching}
      />
    );
  }

  const p = produto.data;
  return (
    <S.Root>
      <AdminPageHeader
        title={p.nome}
        description={`SKU ${p.sku}`}
        actions={
          <>
            {p.ativo ? (
              <Badge variant="green">Ativo</Badge>
            ) : (
              <Badge variant="danger">Inativo</Badge>
            )}
            <Button
              as={Link}
              href={`/produto/${p.id}`}
              target="_blank"
              rel="noreferrer"
              variant="secondary"
              size="sm"
            >
              Ver na loja
            </Button>
          </>
        }
      >
        <ProductForm key={p.atualizadoEm} produto={p} />
      </AdminPageHeader>
    </S.Root>
  );
}
