import type { ReactNode } from 'react';
import { CartDrawer } from '@/components/carrinho/CartDrawer/CartDrawer';
import { Footer } from '../Footer/Footer';
import { ResumeIntent } from '../ResumeIntent';
import { StoreHeader } from '../StoreHeader/StoreHeader';
import * as S from './style';

/** Chrome da loja: cabeçalho, conteúdo, rodapé e o drawer do carrinho (montado uma vez). */
export function StoreShell({ children }: { children: ReactNode }) {
  return (
    <>
      <S.SkipLink href="#conteudo">Pular para o conteúdo</S.SkipLink>
      <StoreHeader />
      <S.Main id="conteudo" tabIndex={-1}>
        {children}
      </S.Main>
      <Footer />
      <CartDrawer />
      <ResumeIntent />
    </>
  );
}
