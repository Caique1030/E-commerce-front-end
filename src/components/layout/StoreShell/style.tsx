'use client';

import styled from 'styled-components';
import { media, srOnly, text } from '@/styles/mixins';
import { color, radius, shadow } from '@/styles/tokens';

/** "Pular para o conteúdo": invisível até receber foco pelo teclado. */
export const SkipLink = styled.a`
  ${srOnly()}

  &:focus {
    ${text('corpo')}
    position: fixed;
    top: 0.5rem;
    left: 0.5rem;
    z-index: 70;
    width: auto;
    height: auto;
    margin: 0;
    padding: 0.5rem 0.75rem;
    overflow: visible;
    clip: auto;
    white-space: normal;
    border-radius: ${radius.campo};
    background-color: ${color.branco};
    box-shadow: ${shadow.flutuante};
  }
`;

/** Coluna única da loja (`.conteudo`), ocupando o espaço entre cabeçalho e rodapé. */
export const Main = styled.main.attrs({ className: 'conteudo' })`
  flex: 1 1 0%;
  padding-block: 1rem;
  ${media.lg`
    padding-block: 1.25rem;
  `}
`;
