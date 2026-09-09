'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import styled from 'styled-components';
import { outlinedPanel, text } from '@/styles/mixins';
import { color } from '@/styles/tokens';

export const Root = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Title = styled.h1`
  ${text('h1')}
`;

/** Lista de pedidos: painel branco com uma linha por pedido. */
export const List = styled.ul`
  ${outlinedPanel()}

  & > * + * {
    border-top: 1px solid ${color.borda};
  }
`;

export const OrderLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;

  &:hover {
    background-color: ${color.papel2};
  }
`;

export const Info = styled.div`
  flex: 1 1 0%;
  min-width: 0;
`;

export const Code = styled.p.attrs({ className: 'preco' })`
  ${text('corpo')}
  font-weight: 500;
`;

export const Meta = styled.p`
  ${text('apoio')}
  color: ${color.suave};
`;

export const Chevron = styled(ChevronRight)`
  flex-shrink: 0;
  color: ${color.suave};
`;

export const Skeletons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
