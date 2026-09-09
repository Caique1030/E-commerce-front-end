'use client';

import Link from 'next/link';
import styled, { css } from 'styled-components';
import { text } from '@/styles/mixins';
import { color } from '@/styles/tokens';

/* Peças do pedido reaproveitadas na confirmação, em "Meus pedidos" e no admin. */

/* OrderHeader */

export const HeaderRoot = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  column-gap: 1.5rem;
  row-gap: 0.5rem;
`;

/** Código do pedido em numeral tabular (`.preco`), no tamanho de título de seção. */
export const Code = styled.p.attrs({ className: 'preco' })`
  ${text('h2')}
`;

/** Linha de apoio em cinza: data do pedido, preço unitário, data de cada passo do histórico. */
export const Meta = styled.p`
  ${text('apoio')}
  color: ${color.suave};
`;

export const Customer = styled.p`
  ${text('apoio')}
  margin-top: 0.25rem;
`;

export const Muted = styled.span`
  color: ${color.suave};
`;

/* OrderItems */

/** Uma linha fina entre os itens (era `divide-y`). */
export const ItemsRoot = styled.ul`
  & > * + * {
    border-top: 1px solid ${color.borda};
  }
`;

export const Item = styled.li`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 0.75rem;
`;

export const ItemBody = styled.div`
  min-width: 0;
`;

export const ItemLink = styled(Link)`
  ${text('corpo')}
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

export const Separator = styled.span`
  margin-inline: 0.375rem;
  color: ${color.bordaForte};
`;

export const Schedule = styled.p`
  ${text('apoio')}
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.25rem;
  color: ${color.agenda};

  & > svg {
    flex-shrink: 0;
  }
`;

/* OrderTimeline */

export const TimelineRoot = styled.ol`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-left: 1px solid ${color.borda};
  padding-left: 1.25rem;
`;

export const Step = styled.li`
  position: relative;
`;

/** O ponto sobre a linha: verde no status atual, cinza nos anteriores, vermelho no cancelamento. */
function markerColor(tone: 'current' | 'past' | 'cancelled') {
  switch (tone) {
    case 'cancelled':
      return color.alerta;
    case 'current':
      return color.verde;
    default:
      return color.bordaForte;
  }
}

export const Marker = styled.span<{ $tone: 'current' | 'past' | 'cancelled' }>`
  position: absolute;
  top: 0.375rem;
  left: -1.4rem;
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 9999px;
  border: 2px solid ${color.branco};
  background-color: ${(p) => markerColor(p.$tone)};
`;

export const StepLabel = styled.p<{ $current: boolean }>`
  ${text('corpo')}
  ${(p) =>
    p.$current &&
    css`
      font-weight: 500;
    `}
`;

export const StepNote = styled.p`
  ${text('apoio')}
  margin-top: 0.125rem;
  color: ${color.tinta2};
`;
