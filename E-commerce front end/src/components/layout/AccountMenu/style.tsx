'use client';

import Link from 'next/link';
import styled, { css } from 'styled-components';
import { MenuTrigger } from '@/components/ui/Menu';
import { media, text, truncate } from '@/styles/mixins';
import { color, radius } from '@/styles/tokens';

/* Visitante: dois links no lugar do menu. */

export const GuestLinks = styled.div`
  ${text('apoio')}
  display: flex;
  align-items: center;
  gap: 0.125rem;
`;

const guestLink = css`
  align-items: center;
  height: 2.25rem;
  padding-inline: 0.625rem;
  border-radius: ${radius.campo};

  &:hover {
    background-color: color-mix(in oklab, ${color.tinta} 10%, transparent);
  }
`;

export const RegisterLink = styled(Link)`
  ${guestLink}
  display: none;

  ${media.sm`
    display: inline-flex;
  `}
`;

export const LoginLink = styled(Link)`
  ${guestLink}
  display: flex;
  font-weight: 600;
`;

/* Gatilho do menu: iniciais, primeiro nome e seta. */

/** O primitivo `MenuTrigger` é só o <button> com a ARIA; a aparência entra por aqui. */
export const Trigger = styled(MenuTrigger)`
  ${text('apoio')}
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 2.25rem;
  padding-inline: 0.5rem;
  border-radius: ${radius.campo};

  &:hover,
  &[data-state='open'] {
    background-color: color-mix(in oklab, ${color.tinta} 10%, transparent);
  }
`;

export const Avatar = styled.span`
  ${text('micro')}
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
  background-color: ${color.tinta};
  color: ${color.branco};
  font-weight: 600;
`;

export const FirstName = styled.span`
  ${truncate()}
  display: none;
  max-width: 8rem;

  ${media.md`
    display: inline;
  `}
`;

/** Ícone em cinza (era `text-suave`), no gatilho e nos itens. */
export const MutedIcon = styled.span`
  display: inline-flex;
  color: ${color.suave};
`;

/* Cabeçalho do menu: nome, e-mail e papel. */

export const LabelName = styled.span`
  ${truncate()}
  display: block;
  font-weight: 500;
  color: ${color.tinta};
`;

export const LabelEmail = styled.span`
  ${truncate()}
  display: block;
`;

export const LabelRole = styled.span`
  ${text('micro')}
  display: block;
  margin-top: 0.125rem;
  letter-spacing: 0.025em;
  text-transform: uppercase;
`;
