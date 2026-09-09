import Link from 'next/link';
import { EmptyState } from '@/components/estados/EmptyState';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

export default function NaoEncontradoGlobal() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="bg-amarelo shadow-barra">
        <div className="conteudo flex h-14 items-center">
          <Logo />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4">
        <EmptyState
          className="painel w-full max-w-lg"
          illustration="search"
          title="Não encontramos esta página."
          description="Confira o endereço ou volte para o catálogo."
          action={
            <Button as={Link} href="/">
              Ir para a loja
            </Button>
          }
        />
      </main>
    </div>
  );
}
