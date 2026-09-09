'use client';

import styled from 'styled-components';
import { media, text } from '@/styles/mixins';
import { Panel } from '@/styles/primitives';
import { color } from '@/styles/tokens';

export const Root = styled.section`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 1rem;
`;

export const Header = styled(Panel)`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
`;

export const TitleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  column-gap: 1.5rem;
  row-gap: 0.25rem;
`;

/**
 * Título da grade. Na home (nível 1, sem categoria fixa) a escala display vem da classe global
 * `titulo-display`, passada via className; nos demais casos usa a escala h1.
 */
export const Title = styled.h1<{ $display: boolean }>`
  ${(p) => !p.$display && text('h1')}
`;

export const Description = styled.p`
  ${text('corpo')}
  margin-top: 0.25rem;
  color: ${color.suave};
`;

/** Contagem de resultados: tabular-nums vem da classe global `.preco`. */
export const Count = styled.p.attrs({ className: 'preco' })`
  ${text('apoio')}
  color: ${color.suave};
`;

export const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  border-top: 1px solid ${color.borda};
  padding-top: 0.75rem;
`;

/** Botões "Categorias" e "Filtros": só no mobile, onde a barra lateral não existe. */
export const MobileActions = styled.div`
  display: flex;
  gap: 0.5rem;

  ${media.lg`
    display: none;
  `}
`;

export const Chip = styled.button`
  ${text('apoio')}
  display: inline-flex;
  height: 2rem;
  align-items: center;
  gap: 0.25rem;
  border-radius: 9999px;
  padding-right: 0.5rem;
  padding-left: 0.75rem;
  font-weight: 600;
  background-color: ${color.acaoSuave};
  color: ${color.acao};
  transition:
    color 150ms,
    background-color 150ms,
    border-color 150ms;

  &:hover {
    background-color: ${color.acao};
    color: ${color.branco};
  }
`;

export const SortGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
`;

export const SortLabel = styled.span`
  ${text('apoio')}
  display: none;
  color: ${color.suave};

  ${media.sm`
    display: inline;
  `}
`;

export const EmptyPanel = styled(Panel)``;

/** Grade + paginação; esmaece enquanto a próxima página chega (placeholderData). */
export const Results = styled.div<{ $dimmed: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transition: opacity 150ms;
  opacity: ${(p) => (p.$dimmed ? 0.6 : 1)};
`;
