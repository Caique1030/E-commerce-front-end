'use client';

import styled, { css } from 'styled-components';
import { outlinedPanel, text, truncate } from '@/styles/mixins';
import { color, radius } from '@/styles/tokens';

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Toolbar = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const Tree = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

/** Raiz é um cartão; subcategoria só tem a linha à esquerda, sobre o fundo do pai. */
export const Node = styled.li<{ $nested: boolean }>`
  ${outlinedPanel()}

  ${(p) =>
    p.$nested &&
    css`
      border-width: 0;
      border-left-width: 1px;
      background-color: transparent;
    `}
`;

export const NodeRow = styled.div<{ $nested: boolean }>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 0.75rem;
  row-gap: 0.25rem;
  padding: 0.5rem 0.75rem;

  ${(p) =>
    p.$nested &&
    css`
      padding-left: 1rem;
    `}
`;

export const NodeInfo = styled.div`
  display: flex;
  flex: 1 1 0%;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
`;

export const NodeName = styled.span<{ $root: boolean }>`
  ${text('corpo')}
  ${truncate()}

  ${(p) =>
    p.$root &&
    css`
      font-weight: 500;
    `}
`;

export const NodeSlug = styled.span.attrs({ className: 'preco' })`
  ${text('micro')}
  ${truncate()}
  color: ${color.suave};
`;

export const NodeActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.125rem;
`;

/** Ação discreta da linha; a de excluir fica vermelha só no hover. */
export const ActionButton = styled.button<{ $danger?: boolean }>`
  ${text('apoio')}
  padding: 0.25rem 0.5rem;
  border-radius: ${radius.campo};
  color: ${color.suave};
  font-weight: 500;

  &:hover {
    background-color: ${color.papel2};
    color: ${(p) => (p.$danger ? color.alerta : color.tinta)};
  }

  &:disabled {
    opacity: 0.4;
  }
`;

export const Subtree = styled.ul`
  display: flex;
  flex-direction: column;
  margin-left: 1rem;
  padding-bottom: 0.5rem;
  border-left: 1px solid ${color.borda};
`;

export const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const ModalText = styled.p`
  ${text('corpo')}
  color: ${color.suave};
`;
