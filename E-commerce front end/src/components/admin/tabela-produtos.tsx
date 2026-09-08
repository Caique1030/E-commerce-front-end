'use client';

import { CalendarDays, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Erro } from '@/components/estados/erro';
import { EsqueletoTabela } from '@/components/estados/skeletons';
import { Vazio } from '@/components/estados/vazio';
import { Badge } from '@/components/ui/badge';
import { Botao } from '@/components/ui/botao';
import { Caixa, Selecao } from '@/components/ui/campo';
import { ImagemProduto } from '@/components/ui/imagem-produto';
import { Paginacao } from '@/components/ui/paginacao';
import { Tabela, Td, Th } from '@/components/ui/tabela';
import { achatarCategorias } from '@/lib/api/categorias';
import { LIMITE_TABELA } from '@/lib/constantes';
import { centavosParaBRL, formatarInteiro, pluralizar } from '@/lib/formatadores';
import { useArvoreCategorias } from '@/lib/hooks/use-categorias';
import { useChamadaComAtraso } from '@/lib/hooks/use-debounce';
import { useProdutos } from '@/lib/hooks/use-produtos';
import type { TipoProduto } from '@/lib/tipos';
import { cn } from '@/lib/utils';

/** Tabela administrativa de produtos. Filtros na URL, como no catálogo. */
export function TabelaProdutos() {
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
    <div className="flex flex-col gap-4">
      <div className="rounded-card border-borda bg-branco flex flex-wrap items-end gap-3 border px-4 py-3">
        <div className="relative min-w-56 flex-1">
          <label htmlFor="busca-admin" className="sr-only">
            Buscar produtos
          </label>
          <Search
            className="text-suave pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden
          />
          <input
            id="busca-admin"
            type="search"
            value={textoBusca}
            onChange={(e) => {
              setTextoBusca(e.target.value);
              buscarComAtraso(e.target.value);
            }}
            placeholder="Nome, descrição ou marca"
            className="rounded-campo border-borda-forte bg-branco text-corpo focus:border-tinta h-10 w-full border pr-3 pl-9 focus:outline-none"
          />
        </div>
        <label className="text-apoio flex flex-col gap-1">
          <span className="font-medium">Categoria</span>
          <Selecao
            value={categoria}
            onChange={(e) => atualizar({ categoria: e.target.value || undefined })}
            className="min-w-52"
          >
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.slug}>
                {'  '.repeat(c.nivel)}
                {c.nome}
                {c.ativo ? '' : ' (inativa)'}
              </option>
            ))}
          </Selecao>
        </label>
        <label className="text-apoio flex flex-col gap-1">
          <span className="font-medium">Tipo</span>
          <Selecao
            value={tipo}
            onChange={(e) => atualizar({ tipo: e.target.value || undefined })}
            className="min-w-40"
          >
            <option value="">Todos</option>
            <option value="SIMPLE">Produto físico</option>
            <option value="BOOKING">Serviço agendado</option>
          </Selecao>
        </label>
        <Caixa
          rotulo="Incluir inativos"
          checked={inativos}
          onChange={(e) => atualizar({ inativos: e.target.checked ? '1' : undefined })}
          className="pb-2"
        />
        <Botao asChild icone={<Plus className="size-4" aria-hidden />} className="ml-auto">
          <Link href="/admin/produtos/novo">Novo produto</Link>
        </Botao>
      </div>

      {produtos.isPending ? (
        <EsqueletoTabela colunas={7} />
      ) : produtos.isError ? (
        <Erro
          erro={produtos.error}
          titulo="Não foi possível carregar os produtos."
          aoTentarDeNovo={() => void produtos.refetch()}
          tentandoDeNovo={produtos.isFetching}
        />
      ) : produtos.data.data.length === 0 ? (
        <Vazio
          ilustracao="busca"
          titulo="Nenhum produto com esses filtros."
          acao={
            <Botao variante="secundario" onClick={() => router.replace('/admin/produtos')}>
              Limpar filtros
            </Botao>
          }
          compacto
        />
      ) : (
        <>
          <p className="text-apoio text-suave" aria-live="polite">
            {pluralizar(produtos.data.meta.total, 'produto', 'produtos')}
          </p>
          <Tabela className={cn(produtos.isPlaceholderData && 'opacity-60')}>
            <thead>
              <tr>
                <Th className="w-14">
                  <span className="sr-only">Imagem</span>
                </Th>
                <Th>Produto</Th>
                <Th>Categoria</Th>
                <Th>Tipo</Th>
                <Th className="text-right">Preço</Th>
                <Th className="text-right">Estoque</Th>
                <Th>Situação</Th>
                <Th>
                  <span className="sr-only">Ações</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {produtos.data.data.map((p) => (
                <tr key={p.id} className={cn(!p.ativo && 'text-suave')}>
                  <Td className="py-1.5">
                    <div className="rounded-campo border-borda w-12 overflow-hidden border">
                      <ImagemProduto
                        src={p.imagemUrl}
                        nome={p.nome}
                        tipo={p.tipo}
                        duracaoMin={p.duracaoMin}
                        sizes="48px"
                        miniatura
                      />
                    </div>
                  </Td>
                  <Td>
                    <Link
                      href={`/admin/produtos/${p.id}`}
                      className="text-tinta font-medium hover:underline"
                    >
                      {p.nome}
                    </Link>
                    <span className="preco text-micro text-suave block">{p.sku}</span>
                  </Td>
                  <Td className="text-apoio">{p.categoria.nome}</Td>
                  <Td>
                    {p.tipo === 'BOOKING' ? (
                      <Badge
                        variante="agenda"
                        icone={<CalendarDays className="size-3" aria-hidden />}
                      >
                        Agendado
                      </Badge>
                    ) : (
                      <Badge variante="neutro">Físico</Badge>
                    )}
                  </Td>
                  <Td className="preco text-right">{centavosParaBRL(p.precoCentavos)}</Td>
                  <Td
                    className={cn(
                      'preco text-right',
                      p.tipo === 'SIMPLE' && p.estoque === 0 && 'text-alerta',
                    )}
                  >
                    {p.tipo === 'BOOKING' ? '—' : formatarInteiro(p.estoque)}
                  </Td>
                  <Td>
                    {p.ativo ? (
                      <Badge variante="verde">Ativo</Badge>
                    ) : (
                      <Badge variante="alerta">Inativo</Badge>
                    )}
                  </Td>
                  <Td className="text-right">
                    <Link
                      href={`/admin/produtos/${p.id}`}
                      className="text-apoio text-verde-nota font-medium hover:underline"
                    >
                      Editar
                    </Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabela>
          <Paginacao
            pagina={page}
            totalPaginas={produtos.data.meta.totalPages}
            aoMudar={(p) => atualizar({ page: p > 1 ? String(p) : undefined }, true)}
          />
        </>
      )}
    </div>
  );
}
