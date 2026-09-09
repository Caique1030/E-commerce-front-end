'use client';

import Link from 'next/link';
import styled, { css } from 'styled-components';
import { lineClamp, media, text } from '@/styles/mixins';
import { color } from '@/styles/tokens';

export const SkeletonRoot = styled.div.attrs({ className: 'painel' })`
  display: flex;
  gap: 1.5rem;
  overflow: hidden;
  padding: 1.25rem 1rem;
`;

export const SkeletonItem = styled.div`
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

export const Root = styled.nav.attrs({ className: 'painel' })`
  overflow: hidden;
  padding: 1rem 0.5rem;
`;

/** Rola de lado sem barra visível (`rolagem-discreta`); no desktop distribui os atalhos na largura. */
export const List = styled.ul.attrs({ className: 'rolagem-discreta' })`
  display: flex;
  gap: 0.25rem;
  overflow-x: auto;
  padding-inline: 0.5rem;

  ${media.sm`
    justify-content: space-between;
  `}
`;

export const Item = styled.li`
  flex-shrink: 0;
`;

/** O atalho inteiro é o alvo do hover: a bolha do ícone reage a ele (era `group`/`group-hover`). */
export const Card = styled(Link)`
  display: flex;
  width: 5.5rem;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.25rem;
  border-radius: 0.5rem;
  text-align: center;

  &:hover {
    background-color: ${color.papel2};
  }
`;

/** Bolha do ícone: cinza que vira azul no hover; nos serviços, violeta-claro que vira violeta. */
export const IconCircle = styled.span<{ $schedule: boolean }>`
  display: flex;
  width: 3.5rem;
  height: 3.5rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  transition:
    color 150ms,
    background-color 150ms,
    border-color 150ms;

  ${(p) =>
    p.$schedule
      ? css`
          background-color: ${color.agendaSuave};
          color: ${color.agenda};

          ${Card}:hover & {
            background-color: ${color.agenda};
            color: ${color.branco};
          }
        `
      : css`
          background-color: ${color.papel2};
          color: ${color.tinta2};

          ${Card}:hover & {
            background-color: ${color.acao};
            color: ${color.branco};
          }
        `}
`;

/** Nome em até duas linhas apertadas (`leading-tight`). */
export const Label = styled.span`
  ${text('micro')}
  ${lineClamp(2)}
  line-height: 1.25;
  font-weight: 600;
  color: ${color.tinta2};
`;
