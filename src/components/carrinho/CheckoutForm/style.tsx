'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { media, outlinedPanel, text } from '@/styles/mixins';
import { color, radius } from '@/styles/tokens';

export const Root = styled.form`
  display: grid;
  gap: 2rem;

  ${media.lg`
    grid-template-columns: minmax(0, 1fr) 24rem;
    gap: 2.5rem;
  `}
`;

/* Coluna dos itens. */

export const Items = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Title = styled.h1`
  ${text('h1')}
`;

/** Painel do 409: o que mudou desde que os itens entraram no carrinho. */
export const ProblemPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid color-mix(in oklab, ${color.alerta} 30%, transparent);
  border-radius: ${radius.card};
  background-color: ${color.alertaSuave};
`;

export const ProblemHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
`;

export const ProblemIcon = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  margin-top: 0.125rem;
  color: ${color.alerta};
`;

export const ProblemTitle = styled.p`
  ${text('corpo')}
  font-weight: 500;
  color: ${color.tinta};
`;

export const ProblemText = styled.p`
  ${text('apoio')}
  color: ${color.suave};
`;

export const ProblemList = styled.ul`
  ${text('corpo')}
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-left: 1.75rem;
`;

export const ProblemName = styled.span`
  font-weight: 500;
`;

export const ProblemAction = styled.div`
  padding-left: 1.75rem;
`;

export const UnavailableNotice = styled.p`
  ${text('apoio')}
  padding: 0.75rem 1rem;
  border: 1px solid color-mix(in oklab, ${color.alerta} 25%, transparent);
  border-radius: ${radius.card};
  background-color: ${color.alertaSuave};
  color: ${color.alerta};
`;

export const NoticeLink = styled(Link)`
  font-weight: 500;
  text-decoration-line: underline;
  text-underline-offset: 4px;
`;

/** Linhas só de leitura, separadas por um fio (era `divide-y divide-borda`). */
export const ItemList = styled.ul`
  padding-inline: 1.25rem;
  ${outlinedPanel()}

  & > * + * {
    border-top: 1px solid ${color.borda};
  }
`;

export const Hint = styled.p`
  ${text('apoio')}
  color: ${color.suave};
`;

export const HintLink = styled(Link)`
  text-decoration-line: underline;
  text-underline-offset: 4px;

  &:hover {
    color: ${color.tinta};
  }
`;

/* Coluna do resumo, grudada no desktop. */

export const Summary = styled.aside`
  ${media.lg`
    position: sticky;
    top: 6rem;
    align-self: flex-start;
  `}
`;

export const SummaryCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.25rem;
  ${outlinedPanel()}
`;

export const Buyer = styled.fieldset`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Legend = styled.legend`
  ${text('h2')}
`;

export const EmailBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const EmailLabel = styled.p`
  ${text('apoio')}
  font-weight: 500;
`;

export const EmailValue = styled.p`
  ${text('corpo')}
`;

export const Totals = styled.div`
  padding-top: 1rem;
  border-top: 1px solid ${color.borda};
`;

export const GeneralError = styled.p`
  ${text('apoio')}
  padding: 0.5rem 0.75rem;
  border-radius: ${radius.campo};
  background-color: ${color.alertaSuave};
  color: ${color.alerta};
`;

export const Note = styled.p`
  ${text('apoio')}
  color: ${color.suave};
`;

export const ExternalLink = styled.a`
  text-decoration-line: underline;
  text-underline-offset: 4px;

  &:hover {
    color: ${color.tinta};
  }
`;
