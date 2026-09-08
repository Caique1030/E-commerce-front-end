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
import { cn } from '@/lib/utils';

const MESES_ADIANTE = 6;
const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

interface CalendarioProps {
  /** YYYY-MM-DD selecionado. */
  valor: string | null;
  aoEscolher: (data: string) => void;
  /** Dias já consultados e sem horário: ficam desabilitados. */
  diasSemVaga?: ReadonlySet<string>;
  className?: string;
}

function paraCivil(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

/** Calendário mensal: bloqueia passado, fins de semana e dias já sabidos sem vaga. */
export function Calendario({ valor, aoEscolher, diasSemVaga, className }: CalendarioProps) {
  const hoje = dataCivilHoje();
  const hojeDate = parse(hoje, 'yyyy-MM-dd', new Date());
  const [mes, setMes] = useState(() =>
    startOfMonth(valor ? parse(valor, 'yyyy-MM-dd', new Date()) : hojeDate),
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
    <div className={cn('rounded-card border-borda bg-branco shadow-card border p-3', className)}>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMes((m) => addMonths(m, -1))}
          disabled={!podeVoltar}
          className="rounded-campo hover:bg-papel-2 flex size-8 items-center justify-center disabled:opacity-40"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <p className="text-corpo font-medium capitalize" aria-live="polite">
          {rotuloMes}
        </p>
        <button
          type="button"
          onClick={() => setMes((m) => addMonths(m, 1))}
          disabled={!podeAvancar}
          className="rounded-campo hover:bg-papel-2 flex size-8 items-center justify-center disabled:opacity-40"
          aria-label="Próximo mês"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>

      <div
        className="grid grid-cols-7 gap-1"
        role="group"
        aria-label={`Calendário de ${rotuloMes}`}
      >
        {DIAS_SEMANA.map((d, i) => (
          <div key={i} className="text-micro text-suave py-1 text-center font-medium" aria-hidden>
            {d}
          </div>
        ))}
        {dias.map((d) => {
          const civil = paraCivil(d);
          const doMes = isSameMonth(d, mes);
          const passado = ehDataPassada(civil);
          const semAtendimento = !ehDiaDeAtendimento(civil);
          const semVaga = diasSemVaga?.has(civil) ?? false;
          const desabilitado = !doMes || passado || semAtendimento || semVaga;
          const selecionado = valor === civil;
          const ehHoje = civil === hoje;
          const motivo = passado
            ? 'já passou'
            : semAtendimento
              ? 'sem atendimento'
              : semVaga
                ? 'sem horários livres'
                : '';
          return (
            <button
              key={civil}
              type="button"
              onClick={() => aoEscolher(civil)}
              disabled={desabilitado}
              aria-pressed={selecionado}
              aria-label={`${format(d, "EEEE, d 'de' MMMM", { locale: ptBR })}${motivo ? ` (${motivo})` : ''}`}
              tabIndex={doMes ? 0 : -1}
              className={cn(
                'preco rounded-campo text-apoio flex h-9 items-center justify-center transition-colors',
                !doMes && 'invisible',
                desabilitado && doMes && 'text-suave/50 decoration-suave/40 line-through',
                !desabilitado && 'hover:bg-agenda-suave',
                selecionado && 'bg-agenda text-branco hover:bg-agenda-2 font-semibold',
                ehHoje && !selecionado && 'font-semibold underline underline-offset-4',
              )}
            >
              {format(d, 'd')}
            </button>
          );
        })}
      </div>
      <p className="text-micro text-suave mt-2">Atendimento de segunda a sexta, das 9h às 18h.</p>
    </div>
  );
}
