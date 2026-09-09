'use client';

import { CalendarDays, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ErrorState } from '@/components/estados/ErrorState';
import { TableSkeleton } from '@/components/estados/Skeletons';
import { EmptyState } from '@/components/estados/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Checkbox, NativeSelect } from '@/components/ui/Field';
import { ProductImage } from '@/components/ui/ProductImage';
import { Pagination } from '@/components/ui/Pagination';
import { Table, Td, Th } from '@/components/ui/Table';
import { achatarCategorias } from '@/lib/api/categorias';
import { LIMITE_TABELA } from '@/lib/constantes';
import { centavosParaBRL, formatarInteiro, pluralizar } from '@/lib/formatadores';
import { useArvoreCategorias } from '@/lib/hooks/use-categorias';
import { useChamadaComAtraso } from '@/lib/hooks/use-debounce';
import { useProdutos } from '@/lib/hooks/use-produtos';
import type { TipoProduto } from '@/lib/tipos';
import { VisuallyHidden } from '@/styles/primitives';
import * as S from './style';

/** Tabela administrativa de produtos. Filtros na URL, como no catálogo. */
export function ProductsTable() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const busca = searchParams.get('busca') ?? '';
  const categoria = searchParams.get('categoria') ?? '';
  const tipo = (searchParams.get('tipo') as TipoProduto | null) ?? '';
  const inativos = searchParams.get('inativos') === '1';
  const page = Math.max(1, Number(searchParams.get('page') ?? 1) || 1);

  const [textoBusca, setTextoBusca] = useState(busca);
  const [buscaAnterior, setBuscaAnterior] = useState(busca);
  if (busca !== buscaAnterior) {
    setBuscaAnterior(busca);
    setTextoBusca(busca);
  }

  function atualizar(mudancas: Record<string, string | undefined>, manterPagina = false) {
    const q = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(mudancas)) {
      if (v) q.set(k, v);
      else q.delete(k);
    }
    if (!manterPagina) q.delete('page');
    const s = q.toString();
    router.replace(s ? `/admin/produtos?${s}` : '/admin/produtos', { scroll: false });
  }
  const buscarComAtraso = useChamadaComAtraso(
    (v: string) => atualizar({ busca: v.trim() || undefined }),
    400,
  );

  const produtos = useProdutos({
    busca: busca || undefined,
    categoria: categoria || undefined,
    tipo: tipo || undefined,
    incluirInativos: inativos || undefined,
    ordenar: 'nome',
    page,
    limit: LIMITE_TABELA,
  });
  const arvore = useArvoreCategorias(true);
  const categorias = arvore.data ? achatarCategorias(arvore.data) : [];

  return (
    <S.Root>
      <S.FilterBar>
        <S.SearchBox>
          <S.SearchLabel htmlFor="busca-admin">Buscar produtos</S.SearchLabel>
          <S.SearchIcon aria-hidden>
            <Search size={16} />
          </S.SearchIcon>
          <S.SearchInput
            id="busca-admin"
            type="search"
            value={textoBusca}
            onChange={(e) => {
              setTextoBusca(e.target.value);
              buscarComAtraso(e.target.value);
            }}
            placeholder="Nome, descrição ou marca"
          />
        </S.SearchBox>
        <S.FilterLabel>
          <S.FilterCaption>Categoria</S.FilterCaption>
          <NativeSelect
            value={categoria}
            onChange={(e) => atualizar({ categoria: e.target.value || undefined })}
            className="min-w-52"
          >
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.slug}>
                {'  '.repeat(c.nivel)}
                {c.nome}
                {c.ativo ? '' : ' (inativa)'}
              </option>
            ))}
          </NativeSelect>
        </S.FilterLabel>
        <S.FilterLabel>
          <S.FilterCaption>Tipo</S.FilterCaption>
          <NativeSelect
            value={tipo}
            onChange={(e) => atualizar({ tipo: e.target.value || undefined })}
            className="min-w-40"
          >
            <option value="">Todos</option>
            <option value="SIMPLE">Produto físico</option>
            <option value="BOOKING">Serviço agendado</option>
          </NativeSelect>
        </S.FilterLabel>
        <Checkbox
          label="Incluir inativos"
          checked={inativos}
          onChange={(e) => atualizar({ inativos: e.target.checked ? '1' : undefined })}
          className="pb-2"
        />
        <Button
          as={Link}
          href="/admin/produtos/novo"
          icon={<Plus size={16} aria-hidden />}
          className="ml-auto"
        >
          Novo produto
        </Button>
      </S.FilterBar>

      {produtos.isPending ? (
        <TableSkeleton columns={7} />
      ) : produtos.isError ? (
        <ErrorState
          error={produtos.error}
          title="Não foi possível carregar os produtos."
          onRetry={() => void produtos.refetch()}
          retrying={produtos.isFetching}
        />
      ) : produtos.data.data.length === 0 ? (
        <EmptyState
          illustration="search"
          title="Nenhum produto com esses filtros."
          action={
            <Button variant="secondary" onClick={() => router.replace('/admin/produtos')}>
              Limpar filtros
            </Button>
          }
          compact
        />
      ) : (
        <>
          <S.Count aria-live="polite">
            {pluralizar(produtos.data.meta.total, 'produto', 'produtos')}
          </S.Count>
          <Table className={produtos.isPlaceholderData ? 'opacity-60' : undefined}>
            <thead>
              <tr>
                <Th className="w-14">
                  <VisuallyHidden>Imagem</VisuallyHidden>
                </Th>
                <Th>Produto</Th>
                <Th>Categoria</Th>
                <Th>Tipo</Th>
                <Th className="text-right">Preço</Th>
                <Th className="text-right">Estoque</Th>
                <Th>Situação</Th>
                <Th>
                  <VisuallyHidden>Ações</VisuallyHidden>
                </Th>
              </tr>
            </thead>
            <tbody>
              {produtos.data.data.map((p) => (
                <S.Row key={p.id} $inactive={!p.ativo}>
                  <Td className="py-1.5">
                    <S.Thumb>
                      <ProductImage
                        src={p.imagemUrl}
                        nome={p.nome}
                        tipo={p.tipo}
                        duracaoMin={p.duracaoMin}
                        sizes="48px"
                        thumbnail
                      />
                    </S.Thumb>
                  </Td>
                  <Td>
                    <S.NameLink href={`/admin/produtos/${p.id}`}>{p.nome}</S.NameLink>
                    <S.Sku>{p.sku}</S.Sku>
                  </Td>
                  <Td>
                    <S.CategoryName>{p.categoria.nome}</S.CategoryName>
                  </Td>
                  <Td>
                    {p.tipo === 'BOOKING' ? (
                      <Badge variant="schedule" icon={<CalendarDays size={12} aria-hidden />}>
                        Agendado
                      </Badge>
                    ) : (
                      <Badge variant="neutral">Físico</Badge>
                    )}
                  </Td>
                  <Td className="preco text-right">{centavosParaBRL(p.precoCentavos)}</Td>
                  <Td className="preco text-right">
                    <S.Stock $out={p.tipo === 'SIMPLE' && p.estoque === 0}>
                      {p.tipo === 'BOOKING' ? '—' : formatarInteiro(p.estoque)}
                    </S.Stock>
                  </Td>
                  <Td>
                    {p.ativo ? (
                      <Badge variant="green">Ativo</Badge>
                    ) : (
                      <Badge variant="danger">Inativo</Badge>
                    )}
                  </Td>
                  <Td className="text-right">
                    <S.EditLink href={`/admin/produtos/${p.id}`}>Editar</S.EditLink>
                  </Td>
                </S.Row>
              ))}
            </tbody>
          </Table>
          <Pagination
            page={page}
            totalPages={produtos.data.meta.totalPages}
            onChange={(p) => atualizar({ page: p > 1 ? String(p) : undefined }, true)}
          />
        </>
      )}
    </S.Root>
  );
}
