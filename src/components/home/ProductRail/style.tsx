'use client';

import Link from 'next/link';
import styled, { css } from 'styled-components';
import { lineClamp, media, text, truncate } from '@/styles/mixins';
import { Track as BaseTrack } from '@/styles/primitives';
import { color, shadow } from '@/styles/tokens';

export type RailTone = 'neutral' | 'schedule';

/*
 * As faixas da célula do trilho. Toda célula tem todas elas, com conteúdo ou sem: é isso que
 * mantém foto, nome, preço e benefício na mesma altura do primeiro ao último card. Cada altura
 * é o line-height do seu papel na escala tipográfica, então nada aperta nem sobra.
 */
export type RailRow = 'label' | 'name' | 'price' | 'support';

const ROW_HEIGHT: Record<RailRow, string> = {
  label: '0.875rem' /* text-micro, 1 linha */,
  name: '2.25rem' /* text-apoio, 2 linhas */,
  price: '1.875rem' /* text-preco-md, 1 linha */,
  support: '1.125rem' /* text-apoio, 1 linha */,
};

function railRow(row: RailRow) {
  return css`
    min-height: ${ROW_HEIGHT[row]};
  `;
}

export const Root = styled.section.attrs({ className: 'painel' })`
  overflow: hidden;
`;

/** Cabeçalho do trilho: linha fina embaixo no neutro; violeta cheio no trilho de serviços. */
export const Header = styled.div<{ $tone: RailTone }>`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  column-gap: 1rem;
  row-gap: 0.25rem;
  padding: 1rem;

  ${(p) =>
    p.$tone === 'schedule'
      ? css`
          border-top-left-radius: inherit;
          border-top-right-radius: inherit;
          background-color: ${color.agenda};
          color: ${color.branco};
        `
      : css`
          border-bottom: 1px solid ${color.borda};
        `}
`;

export const Heading = styled.h2`
  ${text('h2')}
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const Description = styled.p<{ $tone: RailTone }>`
  ${text('apoio')}
  margin-top: 0.125rem;
  color: ${(p) =>
    p.$tone === 'schedule' ? `color-mix(in oklab, ${color.branco} 85%, transparent)` : color.suave};
`;

export const SeeAll = styled(Link)<{ $tone: RailTone }>`
  ${text('apoio')}
  font-weight: 600;
  color: ${(p) => (p.$tone === 'schedule' ? color.branco : color.acao)};

  &:hover {
    text-decoration: underline;
  }
`;

/** Esqueleto no mesmo `.trilho` da lista real: as colunas já nascem na largura certa. */
export const SkeletonTrack = styled.div.attrs({ className: 'trilho' })``;

export const Viewport = styled.div`
  position: relative;
`;

/** A lista rolável (`.trilho`, de `@/styles/primitives`). */
export const Track = styled(BaseTrack)``;

export const Cell = styled.li`
  display: flex;
`;

/** Setas só no desktop: no toque, o dedo faz o trabalho delas. */
export const Arrow = styled.button<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${(p) => (p.$side === 'left' ? 'left: 0.5rem;' : 'right: 0.5rem;')}
  display: none;
  width: 2.25rem;
  height: 2.25rem;
  align-items: center;
  justify-content: center;
  transform: translateY(-50%);
  border-radius: 9999px;
  background-color: ${color.branco};
  color: ${color.tinta};
  box-shadow: ${shadow.cardAlto};

  &:hover {
    background-color: ${color.papel2};
  }

  ${media.lg`
    display: flex;
  `}
`;

/* RailCard */

/*
 * `group` continua como classe: o zoom da foto no hover vive dentro de `ProductImage`
 * (`group-hover:scale-[1.04]`), um primitivo Tailwind que não é reimplementado aqui.
 */
export const Card = styled(Link).attrs({ className: 'group' })`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  padding: 0.75rem;

  &:hover {
    background-color: color-mix(in oklab, ${color.papel2} 60%, transparent);
  }
`;

/** Rótulo acima do nome: marca/categoria (cinza) ou "Serviço agendado" (violeta, em negrito). */
export const Label = styled.p<{ $booking: boolean }>`
  ${text('micro')}
  ${truncate()}
  ${railRow('label')}
  margin-top: 0.5rem;
  letter-spacing: 0.025em;
  text-transform: uppercase;

  ${(p) =>
    p.$booking
      ? css`
          font-weight: 700;
          color: ${color.agenda};
        `
      : css`
          color: ${color.suave};
        `}
`;

/** Nome em duas linhas; sublinha quando o card inteiro está sob o ponteiro. */
export const Name = styled.p`
  ${text('apoio')}
  ${lineClamp(2)}
  ${railRow('name')}
  color: ${color.tinta2};

  ${Card}:hover & {
    text-decoration: underline;
  }
`;

export const PriceRow = styled.div`
  ${railRow('price')}
  display: flex;
  align-items: flex-end;
  margin-top: 0.5rem;
`;

export const Installments = styled.p`
  ${text('apoio')}
  ${railRow('support')}
  color: ${color.tinta3};
`;

/** Valor da parcela: tabular-nums vem da classe global `.preco`. */
export const InstallmentsValue = styled.span.attrs({ className: 'preco' })`
  font-weight: 600;
  color: ${color.verde};
`;

/** Benefício: duração do serviço (violeta) ou frete grátis (verde), com o ícone que não encolhe. */
export const Benefit = styled.p<{ $booking: boolean }>`
  ${text('apoio')}
  ${railRow('support')}
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 700;
  color: ${(p) => (p.$booking ? color.agenda : color.verde)};

  & > svg {
    flex-shrink: 0;
  }
`;

/* RailCardSkeleton */

export const SkeletonCell = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
`;

/**
 * Linha do esqueleto com a altura fixa da faixa correspondente; o bloco de esqueleto estica
 * por dentro (flex), então a célula vazia tem exatamente o desenho da célula cheia.
 */
export const SkeletonRow = styled.div<{ $row: RailRow }>`
  display: flex;

  & > * {
    flex: 1 1 0%;
  }

  ${(p) => {
    switch (p.$row) {
      case 'label':
        return css`
          ${railRow('label')}
          margin-top: 0.5rem;
          width: 4rem;
        `;
      case 'name':
        return css`
          ${railRow('name')}
          margin-top: 0.25rem;
          width: 100%;
        `;
      case 'price':
        return css`
          ${railRow('price')}
          margin-top: 0.5rem;
          width: 6rem;
        `;
      default:
        return css`
          ${railRow('support')}
          margin-top: 0.25rem;
          width: 5rem;
        `;
    }
  }}
`;
