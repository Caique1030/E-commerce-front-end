'use client';

import Link from 'next/link';
import styled, { css } from 'styled-components';
import { reducedMotion, text } from '@/styles/mixins';
import { color, radius } from '@/styles/tokens';

export const Root = styled.nav`
  ${text('corpo')}
`;

export const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
`;

export const Message = styled.p`
  ${text('apoio')}
  padding-block: 0.5rem;
  color: ${color.suave};
`;

/**
 * Base de todos os links da árvore. O estado "página atual" vem do `aria-current`, que vence o
 * hover por vir depois no bloco (mesma especificidade).
 */
const linkBase = css`
  ${text('corpo')}
  display: flex;
  flex: 1 1 0%;
  align-items: center;
  min-height: 2.25rem;
  padding-inline: 0.5rem;
  border-radius: ${radius.campo};
  color: ${color.tinta};

  &:hover {
    background-color: ${color.papel2};
  }

  &[aria-current='page'] {
    background-color: ${color.acaoSuave};
    font-weight: 500;
    color: ${color.acao};
  }
`;

export const AllLink = styled(Link)`
  ${linkBase}
  font-weight: 500;
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
`;

export const CategoryLink = styled(Link)<{ $schedule: boolean }>`
  ${linkBase}
  gap: 0.375rem;

  ${(p) =>
    p.$schedule &&
    css`
      color: ${color.agenda};
    `}
`;

/** Ícone de agenda ao lado de "Serviços" (era `shrink-0`). */
export const LinkIcon = styled.span`
  display: inline-flex;
  flex-shrink: 0;
`;

export const ToggleButton = styled.button`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: ${radius.campo};
  color: ${color.suave};

  &:hover {
    background-color: ${color.papel2};
    color: ${color.tinta};
  }
`;

/** Seta que gira 90° quando a raiz está aberta. */
export const Chevron = styled.span<{ $open: boolean }>`
  display: inline-flex;
  transition: transform 150ms;
  transform: rotate(${(p) => (p.$open ? '90deg' : '0deg')});

  ${reducedMotion`
    transition: none;
  `}
`;

/* `hidden` só vence se o `display: flex` também for condicional: os dois têm a mesma força no CSS. */
export const Children = styled.ul<{ $open: boolean }>`
  display: ${(p) => (p.$open ? 'flex' : 'none')};
  flex-direction: column;
  gap: 0.125rem;
  margin-block: 0.125rem;
  margin-left: 0.75rem;
  padding-left: 0.25rem;
  border-left: 1px solid ${color.borda};
`;

export const ChildLink = styled(Link)`
  ${linkBase}
  ${text('apoio')}
  min-height: 2rem;
  color: ${color.tinta3};
`;
