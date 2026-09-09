'use client';

import styled from 'styled-components';
import { srOnly } from './mixins';

/*
 * Blocos compartilhados entre as telas em styled-components. As classes globais de globals.css
 * (.conteudo, .painel, .trilho) são referenciadas, nunca reimplementadas: o Tailwind e o
 * styled-components precisam desenhar exatamente a mesma coisa.
 */

/** Largura única do conteúdo (`.conteudo`): cabeçalho, faixas, catálogo e rodapé alinham aqui. */
export const Container = styled.div.attrs({ className: 'conteudo' })``;

/** Painel branco sobre o cinza (`.painel`): a unidade de composição da loja. */
export const Panel = styled.div.attrs({ className: 'painel' })``;

/** Trilho horizontal de produtos (`.trilho`), com scroll-snap e coluna de largura fixa. */
export const Track = styled.ul.attrs({ className: 'trilho' })``;

/** Texto só para leitor de tela. */
export const VisuallyHidden = styled.span`
  ${srOnly()}
`;
