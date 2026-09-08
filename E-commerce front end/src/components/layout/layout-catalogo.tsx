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
    <div className="grid gap-8 lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-10">
      <aside className="hidden lg:block" aria-label="Navegação do catálogo">
        <div className="sticky top-20 flex max-h-[calc(100dvh-6rem)] flex-col gap-7 overflow-y-auto pr-2 pb-4">
          <Suspense fallback={<EsqueletoArvore />}>
            <ArvoreCategorias />
          </Suspense>
          <div className="border-borda border-t pt-6">
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
