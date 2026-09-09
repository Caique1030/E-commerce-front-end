'use client';

import styled from 'styled-components';
import { media, text } from '@/styles/mixins';
import { color } from '@/styles/tokens';

export const Root = styled.section.attrs({ className: 'painel' })`
  padding: 1.25rem 1rem;
`;

/** Duas colunas no toque, quatro no desktop: uma promessa por célula. */
export const List = styled.ul`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 1rem;
  row-gap: 1.25rem;

  ${media.lg`
    grid-template-columns: repeat(4, minmax(0, 1fr));
  `}
`;

export const Item = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

/** Bolha azul-clara com o ícone do benefício. */
export const IconCircle = styled.span`
  display: flex;
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background-color: ${color.acaoSuave};
  color: ${color.acao};
`;

export const Body = styled.div`
  min-width: 0;
`;

export const Title = styled.p`
  ${text('corpo')}
  font-weight: 600;
`;

export const Text = styled.p`
  ${text('apoio')}
  margin-top: 0.125rem;
  color: ${color.suave};
`;
