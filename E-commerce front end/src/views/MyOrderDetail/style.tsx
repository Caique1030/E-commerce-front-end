'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { media, outlinedPanel, text } from '@/styles/mixins';
import { color } from '@/styles/tokens';

export const Root = styled.article`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 48rem;
  margin-inline: auto;
`;

export const BackLink = styled(Link)`
  ${text('apoio')}
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: ${color.suave};

  &:hover {
    color: ${color.tinta};
  }
`;

/** Itens à esquerda, acompanhamento à direita a partir de 768px. */
export const Grid = styled.div`
  display: grid;
  gap: 1.5rem;
  ${media.md`
    grid-template-columns: minmax(0, 1fr) 16rem;
  `}
`;

export const ItemsCard = styled.section`
  ${outlinedPanel()}
  padding: 0.5rem 1.25rem;
`;

export const SideCard = styled.section`
  ${outlinedPanel()}
  padding: 1.25rem;
`;

export const SideTitle = styled.h2`
  ${text('h2')}
  margin-bottom: 1rem;
`;

export const Skeletons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 48rem;
  margin-inline: auto;
`;
