import { CalendarDays, CreditCard, ShieldCheck, Truck } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { FRETE_GRATIS_MINIMO_CENTAVOS, MAX_PARCELAS } from '@/lib/comercial';
import { centavosParaBRL, NOME_FUSO } from '@/lib/formatadores';
import { NOME_LOJA } from '@/lib/constantes';
import * as S from './style';

const colunas = [
  {
    titulo: 'Comprar',
    links: [
      { href: '/', rotulo: 'Catálogo completo' },
      { href: '/?ordenar=preco-asc', rotulo: 'Menores preços' },
      { href: '/?tipo=SIMPLE', rotulo: 'Só produtos' },
      { href: '/categoria/servicos', rotulo: 'Serviços agendados' },
    ],
  },
  {
    titulo: 'Sua conta',
    links: [
      { href: '/meus-pedidos', rotulo: 'Meus pedidos' },
      { href: '/conta', rotulo: 'Minha conta' },
      { href: '/entrar', rotulo: 'Entrar' },
      { href: '/criar-conta', rotulo: 'Criar conta' },
    ],
  },
];

const promessas = [
  {
    icone: Truck,
    texto: `Frete grátis a partir de ${centavosParaBRL(FRETE_GRATIS_MINIMO_CENTAVOS)}`,
  },
  { icone: CreditCard, texto: `Parcele em até ${MAX_PARCELAS}x sem juros` },
  { icone: CalendarDays, texto: 'Serviços com hora marcada, das 9h às 18h' },
  { icone: ShieldCheck, texto: 'Status do pedido registrado a cada mudança' },
];

export function Footer() {
  const mailpit = process.env.NEXT_PUBLIC_MAILPIT_URL;
  return (
    <S.Root>
      <S.Promises>
        <S.PromiseList>
          {promessas.map(({ icone: Icone, texto }) => (
            <S.PromiseItem key={texto}>
              <S.PromiseIcon>
                <Icone size={20} strokeWidth={1.75} aria-hidden />
              </S.PromiseIcon>
              {texto}
            </S.PromiseItem>
          ))}
        </S.PromiseList>
      </S.Promises>

      <S.Columns>
        <S.Brand>
          <Logo />
          <S.BrandText>
            Loja de demonstração de um desafio técnico. Preços em reais; horários de serviço no{' '}
            {NOME_FUSO}.
          </S.BrandText>
        </S.Brand>
        {colunas.map((c) => (
          <S.Column key={c.titulo} aria-label={c.titulo}>
            <S.ColumnTitle>{c.titulo}</S.ColumnTitle>
            {c.links.map((l) => (
              <S.ColumnLink key={l.href + l.rotulo} href={l.href}>
                {l.rotulo}
              </S.ColumnLink>
            ))}
          </S.Column>
        ))}
      </S.Columns>

      <S.Bottom>
        <S.BottomContent>
          <p>
            © {new Date().getFullYear()} {NOME_LOJA}. Projeto de demonstração, sem venda real.
          </p>
          <S.BottomLinks>
            <S.BottomLink href="/admin">Área administrativa</S.BottomLink>
            {mailpit && (
              <S.ExternalLink href={mailpit} target="_blank" rel="noreferrer">
                Caixa de e-mails (Mailpit)
              </S.ExternalLink>
            )}
          </S.BottomLinks>
        </S.BottomContent>
      </S.Bottom>
    </S.Root>
  );
}
