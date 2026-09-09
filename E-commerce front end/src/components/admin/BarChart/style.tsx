'use client';

import styled, { css } from 'styled-components';
import { outlinedPanel, text, truncate } from '@/styles/mixins';
import { color, radius, shadow } from '@/styles/tokens';

export const Root = styled.section`
  padding: 1.25rem;
  ${outlinedPanel()}
`;

export const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

export const Title = styled.h2`
  ${text('h2')}
`;

export const Subtitle = styled.p`
  ${text('apoio')}
  color: ${color.suave};
`;

/** Alternador gráfico/tabela: um grupo de botões com aria-pressed. */
export const ModeToggle = styled.div`
  ${text('apoio')}
  display: flex;
  padding: 0.125rem;
  border: 1px solid ${color.bordaForte};
  border-radius: ${radius.campo};
`;

export const ModeButton = styled.button<{ $active: boolean }>`
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

export const Empty = styled.p`
  ${text('corpo')}
  padding: 2.5rem 0;
  color: ${color.suave};
  text-align: center;
`;

/* Visão em tabela */

export const TableScroll = styled.div`
  overflow-x: auto;
`;

export const DataTable = styled.table`
  ${text('apoio')}
  width: 100%;
`;

export const HeadRow = styled.tr`
  border-bottom: 1px solid ${color.borda};
  color: ${color.suave};
  text-align: left;
`;

export const HeadCell = styled.th<{ $right?: boolean }>`
  padding: 0.5rem 0;
  font-weight: 500;
  text-align: ${(p) => (p.$right ? 'right' : 'inherit')};
`;

export const BodyRow = styled.tr`
  border-bottom: 1px solid ${color.borda};

  &:last-child {
    border-bottom: 0;
  }
`;

export const Cell = styled.td.attrs({ className: 'preco' })<{ $right?: boolean }>`
  padding: 0.375rem 0;
  text-align: ${(p) => (p.$right ? 'right' : 'inherit')};
`;

/* Visão em gráfico */

export const ChartArea = styled.div`
  position: relative;
`;

/** Área do desenho: as linhas do eixo Y ficam atrás das barras, com espaço para o rótulo à esquerda. */
export const Plot = styled.div`
  position: relative;
  height: 14rem;
  padding-left: 3.5rem;
`;

export const GridLine = styled.div`
  position: absolute;
  right: 0;
  left: 3.5rem;
  border-top: 1px solid ${color.borda};
`;

export const GridLabel = styled.span.attrs({ className: 'preco' })`
  ${text('micro')}
  position: absolute;
  top: -0.625rem;
  left: -3.5rem;
  width: 3rem;
  color: ${color.suave};
  text-align: right;
`;

export const Bars = styled.ol`
  position: relative;
  display: flex;
  align-items: flex-end;
  height: 100%;
  gap: 2px;
`;

export const BarSlot = styled.li`
  position: relative;
  display: flex;
  flex: 1 1 0%;
  align-items: flex-end;
  justify-content: center;
  height: 100%;
  min-width: 0;
`;

export const BarButton = styled.button`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;

  &:focus {
    outline-style: none;
  }

  &:focus-visible {
    background-color: color-mix(in oklab, ${color.verdeSuave} 60%, transparent);
  }
`;

export const Bar = styled.span<{ $active: boolean }>`
  display: block;
  width: 100%;
  max-width: 1.5rem;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  background-color: ${(p) => (p.$active ? color.verde2 : color.verde)};
  transition:
    color 150ms,
    background-color 150ms,
    border-color 150ms;
`;

export const Tooltip = styled.div`
  ${text('apoio')}
  position: absolute;
  bottom: 100%;
  left: 50%;
  z-index: 10;
  width: max-content;
  margin-bottom: 0.25rem;
  padding: 0.375rem 0.625rem;
  border: 1px solid ${color.borda};
  border-radius: ${radius.campo};
  background-color: ${color.branco};
  box-shadow: ${shadow.flutuante};
  transform: translateX(-50%);
  pointer-events: none;
`;

export const TooltipValue = styled.p.attrs({ className: 'preco' })`
  color: ${color.tinta};
  font-weight: 600;
`;

export const TooltipMeta = styled.p`
  ${text('micro')}
  color: ${color.suave};
`;

export const Axis = styled.ol`
  ${text('micro')}
  display: flex;
  gap: 2px;
  margin-top: 0.375rem;
  padding-left: 3.5rem;
  color: ${color.suave};
`;

export const AxisLabel = styled.li.attrs({ className: 'preco' })`
  ${truncate()}
  flex: 1 1 0%;
  min-width: 0;
  text-align: center;
`;
