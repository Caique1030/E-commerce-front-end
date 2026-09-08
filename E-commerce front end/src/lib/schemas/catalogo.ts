import { z } from 'zod';
import { LIMITE_CATALOGO, OPCOES_ORDENACAO, type ValorOrdenacao } from '@/lib/constantes';
import type { Direcao, FiltrosProduto, Ordenacao } from '@/lib/tipos';
import { TipoProdutoEnum } from './enums';

/**
 * Filtros do catálogo vivem na URL (/?busca=fone&categoria=eletronicos&precoMin=100&page=2).
 * Na URL o preço é em reais (legível); para a API vira centavos.
 */
const numeroReais = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() !== '' ? Number(v.replace(',', '.')) : undefined),
  z.number().min(0).optional(),
);

const valoresOrdenacao = OPCOES_ORDENACAO.map((o) => o.valor) as [
  ValorOrdenacao,
  ...ValorOrdenacao[],
];

export const filtrosCatalogoSchema = z.object({
  busca: z.string().trim().max(100).optional(),
  categoria: z.string().trim().max(80).optional(),
  tipo: TipoProdutoEnum.optional(),
  precoMin: numeroReais,
  precoMax: numeroReais,
  ordenar: z.enum(valoresOrdenacao).catch('recente'),
  page: z.coerce.number().int().min(1).catch(1),
});

export type FiltrosCatalogo = z.infer<typeof filtrosCatalogoSchema>;

type EntradaParams = Record<string, string | string[] | undefined> | URLSearchParams;

function primeiro(v: string | string[] | undefined | null): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v ?? undefined;
}

const forma = filtrosCatalogoSchema.shape;

function campo<K extends keyof typeof forma>(
  chave: K,
  valor: unknown,
): z.infer<(typeof forma)[K]> | undefined {
  const r = forma[chave].safeParse(valor);
  return r.success ? (r.data as z.infer<(typeof forma)[K]>) : undefined;
}

/**
 * Aceita tanto `searchParams` de página quanto `URLSearchParams` do cliente.
 * Cada campo é validado sozinho: um valor inválido (ex.: precoMax=abc) é ignorado sem derrubar os outros.
 */
export function lerFiltrosCatalogo(params: EntradaParams): FiltrosCatalogo {
  const obter = (k: string) =>
    params instanceof URLSearchParams ? (params.get(k) ?? undefined) : primeiro(params[k]);
  return {
    busca: campo('busca', obter('busca') || undefined),
    categoria: campo('categoria', obter('categoria') || undefined),
    tipo: campo('tipo', obter('tipo') || undefined),
    precoMin: campo('precoMin', obter('precoMin')),
    precoMax: campo('precoMax', obter('precoMax')),
    ordenar: campo('ordenar', obter('ordenar')) ?? 'recente',
    page: campo('page', obter('page')) ?? 1,
  };
}

/** Filtros da URL → filtros da API (centavos, ordenação e direção separadas). */
export function filtrosParaApi(f: FiltrosCatalogo, categoriaFixa?: string): FiltrosProduto {
  const [ordenar, direcao] = f.ordenar.split('-') as [Ordenacao, Direcao | undefined];
  return {
    busca: f.busca,
    categoria: categoriaFixa ?? f.categoria,
    tipo: f.tipo,
    precoMin: f.precoMin !== undefined ? Math.round(f.precoMin * 100) : undefined,
    precoMax: f.precoMax !== undefined ? Math.round(f.precoMax * 100) : undefined,
    ordenar,
    direcao,
    page: f.page,
    limit: LIMITE_CATALOGO,
  };
}

/** Filtros → query string enxuta (omite padrões) para manter a URL limpa e compartilhável. */
export function filtrosParaQuery(f: Partial<FiltrosCatalogo>): string {
  const p = new URLSearchParams();
  if (f.busca) p.set('busca', f.busca);
  if (f.categoria) p.set('categoria', f.categoria);
  if (f.tipo) p.set('tipo', f.tipo);
  if (f.precoMin !== undefined) p.set('precoMin', String(f.precoMin));
  if (f.precoMax !== undefined) p.set('precoMax', String(f.precoMax));
  if (f.ordenar && f.ordenar !== 'recente') p.set('ordenar', f.ordenar);
  if (f.page && f.page > 1) p.set('page', String(f.page));
  const s = p.toString();
  return s ? `?${s}` : '';
}

export function temFiltrosAtivos(f: FiltrosCatalogo): boolean {
  return !!(f.busca || f.tipo || f.precoMin !== undefined || f.precoMax !== undefined);
}
