'use client';

import Link from 'next/link';
import styled, { css } from 'styled-components';
import { media, text } from '@/styles/mixins';
import { Container } from '@/styles/primitives';
import { color, radius, shadow } from '@/styles/tokens';

/** Fundo translúcido de tinta ao passar o mouse sobre o amarelo (era `hover:bg-tinta/10`). */
const inkHover = css`
  &:hover {
    background-color: color-mix(in oklab, ${color.tinta} 10%, transparent);
  }
`;

export const Root = styled.header`
  position: sticky;
  top: 0;
  z-index: 40;
  background-color: ${color.amarelo};
  box-shadow: ${shadow.barra};
`;

export const Content = styled(Container)`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.625rem;
  padding-bottom: 0.5rem;

  ${media.lg`
    gap: 0.25rem;
    padding-bottom: 0;
  `}
`;

export const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${media.sm`
    gap: 1rem;
  `}
`;

export const MenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: ${radius.campo};
  ${inkHover}

  ${media.lg`
    display: none;
  `}
`;

export const DesktopSearch = styled.div`
  display: none;
  flex: 1 1 0%;

  ${media.md`
    display: block;
    max-width: 42rem;
  `}
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: auto;

  ${media.sm`
    gap: 0.5rem;
  `}
`;

export const MobileSearch = styled.div`
  ${media.md`
    display: none;
  `}
`;

/** Mesmo tamanho da busca, enquanto o Suspense resolve os search params. */
export const SearchFallback = styled.div`
  width: 100%;
  height: 2.5rem;
  border-radius: ${radius.campo};
  background-color: ${color.branco};
  box-shadow: ${shadow.card};
`;

export const Shortcuts = styled.nav`
  ${text('apoio')}
  display: none;
  align-items: center;
  gap: 0.25rem;

  ${media.lg`
    display: flex;
  `}
`;

const shortcut = css`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  height: 2.25rem;
  padding-inline: 0.5rem;
  border-radius: ${radius.campo};
  ${inkHover}
`;

export const CategoriesButton = styled.button`
  ${shortcut}
  font-weight: 600;
`;

export const ShortcutLink = styled(Link)`
  ${shortcut}
`;

export const Shipping = styled.p`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-left: auto;
  padding-right: 0.25rem;
  color: ${color.tinta2};
`;

export const ShippingAmount = styled.strong.attrs({ className: 'preco' })`
  font-weight: 600;
`;

/* Conteúdo do menu lateral (celular). */

export const DrawerBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 1.25rem;
`;

export const AccountCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: ${radius.card};
  background-color: ${color.papel2};
`;

export const UserName = styled.p`
  ${text('corpo')}
  font-weight: 600;
`;

export const UserEmail = styled.p`
  ${text('apoio')}
  margin-top: -0.25rem;
  color: ${color.suave};
`;

export const AccountLinks = styled.div<{ $spaced: boolean }>`
  ${text('corpo')}
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: ${color.acao};

  ${(p) =>
    p.$spaced &&
    css`
      margin-top: 0.25rem;
    `}
`;

export const AccountLink = styled(Link)<{ $strong?: boolean }>`
  padding-block: 0.25rem;

  ${(p) =>
    p.$strong &&
    css`
      font-weight: 600;
    `}

  &:hover {
    text-decoration-line: underline;
  }
`;

export const SectionTitle = styled.p`
  ${text('apoio')}
  margin-bottom: 0.5rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  color: ${color.suave};
`;

export const ShortcutList = styled.ul`
  ${text('corpo')}
  display: flex;
  flex-direction: column;
`;

export const DrawerShortcutLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.25rem;
  padding-inline: 0.5rem;
  border-radius: ${radius.campo};

  &:hover {
    background-color: ${color.papel2};
  }
`;

/** Ícone em cinza ao lado do rótulo (era `text-suave`). */
export const MutedIcon = styled.span`
  display: inline-flex;
  color: ${color.suave};
`;
