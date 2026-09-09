import type { ReactNode } from 'react';
import { Logo } from '@/components/ui/Logo';
import * as S from './style';

/** Chrome mínimo para entrar e criar conta: a faixa amarela da loja e o formulário. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <S.Root>
      <S.Header>
        <S.Bar>
          <Logo />
        </S.Bar>
      </S.Header>
      <S.Main>
        <S.Box>{children}</S.Box>
      </S.Main>
    </S.Root>
  );
}
