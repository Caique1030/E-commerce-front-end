'use client';

import styled from 'styled-components';
import { media, outlinedPanel } from '@/styles/mixins';
import { color } from '@/styles/tokens';

/** Esqueleto com a forma do checkout: itens à esquerda, resumo à direita a partir de 1024px. */
export const Skeletons = styled.div`
  display: grid;
  gap: 2rem;
  ${media.lg`
    grid-template-columns: minmax(0, 1fr) 24rem;
  `}
`;

export const SkeletonTitle = styled.div`
  margin-bottom: 1rem;
`;

export const SkeletonList = styled.ul`
  padding-inline: 1.25rem;
  ${outlinedPanel()}

  & > * + * {
    border-top: 1px solid ${color.borda};
  }
`;
