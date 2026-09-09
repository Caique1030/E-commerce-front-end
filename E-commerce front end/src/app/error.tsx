'use client';

import Link from 'next/link';
import { ErrorState } from '@/components/estados/ErrorState';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

export default function ErroGlobal({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="bg-amarelo shadow-barra">
        <div className="conteudo flex h-14 items-center">
          <Logo />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4">
        <ErrorState
          title="Não foi possível mostrar esta página."
          description="Tente de novo. Se continuar, volte para a loja."
          onRetry={reset}
          extraAction={
            <Button as={Link} href="/" variant="ghost">
              Ir para a loja
            </Button>
          }
          className="painel w-full max-w-lg px-6 py-10"
        />
      </main>
    </div>
  );
}
