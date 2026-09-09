'use client';

import styled from 'styled-components';
import { text } from '@/styles/mixins';
import { color, radius } from '@/styles/tokens';

export const Root = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

/** Aviso de que a máquina de estados não permite mais nenhuma transição. */
export const Note = styled.p`
  ${text('apoio')}
  color: ${color.suave};
`;

export const Warning = styled.p`
  ${text('apoio')}
  padding: 0.5rem 0.75rem;
  border-radius: ${radius.campo};
  background-color: ${color.avisoSuave};
  color: ${color.aviso};
`;
