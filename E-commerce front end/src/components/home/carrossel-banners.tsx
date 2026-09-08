'use client';

import { ChevronLeft, ChevronRight, CreditCard, Truck } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { FRETE_GRATIS_MINIMO_CENTAVOS, MAX_PARCELAS } from '@/lib/comercial';
import { centavosParaBRL } from '@/lib/formatadores';
import { cn } from '@/lib/utils';

const TROCA_MS = 6000;

interface Banner {
  id: string;
  olho: string;
  titulo: string;
  texto: string;
  acao: string;
  href: string;
  /** Fundo do banner e cor do texto por cima dele. */
  fundo: string;
  claro: boolean;
  arte: ReactNode;
}

/** A régua do dia de atendimento, no tamanho do herói: a assinatura da loja em escala grande. */
function ReguaDoDia() {
  return (
    <svg viewBox="0 0 220 60" className="h-16 w-full max-w-[13rem]" aria-hidden>
      <rect x="0" y="28" width="220" height="3" rx="1.5" fill="rgb(255 255 255 / 0.35)" />
      {Array.from({ length: 10 }, (_, i) => (
        <rect
          key={i}
          x={i * 24}
          y={i === 0 || i === 9 ? 16 : 22}
          width="2.5"
          height={i === 0 || i === 9 ? 27 : 15}
          rx="1.25"
          fill="rgb(255 255 255 / 0.5)"
        />
      ))}
      <rect x="70" y="18" width="72" height="23" rx="5" fill="#FFFFFF" />
      <text x="106" y="34" textAnchor="middle" className="fill-agenda text-[13px] font-bold">
        14:00
      </text>
    </svg>
  );
}

const banners: Banner[] = [
  {
    id: 'frete',
    olho: 'Entrega',
    titulo: 'Frete grátis a partir de ' + centavosParaBRL(FRETE_GRATIS_MINIMO_CENTAVOS),
    texto: 'Vale para todo o catálogo de produtos físicos, sem cupom e sem cadastro de clube.',
    acao: 'Ver produtos',
    href: '/?tipo=SIMPLE',
    fundo: 'linear-gradient(115deg, #FFF159 0%, #FFE600 58%, #F5D800 100%)',
    claro: false,
    arte: <Truck className="size-40 opacity-15 lg:size-56" strokeWidth={1} aria-hidden />,
  },
  {
    id: 'agenda',
    olho: 'Serviços',
    titulo: 'Escolha o dia e a hora do seu serviço',
    texto: 'Montagem, instalação e manutenção com horário marcado das 9h às 18h.',
    acao: 'Ver serviços',
    href: '/categoria/servicos',
    fundo: 'linear-gradient(115deg, #4B1FA8 0%, #7B3FF2 62%, #9B6BFF 100%)',
    claro: true,
    arte: <ReguaDoDia />,
  },
  {
    id: 'parcelas',
    olho: 'Pagamento',
    titulo: `Até ${MAX_PARCELAS}x sem juros`,
    texto: 'O parcelamento aparece no card, antes de você entrar no carrinho.',
    acao: 'Começar a comprar',
    href: '/?ordenar=preco-asc',
    fundo: 'linear-gradient(115deg, #14448F 0%, #3483FA 65%, #6BA8FF 100%)',
    claro: true,
    arte: <CreditCard className="size-36 opacity-20 lg:size-52" strokeWidth={1} aria-hidden />,
  },
];

/**
 * Carrossel de destaques da home. Troca sozinho a cada 6s e para assim que o ponteiro entra
 * ou algo dentro dele recebe foco; com prefers-reduced-motion nunca troca sozinho.
 * Só o banner visível existe no DOM — nada de foco preso em slide escondido.
 */
export function CarrosselBanners() {
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);
  const regiao = useRef<HTMLDivElement>(null);

  const ir = useCallback((passo: number) => {
    setIndice((i) => (i + passo + banners.length) % banners.length);
  }, []);

  useEffect(() => {
    if (pausado) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => ir(1), TROCA_MS);
    return () => clearInterval(t);
  }, [pausado, ir]);

  const banner = banners[indice];

  return (
    <div
      ref={regiao}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Destaques da loja"
      className="rounded-card shadow-card relative overflow-hidden"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={(e) => {
        if (!regiao.current?.contains(e.relatedTarget as Node)) setPausado(false);
      }}
    >
      <div
        key={banner.id}
        role="group"
        aria-roledescription="slide"
        aria-label={`${indice + 1} de ${banners.length}: ${banner.titulo}`}
        className={cn(
          'banner-ativo flex h-[15rem] items-center sm:h-[17rem] lg:h-[19rem]',
          banner.claro ? 'text-branco' : 'text-tinta',
        )}
        style={{ background: banner.fundo }}
      >
        <div className="flex w-full items-center justify-between gap-6 px-6 sm:px-10 lg:px-14">
          <div className="flex max-w-lg flex-col items-start gap-3">
            <span
              className={cn(
                'text-micro rounded-full px-2.5 py-1 font-bold tracking-[0.12em] uppercase',
                banner.claro ? 'bg-branco/20' : 'bg-tinta/10',
              )}
            >
              {banner.olho}
            </span>
            <p className="titulo-display text-balance">{banner.titulo}</p>
            <p className={cn('text-corpo', banner.claro ? 'text-branco/85' : 'text-tinta-2')}>
              {banner.texto}
            </p>
            <Link
              href={banner.href}
              className={cn(
                'rounded-campo shadow-card mt-1 inline-flex h-11 items-center px-5 font-semibold transition-colors',
                banner.claro
                  ? 'bg-branco text-tinta hover:bg-papel-2'
                  : 'bg-tinta text-branco hover:bg-tinta-2',
              )}
            >
              {banner.acao}
            </Link>
          </div>
          <div className="hidden shrink-0 sm:block">{banner.arte}</div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => ir(-1)}
        className="bg-branco/85 text-tinta shadow-card hover:bg-branco absolute top-1/2 left-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full"
        aria-label="Destaque anterior"
      >
        <ChevronLeft className="size-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => ir(1)}
        className="bg-branco/85 text-tinta shadow-card hover:bg-branco absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full"
        aria-label="Próximo destaque"
      >
        <ChevronRight className="size-5" aria-hidden />
      </button>

      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
        {banners.map((b, i) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setIndice(i)}
            aria-current={i === indice ? 'true' : undefined}
            aria-label={`Ir para o destaque ${i + 1}: ${b.titulo}`}
            className={cn(
              'h-2 rounded-full transition-all',
              i === indice ? 'w-6' : 'w-2',
              // No banner amarelo o ponto branco sumiria: ali ele é tinta.
              banner.claro
                ? i === indice
                  ? 'bg-branco'
                  : 'bg-branco/50 hover:bg-branco/80'
                : i === indice
                  ? 'bg-tinta'
                  : 'bg-tinta/30 hover:bg-tinta/60',
            )}
          />
        ))}
      </div>
    </div>
  );
}
