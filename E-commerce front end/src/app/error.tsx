'use client';

import Link from 'next/link';
import { Erro } from '@/components/estados/erro';
import { Botao } from '@/components/ui/botao';
import { Logo } from '@/components/ui/logo';

export default function ErroGlobal({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="px-6 py-5">
        <Logo />
      </header>
      <main className="flex flex-1 items-center justify-center px-4">
        <Erro
          titulo="Não foi possível mostrar esta página."
          descricao="Tente de novo. Se continuar, volte para a loja."
          aoTentarDeNovo={reset}
          acaoExtra={
            <Botao asChild variante="fantasma">
              <Link href="/">Ir para a loja</Link>
            </Botao>
          }
          className="w-full max-w-lg"
        />
      </main>
    </div>
  );
}
