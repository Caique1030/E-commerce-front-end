import { css, type Interpolation, type RuleSet } from 'styled-components';
import {
  breakpoint,
  color,
  radius,
  shadow,
  TEXT_SCALE_NAMES,
  TEXT_SCALES_WITH_WEIGHT,
} from './tokens';

export type TextScale = (typeof TEXT_SCALE_NAMES)[number];
type Tagged = (
  strings: TemplateStringsArray,
  ...values: Interpolation<object>[]
) => RuleSet<object>;

/**
 * Expande `--text-<escala>`, `--line-height` e (quando existe) `--font-weight`, exatamente como o
 * utilitário `text-<escala>` do Tailwind. Coloque no início do bloco para poder sobrescrever depois.
 */
export function text(scale: TextScale): RuleSet<object> {
  return css`
    font-size: var(--text-${scale});
    line-height: var(--text-${scale}--line-height);
    ${TEXT_SCALES_WITH_WEIGHT.has(scale) ? `font-weight: var(--text-${scale}--font-weight);` : ''}
  `;
}

function minWidth(px: number): Tagged {
  return (strings, ...values) => css`
    @media (min-width: ${px}px) {
      ${css(strings, ...values)}
    }
  `;
}

/** Uso: `${media.lg` + `grid-template-columns: 14rem 1fr;` + `}` — mobile first, como o Tailwind. */
export const media: Record<keyof typeof breakpoint, Tagged> = {
  sm: minWidth(breakpoint.sm),
  md: minWidth(breakpoint.md),
  lg: minWidth(breakpoint.lg),
  xl: minWidth(breakpoint.xl),
};

/** Mesma condição de `prefers-reduced-motion` usada em globals.css. */
export const reducedMotion: Tagged = (strings, ...values) => css`
  @media (prefers-reduced-motion: reduce) {
    ${css(strings, ...values)}
  }
`;

/** Equivalente ao `sr-only` do Tailwind. */
export function srOnly(): RuleSet<object> {
  return css`
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  `;
}

/** Equivalente ao `truncate` do Tailwind. */
export function truncate(): RuleSet<object> {
  return css`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `;
}

/** Equivalente ao `line-clamp-N` do Tailwind. */
export function lineClamp(lines: number): RuleSet<object> {
  return css`
    display: -webkit-box;
    -webkit-line-clamp: ${lines};
    -webkit-box-orient: vertical;
    overflow: hidden;
  `;
}

/**
 * Painel branco com borda: a receita de `.painel` (fundo, raio, sombra) mais o fio de
 * `--color-borda`. É a moldura de formulários, listas e cartões do admin.
 */
export function outlinedPanel(): RuleSet<object> {
  return css`
    border: 1px solid ${color.borda};
    border-radius: ${radius.card};
    background-color: ${color.branco};
    box-shadow: ${shadow.card};
  `;
}

/**
 * globals.css já define `:focus-visible` para tudo. Use este mixin só quando um ancestral com
 * overflow ou border-radius engolir o contorno e for preciso repetir a regra no próprio elemento.
 */
export function focusRing(): RuleSet<object> {
  return css`
    &:focus-visible {
      outline: 2px solid ${color.acao};
      outline-offset: 2px;
      border-radius: 2px;
    }
  `;
}
