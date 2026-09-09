'use client';

import styled from 'styled-components';
import { text } from '@/styles/mixins';
import { color, radius } from '@/styles/tokens';

export const Root = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: ${radius.campo};

  &:hover {
    background-color: color-mix(in oklab, ${color.tinta} 10%, transparent);
  }
`;

/** Contador sobre o ícone, com anel amarelo para descolar do fundo (era `ring-2 ring-amarelo`). */
export const Counter = styled.span.attrs({ className: 'preco' })`
  ${text('micro')}
  position: absolute;
  top: 0.125rem;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  min-width: 18px;
  padding-inline: 0.25rem;
  border-radius: 9999px;
  background-color: ${color.acao};
  color: ${color.branco};
  font-weight: 700;
  box-shadow: 0 0 0 2px ${color.amarelo};
`;
