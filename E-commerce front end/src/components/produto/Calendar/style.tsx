'use client';

import styled, { css } from 'styled-components';
import { outlinedPanel, text } from '@/styles/mixins';
import { color, radius } from '@/styles/tokens';

export const Root = styled.div`
  ${outlinedPanel()}
  padding: 0.75rem;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

export const NavButton = styled.button`
  display: flex;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: ${radius.campo};

  &:hover {
    background-color: ${color.papel2};
  }

  &:disabled {
    opacity: 0.4;
  }
`;

export const MonthLabel = styled.p`
  ${text('corpo')}
  font-weight: 500;
  text-transform: capitalize;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.25rem;
`;

export const Weekday = styled.div`
  ${text('micro')}
  padding-block: 0.25rem;
  text-align: center;
  font-weight: 500;
  color: ${color.suave};
`;

interface DayProps {
  /** Fora do mês em exibição: ocupa a célula, mas não aparece. */
  $outside: boolean;
  /** Do mês, mas bloqueado (passado, fim de semana ou sem vaga): riscado e apagado. */
  $blocked: boolean;
  /** Clicável: ganha fundo violeta claro no hover. */
  $hoverable: boolean;
  $selected: boolean;
  /** Hoje, quando não é o dia selecionado. */
  $today: boolean;
}

/** Dia do mês: tabular-nums vem da classe global `.preco`. */
export const Day = styled.button.attrs<DayProps>({ className: 'preco' })`
  ${text('apoio')}
  display: flex;
  height: 2.25rem;
  align-items: center;
  justify-content: center;
  border-radius: ${radius.campo};
  transition:
    color 150ms,
    background-color 150ms,
    border-color 150ms;

  ${(p) =>
    p.$outside &&
    css`
      visibility: hidden;
    `}

  ${(p) =>
    p.$blocked &&
    css`
      color: color-mix(in oklab, ${color.suave} 50%, transparent);
      text-decoration-line: line-through;
      text-decoration-color: color-mix(in oklab, ${color.suave} 40%, transparent);
    `}

  ${(p) =>
    p.$hoverable &&
    css`
      &:hover {
        background-color: ${color.agendaSuave};
      }
    `}

  ${(p) =>
    p.$selected &&
    css`
      background-color: ${color.agenda};
      color: ${color.branco};
      font-weight: 600;

      &:hover {
        background-color: ${color.agenda2};
      }
    `}

  ${(p) =>
    p.$today &&
    css`
      font-weight: 600;
      text-decoration-line: underline;
      text-underline-offset: 4px;
    `}
`;

export const Note = styled.p`
  ${text('micro')}
  margin-top: 0.5rem;
  color: ${color.suave};
`;
