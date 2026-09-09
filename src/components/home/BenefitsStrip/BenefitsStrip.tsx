import { CalendarDays, CreditCard, ShieldCheck, Truck } from 'lucide-react';
import { FRETE_GRATIS_MINIMO_CENTAVOS, MAX_PARCELAS } from '@/lib/comercial';
import { centavosParaBRL } from '@/lib/formatadores';
import * as S from './style';

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
export function BenefitsStrip({ className }: { className?: string }) {
  return (
    <S.Root aria-label="O que a loja garante" className={className}>
      <S.List>
        {beneficios.map(({ icone: Icone, titulo, texto }) => (
          <S.Item key={titulo}>
            <S.IconCircle>
              <Icone size={20} strokeWidth={1.75} aria-hidden />
            </S.IconCircle>
            <S.Body>
              <S.Title>{titulo}</S.Title>
              <S.Text>{texto}</S.Text>
            </S.Body>
          </S.Item>
        ))}
      </S.List>
    </S.Root>
  );
}
