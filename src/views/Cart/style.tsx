'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { media, outlinedPanel, text } from '@/styles/mixins';
import { color, radius } from '@/styles/tokens';

/** Itens à esquerda, resumo fixo à direita a partir de 1024px. */
export const Root = styled.div`
  display: grid;
  gap: 2rem;
  ${media.lg`
    grid-template-columns: minmax(0, 1fr) 20rem;
    gap: 2.5rem;
  `}
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
`;

export const Title = styled.h1`
  ${text('h1')}
`;

export const Notice = styled.p`
  ${text('apoio')}
  margin-bottom: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid color-mix(in oklab, ${color.alerta} 25%, transparent);
  border-radius: ${radius.card};
  background-color: ${color.alertaSuave};
  color: ${color.alerta};
`;

/** Lista de linhas do carrinho, uma divisória entre cada. */
export const List = styled.ul`
  ${outlinedPanel()}
  padding-inline: 1.25rem;

  & > * + * {
    border-top: 1px solid ${color.borda};
  }
`;

export const Aside = styled.aside`
  ${media.lg`
    position: sticky;
    top: 6rem;
    align-self: flex-start;
  `}
`;

export const SummaryCard = styled.div`
  ${outlinedPanel()}
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
`;

export const SummaryTitle = styled.h2`
  ${text('h2')}
`;

export const ContinueLink = styled(Link)`
  ${text('apoio')}
  text-align: center;
  color: ${color.suave};
  text-underline-offset: 4px;

  &:hover {
    color: ${color.tinta};
    text-decoration: underline;
  }
`;

export const ModalText = styled.p`
  ${text('corpo')}
  color: ${color.suave};
`;

export const SkeletonTitle = styled.div`
  margin-bottom: 1rem;
`;
