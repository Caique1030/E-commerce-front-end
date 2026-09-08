'use client';

import { Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState, type FormEvent } from 'react';
import { useChamadaComAtraso } from '@/lib/hooks/use-debounce';
import { filtrosParaQuery, lerFiltrosCatalogo } from '@/lib/schemas/catalogo';
import { cn } from '@/lib/utils';

const ATRASO_MS = 400;

function ehPaginaDeCatalogo(pathname: string): boolean {
  return pathname === '/' || pathname.startsWith('/categoria/');
}

/**
 * Busca do cabeçalho. No catálogo, digitar atualiza a URL com 400ms de atraso; em qualquer
 * outra página, Enter leva para a home já filtrada.
 */
export function Busca({ className }: { className?: string }) {
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
    <form
      role="search"
      onSubmit={aoEnviar}
      className={cn(
        'rounded-campo bg-branco shadow-card focus-within:ring-acao/40 flex h-10 items-center focus-within:ring-2',
        className,
      )}
    >
      <label htmlFor="busca-loja" className="sr-only">
        Buscar produtos e serviços
      </label>
      <input
        ref={inputRef}
        id="busca-loja"
        type="search"
        autoComplete="off"
        value={valor}
        onChange={(e) => aoDigitar(e.target.value)}
        placeholder="Buscar produtos, marcas e serviços"
        className="text-corpo text-tinta placeholder:text-suave h-full min-w-0 flex-1 bg-transparent pr-2 pl-4 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {valor && (
        <button
          type="button"
          onClick={limpar}
          className="rounded-campo text-suave hover:bg-papel-2 hover:text-tinta mr-1 p-1"
          aria-label="Limpar busca"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
      <button
        type="submit"
        className="border-borda text-suave hover:text-acao flex h-6 w-11 items-center justify-center border-l"
        aria-label="Buscar"
      >
        <Search className="size-[18px]" aria-hidden strokeWidth={2} />
      </button>
    </form>
  );
}
