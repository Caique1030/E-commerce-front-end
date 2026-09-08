import { EsqueletoGrade } from '@/components/estados/skeletons';
import { Esqueleto } from '@/components/ui/esqueleto';
import { LayoutCatalogo } from '@/components/layout/layout-catalogo';

export default function CarregandoCategoria() {
  return (
    <LayoutCatalogo>
      <div className="flex flex-col gap-4">
        <Esqueleto className="h-3 w-40" />
        <Esqueleto className="h-8 w-56" />
        <EsqueletoGrade />
      </div>
    </LayoutCatalogo>
  );
}
