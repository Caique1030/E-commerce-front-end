'use client';

import Link from 'next/link';
import styled, { css } from 'styled-components';
import { media, outlinedPanel, text, truncate } from '@/styles/mixins';
import { color, radius } from '@/styles/tokens';

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

/* Filtros de período */

export const FilterBar = styled.div`
  ${outlinedPanel()}
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
`;

export const PresetGroup = styled.div`
  ${text('apoio')}
  display: flex;
  padding: 0.125rem;
  border: 1px solid ${color.bordaForte};
  border-radius: ${radius.campo};
`;

export const PresetButton = styled.button<{ $active: boolean }>`
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  font-weight: 500;

  ${(p) =>
    p.$active
      ? css`
          background-color: ${color.tinta};
          color: ${color.branco};
        `
      : css`
          color: ${color.suave};

          &:hover {
            color: ${color.tinta};
          }
        `}
`;

export const RangeForm = styled.form`
  ${text('apoio')}
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
`;

export const RangeLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

export const RangeCaption = styled.span`
  color: ${color.suave};
`;

export const DateInput = styled.input.attrs({ className: 'preco' })`
  ${text('apoio')}
  height: 2rem;
  padding: 0 0.5rem;
  border: 1px solid ${color.bordaForte};
  border-radius: ${radius.campo};
  background-color: ${color.branco};
`;

export const ApplyButton = styled.button`
  height: 2rem;
  padding: 0 0.625rem;
  border: 1px solid ${color.bordaForte};
  border-radius: ${radius.campo};
  background-color: ${color.branco};
  font-weight: 500;

  &:hover {
    border-color: ${color.tinta};
  }
`;

export const Refreshing = styled.span`
  ${text('micro')}
  margin-left: auto;
  color: ${color.suave};
`;

/* Resumo: métricas, gráfico e pedidos por status */

export const Summary = styled.div<{ $dimmed: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  transition: opacity 150ms;
  opacity: ${(p) => (p.$dimmed ? 0.6 : 1)};
`;

export const MetricGrid = styled.div`
  display: grid;
  gap: 1rem;

  ${media.sm`
    grid-template-columns: repeat(2, minmax(0, 1fr));
  `}

  ${media.xl`
    grid-template-columns: repeat(4, minmax(0, 1fr));
  `}
`;

export const MetricCard = styled.div<{ $highlight: boolean }>`
  ${outlinedPanel()}
  padding: 1rem;

  ${(p) =>
    p.$highlight &&
    css`
      border-color: color-mix(in oklab, ${color.verde} 30%, transparent);
      background-color: color-mix(in oklab, ${color.verdeSuave} 40%, transparent);
    `}
`;

export const MetricLabel = styled.p`
  ${text('apoio')}
  color: ${color.suave};
`;

/** O valor em destaque é um pouco menor que o preço padrão, para caber com folga no card. */
export const MetricValue = styled.p.attrs({ className: 'preco' })<{ $highlight: boolean }>`
  ${(p) =>
    p.$highlight
      ? css`
          font-size: 1.75rem;
          line-height: 2rem;
        `
      : text('preco')}
  margin-top: 0.25rem;
  color: ${color.tinta};
  font-weight: 600;
`;

export const ChartsGrid = styled.div`
  display: grid;
  gap: 1.25rem;

  ${media.xl`
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  `}
`;

export const StatusCard = styled.section`
  ${outlinedPanel()}
  padding: 1.25rem;
`;

export const SectionTitle = styled.h2`
  ${text('h2')}
`;

export const StatusCaption = styled.p`
  ${text('apoio')}
  margin-bottom: 1rem;
  color: ${color.suave};
`;

export const StatusList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
`;

export const StatusRow = styled.li`
  ${text('apoio')}
  display: grid;
  grid-template-columns: 8rem minmax(0, 1fr) 2.5rem;
  align-items: center;
  gap: 0.75rem;
`;

export const StatusName = styled.span`
  ${truncate()}
`;

export const StatusTrack = styled.span`
  height: 0.75rem;
  overflow: hidden;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  background-color: ${color.papel2};
`;

export const StatusFill = styled.span<{ $cancelled: boolean }>`
  display: block;
  height: 100%;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  background-color: ${(p) =>
    p.$cancelled ? `color-mix(in oklab, ${color.alerta} 70%, transparent)` : color.tinta};
`;

export const StatusCount = styled.span.attrs({ className: 'preco' })`
  font-weight: 500;
  text-align: right;
`;

/* Produtos mais vendidos */

export const TopSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const TopEmpty = styled.p`
  ${outlinedPanel()}
  ${text('corpo')}
  padding: 1.5rem;
  color: ${color.suave};
  text-align: center;
`;

export const ProductLink = styled(Link)`
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

export const Sku = styled.span`
  color: ${color.suave};
`;
