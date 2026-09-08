import { EsqueletoGrade } from '@/components/estados/skeletons';
import { LayoutCatalogo } from '@/components/layout/layout-catalogo';

/** A home espera o prefetch do catálogo antes de renderizar; sem isto a tela ficava em branco. */
export default function CarregandoHome() {
  return (
    <LayoutCatalogo>
      <EsqueletoGrade />
    </LayoutCatalogo>
  );
}
