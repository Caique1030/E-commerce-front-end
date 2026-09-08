import { describe, expect, it } from 'vitest';
import {
  checkoutSchema,
  createProductSchema,
  filtrosParaApi,
  formularioCadastroSchema,
  formularioParaPayload,
  formularioProdutoSchema,
  lerFiltrosCatalogo,
  loginSchema,
  registerSchema,
} from '@/lib/schemas';

describe('schemas de autenticação (espelho do back)', () => {
  it('login rejeita e-mail inválido e senha vazia', () => {
    expect(loginSchema.safeParse({ email: 'nao-e-email', senha: 'x' }).success).toBe(false);
    expect(loginSchema.safeParse({ email: 'a@b.co', senha: '' }).success).toBe(false);
    expect(loginSchema.safeParse({ email: ' A@B.CO ', senha: 'x' }).data).toEqual({
      email: 'a@b.co',
      senha: 'x',
    });
  });

  it('cadastro exige senha com letra e número e rejeita campo extra (strict)', () => {
    expect(
      registerSchema.safeParse({ nome: 'Maria', email: 'm@x.com', senha: '12345678' }).success,
    ).toBe(false);
    expect(
      registerSchema.safeParse({ nome: 'Maria', email: 'm@x.com', senha: 'abcdefgh' }).success,
    ).toBe(false);
    expect(
      registerSchema.safeParse({ nome: 'Maria', email: 'm@x.com', senha: 'Maria123' }).success,
    ).toBe(true);
    expect(
      registerSchema.safeParse({
        nome: 'Maria',
        email: 'm@x.com',
        senha: 'Maria123',
        role: 'ADMIN',
      }).success,
    ).toBe(false);
  });

  it('o formulário de cadastro confere a confirmação, mas o payload continua o registerSchema', () => {
    const r = formularioCadastroSchema.safeParse({
      nome: 'Maria',
      email: 'm@x.com',
      senha: 'Maria123',
      confirmarSenha: 'outra',
    });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].path).toEqual(['confirmarSenha']);
  });
});

describe('schema de checkout', () => {
  it('rejeita nome curto e campo extra', () => {
    expect(checkoutSchema.safeParse({ nome: 'M' }).success).toBe(false);
    expect(checkoutSchema.safeParse({ nome: 'Maria', telefone: '1199999' }).success).toBe(false);
    expect(checkoutSchema.safeParse({ nome: '  Maria Silva ' }).data).toEqual({
      nome: 'Maria Silva',
    });
  });
});

describe('formulário de produto → payload da API', () => {
  const base = {
    sku: 'GM-001',
    nome: 'Controle sem fio',
    descricao: 'Controle bluetooth',
    preco: 'R$ 299,90',
    estoque: '25',
    imagemUrl: '',
    marca: '',
    tipo: 'SIMPLE' as const,
    categoriaId: '4c5f0a3e-3c2d-4b7e-9a1b-2f3e4d5c6b7a',
    duracaoMin: '',
    capacidadeSlot: '',
    ativo: true,
  };

  it('converte preço em reais para centavos inteiros e passa pelo schema do back', () => {
    const form = formularioProdutoSchema.parse(base);
    const payload = formularioParaPayload(form);
    expect(payload.precoCentavos).toBe(29990);
    expect(payload.estoque).toBe(25);
    expect(payload.imagemUrl).toBeNull();
    expect(payload.duracaoMin).toBeNull();
    expect(createProductSchema.safeParse(payload).success).toBe(true);
  });

  it('serviço agendado exige duração e capacidade', () => {
    const r = formularioProdutoSchema.safeParse({ ...base, tipo: 'BOOKING' });
    expect(r.success).toBe(false);
    const campos = r.error?.issues.map((i) => i.path[0]);
    expect(campos).toContain('duracaoMin');
    expect(campos).toContain('capacidadeSlot');
  });

  it('serviço agendado válido zera o estoque e leva os campos de agenda', () => {
    const form = formularioProdutoSchema.parse({
      ...base,
      tipo: 'BOOKING',
      duracaoMin: '90',
      capacidadeSlot: '3',
      estoque: '10',
    });
    const payload = formularioParaPayload(form);
    expect(payload).toMatchObject({
      tipo: 'BOOKING',
      duracaoMin: 90,
      capacidadeSlot: 3,
      estoque: 0,
    });
    expect(createProductSchema.safeParse(payload).success).toBe(true);
  });

  it('produto físico com campo de agenda é recusado pelo schema do back', () => {
    expect(
      createProductSchema.safeParse({
        ...formularioParaPayload(formularioProdutoSchema.parse(base)),
        duracaoMin: 60,
      }).success,
    ).toBe(false);
  });
});

describe('filtros do catálogo na URL', () => {
  it('lê a query string tolerando valores inválidos', () => {
    const f = lerFiltrosCatalogo(
      new URLSearchParams('busca=fone&precoMin=100&precoMax=abc&ordenar=xyz&page=0&tipo=BOOKING'),
    );
    expect(f.busca).toBe('fone');
    expect(f.precoMin).toBe(100);
    expect(f.precoMax).toBeUndefined();
    expect(f.ordenar).toBe('recente');
    expect(f.page).toBe(1);
    expect(f.tipo).toBe('BOOKING');
  });

  it('converte reais em centavos e separa ordenação e direção para a API', () => {
    const api = filtrosParaApi(
      lerFiltrosCatalogo({ precoMin: '10,5', ordenar: 'preco-desc', page: '3' }),
      'eletronicos',
    );
    expect(api).toMatchObject({
      precoMin: 1050,
      ordenar: 'preco',
      direcao: 'desc',
      page: 3,
      categoria: 'eletronicos',
    });
  });
});
