import { Suspense, type ReactNode } from 'react';
import { EsqueletoArvore } from '@/components/estados/skeletons';
import { FiltrosLaterais } from '@/components/produto/filtros-laterais';
import { ArvoreCategorias } from './arvore-categorias';

/**
 * Catálogo primeiro: árvore de categorias à esquerda, grade à direita.
 * No mobile a árvore vai para o menu e os filtros para um modal (ver Catalogo).
 */
export function LayoutCatalogo({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)]">
      <aside className="hidden lg:block" aria-label="Navegação do catálogo">
        <div className="painel sticky top-[6.5rem] flex max-h-[calc(100dvh-8rem)] flex-col gap-6 overflow-y-auto px-3 py-4">
          <Suspense fallback={<EsqueletoArvore />}>
            <ArvoreCategorias />
          </Suspense>
          <div className="border-borda border-t pt-5">
            <Suspense fallback={null}>
              <FiltrosLaterais />
            </Suspense>
          </div>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
