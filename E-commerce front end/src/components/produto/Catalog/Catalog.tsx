'use client';

import { SlidersHorizontal, X } from 'lucide-react';
import { EmptyState } from '@/components/estados/EmptyState';
import { ErrorState } from '@/components/estados/ErrorState';
import { ProductGridSkeleton } from '@/components/estados/Skeletons';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Dialog';
import { Pagination } from '@/components/ui/Pagination';
import { Select, type SelectOption } from '@/components/ui/Select';
import { OPCOES_ORDENACAO, type ValorOrdenacao } from '@/lib/constantes';
import { pluralizar } from '@/lib/formatadores';
import { useFiltrosCatalogo } from '@/lib/hooks/use-filtros-catalogo';
import { useProdutos } from '@/lib/hooks/use-produtos';
import { useUiStore } from '@/stores/ui-store';
import { Filters } from '../Filters/Filters';
import { ProductGrid } from '../ProductGrid/ProductGrid';
import * as S from './style';

/** As opções de ordenação (compartilhadas com os schemas) no formato do Select. */
const OPCOES_SELECT_ORDENACAO: SelectOption<ValorOrdenacao>[] = OPCOES_ORDENACAO.map((o) => ({
  value: o.valor,
  label: o.rotulo,
}));

interface CatalogProps {
  title: string;
  /** Slug vindo da rota /categoria/[slug]; a URL não carrega `categoria` nesse caso. */
  fixedCategory?: string;
  description?: string;
  /** Na home a vitrine vem antes: ali o título da grade é h2, não o título da página. */
  titleLevel?: 1 | 2;
}

/** Catálogo completo: barra de resultados, chips de filtro, grade com os quatro estados e paginação. */
export function Catalog({ title, fixedCategory, description, titleLevel = 1 }: CatalogProps) {
  const { filtros, filtrosApi, atualizar, mudarPagina, limpar, temFiltros } =
    useFiltrosCatalogo(fixedCategory);
  const consulta = useProdutos(filtrosApi);
  const filtrosMobile = useUiStore((s) => s.filtrosMobileAbertos);
  const definirFiltrosMobile = useUiStore((s) => s.definirFiltrosMobile);
  const abrirMenu = useUiStore((s) => s.definirMenuMobile);

  const total = consulta.data?.meta.total ?? 0;
  const totalPaginas = consulta.data?.meta.totalPages ?? 1;
  // Título da página (nível 1) sem categoria fixa: escala display, via classe global.
  const tituloDisplay = titleLevel === 1 && !fixedCategory;

  const chips: { rotulo: string; remover: () => void }[] = [];
  if (filtros.busca)
    chips.push({ rotulo: `“${filtros.busca}”`, remover: () => atualizar({ busca: undefined }) });
  if (filtros.tipo) {
    chips.push({
      rotulo: filtros.tipo === 'BOOKING' ? 'Serviços agendados' : 'Produtos',
      remover: () => atualizar({ tipo: undefined }),
    });
  }
  if (filtros.precoMin !== undefined || filtros.precoMax !== undefined) {
    const partes = [
      filtros.precoMin !== undefined ? `de R$ ${filtros.precoMin}` : null,
      filtros.precoMax !== undefined ? `até R$ ${filtros.precoMax}` : null,
    ].filter(Boolean);
    chips.push({
      rotulo: partes.join(' '),
      remover: () => atualizar({ precoMin: undefined, precoMax: undefined }),
    });
  }

  return (
    <S.Root aria-labelledby="title-catalogo">
      <S.Header>
        <S.TitleRow>
          <div>
            <S.Title
              as={titleLevel === 1 ? 'h1' : 'h2'}
              id="title-catalogo"
              $display={tituloDisplay}
              className={tituloDisplay ? 'titulo-display' : undefined}
            >
              {title}
            </S.Title>
            {description && <S.Description>{description}</S.Description>}
          </div>
          <S.Count aria-live="polite">
            {consulta.isPending
              ? 'Carregando…'
              : consulta.isError
                ? ''
                : pluralizar(total, 'item', 'itens')}
          </S.Count>
        </S.TitleRow>

        <S.Toolbar>
          <S.MobileActions>
            <Button variant="secondary" size="sm" onClick={() => abrirMenu(true)}>
              Categorias
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<SlidersHorizontal size={16} aria-hidden />}
              onClick={() => definirFiltrosMobile(true)}
            >
              Filtros
            </Button>
            <Modal
              open={filtrosMobile}
              onOpenChange={definirFiltrosMobile}
              title="Filtros"
              description="Tipo de item e faixa de preço"
              descriptionHidden
            >
              <Filters
                filtros={filtros}
                onUpdate={atualizar}
                onClear={limpar}
                hasFilters={temFiltros}
                onApply={() => definirFiltrosMobile(false)}
              />
            </Modal>
          </S.MobileActions>

          {chips.map((c) => (
            <S.Chip
              key={c.rotulo}
              type="button"
              onClick={c.remover}
              aria-label={`Remover filtro ${c.rotulo}`}
            >
              {c.rotulo}
              <X size={14} aria-hidden />
            </S.Chip>
          ))}
          {chips.length > 1 && (
            <Button variant="link" size="sm" onClick={limpar}>
              Limpar filtros
            </Button>
          )}

          <S.SortGroup>
            <S.SortLabel id="rotulo-ordenar">Ordenar por</S.SortLabel>
            <Select<ValorOrdenacao>
              value={filtros.ordenar}
              onChange={(v) => atualizar({ ordenar: v })}
              options={OPCOES_SELECT_ORDENACAO}
              ariaLabel="Ordenar produtos"
              size="sm"
              className="min-w-40"
            />
          </S.SortGroup>
        </S.Toolbar>
      </S.Header>

      {consulta.isPending ? (
        <ProductGridSkeleton />
      ) : consulta.isError ? (
        <ErrorState
          error={consulta.error}
          title="Não foi possível carregar os produtos."
          onRetry={() => void consulta.refetch()}
          retrying={consulta.isFetching}
        />
      ) : consulta.data.data.length === 0 ? (
        <S.EmptyPanel>
          <EmptyState
            illustration="search"
            title={
              filtros.busca
                ? `Nenhum produto encontrado para “${filtros.busca}”.`
                : 'Nenhum produto por aqui.'
            }
            description={
              temFiltros ? 'Tente outro termo ou remova os filtros.' : 'Explore outras categorias.'
            }
            action={
              temFiltros ? (
                <Button variant="secondary" onClick={limpar}>
                  Limpar filtros
                </Button>
              ) : undefined
            }
          />
        </S.EmptyPanel>
      ) : (
        <S.Results
          $dimmed={!!consulta.isPlaceholderData}
          aria-busy={consulta.isPlaceholderData || undefined}
        >
          <ProductGrid produtos={consulta.data.data} firstPage={filtros.page === 1} />
          <Pagination
            page={filtros.page}
            totalPages={totalPaginas}
            onChange={mudarPagina}
            className="justify-center"
          />
        </S.Results>
      )}
    </S.Root>
  );
}
