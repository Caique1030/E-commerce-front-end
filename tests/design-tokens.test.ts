import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const GLOBALS = path.resolve(__dirname, '../src/app/globals.css');
const TOKENS = path.resolve(__dirname, '../src/styles/tokens.ts');

/** Só as declarações de primeiro nível dentro de `@theme { }`; ignora os @keyframes aninhados. */
function nomesDoTheme(css: string): Set<string> {
  const abre = css.indexOf('{', css.indexOf('@theme'));
  let fim = abre;
  let profundidade = 0;
  for (let i = abre; i < css.length; i++) {
    if (css[i] === '{') profundidade++;
    if (css[i] === '}') {
      profundidade--;
      if (profundidade === 0) {
        fim = i;
        break;
      }
    }
  }
  const nomes = new Set<string>();
  let nivel = 0;
  for (const linha of css.slice(abre + 1, fim).split('\n')) {
    if (nivel === 0) {
      const m = linha.match(/^\s*--([a-z0-9-]+):/i);
      if (m) nomes.add(m[1]);
    }
    nivel += (linha.match(/{/g) ?? []).length - (linha.match(/}/g) ?? []).length;
  }
  return nomes;
}

describe('tokens.ts não diverge do @theme de globals.css', () => {
  const nomesCss = nomesDoTheme(readFileSync(GLOBALS, 'utf8'));
  const tokensSrc = readFileSync(TOKENS, 'utf8');

  it('TEXT_SCALE_NAMES bate 1:1 com as escalas --text-*', () => {
    const escalasCss = [...nomesCss]
      .filter((n) => n.startsWith('text-') && !n.slice(5).includes('--'))
      .map((n) => n.slice(5))
      .sort();
    const declaracao = tokensSrc.match(/TEXT_SCALE_NAMES\s*=\s*\[([^\]]+)]/)?.[1] ?? '';
    const escalasTs = declaracao
      .split(',')
      .map((s) => s.trim().replace(/['"]/g, ''))
      .filter(Boolean)
      .sort();
    expect(escalasTs).toEqual(escalasCss);
  });

  it('TEXT_SCALES_WITH_WEIGHT bate com as escalas que definem --font-weight', () => {
    const comPeso = [...nomesCss]
      .filter((n) => n.startsWith('text-') && n.endsWith('--font-weight'))
      .map((n) => n.slice(5, -'--font-weight'.length))
      .sort();
    const bloco =
      tokensSrc.match(/TEXT_SCALES_WITH_WEIGHT[^=]*=\s*new Set\(\[([^\]]+)]\)/)?.[1] ?? '';
    const emTs = bloco
      .split(',')
      .map((s) => s.trim().replace(/['"]/g, ''))
      .filter(Boolean)
      .sort();
    expect(emTs).toEqual(comPeso);
  });

  it('toda variável de cor, fonte, raio, sombra, easing e animação é referenciada em tokens.ts', () => {
    const outras = [...nomesCss].filter((n) => !n.startsWith('text-'));
    const referenciadas = new Set(
      [...tokensSrc.matchAll(/cssVar\('([a-z0-9-]+)'\)/g)].map((m) => m[1]),
    );
    expect(outras.filter((n) => !referenciadas.has(n))).toEqual([]);
    expect([...referenciadas].filter((n) => !nomesCss.has(n))).toEqual([]);
  });
});
