'use client';

import styled from 'styled-components';
import { Panel } from '@/styles/primitives';
import { color } from '@/styles/tokens';

/** Raiz da view. Sem estilo próprio: o espaçamento da página vem do AdminPageHeader. */
export const Root = styled.div``;

/** Moldura do formulário enquanto o produto carrega: `.painel` com borda, mesma caixa do ProductForm. */
export const FormPanel = styled(Panel)`
  border: 1px solid ${color.borda};
  padding: 1.25rem;
`;
