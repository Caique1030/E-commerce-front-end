import { describe, expect, it } from 'vitest';
import {
  agruparSlots,
  ehDataPassada,
  ehDiaDeAtendimento,
  mesmoInstante,
  minutosDoDia,
  posicaoNaFaixa,
  slotsPorDia,
} from '@/lib/agenda';
import type { Slot } from '@/lib/tipos';

const slot = (inicioLocal: string): Slot => ({
  // horário local de Brasília (UTC-3) → instante UTC
  inicio: `2026-09-10T${inicioLocal}:00-03:00`,
  fim: `2026-09-10T${inicioLocal}:00-03:00`,
  capacidade: 2,
  reservados: 0,
  vagas: 2,
});

describe('faixa de agenda', () => {
  it('lê os minutos do relógio no fuso da aplicação', () => {
    expect(minutosDoDia('2026-09-10T12:00:00.000Z')).toBe(9 * 60); // 09:00 em Brasília
    expect(minutosDoDia('2026-09-10T20:30:00.000Z')).toBe(17 * 60 + 30);
  });

  it('posiciona o bloco proporcionalmente à janela 09h–18h', () => {
    expect(posicaoNaFaixa('2026-09-10T12:00:00.000Z', 120)).toEqual({
      inicioPct: 0,
      larguraPct: (120 / 540) * 100,
    });
    const meio = posicaoNaFaixa('2026-09-10T16:30:00.000Z', 60); // 13:30
    expect(meio.inicioPct).toBeCloseTo(50, 5);
    expect(meio.larguraPct).toBeCloseTo((60 / 540) * 100, 5);
  });

  it('não deixa o bloco sair da faixa', () => {
    const fim = posicaoNaFaixa('2026-09-10T20:00:00.000Z', 120); // 17:00 + 2h passaria das 18h
    expect(fim.inicioPct + fim.larguraPct).toBeLessThanOrEqual(100);
  });

  it('conta quantos atendimentos cabem no dia', () => {
    expect(slotsPorDia(60)).toBe(9);
    expect(slotsPorDia(90)).toBe(6);
    expect(slotsPorDia(120)).toBe(4);
    expect(slotsPorDia(0)).toBe(0);
  });
});

describe('regras do calendário', () => {
  it('só atende de segunda a sexta', () => {
    expect(ehDiaDeAtendimento('2026-09-10')).toBe(true); // quinta
    expect(ehDiaDeAtendimento('2026-09-12')).toBe(false); // sábado
    expect(ehDiaDeAtendimento('2026-09-13')).toBe(false); // domingo
  });

  it('bloqueia datas anteriores a hoje no fuso da aplicação', () => {
    const agora = new Date('2026-09-10T15:00:00Z');
    expect(ehDataPassada('2026-09-09', agora)).toBe(true);
    expect(ehDataPassada('2026-09-10', agora)).toBe(false);
    expect(ehDataPassada('2026-09-11', agora)).toBe(false);
  });
});

describe('agrupamento de horários', () => {
  it('separa manhã (antes das 12h) e tarde', () => {
    const { manha, tarde } = agruparSlots([
      slot('09:00'),
      slot('11:00'),
      slot('12:00'),
      slot('16:00'),
    ]);
    expect(manha.map((s) => s.inicio)).toEqual([slot('09:00').inicio, slot('11:00').inicio]);
    expect(tarde).toHaveLength(2);
  });

  it('compara instantes ignorando a serialização', () => {
    expect(mesmoInstante('2026-09-10T12:00:00Z', '2026-09-10T09:00:00-03:00')).toBe(true);
    expect(mesmoInstante('2026-09-10T12:00:00Z', '2026-09-10T13:00:00Z')).toBe(false);
    expect(mesmoInstante(null, null)).toBe(true);
    expect(mesmoInstante(null, '2026-09-10T12:00:00Z')).toBe(false);
  });
});
