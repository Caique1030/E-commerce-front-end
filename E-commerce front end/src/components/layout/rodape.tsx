import { CalendarDays, CreditCard, ShieldCheck, Truck } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { FRETE_GRATIS_MINIMO_CENTAVOS, MAX_PARCELAS } from '@/lib/comercial';
import { centavosParaBRL, NOME_FUSO } from '@/lib/formatadores';
import { NOME_LOJA } from '@/lib/constantes';

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

export function Rodape() {
  const mailpit = process.env.NEXT_PUBLIC_MAILPIT_URL;
  return (
    <footer className="bg-branco mt-6">
      <div className="border-borda conteudo border-b py-6">
        <ul className="text-apoio text-tinta-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {promessas.map(({ icone: Icone, texto }) => (
            <li key={texto} className="flex items-center gap-2.5">
              <Icone className="text-acao size-5 shrink-0" strokeWidth={1.75} aria-hidden />
              {texto}
            </li>
          ))}
        </ul>
      </div>

      <div className="conteudo grid gap-8 py-8 md:grid-cols-[minmax(0,1fr)_auto_auto]">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="text-apoio text-suave max-w-xs">
            Loja de demonstração de um desafio técnico. Preços em reais; horários de serviço no{' '}
            {NOME_FUSO}.
          </p>
        </div>
        {colunas.map((c) => (
          <nav key={c.titulo} aria-label={c.titulo} className="flex flex-col gap-2">
            <p className="text-micro text-suave font-bold tracking-wide uppercase">{c.titulo}</p>
            {c.links.map((l) => (
              <Link key={l.href + l.rotulo} href={l.href} className="text-apoio hover:text-acao">
                {l.rotulo}
              </Link>
            ))}
          </nav>
        ))}
      </div>

      <div className="bg-papel-2">
        <div className="conteudo text-micro text-suave flex flex-wrap items-center justify-between gap-2 py-4">
          <p>
            © {new Date().getFullYear()} {NOME_LOJA}. Projeto de demonstração, sem venda real.
          </p>
          <div className="flex gap-4">
            <Link href="/admin" className="hover:text-acao">
              Área administrativa
            </Link>
            {mailpit && (
              <a href={mailpit} target="_blank" rel="noreferrer" className="hover:text-acao">
                Caixa de e-mails (Mailpit)
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
