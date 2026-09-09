'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { text } from '@/styles/mixins';
import { color, radius } from '@/styles/tokens';

/*
 * O elemento mais externo é o primitivo `Drawer`; aqui ficam só as peças de dentro dele.
 */

/** Lista de linhas separadas por um fio (era `divide-y divide-borda`). */
export const List = styled.ul`
  padding-inline: 1.25rem;

  & > * + * {
    border-top: 1px solid ${color.borda};
  }
`;

export const ErrorWrap = styled.div`
  padding: 1rem 1.25rem;
`;

export const Footer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const Warning = styled.p`
  ${text('apoio')}
  padding: 0.5rem 0.75rem;
  border-radius: ${radius.campo};
  background-color: ${color.alertaSuave};
  color: ${color.alerta};
`;

export const FullCartLink = styled(Link)`
  ${text('apoio')}
  text-align: center;
  text-underline-offset: 4px;
  color: ${color.suave};

  &:hover {
    color: ${color.tinta};
    text-decoration-line: underline;
  }
`;
