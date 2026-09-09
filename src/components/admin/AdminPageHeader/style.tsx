'use client';

import styled from 'styled-components';
import { text } from '@/styles/mixins';
import { color } from '@/styles/tokens';

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

export const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem;
`;

export const Title = styled.h1`
  ${text('h1')}
`;

export const Description = styled.p`
  ${text('apoio')}
  margin-top: 0.125rem;
  color: ${color.suave};
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;
