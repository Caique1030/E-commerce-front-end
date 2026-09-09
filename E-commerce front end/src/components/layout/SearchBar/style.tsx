'use client';

import styled from 'styled-components';
import { srOnly, text } from '@/styles/mixins';
import { color, radius, shadow } from '@/styles/tokens';

export const Root = styled.form`
  display: flex;
  align-items: center;
  height: 2.5rem;
  border-radius: ${radius.campo};
  background-color: ${color.branco};
  box-shadow: ${shadow.card};

  /* Anel de foco (era focus-within:ring-2 ring-acao/40), somado à sombra do card. */
  &:focus-within {
    box-shadow:
      0 0 0 2px color-mix(in oklab, ${color.acao} 40%, transparent),
      ${shadow.card};
  }
`;

export const Label = styled.label`
  ${srOnly()}
`;

export const Input = styled.input`
  ${text('corpo')}
  flex: 1 1 0%;
  min-width: 0;
  height: 100%;
  padding-right: 0.5rem;
  padding-left: 1rem;
  background-color: transparent;
  color: ${color.tinta};

  &::placeholder {
    color: ${color.suave};
  }

  &:focus {
    outline-style: none;
  }

  &::-webkit-search-cancel-button {
    display: none;
  }
`;

export const ClearButton = styled.button`
  margin-right: 0.25rem;
  padding: 0.25rem;
  border-radius: ${radius.campo};
  color: ${color.suave};

  &:hover {
    background-color: ${color.papel2};
    color: ${color.tinta};
  }
`;

export const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 1.5rem;
  border-left: 1px solid ${color.borda};
  color: ${color.suave};

  &:hover {
    color: ${color.acao};
  }
`;
