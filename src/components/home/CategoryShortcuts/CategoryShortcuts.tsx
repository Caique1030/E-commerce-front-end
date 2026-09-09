'use client';

import {
  BookOpen,
  Car,
  CalendarDays,
  Dumbbell,
  Gem,
  Headphones,
  House,
  Laptop,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sofa,
  Sparkles,
  Tag,
  Watch,
  type LucideIcon,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useArvoreCategorias } from '@/lib/hooks/use-categorias';
import * as S from './style';

/**
 * Ícone por categoria. A busca é por pedaço do slug ou do nome, porque o catálogo vem do
 * seed e pode chegar em português ou inglês; o que não casa fica com a etiqueta genérica.
 */
const ICONES: { chaves: string[]; icone: LucideIcon }[] = [
  { chaves: ['servico', 'agenda'], icone: CalendarDays },
  { chaves: ['smartphone', 'celular', 'telefone', 'phone'], icone: Smartphone },
  { chaves: ['laptop', 'notebook', 'computador'], icone: Laptop },
  { chaves: ['eletronic', 'electronic', 'audio', 'fone'], icone: Headphones },
  { chaves: ['moda', 'roupa', 'vestu', 'shirt', 'cloth', 'men', 'women'], icone: Shirt },
  { chaves: ['relogio', 'watch'], icone: Watch },
  { chaves: ['joia', 'jewel', 'anel', 'acessor'], icone: Gem },
  { chaves: ['beleza', 'beauty', 'perfum', 'fragran', 'skin'], icone: Sparkles },
  { chaves: ['movel', 'furnitur', 'sofa'], icone: Sofa },
  { chaves: ['casa', 'home', 'decor', 'cozinha', 'kitchen'], icone: House },
  { chaves: ['mercado', 'grocer', 'alimento', 'bebida'], icone: ShoppingBasket },
  { chaves: ['esporte', 'sport', 'fitness'], icone: Dumbbell },
  { chaves: ['livro', 'book'], icone: BookOpen },
  { chaves: ['auto', 'carro', 'veicul', 'moto'], icone: Car },
];

function iconeDaCategoria(slug: string, nome: string): LucideIcon {
  // Sem acento dos dois lados: "Eletrônicos" precisa casar com a chave "eletronic".
  const alvo = `${slug} ${nome}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
  return ICONES.find((m) => m.chaves.some((c) => alvo.includes(c)))?.icone ?? Tag;
}

/**
 * Primeira parada da home: as categorias raiz como botões redondos, do jeito que o cliente
 * espera achar num marketplace. Rola de lado no celular, cabe inteiro no desktop.
 */
export function CategoryShortcuts({ className }: { className?: string }) {
  const { data, isPending } = useArvoreCategorias();

  if (isPending) {
    return (
      <S.SkeletonRoot className={className} aria-hidden>
        {Array.from({ length: 8 }, (_, i) => (
          <S.SkeletonItem key={i}>
            <Skeleton className="size-14 rounded-full" />
            <Skeleton className="h-3 w-14" />
          </S.SkeletonItem>
        ))}
      </S.SkeletonRoot>
    );
  }
  if (!data || data.length === 0) return null;

  return (
    <S.Root aria-label="Categorias em destaque" className={className}>
      <S.List>
        {data.slice(0, 10).map((c) => {
          const Icone = iconeDaCategoria(c.slug, c.nome);
          const ehServico = c.slug === 'servicos';
          return (
            <S.Item key={c.id}>
              <S.Card href={`/categoria/${c.slug}`}>
                <S.IconCircle $schedule={ehServico}>
                  <Icone size={24} strokeWidth={1.75} aria-hidden />
                </S.IconCircle>
                <S.Label>{c.nome}</S.Label>
              </S.Card>
            </S.Item>
          );
        })}
      </S.List>
    </S.Root>
  );
}
