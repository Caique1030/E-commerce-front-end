'use client';

import styled from 'styled-components';
import { media } from '@/styles/mixins';
import { Panel } from '@/styles/primitives';
import { color } from '@/styles/tokens';

export const Root = styled.div`
  display: grid;
  gap: 1rem;

  ${media.lg`
    grid-template-columns: 14rem minmax(0, 1fr);
  `}
`;

export const Sidebar = styled.aside`
  display: none;

  ${media.lg`
    display: block;
  `}
`;

/** Painel grudado abaixo do cabeçalho, com rolagem própria quando a árvore é longa. */
export const SidebarPanel = styled(Panel)`
  position: sticky;
  top: 6.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: calc(100dvh - 8rem);
  overflow-y: auto;
  padding: 1rem 0.75rem;
`;

export const FiltersSection = styled.div`
  padding-top: 1.25rem;
  border-top: 1px solid ${color.borda};
`;

export const Main = styled.div`
  min-width: 0;
`;
