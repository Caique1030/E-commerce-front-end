import type { ReactNode } from 'react';
import { Logo } from '@/components/ui/logo';

/** Chrome mínimo para entrar e criar conta: a faixa amarela da loja e o formulário. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="bg-amarelo shadow-barra">
        <div className="conteudo flex h-14 items-center">
          <Logo />
        </div>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pt-6 pb-16 sm:pt-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
