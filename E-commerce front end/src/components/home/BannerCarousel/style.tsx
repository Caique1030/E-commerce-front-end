'use client';

import Link from 'next/link';
import styled, { css } from 'styled-components';
import { media, text } from '@/styles/mixins';
import { color, radius, shadow } from '@/styles/tokens';

export const Root = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: ${radius.card};
  box-shadow: ${shadow.card};
`;

/**
 * O slide visível. `banner-ativo` (globals.css) faz a entrada em opacidade e a desliga com
 * prefers-reduced-motion; o fundo vem dos dados do banner, por `style`, no próprio componente.
 */
export const Slide = styled.div.attrs<{ $light: boolean }>({ className: 'banner-ativo' })`
  display: flex;
  align-items: center;
  height: 15rem;
  color: ${(p) => (p.$light ? color.branco : color.tinta)};

  ${media.sm`
    height: 17rem;
  `}
  ${media.lg`
    height: 19rem;
  `}
`;

export const Inner = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding-inline: 1.5rem;

  ${media.sm`
    padding-inline: 2.5rem;
  `}
  ${media.lg`
    padding-inline: 3.5rem;
  `}
`;

export const Copy = styled.div`
  display: flex;
  max-width: 32rem;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
`;

/** Olho do banner: meio-tom da própria cor do texto sobre o fundo (branco/20 ou tinta/10). */
export const Eyebrow = styled.span<{ $light: boolean }>`
  ${text('micro')}
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;

  ${(p) =>
    p.$light
      ? css`
          background-color: color-mix(in oklab, ${color.branco} 20%, transparent);
        `
      : css`
          background-color: color-mix(in oklab, ${color.tinta} 10%, transparent);
        `}
`;

export const Title = styled.p.attrs({ className: 'titulo-display' })`
  text-wrap: balance;
`;

export const Text = styled.p<{ $light: boolean }>`
  ${text('corpo')}
  color: ${(p) =>
    p.$light ? `color-mix(in oklab, ${color.branco} 85%, transparent)` : color.tinta2};
`;

/** Chamada do banner: invertida em relação ao texto (branca no fundo escuro, tinta no amarelo). */
export const Cta = styled(Link)<{ $light: boolean }>`
  display: inline-flex;
  align-items: center;
  height: 2.75rem;
  margin-top: 0.25rem;
  padding-inline: 1.25rem;
  border-radius: ${radius.campo};
  box-shadow: ${shadow.card};
  font-weight: 600;
  transition:
    color 150ms,
    background-color 150ms,
    border-color 150ms;

  ${(p) =>
    p.$light
      ? css`
          background-color: ${color.branco};
          color: ${color.tinta};

          &:hover {
            background-color: ${color.papel2};
          }
        `
      : css`
          background-color: ${color.tinta};
          color: ${color.branco};

          &:hover {
            background-color: ${color.tinta2};
          }
        `}
`;

/** A arte só aparece a partir do sm: no celular o texto ocupa a faixa inteira. */
export const Art = styled.div`
  display: none;
  flex-shrink: 0;

  ${media.sm`
    display: block;
  `}
`;

/**
 * Ícone decorativo do banner. Cresce no desktop, o que o prop `size` do lucide não faz sozinho:
 * os dois tamanhos (e a opacidade) vêm por props, em rem, do próprio banner.
 */
export const ArtIcon = styled.span<{ $size: string; $sizeLg: string; $opacity: number }>`
  display: inline-flex;
  opacity: ${(p) => p.$opacity};

  & > svg {
    width: ${(p) => p.$size};
    height: ${(p) => p.$size};
  }

  ${(p) => media.lg`
    & > svg {
      width: ${p.$sizeLg};
      height: ${p.$sizeLg};
    }
  `}
`;

/** A régua do dia em escala de herói (era `h-16 w-full max-w-[13rem]`). */
export const Ruler = styled.svg`
  height: 4rem;
  width: 100%;
  max-width: 13rem;
`;

export const RulerTime = styled.text`
  fill: ${color.agenda};
  font-size: 13px;
  font-weight: 700;
`;

/** Setas: brancas a 85% sobre qualquer fundo, cheias no hover. */
export const Arrow = styled.button<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${(p) => (p.$side === 'left' ? 'left: 0.75rem;' : 'right: 0.75rem;')}
  display: flex;
  width: 2.25rem;
  height: 2.25rem;
  align-items: center;
  justify-content: center;
  transform: translateY(-50%);
  border-radius: 9999px;
  background-color: color-mix(in oklab, ${color.branco} 85%, transparent);
  color: ${color.tinta};
  box-shadow: ${shadow.card};

  &:hover {
    background-color: ${color.branco};
  }
`;

export const Dots = styled.div`
  position: absolute;
  right: 0;
  bottom: 0.75rem;
  left: 0;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
`;

/** Ponto de navegação: alonga quando é o atual. No banner amarelo o ponto branco sumiria: ali ele é tinta. */
export const Dot = styled.button<{ $active: boolean; $light: boolean }>`
  height: 0.5rem;
  width: ${(p) => (p.$active ? '1.5rem' : '0.5rem')};
  border-radius: 9999px;
  transition: all 150ms;

  ${(p) => {
    if (p.$active) {
      return css`
        background-color: ${p.$light ? color.branco : color.tinta};
      `;
    }
    return p.$light
      ? css`
          background-color: color-mix(in oklab, ${color.branco} 50%, transparent);

          &:hover {
            background-color: color-mix(in oklab, ${color.branco} 80%, transparent);
          }
        `
      : css`
          background-color: color-mix(in oklab, ${color.tinta} 30%, transparent);

          &:hover {
            background-color: color-mix(in oklab, ${color.tinta} 60%, transparent);
          }
        `;
  }}
`;
