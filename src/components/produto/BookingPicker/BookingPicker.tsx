'use client';

import { CalendarDays, Minus, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ErrorState } from '@/components/estados/ErrorState';
import { Button } from '@/components/ui/Button';
import { ScheduleStrip } from '@/components/ui/ScheduleStrip';
import { Skeleton } from '@/components/ui/Skeleton';
import { agruparSlots } from '@/lib/agenda';
import {
  formatarAgendamento,
  formatarDataLonga,
  formatarHora,
  pluralizar,
} from '@/lib/formatadores';
import { useDisponibilidade } from '@/lib/hooks/use-produtos';
import type { Produto, Slot } from '@/lib/tipos';
import { Calendar } from '../Calendar/Calendar';
import * as S from './style';

interface BookingPickerProps {
  produto: Produto;
  onConfirm: (agendadoPara: string, quantidade: number) => void;
  confirming?: boolean;
  disabled?: boolean;
}

/**
 * Data e horário em estado local; o botão só habilita quando os dois existem.
 * A disponibilidade tem staleTime 0 e refaz ao focar a janela: vaga muda enquanto o usuário
 * pensa. Tudo que depende da resposta (horário ainda válido, vagas máximas, dias sem vaga)
 * é derivado no render, não sincronizado por efeito.
 */
export function BookingPicker({
  produto,
  onConfirm,
  confirming = false,
  disabled = false,
}: BookingPickerProps) {
  const [data, setData] = useState<string | null>(null);
  const [horarioEscolhido, setHorarioEscolhido] = useState<string | null>(null);
  const [quantidadePedida, setQuantidadePedida] = useState(1);
  const [diasSemVaga, setDiasSemVaga] = useState<ReadonlySet<string>>(new Set());

  const disponibilidade = useDisponibilidade(produto.id, data);
  const slots = disponibilidade.data;

  // Dia consultado e vazio: marca no calendário para o usuário não clicar de novo.
  if (data && disponibilidade.isSuccess && slots && slots.length === 0 && !diasSemVaga.has(data)) {
    setDiasSemVaga(new Set(diasSemVaga).add(data));
  }

  // Se o horário escolhido sumiu num refetch (lotou), ele deixa de valer.
  const slotEscolhido = useMemo(
    () => slots?.find((s) => s.inicio === horarioEscolhido) ?? null,
    [slots, horarioEscolhido],
  );
  const horario = slotEscolhido?.inicio ?? null;
  const vagasMax = slotEscolhido?.vagas ?? 1;
  const quantidade = Math.min(Math.max(1, quantidadePedida), vagasMax);

  const grupos = useMemo(() => (slots ? agruparSlots(slots) : null), [slots]);
  const duracao = produto.duracaoMin ?? 60;
  const pronto = !!data && !!horario;

  function escolherData(d: string) {
    setData(d);
    setHorarioEscolhido(null);
  }

  return (
    <S.Root aria-label="Escolha de data e horário">
      <S.Summary>
        <ScheduleStrip duracaoMin={duracao} selectedSlot={horario} variant="detail" />
        <S.SummaryText aria-live="polite">
          {horario
            ? formatarAgendamento(horario)
            : data
              ? `${formatarDataLonga(`${data}T12:00:00Z`)}: escolha um horário.`
              : 'Escolha um dia no calendário.'}
        </S.SummaryText>
      </S.Summary>

      <S.Columns>
        <Calendar value={data} onPick={escolherData} unavailableDays={diasSemVaga} />

        <S.Slots aria-live="polite">
          {!data ? (
            <S.Hint>Os horários aparecem aqui depois de escolher um dia.</S.Hint>
          ) : disponibilidade.isPending ? (
            <S.SkeletonStack aria-busy>
              <Skeleton className="h-3 w-16" />
              <S.SkeletonGrid>
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </S.SkeletonGrid>
            </S.SkeletonStack>
          ) : disponibilidade.isError ? (
            <ErrorState
              error={disponibilidade.error}
              title="Não foi possível carregar os horários."
              onRetry={() => void disponibilidade.refetch()}
              retrying={disponibilidade.isFetching}
              compact
            />
          ) : slots && slots.length === 0 ? (
            <S.EmptyDay>Sem horários livres neste dia. Escolha outro dia.</S.EmptyDay>
          ) : grupos ? (
            <>
              <SlotGroup
                title="Manhã"
                slots={grupos.manha}
                selected={horario}
                onSelect={setHorarioEscolhido}
              />
              <SlotGroup
                title="Tarde"
                slots={grupos.tarde}
                selected={horario}
                onSelect={setHorarioEscolhido}
              />
              {disponibilidade.isFetching && <S.Refreshing>Atualizando vagas…</S.Refreshing>}
            </>
          ) : null}
        </S.Slots>
      </S.Columns>

      <S.Footer>
        <S.Seats>
          <S.SeatsLabel id="rotulo-vagas">Vagas</S.SeatsLabel>
          <S.Stepper role="group" aria-labelledby="rotulo-vagas">
            <S.StepButton
              type="button"
              onClick={() => setQuantidadePedida(Math.max(1, quantidade - 1))}
              disabled={quantidade <= 1}
              aria-label="Menos uma vaga"
            >
              <Minus size={16} aria-hidden />
            </S.StepButton>
            <S.StepValue aria-live="polite">{quantidade}</S.StepValue>
            <S.StepButton
              type="button"
              onClick={() => setQuantidadePedida(Math.min(vagasMax, quantidade + 1))}
              disabled={!slotEscolhido || quantidade >= vagasMax}
              aria-label="Mais uma vaga"
            >
              <Plus size={16} aria-hidden />
            </S.StepButton>
          </S.Stepper>
          {slotEscolhido && (
            <S.SeatsLabel>
              {pluralizar(slotEscolhido.vagas, 'vaga livre', 'vagas livres')}
            </S.SeatsLabel>
          )}
        </S.Seats>

        <Button
          variant="schedule"
          size="lg"
          icon={<CalendarDays size={16} aria-hidden />}
          disabled={!pronto || disabled}
          loading={confirming}
          onClick={() => horario && onConfirm(horario, quantidade)}
          className="sm:min-w-56"
        >
          {confirming ? 'Agendando…' : 'Agendar e adicionar'}
        </Button>
      </S.Footer>
    </S.Root>
  );
}

interface SlotGroupProps {
  title: string;
  slots: Slot[];
  selected: string | null;
  onSelect: (inicio: string) => void;
}

function SlotGroup({ title, slots, selected, onSelect }: SlotGroupProps) {
  if (slots.length === 0) return null;
  return (
    <fieldset>
      <S.GroupLegend>{title}</S.GroupLegend>
      <S.SlotGrid>
        {slots.map((s) => {
          const ativo = s.inicio === selected;
          return (
            <S.SlotButton
              key={s.inicio}
              type="button"
              onClick={() => onSelect(s.inicio)}
              aria-pressed={ativo}
              aria-label={`${formatarHora(s.inicio)}, ${pluralizar(s.vagas, 'vaga', 'vagas')}`}
              $active={ativo}
            >
              {formatarHora(s.inicio)}
              <S.SlotSeats $active={ativo}>
                {s.vagas} {s.vagas === 1 ? 'vaga' : 'vagas'}
              </S.SlotSeats>
            </S.SlotButton>
          );
        })}
      </S.SlotGrid>
    </fieldset>
  );
}
