/**
 * Regras comerciais da vitrine. Ficam num lugar só porque aparecem em quatro telas — card,
 * detalhe do produto, carrinho e rodapé — e precisam dizer exatamente a mesma coisa em todas.
 *
 * Nada aqui é enfeite: o que a vitrine anuncia em verde ou azul sai destas duas funções, a
 * partir do preço real que a API devolveu.
 */

/** Acima deste valor a loja não cobra frete. */
export const FRETE_GRATIS_MINIMO_CENTAVOS = 7900;

/** Parcelamento sem juros: até 12 vezes, nunca com parcela abaixo de R$ 5. */
export const MAX_PARCELAS = 12;
export const PARCELA_MINIMA_CENTAVOS = 500;

export function temFreteGratis(precoCentavos: number): boolean {
  return Number.isFinite(precoCentavos) && precoCentavos >= FRETE_GRATIS_MINIMO_CENTAVOS;
}

export interface Parcelamento {
  vezes: number;
  valorCentavos: number;
}

/**
 * Maior número de parcelas em que o preço cabe sem a parcela cair abaixo do mínimo.
 * Devolve null quando o valor só faz sentido à vista.
 */
export function parcelamento(precoCentavos: number): Parcelamento | null {
  if (!Number.isFinite(precoCentavos) || precoCentavos <= 0) return null;
  const vezes = Math.min(MAX_PARCELAS, Math.floor(precoCentavos / PARCELA_MINIMA_CENTAVOS));
  if (vezes < 2) return null;
  return { vezes, valorCentavos: Math.round(precoCentavos / vezes) };
}
