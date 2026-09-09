'use client';

import styled, { css } from 'styled-components';
import { media, outlinedPanel, text } from '@/styles/mixins';
import { color, radius } from '@/styles/tokens';

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

/** Resumo no topo: faixa de agenda + frase do que já foi escolhido. */
export const Summary = styled.div`
  border-radius: ${radius.card};
  border: 1px solid color-mix(in oklab, ${color.agenda} 25%, transparent);
  background-color: color-mix(in oklab, ${color.agendaSuave} 50%, transparent);
  padding: 1rem;
`;

export const SummaryText = styled.p`
  ${text('apoio')}
  margin-top: 0.5rem;
  color: ${color.agenda};
`;

/** Calendário à esquerda e horários à direita a partir de sm. */
export const Columns = styled.div`
  display: grid;
  gap: 1rem;

  ${media.sm`
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  `}
`;

export const Slots = styled.div`
  display: flex;
  min-height: 10rem;
  flex-direction: column;
  gap: 0.75rem;
`;

export const Hint = styled.p`
  ${text('corpo')}
  color: ${color.suave};
`;

export const SkeletonStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
`;

export const EmptyDay = styled.p`
  ${text('corpo')}
  ${outlinedPanel()}
  padding: 1rem;
  color: ${color.suave};
`;

export const Refreshing = styled.p`
  ${text('micro')}
  color: ${color.suave};
`;

export const Footer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-top: 1px solid ${color.borda};
  padding-top: 1rem;

  ${media.sm`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  `}
`;

export const Seats = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const SeatsLabel = styled.span`
  ${text('apoio')}
  color: ${color.suave};
`;

export const Stepper = styled.div`
  display: flex;
  height: 2.5rem;
  align-items: center;
  border-radius: ${radius.campo};
  border: 1px solid ${color.bordaForte};
  background-color: ${color.branco};
`;

export const StepButton = styled.button`
  display: flex;
  width: 2.5rem;
  height: 2.5rem;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${color.papel2};
  }

  &:disabled {
    color: ${color.suave};
  }
`;

/** Quantidade de vagas: tabular-nums vem da classe global `.preco`. */
export const StepValue = styled.span.attrs({ className: 'preco' })`
  ${text('corpo')}
  width: 2.5rem;
  text-align: center;
  font-weight: 500;
`;

/* Grupo de horários (Manhã / Tarde). */

export const GroupLegend = styled.legend`
  ${text('apoio')}
  margin-bottom: 0.375rem;
  font-weight: 500;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  color: ${color.suave};
`;

export const SlotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
`;

/** Horário: tabular-nums vem da classe global `.preco`. */
export const SlotButton = styled.button.attrs<{ $active: boolean }>({ className: 'preco' })`
  ${text('apoio')}
  display: flex;
  height: 2.5rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: ${radius.campo};
  border: 1px solid;
  font-weight: 500;
  transition:
    color 150ms,
    background-color 150ms,
    border-color 150ms;

  ${(p) =>
    p.$active
      ? css`
          border-color: ${color.agenda};
          background-color: ${color.agenda};
          color: ${color.branco};
        `
      : css`
          border-color: ${color.bordaForte};
          background-color: ${color.branco};
          color: ${color.tinta};

          &:hover {
            border-color: ${color.agenda};
            background-color: ${color.agendaSuave};
          }
        `}
`;

export const SlotSeats = styled.span<{ $active: boolean }>`
  ${text('micro')}
  font-weight: 400;
  color: ${(p) =>
    p.$active ? `color-mix(in oklab, ${color.branco} 80%, transparent)` : color.suave};
`;
