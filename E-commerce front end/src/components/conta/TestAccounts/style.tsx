'use client';

import styled from 'styled-components';
import { text } from '@/styles/mixins';
import { color, radius } from '@/styles/tokens';

/** Caixa discreta (cinza a 60%), fechada por padrão: é ferramenta de teste, não parte do login. */
export const Root = styled.details`
  ${text('apoio')}
  padding: 0.75rem 1rem;
  border: 1px solid ${color.borda};
  border-radius: ${radius.card};
  background-color: color-mix(in oklab, ${color.papel2} 60%, transparent);
`;

export const Summary = styled.summary`
  cursor: pointer;
  font-weight: 500;
  color: ${color.tinta};
`;

export const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

export const Item = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

export const Role = styled.span`
  font-weight: 500;
  color: ${color.tinta};
`;

export const Email = styled.span`
  display: block;
  color: ${color.suave};
`;

/** "Preencher": botão pequeno com borda, que escurece no hover. */
export const FillButton = styled.button`
  ${text('apoio')}
  flex-shrink: 0;
  padding: 0.25rem 0.625rem;
  border: 1px solid ${color.bordaForte};
  border-radius: ${radius.campo};
  background-color: ${color.branco};

  &:hover {
    border-color: ${color.tinta};
  }
`;
