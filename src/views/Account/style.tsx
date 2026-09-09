'use client';

import styled from 'styled-components';
import { outlinedPanel, text } from '@/styles/mixins';
import { color } from '@/styles/tokens';

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 36rem;
  margin-inline: auto;
`;

export const Title = styled.h1`
  ${text('h1')}
`;

export const Subtitle = styled.p`
  ${text('corpo')}
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
  color: ${color.suave};
`;

/** Painel branco de cada formulário: dados pessoais e senha. */
export const FormCard = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  ${outlinedPanel()}
`;

export const SectionTitle = styled.h2`
  ${text('h2')}
`;

export const Skeletons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 36rem;
  margin-inline: auto;
`;
