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
import Link from 'next/link';
import { Esqueleto } from '@/components/ui/esqueleto';
import { useArvoreCategorias } from '@/lib/hooks/use-categorias';
import { cn } from '@/lib/utils';

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
export function AtalhosCategorias({ className }: { className?: string }) {
  const { data, isPending } = useArvoreCategorias();

  if (isPending) {
    return (
      <div className={cn('painel flex gap-6 overflow-hidden px-4 py-5', className)} aria-hidden>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex shrink-0 flex-col items-center gap-2">
            <Esqueleto className="size-14 rounded-full" />
            <Esqueleto className="h-3 w-14" />
          </div>
        ))}
      </div>
    );
  }
  if (!data || data.length === 0) return null;

  return (
    <nav
      aria-label="Categorias em destaque"
      className={cn('painel overflow-hidden px-2 py-4', className)}
    >
      <ul className="rolagem-discreta flex gap-1 overflow-x-auto px-2 sm:justify-between">
        {data.slice(0, 10).map((c) => {
          const Icone = iconeDaCategoria(c.slug, c.nome);
          const ehServico = c.slug === 'servicos';
          return (
            <li key={c.id} className="shrink-0">
              <Link
                href={`/categoria/${c.slug}`}
                className="group hover:bg-papel-2 flex w-[5.5rem] flex-col items-center gap-2 rounded-lg px-1 py-2 text-center"
              >
                <span
                  className={cn(
                    'flex size-14 items-center justify-center rounded-full transition-colors',
                    ehServico
                      ? 'bg-agenda-suave text-agenda group-hover:bg-agenda group-hover:text-branco'
                      : 'bg-papel-2 text-tinta-2 group-hover:bg-acao group-hover:text-branco',
                  )}
                >
                  <Icone className="size-6" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="text-micro text-tinta-2 line-clamp-2 leading-tight font-semibold">
                  {c.nome}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
