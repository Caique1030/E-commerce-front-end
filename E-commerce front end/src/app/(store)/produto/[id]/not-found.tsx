import Link from 'next/link';
import { EmptyState } from '@/components/estados/EmptyState';
import { Button } from '@/components/ui/Button';

export default function ProdutoNaoEncontrado() {
  return (
    <EmptyState
      illustration="search"
      title="Este produto não está mais à venda."
      description="Ele pode ter sido removido do catálogo ou o endereço está errado."
      action={
        <Button as={Link} href="/">
          Ver produtos
        </Button>
      }
    />
  );
}
