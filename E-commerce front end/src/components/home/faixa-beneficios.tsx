import { CalendarDays, CreditCard, ShieldCheck, Truck } from 'lucide-react';
import { FRETE_GRATIS_MINIMO_CENTAVOS, MAX_PARCELAS } from '@/lib/comercial';
import { centavosParaBRL } from '@/lib/formatadores';
import { cn } from '@/lib/utils';

const beneficios = [
  {
    icone: Truck,
    titulo: 'Frete grátis',
    texto: `Em produtos a partir de ${centavosParaBRL(FRETE_GRATIS_MINIMO_CENTAVOS)}.`,
  },
  {
    icone: CreditCard,
    titulo: `Até ${MAX_PARCELAS}x sem juros`,
    texto: 'O valor da parcela aparece já no card.',
  },
  {
    icone: CalendarDays,
    titulo: 'Serviço com hora marcada',
    texto: 'Escolha o dia e o horário entre 9h e 18h.',
  },
  {
    icone: ShieldCheck,
    titulo: 'Compra acompanhada',
    texto: 'Cada mudança de status fica no seu pedido.',
  },
];

/** As quatro promessas da loja, ditas uma vez, no lugar em que o cliente decide comprar. */
export function FaixaBeneficios({ className }: { className?: string }) {
  return (
    <section aria-label="O que a loja garante" className={cn('painel px-4 py-5', className)}>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-5 lg:grid-cols-4">
        {beneficios.map(({ icone: Icone, titulo, texto }) => (
          <li key={titulo} className="flex items-start gap-3">
            <span className="bg-acao-suave text-acao flex size-10 shrink-0 items-center justify-center rounded-full">
              <Icone className="size-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-corpo font-semibold">{titulo}</p>
              <p className="text-apoio text-suave mt-0.5">{texto}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
