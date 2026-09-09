'use client';

import Link from 'next/link';
import styled, { css } from 'styled-components';
import { media, text } from '@/styles/mixins';
import { color, radius } from '@/styles/tokens';

/** Largura da ferramenta interna: mais larga que a loja (`.conteudo`), as tabelas precisam de espaço. */
const wide = css`
  max-width: 88rem;
  margin-inline: auto;
  padding-inline: 1rem;

  ${media.sm`
    padding-inline: 1.5rem;
  `}

  ${media.lg`
    padding-inline: 2rem;
  `}
`;

/** Branco translúcido sobre a tinta (eram `text-branco/75`, `hover:bg-branco/10` e `bg-branco/15`). */
const dimText = `color-mix(in oklab, ${color.branco} 75%, transparent)`;
const hoverBg = `color-mix(in oklab, ${color.branco} 10%, transparent)`;
const activeBg = `color-mix(in oklab, ${color.branco} 15%, transparent)`;

export const Root = styled.div`
  display: flex;
  flex: 1 1 0%;
  flex-direction: column;
  min-height: 100%;
  background-color: color-mix(in oklab, ${color.papel2} 70%, transparent);
`;

export const Header = styled.header`
  background-color: ${color.tinta};
  color: ${color.branco};
`;

export const HeaderContent = styled.div`
  ${wide}
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 1.5rem;
  row-gap: 0.5rem;
  padding-block: 0.75rem;
`;

/** No celular a navegação desce para a própria linha e rola na horizontal sem barra visível. */
export const Nav = styled.nav.attrs({ className: 'rolagem-discreta' })`
  display: flex;
  order: 9999;
  width: 100%;
  gap: 0.25rem;
  margin-inline: -0.25rem;
  overflow-x: auto;

  ${media.sm`
    order: 0;
    width: auto;
  `}
`;

export const NavLink = styled(Link)<{ $active: boolean }>`
  ${text('apoio')}
  padding: 0.375rem 0.75rem;
  border-radius: ${radius.campo};
  font-weight: 500;
  white-space: nowrap;
  color: ${dimText};

  ${(p) =>
    p.$active &&
    css`
      background-color: ${activeBg};
      color: ${color.branco};
    `}

  &:hover {
    background-color: ${hoverBg};
    color: ${color.branco};
  }
`;

export const Actions = styled.div`
  ${text('apoio')}
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
`;

const action = css`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.5rem;
  border-radius: ${radius.campo};
  color: ${dimText};

  &:hover {
    background-color: ${hoverBg};
    color: ${color.branco};
  }
`;

export const StoreLink = styled(Link)`
  ${action}
`;

export const SignOutButton = styled.button`
  ${action}
`;

/** Nome e papel de quem está logado; só a partir de md, no celular o espaço é curto. */
export const UserName = styled.span`
  display: none;
  color: ${dimText};

  ${media.md`
    display: inline;
  `}
`;

export const Main = styled.main`
  ${wide}
  width: 100%;
  flex: 1 1 0%;
  padding-block: 1.5rem;
`;

/** Faixa com a altura do cabeçalho, para a barra em tinta não "piscar" depois da checagem. */
export const SkeletonBar = styled.div`
  height: 3.25rem;
  background-color: ${color.tinta};
`;

export const SkeletonBody = styled.div`
  ${wide}
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-block: 1.5rem;
`;
