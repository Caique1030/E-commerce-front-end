'use client';

import styled, { css } from 'styled-components';
import { outlinedPanel, srOnly, text } from '@/styles/mixins';
import { color, radius } from '@/styles/tokens';

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  ${outlinedPanel()}
`;

/* Busca com a lupa sobreposta ao campo */

export const SearchBox = styled.div`
  position: relative;
  flex: 1 1 0%;
  min-width: 14rem;
`;

export const SearchLabel = styled.label`
  ${srOnly()}
`;

export const SearchIcon = styled.span`
  position: absolute;
  top: 50%;
  left: 0.75rem;
  display: flex;
  transform: translateY(-50%);
  color: ${color.suave};
  pointer-events: none;
`;

export const SearchInput = styled.input`
  ${text('corpo')}
  width: 100%;
  height: 2.5rem;
  padding-right: 0.75rem;
  padding-left: 2.25rem;
  border: 1px solid ${color.bordaForte};
  border-radius: ${radius.campo};
  background-color: ${color.branco};

  &:focus {
    border-color: ${color.tinta};
    outline-style: none;
  }
`;

export const FilterLabel = styled.label`
  ${text('apoio')}
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const FilterCaption = styled.span`
  font-weight: 500;
`;

export const Count = styled.p`
  ${text('apoio')}
  color: ${color.suave};
`;

/* Linhas da tabela */

/** Usuário inativo fica em cinza na linha inteira. */
export const Row = styled.tr<{ $inactive: boolean }>`
  ${(p) =>
    p.$inactive &&
    css`
      color: ${color.suave};
    `}
`;

export const Name = styled.span`
  font-weight: 500;
`;

export const Me = styled.span`
  ${text('micro')}
  margin-left: 0.5rem;
  color: ${color.suave};
  font-weight: 400;
`;

export const Email = styled.span`
  ${text('apoio')}
`;

export const HiddenLabel = styled.label`
  ${srOnly()}
`;

export const CreatedAt = styled.span`
  ${text('apoio')}
`;

/** Ação em texto na linha: sublinha no hover e apaga quando não se aplica a quem está logado. */
const rowAction = css`
  ${text('apoio')}
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }

  &:disabled {
    color: ${color.suave};
    text-decoration: none;
  }
`;

export const ToggleButton = styled.button`
  ${rowAction}
  margin-right: 0.75rem;
  color: ${color.acao};
`;

export const RemoveButton = styled.button`
  ${rowAction}
  color: ${color.alerta};
`;

export const ModalText = styled.p`
  ${text('corpo')}
  color: ${color.suave};
`;
