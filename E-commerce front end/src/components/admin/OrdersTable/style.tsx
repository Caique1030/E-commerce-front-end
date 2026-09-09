'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { outlinedPanel, text } from '@/styles/mixins';
import { color } from '@/styles/tokens';

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  ${outlinedPanel()}
`;

export const FilterLabel = styled.label`
  ${text('apoio')}
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const FilterCaption = styled.span`
  font-weight: 500;
`;

export const Count = styled.p`
  ${text('apoio')}
  padding-bottom: 0.625rem;
  color: ${color.suave};
`;

export const CodeLink = styled(Link).attrs({ className: 'preco' })`
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

export const CustomerName = styled.span`
  display: block;
`;

export const CustomerEmail = styled.span`
  ${text('micro')}
  display: block;
  color: ${color.suave};
`;

export const OrderDate = styled.span`
  ${text('apoio')}
`;

export const ChangeButton = styled.button`
  ${text('apoio')}
  color: ${color.acao};
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;
