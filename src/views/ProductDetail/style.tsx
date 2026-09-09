'use client';

import Link from 'next/link';
import styled, { css } from 'styled-components';
import { media, text } from '@/styles/mixins';
import { Panel } from '@/styles/primitives';
import { color, radius } from '@/styles/tokens';

export type StockTone = 'normal' | 'alerta' | 'esgotado';

export const Root = styled.article`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Breadcrumb = styled.nav`
  ${text('apoio')}
  color: ${color.suave};
`;

export const BreadcrumbList = styled.ol`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
`;

export const BreadcrumbItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export const BreadcrumbLink = styled(Link)`
  &:hover {
    color: ${color.acao};
    text-decoration: underline;
  }
`;

/** Painel principal: foto à esquerda (7/12) e caixa de compra à direita (5/12) a partir de lg. */
export const Main = styled(Panel)`
  display: grid;
  gap: 2rem;
  padding: 1rem;

  ${media.sm`
    padding: 1.5rem;
  `}

  ${media.lg`
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    gap: 2.5rem;
  `}
`;

/** A foto não passa de 28rem: acima disso ela empurra a caixa de compra para fora da tela. */
export const ImageFrame = styled.div<{ $booking: boolean }>`
  width: 100%;
  max-width: 28rem;
  margin-inline: auto;
  align-self: flex-start;
  overflow: hidden;
  border-radius: ${radius.card};

  ${(p) =>
    p.$booking &&
    css`
      border-top: 3px solid ${color.agenda};
    `}
`;

export const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Heading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

export const Meta = styled.p`
  ${text('apoio')}
  color: ${color.suave};
`;

export const MetaDot = styled.span`
  margin-inline: 0.375rem;
  color: ${color.bordaForte};
`;

/** SKU: tabular-nums vem da classe global `.preco`. */
export const Sku = styled.span.attrs({ className: 'preco' })``;

export const Title = styled.h1`
  ${text('h1')}
  text-wrap: balance;
`;

export const PriceBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const Installments = styled.p`
  ${text('corpo')}
  color: ${color.tinta2};
`;

/** Valor da parcela: tabular-nums vem da classe global `.preco`. */
export const InstallmentsValue = styled.span.attrs({ className: 'preco' })`
  font-weight: 600;
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

export const Shipping = styled.p<{ $free: boolean }>`
  ${text('corpo')}
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: ${(p) => (p.$free ? color.verde : color.tinta2)};

  & > svg {
    flex-shrink: 0;
  }
`;

export const Purchase = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-top: 1px solid ${color.borda};
  padding-top: 1rem;
`;

export const QuantityRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
`;

export const QuantityLabel = styled.span`
  ${text('apoio')}
  color: ${color.suave};
`;

export const Stepper = styled.div`
  display: flex;
  height: 3rem;
  align-items: center;
  border-radius: ${radius.campo};
  border: 1px solid ${color.bordaForte};
  background-color: ${color.branco};
`;

export const StepButton = styled.button`
  display: flex;
  width: 3rem;
  height: 3rem;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${color.acao};
  }

  &:disabled {
    color: color-mix(in oklab, ${color.suave} 50%, transparent);
  }
`;

/** Quantidade: tabular-nums vem da classe global `.preco`. */
export const StepValue = styled.span.attrs({ className: 'preco' })`
  ${text('corpo')}
  width: 3rem;
  text-align: center;
  font-weight: 600;
`;

export const Reassurance = styled.p`
  ${text('apoio')}
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${color.suave};

  & > svg {
    flex-shrink: 0;
  }
`;

export const DescriptionPanel = styled.section.attrs({ className: 'painel' })`
  padding: 1rem;

  ${media.sm`
    padding: 1.5rem;
  `}
`;

export const DescriptionTitle = styled.h2`
  ${text('h2')}
`;

export const DescriptionText = styled.p`
  ${text('corpo')}
  margin-top: 0.5rem;
  max-width: 65ch;
  white-space: pre-line;
  color: ${color.tinta2};
`;
