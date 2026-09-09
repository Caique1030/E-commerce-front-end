import type { FiltrosProduto } from '@/lib/tipos';
import { BannerCarousel } from '../BannerCarousel/BannerCarousel';
import { BenefitsStrip } from '../BenefitsStrip/BenefitsStrip';
import { CategoryShortcuts } from '../CategoryShortcuts/CategoryShortcuts';
import { ProductRail } from '../ProductRail/ProductRail';
import * as S from './style';

const LIMITE_TRILHO = 12;

/**
 * Filtros dos trilhos. Exportados porque a página faz o prefetch no servidor com exatamente
 * estes objetos — a chave da query precisa ser a mesma dos dois lados, ou o cliente busca de novo.
 */
export const SHOWCASE_FILTERS = {
  ofertas: {
    ordenar: 'preco',
    direcao: 'asc',
    page: 1,
    limit: LIMITE_TRILHO,
  } satisfies FiltrosProduto,
  servicos: {
    tipo: 'BOOKING',
    ordenar: 'recente',
    direcao: 'desc',
    page: 1,
    limit: LIMITE_TRILHO,
  } satisfies FiltrosProduto,
};

/**
 * A vitrine da home, na ordem em que o cliente decide: primeiro o que a loja promete
 * (carrossel), depois por onde entrar (categorias), depois o que já dá para levar (trilhos).
 * A grade completa do catálogo vem logo abaixo, na própria página.
 */
export function Showcase() {
  return (
    <S.Root>
      <BannerCarousel />
      <CategoryShortcuts />
      <ProductRail
        title="Começa em conta"
        description="Os menores preços do catálogo agora"
        filtros={SHOWCASE_FILTERS.ofertas}
        seeAllHref="/?ordenar=preco-asc"
      />
      <ProductRail
        title="Agende um serviço"
        description="Escolha a data e a hora; o horário sai da agenda na mesma compra"
        filtros={SHOWCASE_FILTERS.servicos}
        seeAllHref="/categoria/servicos"
        tone="schedule"
      />
      <BenefitsStrip />
    </S.Root>
  );
}
