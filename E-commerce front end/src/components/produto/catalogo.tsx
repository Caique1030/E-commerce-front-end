'use client';

import { SlidersHorizontal, X } from 'lucide-react';
import { Erro } from '@/components/estados/erro';
import { EsqueletoGrade } from '@/components/estados/skeletons';
import { Vazio } from '@/components/estados/vazio';
import { Botao } from '@/components/ui/botao';
import { DialogRaiz, ModalConteudo } from '@/components/ui/dialog';
import { Paginacao } from '@/components/ui/paginacao';
import { Select } from '@/components/ui/select';
import { OPCOES_ORDENACAO, type ValorOrdenacao } from '@/lib/constantes';
import { pluralizar } from '@/lib/formatadores';
import { useFiltrosCatalogo } from '@/lib/hooks/use-filtros-catalogo';
import { useProdutos } from '@/lib/hooks/use-produtos';
import { useUiStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';
import { Filtros } from './filtros';
import { GradeProdutos } from './grade-produtos';

interface CatalogoProps {
  titulo: string;
  /** Slug vindo da rota /categoria/[slug]; a URL não carrega `categoria` nesse caso. */
  categoriaFixa?: string;
  descricao?: string;
}

/** Catálogo completo: barra de resultados, chips de filtro, grade com os quatro estados e paginação. */
export function Catalogo({ titulo, categoriaFixa, descricao }: CatalogoProps) {
  const { filtros, filtrosApi, atualizar, mudarPagina, limpar, temFiltros } =
    useFiltrosCatalogo(categoriaFixa);
  const consulta = useProdutos(filtrosApi);
  const filtrosMobile = useUiStore((s) => s.filtrosMobileAbertos);
  const definirFiltrosMobile = useUiStore((s) => s.definirFiltrosMobile);
  const abrirMenu = useUiStore((s) => s.definirMenuMobile);

  const total = consulta.data?.meta.total ?? 0;
  const totalPaginas = consulta.data?.meta.totalPages ?? 1;

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
    <section aria-labelledby="titulo-catalogo" className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div>
            <h1 id="titulo-catalogo" className={cn(categoriaFixa ? 'text-h1' : 'titulo-display')}>
              {titulo}
            </h1>
            {descricao && <p className="text-corpo text-suave mt-1">{descricao}</p>}
          </div>
          <p className="preco text-apoio text-suave" aria-live="polite">
            {consulta.isPending
              ? 'Carregando…'
              : consulta.isError
                ? ''
                : pluralizar(total, 'item', 'itens')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-2 lg:hidden">
            <Botao variante="secundario" tamanho="sm" onClick={() => abrirMenu(true)}>
              Categorias
            </Botao>
            <DialogRaiz open={filtrosMobile} onOpenChange={definirFiltrosMobile}>
              <Botao
                variante="secundario"
                tamanho="sm"
                icone={<SlidersHorizontal className="size-4" aria-hidden />}
                onClick={() => definirFiltrosMobile(true)}
              >
                Filtros
              </Botao>
              <ModalConteudo
                titulo="Filtros"
                descricao="Tipo de item e faixa de preço"
                descricaoOculta
              >
                <Filtros
                  filtros={filtros}
                  aoAtualizar={atualizar}
                  aoLimpar={limpar}
                  temFiltros={temFiltros}
                  aoAplicar={() => definirFiltrosMobile(false)}
                />
              </ModalConteudo>
            </DialogRaiz>
          </div>

          {chips.map((c) => (
            <button
              key={c.rotulo}
              type="button"
              onClick={c.remover}
              className="border-borda-forte bg-branco text-apoio hover:border-tinta inline-flex h-8 items-center gap-1 rounded-full border pr-2 pl-3"
              aria-label={`Remover filtro ${c.rotulo}`}
            >
              {c.rotulo}
              <X className="text-suave size-3.5" aria-hidden />
            </button>
          ))}
          {chips.length > 1 && (
            <Botao variante="link" tamanho="sm" onClick={limpar}>
              Limpar filtros
            </Botao>
          )}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-apoio text-suave hidden sm:inline" id="rotulo-ordenar">
              Ordenar por
            </span>
            <Select<ValorOrdenacao>
              valor={filtros.ordenar}
              aoMudar={(v) => atualizar({ ordenar: v })}
              opcoes={OPCOES_ORDENACAO}
              rotuloAcessivel="Ordenar produtos"
              tamanho="sm"
              className="min-w-40"
            />
          </div>
        </div>
      </div>

      {consulta.isPending ? (
        <EsqueletoGrade />
      ) : consulta.isError ? (
        <Erro
          erro={consulta.error}
          titulo="Não foi possível carregar os produtos."
          aoTentarDeNovo={() => void consulta.refetch()}
          tentandoDeNovo={consulta.isFetching}
        />
      ) : consulta.data.data.length === 0 ? (
        <Vazio
          ilustracao="busca"
          titulo={
            filtros.busca
              ? `Nenhum produto encontrado para “${filtros.busca}”.`
              : 'Nenhum produto por aqui.'
          }
          descricao={
            temFiltros ? 'Tente outro termo ou remova os filtros.' : 'Explore outras categorias.'
          }
          acao={
            temFiltros ? (
              <Botao variante="secundario" onClick={limpar}>
                Limpar filtros
              </Botao>
            ) : undefined
          }
        />
      ) : (
        <div
          className={cn(
            'flex flex-col gap-6 transition-opacity',
            consulta.isPlaceholderData && 'opacity-60',
          )}
          aria-busy={consulta.isPlaceholderData || undefined}
        >
          <GradeProdutos produtos={consulta.data.data} primeiraPagina={filtros.page === 1} />
          <Paginacao
            pagina={filtros.page}
            totalPaginas={totalPaginas}
            aoMudar={mudarPagina}
            className="justify-center"
          />
        </div>
      )}
    </section>
  );
}
