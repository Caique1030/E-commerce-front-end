'use client';

import { CalendarDays, ChevronRight } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useId, useMemo, useState } from 'react';
import { CategoryTreeSkeleton } from '@/components/estados/Skeletons';
import { useArvoreCategorias } from '@/lib/hooks/use-categorias';
import type { Categoria } from '@/lib/tipos';
import * as S from './style';

interface CategoryTreeProps {
  /** Fecha o drawer mobile ao navegar. */
  onNavigate?: () => void;
  className?: string;
}

/** Árvore de categorias: cada raiz é um link e, se tiver filhos, um botão para expandir. */
export function CategoryTree({ onNavigate, className }: CategoryTreeProps) {
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

  if (isPending) return <CategoryTreeSkeleton />;
  if (isError || !data) {
    return <S.Message>Não foi possível carregar as categorias.</S.Message>;
  }

  const alternar = (id: string) =>
    setAbertas((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <S.Root aria-label="Categorias" className={className}>
      <S.List>
        <li>
          <S.AllLink href="/" onClick={onNavigate} aria-current={!slugAtual ? 'page' : undefined}>
            Tudo na loja
          </S.AllLink>
        </li>
        {data.map((raiz) => (
          <li key={raiz.id}>
            <RootItem
              categoria={raiz}
              open={abertas.has(raiz.id)}
              onToggle={() => alternar(raiz.id)}
              currentSlug={slugAtual}
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </S.List>
    </S.Root>
  );
}

interface RootItemProps {
  categoria: Categoria;
  open: boolean;
  onToggle: () => void;
  currentSlug?: string;
  onNavigate?: () => void;
}

function RootItem({ categoria, open, onToggle, currentSlug, onNavigate }: RootItemProps) {
  const temFilhos = categoria.filhos.length > 0;
  const ehServicos = categoria.slug === 'servicos';
  const idFilhos = useId();

  return (
    <div>
      <S.Row>
        <S.CategoryLink
          href={`/categoria/${categoria.slug}`}
          onClick={onNavigate}
          aria-current={currentSlug === categoria.slug ? 'page' : undefined}
          $schedule={ehServicos}
        >
          {ehServicos && (
            <S.LinkIcon>
              <CalendarDays size={16} aria-hidden />
            </S.LinkIcon>
          )}
          {categoria.nome}
        </S.CategoryLink>
        {temFilhos && (
          <S.ToggleButton
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={idFilhos}
            aria-label={`${open ? 'Recolher' : 'Expandir'} ${categoria.nome}`}
          >
            <S.Chevron $open={open}>
              <ChevronRight size={16} aria-hidden />
            </S.Chevron>
          </S.ToggleButton>
        )}
      </S.Row>
      {/* `hidden` só vence se o `display: flex` também for condicional: os dois têm a mesma força no CSS. */}
      {temFilhos && (
        <S.Children id={idFilhos} hidden={!open} $open={open}>
          {categoria.filhos.map((filho) => (
            <li key={filho.id}>
              <S.ChildLink
                href={`/categoria/${filho.slug}`}
                onClick={onNavigate}
                aria-current={currentSlug === filho.slug ? 'page' : undefined}
              >
                {filho.nome}
              </S.ChildLink>
            </li>
          ))}
        </S.Children>
      )}
    </div>
  );
}
