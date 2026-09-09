import { ChevronRight } from 'lucide-react';
import { Suspense } from 'react';
import { ProductGridSkeleton } from '@/components/estados/Skeletons';
import { CatalogLayout } from '@/components/layout/CatalogLayout/CatalogLayout';
import { Catalog } from '@/components/produto/Catalog/Catalog';
import type { Categoria } from '@/lib/tipos';
import * as S from './style';

interface CategoryProps {
  slug: string;
  categoria?: Categoria;
  /** Do topo até a categoria atual. */
  trilha: Categoria[];
  /** Subcategorias diretas. */
  filhos: Categoria[];
}

/** Catálogo filtrado por categoria: trilha, subcategorias e a lista com a barra lateral. */
export function Category({ slug, categoria, trilha, filhos }: CategoryProps) {
  return (
    <CatalogLayout>
      <S.Root>
        <S.Breadcrumb aria-label="Você está em">
          <S.Trail>
            <li>
              <S.TrailLink href="/">Tudo na loja</S.TrailLink>
            </li>
            {trilha.map((c, i) => (
              <S.TrailItem key={c.id}>
                <ChevronRight size={14} aria-hidden />
                {i === trilha.length - 1 ? (
                  <S.Current aria-current="page">{c.nome}</S.Current>
                ) : (
                  <S.TrailLink href={`/categoria/${c.slug}`}>{c.nome}</S.TrailLink>
                )}
              </S.TrailItem>
            ))}
          </S.Trail>
        </S.Breadcrumb>

        {filhos.length > 0 && (
          <S.Pills aria-label="Subcategorias">
            {filhos.map((f) => (
              <li key={f.id}>
                <S.Pill href={`/categoria/${f.slug}`}>{f.nome}</S.Pill>
              </li>
            ))}
          </S.Pills>
        )}

        <Suspense fallback={<ProductGridSkeleton />}>
          <Catalog title={categoria?.nome ?? slug} fixedCategory={slug} />
        </Suspense>
      </S.Root>
    </CatalogLayout>
  );
}
