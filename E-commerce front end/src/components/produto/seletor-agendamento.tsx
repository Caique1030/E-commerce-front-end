'use client';

import { CalendarDays, Minus, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Erro } from '@/components/estados/erro';
import { Botao } from '@/components/ui/botao';
import { Esqueleto } from '@/components/ui/esqueleto';
import { FaixaAgenda } from '@/components/ui/faixa-agenda';
import { agruparSlots } from '@/lib/agenda';
import {
  formatarAgendamento,
  formatarDataLonga,
  formatarHora,
  pluralizar,
} from '@/lib/formatadores';
import { useDisponibilidade } from '@/lib/hooks/use-produtos';
import type { Produto, Slot } from '@/lib/tipos';
import { cn } from '@/lib/utils';
import { Calendario } from './calendario';

interface SeletorAgendamentoProps {
  produto: Produto;
  aoConfirmar: (agendadoPara: string, quantidade: number) => void;
  confirmando?: boolean;
  desabilitado?: boolean;
}

/**
 * Data e horário em estado local; o botão só habilita quando os dois existem.
 * A disponibilidade tem staleTime 0 e refaz ao focar a janela: vaga muda enquanto o usuário
 * pensa. Tudo que depende da resposta (horário ainda válido, vagas máximas, dias sem vaga)
 * é derivado no render, não sincronizado por efeito.
 */
export function SeletorAgendamento({
  produto,
  aoConfirmar,
  confirmando = false,
  desabilitado = false,
}: SeletorAgendamentoProps) {
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
    <div className="flex flex-col gap-5" aria-label="Escolha de data e horário">
      <div className="rounded-card border-agenda/25 bg-agenda-suave/50 border p-4">
        <FaixaAgenda duracaoMin={duracao} horarioEscolhido={horario} variante="detalhe" />
        <p className="text-apoio text-agenda mt-2" aria-live="polite">
          {horario
            ? formatarAgendamento(horario)
            : data
              ? `${formatarDataLonga(`${data}T12:00:00Z`)}: escolha um horário.`
              : 'Escolha um dia no calendário.'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Calendario valor={data} aoEscolher={escolherData} diasSemVaga={diasSemVaga} />

        <div className="flex min-h-40 flex-col gap-3" aria-live="polite">
          {!data ? (
            <p className="text-corpo text-suave">
              Os horários aparecem aqui depois de escolher um dia.
            </p>
          ) : disponibilidade.isPending ? (
            <div className="flex flex-col gap-2" aria-busy>
              <Esqueleto className="h-3 w-16" />
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 6 }, (_, i) => (
                  <Esqueleto key={i} className="h-10" />
                ))}
              </div>
            </div>
          ) : disponibilidade.isError ? (
            <Erro
              erro={disponibilidade.error}
              titulo="Não foi possível carregar os horários."
              aoTentarDeNovo={() => void disponibilidade.refetch()}
              tentandoDeNovo={disponibilidade.isFetching}
              compacto
            />
          ) : slots && slots.length === 0 ? (
            <p className="rounded-card border-borda bg-branco shadow-card text-corpo text-suave border p-4">
              Sem horários livres neste dia. Escolha outro dia.
            </p>
          ) : grupos ? (
            <>
              <GrupoHorarios
                titulo="Manhã"
                slots={grupos.manha}
                escolhido={horario}
                aoEscolher={setHorarioEscolhido}
              />
              <GrupoHorarios
                titulo="Tarde"
                slots={grupos.tarde}
                escolhido={horario}
                aoEscolher={setHorarioEscolhido}
              />
              {disponibilidade.isFetching && (
                <p className="text-micro text-suave">Atualizando vagas…</p>
              )}
            </>
          ) : null}
        </div>
      </div>

      <div className="border-borda flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-apoio text-suave" id="rotulo-vagas">
            Vagas
          </span>
          <div
            className="rounded-campo border-borda-forte bg-branco flex h-10 items-center border"
            role="group"
            aria-labelledby="rotulo-vagas"
          >
            <button
              type="button"
              onClick={() => setQuantidadePedida(Math.max(1, quantidade - 1))}
              disabled={quantidade <= 1}
              className="hover:bg-papel-2 disabled:text-suave flex size-10 items-center justify-center"
              aria-label="Menos uma vaga"
            >
              <Minus className="size-4" aria-hidden />
            </button>
            <span className="preco text-corpo w-10 text-center font-medium" aria-live="polite">
              {quantidade}
            </span>
            <button
              type="button"
              onClick={() => setQuantidadePedida(Math.min(vagasMax, quantidade + 1))}
              disabled={!slotEscolhido || quantidade >= vagasMax}
              className="hover:bg-papel-2 disabled:text-suave flex size-10 items-center justify-center"
              aria-label="Mais uma vaga"
            >
              <Plus className="size-4" aria-hidden />
            </button>
          </div>
          {slotEscolhido && (
            <span className="text-apoio text-suave">
              {pluralizar(slotEscolhido.vagas, 'vaga livre', 'vagas livres')}
            </span>
          )}
        </div>

        <Botao
          variante="agenda"
          tamanho="lg"
          icone={<CalendarDays className="size-4" aria-hidden />}
          disabled={!pronto || desabilitado}
          carregando={confirmando}
          onClick={() => horario && aoConfirmar(horario, quantidade)}
          className="sm:min-w-56"
        >
          {confirmando ? 'Agendando…' : 'Agendar e adicionar'}
        </Botao>
      </div>
    </div>
  );
}

interface GrupoProps {
  titulo: string;
  slots: Slot[];
  escolhido: string | null;
  aoEscolher: (inicio: string) => void;
}

function GrupoHorarios({ titulo, slots, escolhido, aoEscolher }: GrupoProps) {
  if (slots.length === 0) return null;
  return (
    <fieldset>
      <legend className="text-apoio text-suave mb-1.5 font-medium tracking-wide uppercase">
        {titulo}
      </legend>
      <div className="grid grid-cols-3 gap-2">
        {slots.map((s) => {
          const ativo = s.inicio === escolhido;
          return (
            <button
              key={s.inicio}
              type="button"
              onClick={() => aoEscolher(s.inicio)}
              aria-pressed={ativo}
              aria-label={`${formatarHora(s.inicio)}, ${pluralizar(s.vagas, 'vaga', 'vagas')}`}
              className={cn(
                'preco rounded-campo text-apoio flex h-10 flex-col items-center justify-center border font-medium transition-colors',
                ativo
                  ? 'border-agenda bg-agenda text-branco'
                  : 'border-borda-forte bg-branco text-tinta hover:border-agenda hover:bg-agenda-suave',
              )}
            >
              {formatarHora(s.inicio)}
              <span
                className={cn('text-micro font-normal', ativo ? 'text-branco/80' : 'text-suave')}
              >
                {s.vagas} {s.vagas === 1 ? 'vaga' : 'vagas'}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
