/**
 * Formatação na borda: a API fala em centavos e UTC; a tela fala em reais e horário de Brasília.
 * Funções puras, sem dependência de biblioteca, cobertas por teste unitário.
 */

export const FUSO_APP = 'America/Sao_Paulo';
export const NOME_FUSO = 'horário de Brasília';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const numeroInteiro = new Intl.NumberFormat('pt-BR');

/** 129900 → "R$ 1.299,00" (o espaço após R$ é não separável). */
export function centavosParaBRL(centavos: number): string {
  if (!Number.isFinite(centavos)) return brl.format(0);
  return brl.format(Math.round(centavos) / 100);
}

/**
 * "R$ 1.299,90" | "1299,90" | "1299.90" | "1.299" | "1299" → centavos inteiros.
 * Devolve null para entrada vazia ou ilegível. Arredonda meio para cima na terceira casa.
 * Aritmética em string: nunca passa por float.
 */
export function brlParaCentavos(texto: string): number | null {
  if (typeof texto !== 'string') return null;
  const limpo = texto.replace(/[^\d.,-]/g, '');
  if (!limpo || limpo === '-' || !/\d/.test(limpo)) return null;

  const negativo = limpo.startsWith('-');
  const corpo = limpo.replace(/-/g, '');

  const ultimaVirgula = corpo.lastIndexOf(',');
  const ultimoPonto = corpo.lastIndexOf('.');

  let inteiro: string;
  let fracao: string;

  if (ultimaVirgula === -1 && ultimoPonto === -1) {
    inteiro = corpo;
    fracao = '';
  } else if (ultimaVirgula !== -1 && ultimoPonto !== -1) {
    // Os dois presentes: o último é o decimal; o outro é milhar.
    const posDecimal = Math.max(ultimaVirgula, ultimoPonto);
    inteiro = corpo.slice(0, posDecimal).replace(/[.,]/g, '');
    fracao = corpo.slice(posDecimal + 1);
  } else if (ultimaVirgula !== -1) {
    // Só vírgula: decimal, salvo se aparecer mais de uma (milhar informal "1,299,000").
    if ((corpo.match(/,/g) ?? []).length > 1) {
      inteiro = corpo.replace(/,/g, '');
      fracao = '';
    } else {
      inteiro = corpo.slice(0, ultimaVirgula);
      fracao = corpo.slice(ultimaVirgula + 1);
    }
  } else {
    // Só ponto: decimal se aparecer uma vez com até 2 dígitos depois; senão é milhar.
    const pontos = (corpo.match(/\./g) ?? []).length;
    const depois = corpo.slice(ultimoPonto + 1);
    if (pontos === 1 && depois.length <= 2) {
      inteiro = corpo.slice(0, ultimoPonto);
      fracao = depois;
    } else {
      inteiro = corpo.replace(/\./g, '');
      fracao = '';
    }
  }

  if (fracao && !/^\d+$/.test(fracao)) return null;
  if (inteiro && !/^\d+$/.test(inteiro)) return null;

  const inteiroNum = Number(inteiro || '0');
  let centavos = inteiroNum * 100;

  if (fracao.length === 0) {
    // nada
  } else if (fracao.length === 1) {
    centavos += Number(fracao) * 10;
  } else {
    centavos += Number(fracao.slice(0, 2));
    const terceira = Number(fracao[2] ?? '0');
    if (terceira >= 5) centavos += 1;
  }

  return negativo ? -centavos : centavos;
}

export function formatarInteiro(n: number): string {
  return numeroInteiro.format(n);
}

function partes(iso: string, opcoes: Intl.DateTimeFormatOptions): Intl.DateTimeFormatPart[] {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO_APP, ...opcoes }).formatToParts(
    new Date(iso),
  );
}

function pegar(ps: Intl.DateTimeFormatPart[], tipo: Intl.DateTimeFormatPartTypes): string {
  return ps.find((p) => p.type === tipo)?.value ?? '';
}

function capitalizar(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "14:00" no fuso da aplicação. */
export function formatarHora(iso: string): string {
  const ps = partes(iso, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  return `${pegar(ps, 'hour')}:${pegar(ps, 'minute')}`;
}

/** "12/09/2026" */
export function formatarData(iso: string): string {
  const ps = partes(iso, { day: '2-digit', month: '2-digit', year: 'numeric' });
  return `${pegar(ps, 'day')}/${pegar(ps, 'month')}/${pegar(ps, 'year')}`;
}

/** "12/09/2026 14:00" */
export function formatarDataHora(iso: string): string {
  return `${formatarData(iso)} ${formatarHora(iso)}`;
}

/** "12 de setembro de 2026" */
export function formatarDataLonga(iso: string): string {
  const ps = partes(iso, { day: 'numeric', month: 'long', year: 'numeric' });
  return `${pegar(ps, 'day')} de ${pegar(ps, 'month')} de ${pegar(ps, 'year')}`;
}

/** "Quinta, 12 de setembro, 14:00 (horário de Brasília)" — o fuso é dito, não presumido. */
export function formatarAgendamento(iso: string, comFuso = true): string {
  const ps = partes(iso, { weekday: 'long', day: 'numeric', month: 'long' });
  const diaSemana = capitalizar(pegar(ps, 'weekday').split('-')[0]);
  const texto = `${diaSemana}, ${pegar(ps, 'day')} de ${pegar(ps, 'month')}, ${formatarHora(iso)}`;
  return comFuso ? `${texto} (${NOME_FUSO})` : texto;
}

/** "Qui, 12/09 às 14:00" — versão curta para linhas de carrinho e tabelas. */
export function formatarAgendamentoCurto(iso: string): string {
  const ps = partes(iso, { weekday: 'short', day: '2-digit', month: '2-digit' });
  const diaSemana = capitalizar(pegar(ps, 'weekday').replace('.', ''));
  return `${diaSemana}, ${pegar(ps, 'day')}/${pegar(ps, 'month')} às ${formatarHora(iso)}`;
}

/** 60 → "1h", 90 → "1h30", 120 → "2h", 45 → "45 min" */
export function formatarDuracao(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
}

export function pluralizar(n: number, singular: string, plural: string): string {
  return `${formatarInteiro(n)} ${n === 1 ? singular : plural}`;
}

/** Data civil de hoje no fuso da aplicação, em YYYY-MM-DD. */
export function dataCivilHoje(agora: Date = new Date()): string {
  const ps = new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO_APP,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(agora);
  return `${pegar(ps, 'year')}-${pegar(ps, 'month')}-${pegar(ps, 'day')}`;
}

/** Iniciais para o avatar: "Maria Silva" → "MS". */
export function iniciais(nome: string): string {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');
}

/** Corta texto com reticências sem quebrar palavra no meio quando possível. */
export function resumir(texto: string, max = 72): string {
  if (texto.length <= max) return texto;
  const corte = texto.slice(0, max);
  const ultimoEspaco = corte.lastIndexOf(' ');
  return `${(ultimoEspaco > max * 0.6 ? corte.slice(0, ultimoEspaco) : corte).trimEnd()}…`;
}
