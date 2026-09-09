'use client';

import Link from 'next/link';
import styled, { css } from 'styled-components';
import { lineClamp, media, text } from '@/styles/mixins';
import { color, radius } from '@/styles/tokens';

/**
 * A linha destacada recebe a classe global `animate-destaque` pelo `className` (tem regra de
 * reduced-motion em globals.css); aqui só entram o recuo e o canto arredondado que a acompanham.
 */
export const Root = styled.li<{ $highlighted: boolean; $unavailable: boolean }>`
  display: flex;
  gap: 0.75rem;
  padding-block: 1rem;

  ${(p) =>
    p.$highlighted &&
    css`
      margin-inline: -0.5rem;
      padding-inline: 0.5rem;
      border-radius: ${radius.card};
    `}

  ${(p) =>
    p.$unavailable &&
    css`
      opacity: 0.9;
    `}
`;

export const ImageLink = styled(Link)<{ $compact: boolean }>`
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid ${color.borda};
  border-radius: ${radius.campo};
  width: ${(p) => (p.$compact ? '5rem' : '6rem')};

  ${(p) =>
    !p.$compact &&
    media.sm`
      width: 7rem;
    `}
`;

export const Body = styled.div`
  display: flex;
  flex: 1 1 0%;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
`;

export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
`;

export const Info = styled.div`
  min-width: 0;
`;

export const NameLink = styled(Link)<{ $booking: boolean }>`
  ${text('corpo')}
  ${lineClamp(2)}
  font-weight: 500;

  ${(p) =>
    p.$booking &&
    css`
      color: ${color.tinta};
    `}

  &:hover {
    text-decoration-line: underline;
  }
`;

export const Schedule = styled.p`
  ${text('apoio')}
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.125rem;
  color: ${color.agenda};
`;

/** Ícone que não encolhe ao lado do texto (era `shrink-0`). */
export const Icon = styled.span`
  display: inline-flex;
  flex-shrink: 0;
`;

export const PriceChanged = styled.p`
  ${text('apoio')}
  margin-top: 0.125rem;
  color: ${color.aviso};
`;

export const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 0.25rem;
`;

export const ReadOnlyQuantity = styled.p`
  ${text('apoio')}
  color: ${color.suave};
`;

export const QuantityRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

/* Seletor de quantidade: menos | campo | mais, num só contorno. */

export const Stepper = styled.div`
  display: flex;
  align-items: center;
  height: 2rem;
  border: 1px solid ${color.bordaForte};
  border-radius: ${radius.campo};
  background-color: ${color.branco};
`;

export const StepButton = styled.button<{ $side: 'left' | 'right' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  color: ${color.tinta};

  ${(p) =>
    p.$side === 'left'
      ? css`
          border-top-left-radius: ${radius.campo};
          border-bottom-left-radius: ${radius.campo};
        `
      : css`
          border-top-right-radius: ${radius.campo};
          border-bottom-right-radius: ${radius.campo};
        `}

  &:hover {
    background-color: ${color.papel2};
  }

  &:disabled {
    color: ${color.suave};
  }
`;

export const QuantityInput = styled.input.attrs({ className: 'preco' })`
  ${text('apoio')}
  width: 2.5rem;
  height: 100%;
  border-inline: 1px solid ${color.bordaForte};
  background-color: transparent;
  text-align: center;
  font-weight: 500;

  &:focus {
    outline-style: none;
  }

  &:disabled {
    color: ${color.suave};
  }
`;

export const UnitPrice = styled.span`
  ${text('apoio')}
  display: none;
  margin-left: 0.25rem;
  color: ${color.suave};

  ${media.sm`
    display: inline;
  `}
`;

export const RemoveButton = styled.button`
  ${text('apoio')}
  text-underline-offset: 4px;
  color: ${color.suave};

  &:hover {
    color: ${color.alerta};
    text-decoration-line: underline;
  }

  &:disabled {
    color: ${color.suave};
  }
`;
