'use client';

import Link from 'next/link';
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

/** Produto inativo fica em cinza na linha inteira. */
export const Row = styled.tr<{ $inactive: boolean }>`
  ${(p) =>
    p.$inactive &&
    css`
      color: ${color.suave};
    `}
`;

export const Thumb = styled.div`
  width: 3rem;
  overflow: hidden;
  border: 1px solid ${color.borda};
  border-radius: ${radius.campo};
`;

export const NameLink = styled(Link)`
  color: ${color.tinta};
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

export const Sku = styled.span.attrs({ className: 'preco' })`
  ${text('micro')}
  display: block;
  color: ${color.suave};
`;

export const CategoryName = styled.span`
  ${text('apoio')}
`;

/** Estoque zerado de produto físico chama atenção em vermelho. */
export const Stock = styled.span<{ $out: boolean }>`
  ${(p) =>
    p.$out &&
    css`
      color: ${color.alerta};
    `}
`;

export const EditLink = styled(Link)`
  ${text('apoio')}
  color: ${color.acao};
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;
