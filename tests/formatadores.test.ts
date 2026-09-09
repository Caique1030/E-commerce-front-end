import { describe, expect, it } from 'vitest';
import {
  brlParaCentavos,
  centavosParaBRL,
  dataCivilHoje,
  formatarAgendamento,
  formatarAgendamentoCurto,
  formatarDuracao,
  formatarHora,
  iniciais,
  resumir,
} from '@/lib/formatadores';

const NBSP = ' ';

describe('centavosParaBRL', () => {
  it('formata em pt-BR com separador de milhar e duas casas', () => {
    expect(centavosParaBRL(129900)).toBe(`R$${NBSP}1.299,00`);
    expect(centavosParaBRL(5)).toBe(`R$${NBSP}0,05`);
    expect(centavosParaBRL(0)).toBe(`R$${NBSP}0,00`);
  });

  it('não confia em número inválido', () => {
    expect(centavosParaBRL(Number.NaN)).toBe(`R$${NBSP}0,00`);
  });
});

describe('brlParaCentavos', () => {
  it('aceita as formas usuais de digitar um preço', () => {
    expect(brlParaCentavos('R$ 1.299,90')).toBe(129990);
    expect(brlParaCentavos('1299,90')).toBe(129990);
    expect(brlParaCentavos('1299.90')).toBe(129990);
    expect(brlParaCentavos('1.299')).toBe(129900);
    expect(brlParaCentavos('1299')).toBe(129900);
    expect(brlParaCentavos('0,5')).toBe(50);
    expect(brlParaCentavos('  R$ 12  ')).toBe(1200);
  });

  it('arredonda a terceira casa decimal para cima a partir de 5', () => {
    expect(brlParaCentavos('10,005')).toBe(1001);
    expect(brlParaCentavos('10,004')).toBe(1000);
  });

  it('devolve zero e null nos limites', () => {
    expect(brlParaCentavos('0')).toBe(0);
    expect(brlParaCentavos('')).toBeNull();
    expect(brlParaCentavos('abc')).toBeNull();
    expect(brlParaCentavos('R$')).toBeNull();
  });

  it('faz ida e volta com o formatador sem perder centavos', () => {
    for (const c of [0, 1, 99, 100, 129990, 100000000]) {
      expect(brlParaCentavos(centavosParaBRL(c))).toBe(c);
    }
  });
});

describe('datas no fuso da aplicação', () => {
  // 17:00Z = 14:00 em Brasília (UTC-3), quinta-feira 10/09/2026
  const iso = '2026-09-10T17:00:00.000Z';

  it('formata o agendamento com dia da semana, data, hora e fuso explícito', () => {
    expect(formatarAgendamento(iso)).toBe('Quinta, 10 de setembro, 14:00 (horário de Brasília)');
    expect(formatarAgendamento(iso, false)).toBe('Quinta, 10 de setembro, 14:00');
  });

  it('formata a versão curta e a hora isolada', () => {
    expect(formatarAgendamentoCurto(iso)).toBe('Qui, 10/09 às 14:00');
    expect(formatarHora(iso)).toBe('14:00');
  });

  it('calcula a data civil de hoje em Brasília, não em UTC', () => {
    // 01:30Z do dia 11 ainda é 22:30 do dia 10 em Brasília
    expect(dataCivilHoje(new Date('2026-09-11T01:30:00Z'))).toBe('2026-09-10');
  });
});

describe('utilitários de texto', () => {
  it('formata durações', () => {
    expect(formatarDuracao(45)).toBe('45 min');
    expect(formatarDuracao(60)).toBe('1h');
    expect(formatarDuracao(90)).toBe('1h30');
    expect(formatarDuracao(120)).toBe('2h');
  });

  it('extrai iniciais e resume descrições sem cortar palavra', () => {
    expect(iniciais('Maria Silva Santos')).toBe('MS');
    expect(resumir('Uma descrição bastante longa para caber na linha', 20)).toBe('Uma descrição…');
    expect(resumir('curta', 20)).toBe('curta');
  });
});
