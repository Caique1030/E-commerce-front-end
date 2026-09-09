import { create } from 'zustand';
import { idCurto } from '@/lib/utils';

/**
 * Estado puramente visual. Nada de dados de servidor aqui: carrinho, produtos e pedidos
 * vivem no TanStack Query.
 */

export type TipoToast = 'sucesso' | 'erro' | 'info';

export interface Toast {
  id: string;
  tipo: TipoToast;
  titulo: string;
  descricao?: string;
  duracaoMs: number;
}

interface EstadoUi {
  drawerCarrinhoAberto: boolean;
  /** Linha recém-adicionada que recebe o destaque momentâneo. */
  itemDestacadoId: string | null;
  menuMobileAberto: boolean;
  filtrosMobileAbertos: boolean;
  toasts: Toast[];

  abrirDrawerCarrinho: (itemDestacadoId?: string | null) => void;
  fecharDrawerCarrinho: () => void;
  definirDrawerCarrinho: (aberto: boolean) => void;
  limparDestaque: () => void;
  definirMenuMobile: (aberto: boolean) => void;
  definirFiltrosMobile: (abertos: boolean) => void;
  notificar: (toast: Omit<Toast, 'id' | 'duracaoMs'> & { duracaoMs?: number }) => string;
  dispensarToast: (id: string) => void;
}

export const useUiStore = create<EstadoUi>((set) => ({
  drawerCarrinhoAberto: false,
  itemDestacadoId: null,
  menuMobileAberto: false,
  filtrosMobileAbertos: false,
  toasts: [],

  abrirDrawerCarrinho: (itemDestacadoId = null) =>
    set({ drawerCarrinhoAberto: true, itemDestacadoId }),
  fecharDrawerCarrinho: () => set({ drawerCarrinhoAberto: false, itemDestacadoId: null }),
  definirDrawerCarrinho: (aberto) =>
    set(
      aberto
        ? { drawerCarrinhoAberto: true }
        : { drawerCarrinhoAberto: false, itemDestacadoId: null },
    ),
  limparDestaque: () => set({ itemDestacadoId: null }),
  definirMenuMobile: (aberto) => set({ menuMobileAberto: aberto }),
  definirFiltrosMobile: (abertos) => set({ filtrosMobileAbertos: abertos }),
  notificar: (toast) => {
    const id = idCurto();
    set((s) => ({
      toasts: [...s.toasts.slice(-3), { ...toast, id, duracaoMs: toast.duracaoMs ?? 4500 }],
    }));
    return id;
  },
  dispensarToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Atalho para usar fora de componentes (ex.: dentro de mutações). */
export const notificar = (toast: Parameters<EstadoUi['notificar']>[0]): string =>
  useUiStore.getState().notificar(toast);
