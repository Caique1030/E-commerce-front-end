'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { text } from '@/styles/mixins';
import { color, shadow } from '@/styles/tokens';

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

/** "Você está em": a trilha da categoria, do topo até a atual. */
export const Breadcrumb = styled.nav`
  ${text('apoio')}
  color: ${color.suave};
`;

export const Trail = styled.ol`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
`;

export const TrailItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export const TrailLink = styled(Link)`
  &:hover {
    color: ${color.acao};
    text-decoration: underline;
  }
`;

export const Current = styled.span`
  color: ${color.tinta};
`;

/** Subcategorias como pílulas brancas, logo abaixo da trilha. */
export const Pills = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const Pill = styled(Link)`
  ${text('apoio')}
  display: inline-flex;
  align-items: center;
  height: 2rem;
  padding-inline: 0.875rem;
  border-radius: 9999px;
  background-color: ${color.branco};
  box-shadow: ${shadow.card};
  color: ${color.tinta2};
  font-weight: 500;

  &:hover {
    color: ${color.acao};
  }
`;
