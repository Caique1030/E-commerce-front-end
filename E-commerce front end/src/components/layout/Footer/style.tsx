'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { media, text } from '@/styles/mixins';
import { Container } from '@/styles/primitives';
import { color } from '@/styles/tokens';

export const Root = styled.footer`
  margin-top: 1.5rem;
  background-color: ${color.branco};
`;

export const Promises = styled(Container)`
  padding-block: 1.5rem;
  border-bottom: 1px solid ${color.borda};
`;

export const PromiseList = styled.ul`
  ${text('apoio')}
  display: grid;
  gap: 1rem;
  color: ${color.tinta2};

  ${media.sm`
    grid-template-columns: repeat(2, minmax(0, 1fr));
  `}

  ${media.lg`
    grid-template-columns: repeat(4, minmax(0, 1fr));
  `}
`;

export const PromiseItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.625rem;
`;

/** Ícone azul da promessa (era `text-acao shrink-0`). */
export const PromiseIcon = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  color: ${color.acao};
`;

export const Columns = styled(Container)`
  display: grid;
  gap: 2rem;
  padding-block: 2rem;

  ${media.md`
    grid-template-columns: minmax(0, 1fr) auto auto;
  `}
`;

export const Brand = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const BrandText = styled.p`
  ${text('apoio')}
  max-width: 20rem;
  color: ${color.suave};
`;

export const Column = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const ColumnTitle = styled.p`
  ${text('micro')}
  font-weight: 700;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  color: ${color.suave};
`;

export const ColumnLink = styled(Link)`
  ${text('apoio')}

  &:hover {
    color: ${color.acao};
  }
`;

export const Bottom = styled.div`
  background-color: ${color.papel2};
`;

export const BottomContent = styled(Container)`
  ${text('micro')}
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding-block: 1rem;
  color: ${color.suave};
`;

export const BottomLinks = styled.div`
  display: flex;
  gap: 1rem;
`;

export const BottomLink = styled(Link)`
  &:hover {
    color: ${color.acao};
  }
`;

export const ExternalLink = styled.a`
  &:hover {
    color: ${color.acao};
  }
`;
