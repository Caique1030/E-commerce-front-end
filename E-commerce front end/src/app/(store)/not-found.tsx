import Link from 'next/link';
import { EmptyState } from '@/components/estados/EmptyState';
import { Button } from '@/components/ui/Button';

export default function NaoEncontrado() {
  return (
    <EmptyState
      className="painel"
      illustration="search"
      title="Não encontramos esta página."
      description="Confira o endereço ou volte para o catálogo."
      action={
        <Button as={Link} href="/">
          Ir para a loja
        </Button>
      }
    />
  );
}
