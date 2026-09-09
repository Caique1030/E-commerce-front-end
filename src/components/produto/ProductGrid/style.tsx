'use client';

import styled from 'styled-components';
import { media } from '@/styles/mixins';

export const Root = styled.ul`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;

  ${media.sm`
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  `}

  ${media.lg`
    grid-template-columns: repeat(4, minmax(0, 1fr));
  `}
`;

/** Cada célula estica o card até a largura toda (era o `w-full` passado ao card). */
export const Item = styled.li`
  display: flex;

  & > * {
    width: 100%;
  }
`;
