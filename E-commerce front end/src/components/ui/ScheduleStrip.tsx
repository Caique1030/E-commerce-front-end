import { HORAS_JANELA, JANELA_ATENDIMENTO, posicaoNaFaixa } from '@/lib/agenda';
import { formatarDuracao, formatarHora } from '@/lib/formatadores';
import { cn } from '@/lib/utils';

/**
 * A faixa de agenda: o dia de atendimento (09h–18h) desenhado como uma régua violeta.
 * É a assinatura visual dos serviços agendados. A duração do serviço vira um bloco com
 * largura proporcional; quando há um horário escolhido, o bloco se move para ele.
 *
 *  - 'card':   ocupa a área da imagem no card (serviços não têm foto)
 *  - 'detail': cabeçalho do seletor de horários na página do produto
 *  - 'mini':   linha do carrinho e do pedido, ao lado do horário escrito
 */
export type StripVariant = 'card' | 'detail' | 'mini';

interface ScheduleStripProps {
  duracaoMin: number;
  /** ISO do slot escolhido; sem ele o bloco fica no início do dia, só como amostra. */
  selectedSlot?: string | null;
  capacidadeSlot?: number | null;
  variant?: StripVariant;
  className?: string;
  /** Rótulo textual abaixo da faixa (o card usa; a mini não). */
  withCaption?: boolean;
}

export function ScheduleStrip({
  duracaoMin,
  selectedSlot,
  capacidadeSlot,
  variant = 'card',
  className,
  withCaption = variant === 'card',
}: ScheduleStripProps) {
  const total = HORAS_JANELA.length - 1;
  const startIso = selectedSlot ?? null;
  const { inicioPct, larguraPct } = startIso
    ? posicaoNaFaixa(startIso, duracaoMin)
    : { inicioPct: 0, larguraPct: Math.min(100, (duracaoMin / (total * 60)) * 100) };

  const height = variant === 'mini' ? 10 : variant === 'detail' ? 22 : 28;
  const svgWidth = 100;
  const showHours = variant !== 'mini';

  const description = startIso
    ? `Horário escolhido: ${formatarHora(startIso)}, duração ${formatarDuracao(duracaoMin)}`
    : `Atendimento das ${JANELA_ATENDIMENTO.horaInicio}h às ${JANELA_ATENDIMENTO.horaFim}h, duração ${formatarDuracao(duracaoMin)}`;

  return (
    <div
      className={cn(
        'faixa-agenda flex flex-col',
        variant === 'card' && 'bg-agenda-suave h-full w-full justify-center gap-3 px-5',
        variant === 'detail' && 'gap-1.5',
        variant === 'mini' && 'w-24 gap-0',
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${svgWidth} ${height}`}
        preserveAspectRatio="none"
        className={cn(
          'block w-full',
          variant === 'mini' ? 'h-2.5' : variant === 'detail' ? 'h-6' : 'h-8',
        )}
        role="img"
        aria-label={description}
      >
        {/* trilho do dia */}
        <rect x="0" y={height / 2 - 1} width={svgWidth} height="2" fill="var(--faixa-tique)" />
        {/* tiques de hora cheia */}
        {HORAS_JANELA.map((h, i) => {
          const x = (i / total) * svgWidth;
          const full = i === 0 || i === total;
          return (
            <rect
              key={h}
              x={Math.min(Math.max(x - 0.5, 0), svgWidth - 1)}
              y={full ? 0 : height * 0.3}
              width="1"
              height={full ? height : height * 0.4}
              fill="var(--faixa-tique)"
            />
          );
        })}
        {/* bloco da duração */}
        <rect
          x={inicioPct}
          y={height * 0.18}
          width={Math.max(larguraPct, 1.5)}
          height={height * 0.64}
          rx={variant === 'mini' ? 1 : 2}
          fill="var(--faixa-tinta)"
        />
      </svg>

      {showHours && (
        <div
          className="text-micro text-agenda/80 flex justify-between font-medium tracking-wide tabular-nums"
          aria-hidden
        >
          <span>{String(JANELA_ATENDIMENTO.horaInicio).padStart(2, '0')}h</span>
          <span>{String(JANELA_ATENDIMENTO.horaFim).padStart(2, '0')}h</span>
        </div>
      )}

      {withCaption && (
        <p className="text-apoio text-agenda" aria-hidden>
          {formatarDuracao(duracaoMin)}
          {capacidadeSlot ? ` · até ${capacidadeSlot} por horário` : ''}
        </p>
      )}
    </div>
  );
}
