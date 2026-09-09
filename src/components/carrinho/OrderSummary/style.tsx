'use client';

import styled from 'styled-components';
import { text } from '@/styles/mixins';
import { color } from '@/styles/tokens';

export const Root = styled.dl`
  ${text('corpo')}
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

export const Row = styled.div`
  display: flex;
  justify-content: space-between;
  color: ${color.suave};
`;

/**
 * O valor herda a cor do `dd`, não da linha cinza: tinta para os itens, verde para o desconto
 * (o que o cliente ganha).
 */
export const Value = styled.dd<{ $tone: 'ink' | 'green' }>`
  color: ${(p) => (p.$tone === 'green' ? color.verde : color.tinta)};
`;

export const TotalRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 0.25rem;
  padding-top: 0.5rem;
  border-top: 1px solid ${color.borda};
`;

export const TotalLabel = styled.dt`
  font-weight: 500;
`;
