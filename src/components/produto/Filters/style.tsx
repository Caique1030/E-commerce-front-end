'use client';

import styled, { css } from 'styled-components';
import { srOnly, text } from '@/styles/mixins';
import { color, radius } from '@/styles/tokens';

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

export const Legend = styled.legend`
  ${text('apoio')}
  margin-bottom: 0.5rem;
  font-weight: 500;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  color: ${color.suave};
`;

export const TypeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const TypeOption = styled.label<{ $active: boolean }>`
  ${text('corpo')}
  display: flex;
  min-height: 2.25rem;
  cursor: pointer;
  align-items: center;
  gap: 0.625rem;
  border-radius: ${radius.campo};
  padding-inline: 0.5rem;

  &:hover {
    background-color: ${color.papel2};
  }

  ${(p) =>
    p.$active &&
    css`
      background-color: ${color.acaoSuave};
      color: ${color.acao};
      font-weight: 500;
    `}
`;

export const Radio = styled.input`
  accent-color: ${color.acao};
`;

export const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

/** Rótulo só para leitor de tela (os campos mostram placeholder). */
export const SrLabel = styled.label`
  ${srOnly()}
`;

/** Campo de preço: tabular-nums vem da classe global `.preco`. */
export const PriceInput = styled.input.attrs({ className: 'preco' })`
  ${text('apoio')}
  height: 2.25rem;
  width: 100%;
  border-radius: ${radius.campo};
  border: 1px solid ${color.bordaForte};
  background-color: ${color.branco};
  padding-inline: 0.625rem;

  &:hover {
    border-color: ${color.tinta3};
  }

  &:focus {
    border-color: ${color.acao};
    outline: none;
  }
`;

export const Dash = styled.span`
  color: ${color.suave};
`;
