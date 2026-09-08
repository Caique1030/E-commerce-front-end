'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PaginaAdmin } from '@/components/admin/chrome-admin';
import { FormularioProduto } from '@/components/admin/formulario-produto';
import { Erro } from '@/components/estados/erro';
import { EsqueletoFormulario } from '@/components/estados/skeletons';
import { Vazio } from '@/components/estados/vazio';
import { Badge } from '@/components/ui/badge';
import { Botao } from '@/components/ui/botao';
import { ehApiError } from '@/lib/api/cliente';
import { useProduto } from '@/lib/hooks/use-produtos';

export default function EditarProdutoPage() {
  const { id } = useParams<{ id: string }>();
  const produto = useProduto(id);

  if (produto.isPending) {
    return (
      <PaginaAdmin titulo="Editar produto">
        <div className="rounded-card border-borda bg-branco shadow-card border p-5">
          <EsqueletoFormulario />
        </div>
      </PaginaAdmin>
    );
  }
  if (produto.isError) {
    if (ehApiError(produto.error) && produto.error.status === 404) {
      return (
        <Vazio
          titulo="Produto não encontrado."
          acao={
            <Botao asChild variante="secundario">
              <Link href="/admin/produtos">Ver produtos</Link>
            </Botao>
          }
        />
      );
    }
    return (
      <Erro
        erro={produto.error}
        titulo="Não foi possível carregar o produto."
        aoTentarDeNovo={() => void produto.refetch()}
        tentandoDeNovo={produto.isFetching}
      />
    );
  }

  const p = produto.data;
  return (
    <PaginaAdmin
      titulo={p.nome}
      descricao={`SKU ${p.sku}`}
      acoes={
        <>
          {p.ativo ? (
            <Badge variante="verde">Ativo</Badge>
          ) : (
            <Badge variante="alerta">Inativo</Badge>
          )}
          <Botao asChild variante="secundario" tamanho="sm">
            <Link href={`/produto/${p.id}`} target="_blank" rel="noreferrer">
              Ver na loja
            </Link>
          </Botao>
        </>
      }
    >
      <FormularioProduto key={p.atualizadoEm} produto={p} />
    </PaginaAdmin>
  );
}
