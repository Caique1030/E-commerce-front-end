import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { ReactNode } from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { CheckoutForm } from '@/components/carrinho/CheckoutForm/CheckoutForm';
import type { Carrinho, Usuario } from '@/lib/tipos';

const API = 'http://localhost:3000/api/v1';
const push = vi.fn();
const replace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace, prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => '/checkout',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

const usuario: Usuario = {
  id: 'u-1',
  nome: 'Cliente Exemplo',
  email: 'cliente@loja.local',
  role: 'CLIENTE',
  ativo: true,
  criadoEm: '2026-09-01T00:00:00.000Z',
};

vi.mock('@/providers/sessao-provider', () => ({
  useSessao: () => ({
    status: 'autenticado',
    usuario,
    ehCliente: true,
    ehEquipe: false,
    ehAdmin: false,
    entrar: vi.fn(),
    criarConta: vi.fn(),
    sair: vi.fn(),
    atualizarUsuario: vi.fn(),
  }),
}));

const carrinho: Carrinho = {
  id: 'c-1',
  status: 'ATIVO',
  itens: [
    {
      id: 'item-1',
      produto: {
        id: '11111111-1111-4111-8111-111111111111',
        sku: 'DJ-1',
        nome: 'Fone Bluetooth XZ',
        imagemUrl: null,
        tipo: 'SIMPLE',
      },
      quantidade: 3,
      precoUnitCentavos: 10000,
      precoNoCarrinhoCentavos: 10000,
      precoAlterado: false,
      agendadoPara: null,
      subtotalCentavos: 30000,
      disponivel: true,
    },
  ],
  totalItens: 3,
  subtotalCentavos: 30000,
  atualizadoEm: '2026-09-07T12:00:00.000Z',
};

const pedidoCriado = {
  id: 'ped-1',
  codigo: 'PED-20260907-K7Q2MZ',
  status: 'PENDENTE',
  totalCentavos: 30000,
  totalItens: 3,
  cliente: { id: 'u-1', nome: 'Cliente Exemplo', email: 'cliente@loja.local' },
  criadoEm: '2026-09-07T12:00:00.000Z',
  subtotalCentavos: 30000,
  descontoCentavos: 0,
  itens: [],
  historico: [],
  atualizadoEm: '2026-09-07T12:00:00.000Z',
};

const servidor = setupServer();

beforeAll(() => servidor.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  servidor.resetHandlers();
  push.mockClear();
  replace.mockClear();
});
afterAll(() => servidor.close());

function Envoltorio({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('CheckoutForm', () => {
  it('desabilita o botão durante o envio, manda a chave de idempotência e vai para a confirmação', async () => {
    const chaves: string[] = [];
    servidor.use(
      http.post(`${API}/pedidos`, async ({ request }) => {
        chaves.push(request.headers.get('idempotency-key') ?? '');
        await delay(150);
        return HttpResponse.json(pedidoCriado, { status: 201 });
      }),
    );

    render(<CheckoutForm carrinho={carrinho} />, { wrapper: Envoltorio });

    const botao = screen.getByRole('button', { name: 'Finalizar compra' });
    expect(botao).toBeEnabled();
    await userEvent.click(botao);

    // Enquanto a requisição está em voo: desabilitado, ocupado e com o texto de progresso.
    const ocupado = await screen.findByRole('button', { name: 'Finalizando…' });
    expect(ocupado).toBeDisabled();
    expect(ocupado).toHaveAttribute('aria-busy', 'true');

    // Um segundo clique não dispara nada.
    await userEvent.click(ocupado);

    await waitFor(() => expect(push).toHaveBeenCalledWith('/pedido/ped-1'));
    expect(chaves).toHaveLength(1);
    expect(chaves[0]).toMatch(/^[0-9a-f-]{20,}$/i);
  });

  it('409 ITENS_INDISPONIVEIS abre o painel com o motivo por item e a ação de corrigir', async () => {
    servidor.use(
      http.post(`${API}/pedidos`, () =>
        HttpResponse.json(
          {
            statusCode: 409,
            error: 'ITENS_INDISPONIVEIS',
            message: 'Alguns itens ficaram indisponíveis',
            details: [
              {
                produtoId: '11111111-1111-4111-8111-111111111111',
                nome: 'Fone Bluetooth XZ',
                motivo: 'ESTOQUE_INSUFICIENTE',
                solicitado: 3,
                disponivel: 1,
              },
            ],
          },
          { status: 409 },
        ),
      ),
    );

    render(<CheckoutForm carrinho={carrinho} />, { wrapper: Envoltorio });
    await userEvent.click(screen.getByRole('button', { name: 'Finalizar compra' }));

    const painel = await screen.findByRole('alert');
    expect(painel).toHaveTextContent('Fone Bluetooth XZ: você pediu 3, restam 1.');
    expect(screen.getByRole('button', { name: 'Atualizar carrinho e continuar' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Finalizar compra' })).toBeDisabled();
    expect(push).not.toHaveBeenCalled();
  });

  it('nome alterado vai para PATCH /usuarios/me antes de finalizar', async () => {
    const chamadas: string[] = [];
    servidor.use(
      http.patch(`${API}/usuarios/me`, async ({ request }) => {
        const corpo = (await request.json()) as { nome: string };
        chamadas.push(`perfil:${corpo.nome}`);
        return HttpResponse.json({ ...usuario, nome: corpo.nome });
      }),
      http.post(`${API}/pedidos`, () => {
        chamadas.push('pedido');
        return HttpResponse.json(pedidoCriado, { status: 201 });
      }),
    );

    render(<CheckoutForm carrinho={carrinho} />, { wrapper: Envoltorio });
    const nome = screen.getByRole('textbox', { name: /nome completo/i });
    await userEvent.clear(nome);
    await userEvent.type(nome, 'Maria Silva');
    await userEvent.click(screen.getByRole('button', { name: 'Finalizar compra' }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/pedido/ped-1'));
    expect(chamadas).toEqual(['perfil:Maria Silva', 'pedido']);
  });
});
