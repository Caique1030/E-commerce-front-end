'use client';

import { Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState, type FormEvent } from 'react';
import { useChamadaComAtraso } from '@/lib/hooks/use-debounce';
import { filtrosParaQuery, lerFiltrosCatalogo } from '@/lib/schemas/catalogo';
import * as S from './style';

const ATRASO_MS = 400;

function ehPaginaDeCatalogo(pathname: string): boolean {
  return pathname === '/' || pathname.startsWith('/categoria/');
}

/**
 * Busca do cabeçalho. No catálogo, digitar atualiza a URL com 400ms de atraso; em qualquer
 * outra página, Enter leva para a home já filtrada.
 */
export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const naLoja = ehPaginaDeCatalogo(pathname);
  const buscaDaUrl = searchParams.get('busca') ?? '';
  const [valor, setValor] = useState(buscaDaUrl);
  const [urlAnterior, setUrlAnterior] = useState(buscaDaUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincroniza quando a URL muda por fora (voltar do navegador, limpar filtros): ajuste
  // durante o render, sem efeito.
  if (buscaDaUrl !== urlAnterior) {
    setUrlAnterior(buscaDaUrl);
    setValor(buscaDaUrl);
  }

  const aplicarNaUrl = useChamadaComAtraso((texto: string) => {
    const filtros = lerFiltrosCatalogo(new URLSearchParams(window.location.search));
    const proximo = { ...filtros, busca: texto.trim() || undefined, page: 1 };
    router.replace(`${window.location.pathname}${filtrosParaQuery(proximo)}`, { scroll: false });
  }, ATRASO_MS);

  function aoDigitar(texto: string) {
    setValor(texto);
    if (naLoja) aplicarNaUrl(texto);
  }

  function aoEnviar(e: FormEvent) {
    e.preventDefault();
    const texto = valor.trim();
    if (naLoja) {
      aplicarNaUrl(texto);
      return;
    }
    router.push(`/${filtrosParaQuery({ busca: texto || undefined })}`);
  }

  function limpar() {
    setValor('');
    if (naLoja) aplicarNaUrl('');
    inputRef.current?.focus();
  }

  return (
    <S.Root role="search" onSubmit={aoEnviar} className={className}>
      <S.Label htmlFor="busca-loja">Buscar produtos e serviços</S.Label>
      <S.Input
        ref={inputRef}
        id="busca-loja"
        type="search"
        autoComplete="off"
        value={valor}
        onChange={(e) => aoDigitar(e.target.value)}
        placeholder="Buscar produtos, marcas e serviços"
      />
      {valor && (
        <S.ClearButton type="button" onClick={limpar} aria-label="Limpar busca">
          <X size={16} aria-hidden />
        </S.ClearButton>
      )}
      <S.SubmitButton type="submit" aria-label="Buscar">
        <Search size={18} aria-hidden strokeWidth={2} />
      </S.SubmitButton>
    </S.Root>
  );
}
