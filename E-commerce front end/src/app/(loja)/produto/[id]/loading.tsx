import { EsqueletoDetalheProduto } from '@/components/estados/skeletons';
import { Esqueleto } from '@/components/ui/esqueleto';

export default function CarregandoProduto() {
  return (
    <div className="flex flex-col gap-8">
      <Esqueleto className="h-3 w-56" />
      <EsqueletoDetalheProduto />
    </div>
  );
}
