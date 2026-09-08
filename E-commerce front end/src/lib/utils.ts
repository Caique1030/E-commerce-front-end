import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Junta classes Tailwind resolvendo conflitos (a última vence). */
export function cn(...entradas: ClassValue[]): string {
  return twMerge(clsx(entradas));
}

/** Gera um id curto para toasts e chaves de lista efêmeras. */
export function idCurto(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Slug a partir de um nome: "Móveis & Decoração" → "moveis-decoracao". */
export function gerarSlug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{M}/gu, '') // remove os acentos separados pelo NFD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Só aceita caminhos relativos do próprio site: evita redirecionamento aberto via ?voltar=. */
export function destinoSeguro(valor: string | null | undefined, padrao = '/'): string {
  if (!valor) return padrao;
  if (!valor.startsWith('/') || valor.startsWith('//') || valor.startsWith('/\\')) return padrao;
  return valor;
}

/** Chave de idempotência: uma por tentativa de checkout. */
export function gerarChaveIdempotencia(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${idCurto()}-${idCurto()}`;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function ehUuid(valor: string): boolean {
  return UUID_REGEX.test(valor);
}
