import type { ReactNode } from 'react';
import { Logo } from '@/components/ui/logo';

/** Chrome mínimo para entrar e criar conta: só o wordmark e o formulário. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto w-full max-w-[88rem] px-4 py-4 sm:px-6 lg:px-8">
        <Logo />
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pt-4 pb-16 sm:pt-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
