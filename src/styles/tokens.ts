/**
 * Ponte entre o `@theme` de `globals.css` e o styled-components.
 *
 * Nenhum valor é copiado para cá: cada entrada é apenas o nome de uma custom property viva,
 * então o styled-components resolve exatamente o mesmo valor que os utilitários do Tailwind.
 * `tests/design-tokens.test.ts` falha quando um token é criado ou renomeado só de um lado.
 */
function cssVar(name: string): string {
  return `var(--${name})`;
}

export const color = {
  tinta: cssVar('color-tinta'),
  tinta2: cssVar('color-tinta-2'),
  tinta3: cssVar('color-tinta-3'),
  suave: cssVar('color-suave'),
  papel: cssVar('color-papel'),
  papel2: cssVar('color-papel-2'),
  papel3: cssVar('color-papel-3'),
  branco: cssVar('color-branco'),
  amarelo: cssVar('color-amarelo'),
  amarelo2: cssVar('color-amarelo-2'),
  amarelo3: cssVar('color-amarelo-3'),
  acao: cssVar('color-acao'),
  acao2: cssVar('color-acao-2'),
  acao3: cssVar('color-acao-3'),
  acaoSuave: cssVar('color-acao-suave'),
  verde: cssVar('color-verde'),
  verde2: cssVar('color-verde-2'),
  verdeSuave: cssVar('color-verde-suave'),
  agenda: cssVar('color-agenda'),
  agenda2: cssVar('color-agenda-2'),
  agendaSuave: cssVar('color-agenda-suave'),
  agendaTinta: cssVar('color-agenda-tinta'),
  alerta: cssVar('color-alerta'),
  alertaSuave: cssVar('color-alerta-suave'),
  aviso: cssVar('color-aviso'),
  avisoSuave: cssVar('color-aviso-suave'),
  borda: cssVar('color-borda'),
  bordaForte: cssVar('color-borda-forte'),
} as const;

export const font = { ui: cssVar('font-ui') } as const;

export const radius = {
  card: cssVar('radius-card'),
  campo: cssVar('radius-campo'),
} as const;

export const shadow = {
  card: cssVar('shadow-card'),
  cardAlto: cssVar('shadow-card-alto'),
  barra: cssVar('shadow-barra'),
  flutuante: cssVar('shadow-flutuante'),
} as const;

export const ease = { drawer: cssVar('ease-drawer') } as const;

/** Animações registradas no @theme: use como `animation: ${animation.esqueleto};`. */
export const animation = {
  destaque: cssVar('animate-destaque'),
  esqueleto: cssVar('animate-esqueleto'),
} as const;

/** Escalas `--text-*` do @theme; usadas pelo mixin `text()` e pelo teste de divergência. */
export const TEXT_SCALE_NAMES = [
  'display',
  'h1',
  'h2',
  'corpo',
  'apoio',
  'micro',
  'preco',
  'preco-md',
  'preco-sm',
] as const;

/** Escalas que também definem `--font-weight` no @theme. */
export const TEXT_SCALES_WITH_WEIGHT: ReadonlySet<(typeof TEXT_SCALE_NAMES)[number]> = new Set([
  'display',
  'h1',
  'h2',
  'preco',
  'preco-md',
  'preco-sm',
]);

/** Mesmos pontos de corte do Tailwind (sm/md/lg/xl). */
export const breakpoint = { sm: 640, md: 768, lg: 1024, xl: 1280 } as const;
