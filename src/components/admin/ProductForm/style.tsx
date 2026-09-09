'use client';

import styled, { css } from 'styled-components';
import { media, outlinedPanel, text } from '@/styles/mixins';
import { color, radius } from '@/styles/tokens';

export const Root = styled.form`
  display: grid;
  gap: 1.5rem;

  ${media.lg`
    grid-template-columns: minmax(0, 1fr) 20rem;
  `}
`;

export const Card = styled.div`
  ${outlinedPanel()}
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.25rem;
`;

export const StackFieldset = styled.fieldset`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const GridFieldset = styled.fieldset`
  display: grid;
  gap: 1rem;

  ${media.sm`
    grid-template-columns: repeat(2, minmax(0, 1fr));
  `}
`;

export const Legend = styled.legend`
  ${text('h2')}
  margin-bottom: 0.25rem;
`;

/* Tipo do produto: dois cartões de rádio */

export const TypeOptions = styled.div`
  display: grid;
  gap: 0.5rem;

  ${media.sm`
    grid-template-columns: repeat(2, minmax(0, 1fr));
  `}
`;

/**
 * O cartão selecionado toma a cor do tipo: azul (ação) para produto físico, violeta (agenda)
 * para serviço. Sem seleção, só a borda reage ao hover.
 */
export const TypeOption = styled.label<{ $selected: boolean; $booking: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid ${color.borda};
  border-radius: ${radius.card};
  cursor: pointer;

  ${(p) =>
    p.$selected
      ? css`
          border-color: ${p.$booking ? color.agenda : color.acao};
          background-color: color-mix(
            in oklab,
            ${p.$booking ? color.agendaSuave : color.acaoSuave} 50%,
            transparent
          );
        `
      : css`
          &:hover {
            border-color: ${color.bordaForte};
          }
        `}
`;

export const TypeRadio = styled.input`
  margin-top: 0.25rem;
  accent-color: ${color.acao};
`;

export const TypeLabel = styled.span`
  ${text('corpo')}
  display: block;
  font-weight: 500;
`;

export const TypeDescription = styled.span`
  ${text('apoio')}
  display: block;
  color: ${color.suave};
`;

/* Lateral: pré-visualização e ações */

export const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  ${media.lg`
    position: sticky;
    top: 1.5rem;
    align-self: flex-start;
  `}
`;

export const PreviewCard = styled.div`
  ${outlinedPanel()}
  overflow: hidden;
`;

export const PreviewCaption = styled.p`
  ${text('micro')}
  padding: 0.5rem 0.75rem;
  color: ${color.suave};
`;

export const ActionsCard = styled.div`
  ${outlinedPanel()}
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
`;

export const DangerZone = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid ${color.borda};
`;

export const ConfirmText = styled.p`
  ${text('corpo')}
`;

export const ConfirmName = styled.span`
  font-weight: 500;
`;

export const ConfirmSku = styled.span.attrs({ className: 'preco' })`
  color: ${color.suave};
`;
