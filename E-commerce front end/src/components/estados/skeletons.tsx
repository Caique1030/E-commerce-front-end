import { Esqueleto } from '@/components/ui/esqueleto';
import { cn } from '@/lib/utils';

/** Esqueletos com a forma real de cada tela. */

export function EsqueletoCardProduto() {
  return (
    <div className="rounded-card bg-branco shadow-card flex flex-col overflow-hidden">
      <Esqueleto className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-2 p-3">
        <Esqueleto className="h-3 w-16" />
        <Esqueleto className="h-4 w-4/5" />
        <Esqueleto className="h-4 w-3/5" />
        <Esqueleto className="mt-2 h-7 w-28" />
        <Esqueleto className="h-3 w-24" />
        <Esqueleto className="mt-2 h-10 w-full" />
      </div>
    </div>
  );
}

export function EsqueletoGrade({
  quantidade = 8,
  className,
}: {
  quantidade?: number;
  className?: string;
}) {
  return (
    <div
      className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4', className)}
      aria-busy
      aria-label="Carregando produtos"
    >
      {Array.from({ length: quantidade }, (_, i) => (
        <EsqueletoCardProduto key={i} />
      ))}
    </div>
  );
}

export function EsqueletoArvore() {
  return (
    <div className="flex flex-col gap-3 py-1" aria-hidden>
      {Array.from({ length: 9 }, (_, i) => (
        <Esqueleto key={i} className={cn('h-4', i % 3 === 0 ? 'w-32' : 'ml-3 w-24')} />
      ))}
    </div>
  );
}

export function EsqueletoDetalheProduto() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]" aria-busy>
      <Esqueleto className="aspect-[4/3] w-full" />
      <div className="flex flex-col gap-3">
        <Esqueleto className="h-3 w-24" />
        <Esqueleto className="h-7 w-4/5" />
        <Esqueleto className="h-7 w-3/5" />
        <Esqueleto className="mt-3 h-7 w-32" />
        <Esqueleto className="h-4 w-24" />
        <Esqueleto className="mt-4 h-12 w-full" />
        <Esqueleto className="mt-6 h-4 w-full" />
        <Esqueleto className="h-4 w-full" />
        <Esqueleto className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function EsqueletoLinhaCarrinho() {
  return (
    <div className="flex gap-3 py-4" aria-hidden>
      <Esqueleto className="h-16 w-20 shrink-0" />
      <div className="flex flex-1 flex-col gap-2">
        <Esqueleto className="h-4 w-3/4" />
        <Esqueleto className="h-3 w-1/3" />
        <Esqueleto className="mt-1 h-8 w-28" />
      </div>
      <Esqueleto className="h-5 w-20" />
    </div>
  );
}

export function EsqueletoTabela({
  linhas = 6,
  colunas = 5,
}: {
  linhas?: number;
  colunas?: number;
}) {
  return (
    <div
      className="rounded-card border-borda bg-branco shadow-card overflow-hidden border"
      aria-busy
    >
      <div className="border-borda bg-papel-2 flex gap-4 border-b px-3 py-3">
        {Array.from({ length: colunas }, (_, i) => (
          <Esqueleto key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: linhas }, (_, l) => (
        <div key={l} className="border-borda flex gap-4 border-b px-3 py-3.5 last:border-b-0">
          {Array.from({ length: colunas }, (_, c) => (
            <Esqueleto key={c} className={cn('h-4 flex-1', c === 0 && 'flex-[2]')} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function EsqueletoCartoes({ quantidade = 4 }: { quantidade?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy>
      {Array.from({ length: quantidade }, (_, i) => (
        <div key={i} className="rounded-card border-borda bg-branco shadow-card border p-4">
          <Esqueleto className="h-3 w-24" />
          <Esqueleto className="mt-3 h-7 w-32" />
        </div>
      ))}
    </div>
  );
}

export function EsqueletoFormulario({ campos = 6 }: { campos?: number }) {
  return (
    <div className="flex flex-col gap-5" aria-busy>
      {Array.from({ length: campos }, (_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Esqueleto className="h-3 w-24" />
          <Esqueleto className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}
