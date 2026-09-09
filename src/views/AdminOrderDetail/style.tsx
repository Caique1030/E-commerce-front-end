'use client';

import Link from 'next/link';
import styled, { css } from 'styled-components';
import { OrderTotals } from '@/components/pedido/OrderDetails/OrderDetails';
import { media, text } from '@/styles/mixins';
import { color } from '@/styles/tokens';

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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

/** Itens à esquerda e, a partir de lg, coluna fixa de 20rem para status e histórico. */
export const Grid = styled.div`
  display: grid;
  gap: 1.25rem;

  ${media.lg`
    grid-template-columns: minmax(0, 1fr) 20rem;
  `}
`;

/** Painel branco com borda: `.painel` + `border-borda`. */
const outlined = css`
  border: 1px solid ${color.borda};
`;

export const ItemsPanel = styled.section.attrs({ className: 'painel' })`
  ${outlined}
  padding: 0.5rem 1.25rem;
`;

/** Os totais ficam dentro do painel de itens, com respiro próprio (era `py-4`). */
export const Totals = styled(OrderTotals)`
  padding-block: 1rem;
`;

export const Side = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

export const SidePanel = styled.section.attrs({ className: 'painel' })`
  ${outlined}
  padding: 1.25rem;
`;

export const PanelTitle = styled.h2<{ $spacing: 'sm' | 'md' }>`
  ${text('h2')}
  margin-bottom: ${(p) => (p.$spacing === 'sm' ? '0.75rem' : '1rem')};
`;

/** Mesma forma da página (link de volta, cabeçalho, painel), enquanto o pedido carrega. */
export const SkeletonRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
