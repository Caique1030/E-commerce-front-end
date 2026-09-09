'use client';

import Link from 'next/link';
import styled, { css } from 'styled-components';
import { lineClamp, text, truncate } from '@/styles/mixins';
import { color, radius, shadow } from '@/styles/tokens';

export type StockTone = 'normal' | 'alerta' | 'esgotado';

/*
 * `group` continua como classe: o zoom da foto no hover vive dentro de `ProductImage`
 * (`group-hover:scale-[1.04]`), um primitivo Tailwind que não é reimplementado aqui.
 */
export const Root = styled.article.attrs<{ $booking: boolean }>({ className: 'group' })`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: ${radius.card};
  background-color: ${color.branco};
  box-shadow: ${shadow.card};
  transition: box-shadow 150ms;

  &:hover {
    box-shadow: ${shadow.cardAlto};
  }

  ${(p) =>
    p.$booking &&
    css`
      border-top: 3px solid ${color.agenda};
    `}
`;

export const ImageLink = styled(Link)`
  display: block;
`;

export const Body = styled.div`
  display: flex;
  flex: 1 1 0%;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
`;

/** Rótulo acima do título: marca/categoria (cinza, truncado) ou "Serviço agendado" (violeta, com ícone). */
export const Label = styled.p<{ $booking: boolean }>`
  ${text('micro')}
  text-transform: uppercase;
  letter-spacing: 0.025em;

  ${(p) =>
    p.$booking
      ? css`
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: 700;
          color: ${color.agenda};
        `
      : css`
          ${truncate()}
          color: ${color.suave};
        `}
`;

export const Title = styled.h3`
  ${text('corpo')}
  color: ${color.tinta2};
  line-height: 1.15rem;
`;

export const TitleLink = styled(Link)`
  ${lineClamp(2)}

  &:hover {
    text-decoration: underline;
  }
`;

export const Pricing = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  margin-top: 0.5rem;
`;

export const Installments = styled.p`
  ${text('apoio')}
  color: ${color.tinta3};
`;

/** Valor da parcela: tabular-nums vem da classe global `.preco`. */
export const InstallmentsValue = styled.span.attrs({ className: 'preco' })`
  font-weight: 600;
  color: ${color.verde};
`;

export const FreeShipping = styled.p`
  ${text('apoio')}
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 700;
  color: ${color.verde};
`;

export const Duration = styled.p`
  ${text('apoio')}
  color: ${color.suave};
`;

export const Stock = styled.p<{ $tone: StockTone }>`
  ${text('apoio')}

  ${(p) => {
    switch (p.$tone) {
      case 'esgotado':
        return css`
          font-weight: 600;
          color: ${color.alerta};
        `;
      case 'alerta':
        return css`
          font-weight: 600;
          color: ${color.aviso};
        `;
      default:
        return css`
          color: ${color.suave};
        `;
    }
  }}
`;

export const Footer = styled.div`
  margin-top: auto;
  padding-top: 0.75rem;
`;
