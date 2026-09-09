'use client';

import { ChevronLeft, ChevronRight, CreditCard, Truck } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { FRETE_GRATIS_MINIMO_CENTAVOS, MAX_PARCELAS } from '@/lib/comercial';
import { centavosParaBRL } from '@/lib/formatadores';
import * as S from './style';

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
    <S.Ruler viewBox="0 0 220 60" aria-hidden>
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
      <S.RulerTime x="106" y="34" textAnchor="middle">
        14:00
      </S.RulerTime>
    </S.Ruler>
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
    arte: (
      <S.ArtIcon $size="10rem" $sizeLg="14rem" $opacity={0.15}>
        <Truck strokeWidth={1} aria-hidden />
      </S.ArtIcon>
    ),
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
    arte: (
      <S.ArtIcon $size="9rem" $sizeLg="13rem" $opacity={0.2}>
        <CreditCard strokeWidth={1} aria-hidden />
      </S.ArtIcon>
    ),
  },
];

/**
 * Carrossel de destaques da home. Troca sozinho a cada 6s e para assim que o ponteiro entra
 * ou algo dentro dele recebe foco; com prefers-reduced-motion nunca troca sozinho.
 * Só o banner visível existe no DOM — nada de foco preso em slide escondido.
 */
export function BannerCarousel() {
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);
  const regiaoRef = useRef<HTMLDivElement>(null);

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
    <S.Root
      ref={regiaoRef}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Destaques da loja"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={(e) => {
        if (!regiaoRef.current?.contains(e.relatedTarget as Node)) setPausado(false);
      }}
    >
      <S.Slide
        key={banner.id}
        role="group"
        aria-roledescription="slide"
        aria-label={`${indice + 1} de ${banners.length}: ${banner.titulo}`}
        $light={banner.claro}
        style={{ background: banner.fundo }}
      >
        <S.Inner>
          <S.Copy>
            <S.Eyebrow $light={banner.claro}>{banner.olho}</S.Eyebrow>
            <S.Title>{banner.titulo}</S.Title>
            <S.Text $light={banner.claro}>{banner.texto}</S.Text>
            <S.Cta href={banner.href} $light={banner.claro}>
              {banner.acao}
            </S.Cta>
          </S.Copy>
          <S.Art>{banner.arte}</S.Art>
        </S.Inner>
      </S.Slide>

      <S.Arrow type="button" $side="left" onClick={() => ir(-1)} aria-label="Destaque anterior">
        <ChevronLeft size={20} aria-hidden />
      </S.Arrow>
      <S.Arrow type="button" $side="right" onClick={() => ir(1)} aria-label="Próximo destaque">
        <ChevronRight size={20} aria-hidden />
      </S.Arrow>

      <S.Dots>
        {banners.map((b, i) => (
          <S.Dot
            key={b.id}
            type="button"
            onClick={() => setIndice(i)}
            aria-current={i === indice ? 'true' : undefined}
            aria-label={`Ir para o destaque ${i + 1}: ${b.titulo}`}
            $active={i === indice}
            $light={banner.claro}
          />
        ))}
      </S.Dots>
    </S.Root>
  );
}
