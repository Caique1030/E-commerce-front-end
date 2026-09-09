'use client';

import styled from 'styled-components';
import { outlinedPanel, text } from '@/styles/mixins';
import { color } from '@/styles/tokens';

export const Root = styled.article`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 42rem;
  margin-inline: auto;
`;

export const Header = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
`;

/** O selo verde: benefício para o cliente, o pedido foi recebido. */
export const Seal = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 9999px;
  background-color: ${color.verdeSuave};
  color: ${color.verde};
`;

export const Title = styled.h1`
  ${text('h1')}
`;

export const CodeLine = styled.p`
  ${text('corpo')}
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

export const Code = styled.span.attrs({ className: 'preco' })`
  font-weight: 500;
`;

export const Lead = styled.p`
  ${text('corpo')}
  max-width: 28rem;
  color: ${color.suave};
`;

export const Email = styled.span`
  color: ${color.tinta};
`;

export const MailLink = styled.a`
  text-decoration: underline;
  text-underline-offset: 4px;

  &:hover {
    color: ${color.tinta};
  }
`;

export const ItemsCard = styled.section`
  padding: 0.5rem 1.25rem;
  ${outlinedPanel()}
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
`;

export const Skeletons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 42rem;
  margin-inline: auto;
`;
