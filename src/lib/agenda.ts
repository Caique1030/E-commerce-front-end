import { FUSO_APP, dataCivilHoje } from './formatadores';
import type { Slot } from './tipos';

/**
 * Regras da agenda de serviços (espelho de booking.constants.ts do back):
 * segunda a sexta, 09:00–18:00 no fuso America/Sao_Paulo, em passos da duração do serviço.
 */
export const JANELA_ATENDIMENTO = {
  horaInicio: 9,
  horaFim: 18,
  /** 0 = domingo … 6 = sábado */
  diasSemana: [1, 2, 3, 4, 5] as readonly number[],
} as const;

export const MINUTOS_JANELA = (JANELA_ATENDIMENTO.horaFim - JANELA_ATENDIMENTO.horaInicio) * 60;

/** Horas cheias da janela para desenhar os tiques da faixa: [9, 10, …, 18]. */
export const HORAS_JANELA: readonly number[] = Array.from(
  { length: JANELA_ATENDIMENTO.horaFim - JANELA_ATENDIMENTO.horaInicio + 1 },
  (_, i) => JANELA_ATENDIMENTO.horaInicio + i,
);

/** Minutos de relógio (no fuso da aplicação) de um instante ISO. */
export function minutosDoDia(iso: string): number {
  const ps = new Intl.DateTimeFormat('en-US', {
    timeZone: FUSO_APP,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso));
  const hora = Number(ps.find((p) => p.type === 'hour')?.value ?? 0);
  const minuto = Number(ps.find((p) => p.type === 'minute')?.value ?? 0);
  return (hora === 24 ? 0 : hora) * 60 + minuto;
}

/** Posição e largura (em %) de um bloco dentro da faixa 09h–18h. */
export function posicaoNaFaixa(
  inicioIso: string,
  duracaoMin: number,
): { inicioPct: number; larguraPct: number } {
  const desdeInicio = minutosDoDia(inicioIso) - JANELA_ATENDIMENTO.horaInicio * 60;
  const inicioPct = Math.min(100, Math.max(0, (desdeInicio / MINUTOS_JANELA) * 100));
  const larguraPct = Math.min(100 - inicioPct, Math.max(0, (duracaoMin / MINUTOS_JANELA) * 100));
  return { inicioPct, larguraPct };
}

/** Quantos atendimentos cabem num dia com essa duração (o back gera exatamente isso). */
export function slotsPorDia(duracaoMin: number): number {
  if (duracaoMin <= 0) return 0;
  return Math.floor(MINUTOS_JANELA / duracaoMin);
}

/** Dia útil segundo a regra da agenda; opera na data civil (independe do fuso do navegador). */
export function ehDiaDeAtendimento(data: string): boolean {
  const [ano, mes, dia] = data.split('-').map(Number);
  const diaSemana = new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay();
  return JANELA_ATENDIMENTO.diasSemana.includes(diaSemana);
}

/** Data anterior a hoje (no fuso da aplicação) não pode ser agendada. */
export function ehDataPassada(data: string, agora: Date = new Date()): boolean {
  return data < dataCivilHoje(agora);
}

export interface SlotsAgrupados {
  manha: Slot[];
  tarde: Slot[];
}

/** Manhã = começa antes das 12h. Ajuda a escanear a lista de horários. */
export function agruparSlots(slots: Slot[]): SlotsAgrupados {
  const manha: Slot[] = [];
  const tarde: Slot[] = [];
  for (const s of slots) (minutosDoDia(s.inicio) < 12 * 60 ? manha : tarde).push(s);
  return { manha, tarde };
}

/** Compara dois instantes ISO ignorando diferenças de serialização. */
export function mesmoInstante(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return a === b;
  return new Date(a).getTime() === new Date(b).getTime();
}
