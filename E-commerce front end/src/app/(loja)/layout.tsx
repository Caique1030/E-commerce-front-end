import type { ReactNode } from 'react';
import { DrawerCarrinho } from '@/components/carrinho/drawer-carrinho';
import { Cabecalho } from '@/components/layout/cabecalho';
import { RetomarIntencao } from '@/components/layout/retomar-intencao';
import { Rodape } from '@/components/layout/rodape';

/** Chrome da loja: cabeçalho, conteúdo, rodapé e o drawer do carrinho (montado uma vez). */
export default function LojaLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#conteudo"
        className="focus:rounded-campo focus:bg-branco focus:text-corpo focus:shadow-flutuante sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:px-3 focus:py-2"
      >
        Pular para o conteúdo
      </a>
      <Cabecalho />
      <main
        id="conteudo"
        className="mx-auto w-full max-w-[88rem] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        tabIndex={-1}
      >
        {children}
      </main>
      <Rodape />
      <DrawerCarrinho />
      <RetomarIntencao />
    </>
  );
}
