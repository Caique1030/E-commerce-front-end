'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { outlinedPanel, text } from '@/styles/mixins';
import { color, radius } from '@/styles/tokens';

/*
 * Entrar e criar conta são o mesmo desenho: título, linha que leva ao outro formulário,
 * cartão branco e alerta de erro. Os dois `style.tsx` reexportam daqui.
 */

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

export const Title = styled.h1`
  ${text('h1')}
`;

/** Linha abaixo do título que leva para o outro formulário (entrar/criar conta). */
export const Lead = styled.p`
  ${text('corpo')}
  margin-top: 0.25rem;
  color: ${color.suave};
`;

export const LeadLink = styled(Link)`
  color: ${color.acao};
  text-underline-offset: 4px;

  &:hover {
    text-decoration: underline;
  }
`;

/** Cartão branco do formulário. */
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  ${outlinedPanel()}
`;

/** Erro geral do envio (credenciais, limite de tentativas, rede); erros de campo vão no campo. */
export const Alert = styled.p`
  ${text('apoio')}
  padding: 0.5rem 0.75rem;
  border-radius: ${radius.campo};
  background-color: ${color.alertaSuave};
  color: ${color.alerta};
`;
