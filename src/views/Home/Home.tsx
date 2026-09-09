import { Suspense } from 'react';
import { ProductGridSkeleton } from '@/components/estados/Skeletons';
import { Showcase } from '@/components/home/Showcase/Showcase';
import { CatalogLayout } from '@/components/layout/CatalogLayout/CatalogLayout';
import { Catalog } from '@/components/produto/Catalog/Catalog';
import { DESCRICAO_LOJA, NOME_LOJA } from '@/lib/constantes';
import { VisuallyHidden } from '@/styles/primitives';
import * as S from './style';

interface HomeProps {
  /** Há busca, filtro, categoria, ordenação ou página na URL: a home vira lista com barra lateral. */
  procurando: boolean;
}

/**
 * A vitrine é o estado de repouso da home: URL limpa, nada escolhido ainda. Qualquer sinal de
 * que o cliente já está procurando algo troca a home pela lista com a barra lateral, que é
 * onde essa procura se resolve.
 */
export function Home({ procurando }: HomeProps) {
  if (procurando) {
    return (
      <CatalogLayout>
        <Suspense fallback={<ProductGridSkeleton />}>
          <Catalog title="Resultados" />
        </Suspense>
      </CatalogLayout>
    );
  }

  return (
    <S.Root>
      <VisuallyHidden as="h1">
        {NOME_LOJA} — {DESCRICAO_LOJA}
      </VisuallyHidden>
      <Showcase />
      <Suspense fallback={<ProductGridSkeleton />}>
        <Catalog title="Tudo na loja" titleLevel={2} />
      </Suspense>
    </S.Root>
  );
}
