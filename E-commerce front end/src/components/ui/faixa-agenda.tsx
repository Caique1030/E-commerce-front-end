import { HORAS_JANELA, JANELA_ATENDIMENTO, posicaoNaFaixa } from '@/lib/agenda';
import { formatarDuracao, formatarHora } from '@/lib/formatadores';
import { cn } from '@/lib/utils';

/**
 * A faixa de agenda: o dia de atendimento (09h–18h) desenhado como uma régua violeta.
 * É a assinatura visual dos serviços agendados. A duração do serviço vira um bloco com
 * largura proporcional; quando há um horário escolhido, o bloco se move para ele.
 *
 *  - 'card':    ocupa a área da imagem no card (serviços não têm foto)
 *  - 'detalhe': cabeçalho do seletor de horários na página do produto
 *  - 'mini':    linha do carrinho e do pedido, ao lado do horário escrito
 */
export type VarianteFaixa = 'card' | 'detalhe' | 'mini';

interface FaixaAgendaProps {
  duracaoMin: number;
  /** ISO do slot escolhido; sem ele o bloco fica no início do dia, só como amostra. */
  horarioEscolhido?: string | null;
  capacidadeSlot?: number | null;
  variante?: VarianteFaixa;
  className?: string;
  /** Rótulo textual abaixo da faixa (o card usa; a mini não). */
  comLegenda?: boolean;
}

export function FaixaAgenda({
  duracaoMin,
  horarioEscolhido,
  capacidadeSlot,
  variante = 'card',
  className,
  comLegenda = variante === 'card',
}: FaixaAgendaProps) {
  const total = HORAS_JANELA.length - 1;
  const inicioIso = horarioEscolhido ?? null;
  const { inicioPct, larguraPct } = inicioIso
    ? posicaoNaFaixa(inicioIso, duracaoMin)
    : { inicioPct: 0, larguraPct: Math.min(100, (duracaoMin / (total * 60)) * 100) };

  const altura = variante === 'mini' ? 10 : variante === 'detalhe' ? 22 : 28;
  const larguraSvg = 100;
  const mostrarHoras = variante !== 'mini';

  const descricao = inicioIso
    ? `Horário escolhido: ${formatarHora(inicioIso)}, duração ${formatarDuracao(duracaoMin)}`
    : `Atendimento das ${JANELA_ATENDIMENTO.horaInicio}h às ${JANELA_ATENDIMENTO.horaFim}h, duração ${formatarDuracao(duracaoMin)}`;

  return (
    <div
      className={cn(
        'faixa-agenda flex flex-col',
        variante === 'card' && 'bg-agenda-suave h-full w-full justify-center gap-3 px-5',
        variante === 'detalhe' && 'gap-1.5',
        variante === 'mini' && 'w-24 gap-0',
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${larguraSvg} ${altura}`}
        preserveAspectRatio="none"
        className={cn(
          'block w-full',
          variante === 'mini' ? 'h-2.5' : variante === 'detalhe' ? 'h-6' : 'h-8',
        )}
        role="img"
        aria-label={descricao}
      >
        {/* trilho do dia */}
        <rect x="0" y={altura / 2 - 1} width={larguraSvg} height="2" fill="var(--faixa-tique)" />
        {/* tiques de hora cheia */}
        {HORAS_JANELA.map((h, i) => {
          const x = (i / total) * larguraSvg;
          const cheia = i === 0 || i === total;
          return (
            <rect
              key={h}
              x={Math.min(Math.max(x - 0.5, 0), larguraSvg - 1)}
              y={cheia ? 0 : altura * 0.3}
              width="1"
              height={cheia ? altura : altura * 0.4}
              fill="var(--faixa-tique)"
            />
          );
        })}
        {/* bloco da duração */}
        <rect
          x={inicioPct}
          y={altura * 0.18}
          width={Math.max(larguraPct, 1.5)}
          height={altura * 0.64}
          rx={variante === 'mini' ? 1 : 2}
          fill="var(--faixa-tinta)"
        />
      </svg>

      {mostrarHoras && (
        <div
          className="text-micro text-agenda/80 flex justify-between font-medium tracking-wide tabular-nums"
          aria-hidden
        >
          <span>{String(JANELA_ATENDIMENTO.horaInicio).padStart(2, '0')}h</span>
          <span>{String(JANELA_ATENDIMENTO.horaFim).padStart(2, '0')}h</span>
        </div>
      )}

      {comLegenda && (
        <p className="text-apoio text-agenda" aria-hidden>
          {formatarDuracao(duracaoMin)}
          {capacidadeSlot ? ` · até ${capacidadeSlot} por horário` : ''}
        </p>
      )}
    </div>
  );
}
