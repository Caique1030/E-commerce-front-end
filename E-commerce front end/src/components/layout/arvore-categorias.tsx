'use client';

import * as Collapsible from '@radix-ui/react-collapsible';
import { CalendarDays, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { EsqueletoArvore } from '@/components/estados/skeletons';
import { useArvoreCategorias } from '@/lib/hooks/use-categorias';
import type { Categoria } from '@/lib/tipos';
import { cn } from '@/lib/utils';

interface ArvoreProps {
  /** Fecha o drawer mobile ao navegar. */
  aoNavegar?: () => void;
  className?: string;
}

/** Árvore de categorias: cada raiz é um link e, se tiver filhos, um botão para expandir. */
export function ArvoreCategorias({ aoNavegar, className }: ArvoreProps) {
  const { data, isPending, isError } = useArvoreCategorias();
  const params = useParams<{ slug?: string }>();
  const slugAtual = params?.slug;

  // Raiz que contém a categoria atual começa aberta.
  const raizAtual = useMemo(() => {
    if (!data || !slugAtual) return null;
    return (
      data.find((r) => r.slug === slugAtual || r.filhos.some((f) => f.slug === slugAtual))?.id ??
      null
    );
  }, [data, slugAtual]);

  const [abertas, setAbertas] = useState<Set<string>>(() => new Set(raizAtual ? [raizAtual] : []));
  const [raizAnterior, setRaizAnterior] = useState(raizAtual);
  // A categoria atual mudou (navegação): abre a raiz dela, sem impedir que o usuário a recolha depois.
  if (raizAtual !== raizAnterior) {
    setRaizAnterior(raizAtual);
    if (raizAtual && !abertas.has(raizAtual)) setAbertas(new Set(abertas).add(raizAtual));
  }

  if (isPending) return <EsqueletoArvore />;
  if (isError || !data) {
    return <p className="text-apoio text-suave py-2">Não foi possível carregar as categorias.</p>;
  }

  const alternar = (id: string) =>
    setAbertas((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const linkBase =
    'flex min-h-9 flex-1 items-center rounded-campo px-2 text-corpo text-tinta hover:bg-papel-2 aria-[current=page]:bg-acao-suave aria-[current=page]:font-medium aria-[current=page]:text-acao';

  return (
    <nav aria-label="Categorias" className={cn('text-corpo', className)}>
      <ul className="flex flex-col gap-0.5">
        <li>
          <Link
            href="/"
            onClick={aoNavegar}
            aria-current={!slugAtual ? 'page' : undefined}
            className={cn(linkBase, 'font-medium')}
          >
            Tudo na loja
          </Link>
        </li>
        {data.map((raiz) => (
          <li key={raiz.id}>
            <ItemRaiz
              categoria={raiz}
              aberta={abertas.has(raiz.id)}
              aoAlternar={() => alternar(raiz.id)}
              slugAtual={slugAtual}
              aoNavegar={aoNavegar}
              linkBase={linkBase}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}

interface ItemRaizProps {
  categoria: Categoria;
  aberta: boolean;
  aoAlternar: () => void;
  slugAtual?: string;
  aoNavegar?: () => void;
  linkBase: string;
}

function ItemRaiz({
  categoria,
  aberta,
  aoAlternar,
  slugAtual,
  aoNavegar,
  linkBase,
}: ItemRaizProps) {
  const temFilhos = categoria.filhos.length > 0;
  const ehServicos = categoria.slug === 'servicos';

  return (
    <Collapsible.Root open={aberta} onOpenChange={aoAlternar}>
      <div className="flex items-center">
        <Link
          href={`/categoria/${categoria.slug}`}
          onClick={aoNavegar}
          aria-current={slugAtual === categoria.slug ? 'page' : undefined}
          className={cn(linkBase, 'gap-1.5', ehServicos && 'text-agenda')}
        >
          {ehServicos && <CalendarDays className="size-4 shrink-0" aria-hidden />}
          {categoria.nome}
        </Link>
        {temFilhos && (
          <Collapsible.Trigger asChild>
            <button
              type="button"
              className="rounded-campo text-suave hover:bg-papel-2 hover:text-tinta flex size-8 shrink-0 items-center justify-center"
              aria-label={`${aberta ? 'Recolher' : 'Expandir'} ${categoria.nome}`}
            >
              <ChevronRight
                className={cn(
                  'size-4 transition-transform motion-reduce:transition-none',
                  aberta && 'rotate-90',
                )}
                aria-hidden
              />
            </button>
          </Collapsible.Trigger>
        )}
      </div>
      {temFilhos && (
        <Collapsible.Content>
          <ul className="border-borda my-0.5 ml-3 flex flex-col gap-0.5 border-l pl-1">
            {categoria.filhos.map((filho) => (
              <li key={filho.id}>
                <Link
                  href={`/categoria/${filho.slug}`}
                  onClick={aoNavegar}
                  aria-current={slugAtual === filho.slug ? 'page' : undefined}
                  className={cn(linkBase, 'text-apoio text-tinta-3 min-h-8')}
                >
                  {filho.nome}
                </Link>
              </li>
            ))}
          </ul>
        </Collapsible.Content>
      )}
    </Collapsible.Root>
  );
}
