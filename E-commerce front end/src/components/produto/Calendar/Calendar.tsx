'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parse,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMemo, useState } from 'react';
import { ehDataPassada, ehDiaDeAtendimento } from '@/lib/agenda';
import { dataCivilHoje } from '@/lib/formatadores';
import * as S from './style';

const MESES_ADIANTE = 6;
const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

interface CalendarProps {
  /** YYYY-MM-DD selecionado. */
  value: string | null;
  onPick: (data: string) => void;
  /** Dias já consultados e sem horário: ficam desabilitados. */
  unavailableDays?: ReadonlySet<string>;
  className?: string;
}

function paraCivil(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

/** Calendário mensal: bloqueia passado, fins de semana e dias já sabidos sem vaga. */
export function Calendar({ value, onPick, unavailableDays, className }: CalendarProps) {
  const hoje = dataCivilHoje();
  const hojeDate = parse(hoje, 'yyyy-MM-dd', new Date());
  const [mes, setMes] = useState(() =>
    startOfMonth(value ? parse(value, 'yyyy-MM-dd', new Date()) : hojeDate),
  );

  const dias = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(mes), { weekStartsOn: 0 }),
        end: endOfWeek(endOfMonth(mes), { weekStartsOn: 0 }),
      }),
    [mes],
  );

  const limiteInicio = startOfMonth(hojeDate);
  const limiteFim = startOfMonth(addMonths(hojeDate, MESES_ADIANTE));
  const podeVoltar = mes > limiteInicio;
  const podeAvancar = mes < limiteFim;
  const rotuloMes = format(mes, "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <S.Root className={className}>
      <S.Header>
        <S.NavButton
          type="button"
          onClick={() => setMes((m) => addMonths(m, -1))}
          disabled={!podeVoltar}
          aria-label="Mês anterior"
        >
          <ChevronLeft size={16} aria-hidden />
        </S.NavButton>
        <S.MonthLabel aria-live="polite">{rotuloMes}</S.MonthLabel>
        <S.NavButton
          type="button"
          onClick={() => setMes((m) => addMonths(m, 1))}
          disabled={!podeAvancar}
          aria-label="Próximo mês"
        >
          <ChevronRight size={16} aria-hidden />
        </S.NavButton>
      </S.Header>

      <S.Grid role="group" aria-label={`Calendário de ${rotuloMes}`}>
        {DIAS_SEMANA.map((d, i) => (
          <S.Weekday key={i} aria-hidden>
            {d}
          </S.Weekday>
        ))}
        {dias.map((d) => {
          const civil = paraCivil(d);
          const doMes = isSameMonth(d, mes);
          const passado = ehDataPassada(civil);
          const semAtendimento = !ehDiaDeAtendimento(civil);
          const semVaga = unavailableDays?.has(civil) ?? false;
          const desabilitado = !doMes || passado || semAtendimento || semVaga;
          const selecionado = value === civil;
          const ehHoje = civil === hoje;
          const motivo = passado
            ? 'já passou'
            : semAtendimento
              ? 'sem atendimento'
              : semVaga
                ? 'sem horários livres'
                : '';
          return (
            <S.Day
              key={civil}
              type="button"
              onClick={() => onPick(civil)}
              disabled={desabilitado}
              aria-pressed={selecionado}
              aria-label={`${format(d, "EEEE, d 'de' MMMM", { locale: ptBR })}${motivo ? ` (${motivo})` : ''}`}
              tabIndex={doMes ? 0 : -1}
              $outside={!doMes}
              $blocked={desabilitado && doMes}
              $hoverable={!desabilitado}
              $selected={selecionado}
              $today={ehHoje && !selecionado}
            >
              {format(d, 'd')}
            </S.Day>
          );
        })}
      </S.Grid>
      <S.Note>Atendimento de segunda a sexta, das 9h às 18h.</S.Note>
    </S.Root>
  );
}
