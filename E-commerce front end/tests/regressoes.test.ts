import { describe, expect, it } from 'vitest';
import { escala } from '@/components/admin/BarChart/BarChart';
import { formularioCadastroSchema, registerSchema } from '@/lib/schemas/auth';
import { formularioProdutoSchema } from '@/lib/schemas/produto';
import { destinoSeguro } from '@/lib/utils';

const TAB = String.fromCharCode(9);
const LF = String.fromCharCode(10);
const CR = String.fromCharCode(13);
const BARRA_INVERTIDA = String.fromCharCode(92);

describe('destinoSeguro', () => {
  it('recusa caminhos que o parser de URL transformaria em outro site', () => {
    // O parser descarta tab/LF/CR antes de interpretar: sem removê-los, "/<TAB>/evil.com"
    // vira "//evil.com" (protocol-relative) e sai do site.
    for (const bruto of [`/${TAB}/evil.com`, `/${LF}/evil.com`, `/${CR}/evil.com`]) {
      const destino = destinoSeguro(bruto);
      expect(new URL(destino, 'https://loja.local').origin).toBe('https://loja.local');
    }
  });

  it('continua recusando as formas já conhecidas e aceitando caminho interno', () => {
    expect(destinoSeguro('//evil.com')).toBe('/');
    expect(destinoSeguro(`/${BARRA_INVERTIDA}evil.com`)).toBe('/');
    expect(destinoSeguro('https://evil.com')).toBe('/');
    expect(destinoSeguro(null)).toBe('/');
    expect(destinoSeguro('/meus-pedidos?page=2')).toBe('/meus-pedidos?page=2');
  });
});

describe('cadastro', () => {
  it('o payload montado a partir do formulário passa pelo registerSchema', () => {
    // registerSchema é strict: mandar a saída do formulário inteira (com confirmarSenha)
    // lançava e impedia qualquer cadastro.
    const dados = formularioCadastroSchema.parse({
      nome: 'Maria Silva',
      email: 'm@x.com',
      senha: 'Maria123',
      confirmarSenha: 'Maria123',
    });

    const payload = { nome: dados.nome, email: dados.email, senha: dados.senha };
    expect(registerSchema.safeParse(payload).success).toBe(true);
    expect(registerSchema.safeParse(dados).success).toBe(false);
  });
});

describe('escala do gráfico', () => {
  it('não cria uma faixa vazia quando o máximo já é múltiplo do passo', () => {
    // Somar um passo fixo ao topo deixava a maior barra em 80% da área, com uma faixa sobrando.
    const linhas = escala(100_000);
    expect(linhas.at(-1)).toBe(100_000);
    expect(linhas).toHaveLength(5); // 4 faixas + o zero
  });

  it('arredonda o topo para cima quando o máximo não é redondo', () => {
    const linhas = escala(137_000);
    expect(linhas.at(-1)).toBeGreaterThanOrEqual(137_000);
    expect(linhas.length).toBeLessThanOrEqual(5);
  });

  it('trata máximo zero ou negativo', () => {
    expect(escala(0)).toEqual([0]);
    expect(escala(-5)).toEqual([0]);
  });
});

describe('formulário de produto', () => {
  const base = {
    sku: 'SKU-1',
    nome: 'Corte de cabelo',
    descricao: 'Serviço de barbearia',
    preco: '80,00',
    estoque: 0,
    imagemUrl: '',
    marca: '',
    categoriaId: '11111111-1111-4111-8111-111111111111',
    ativo: true,
  };

  it('aceita SIMPLE com resíduo de agenda deixado pela troca de tipo', () => {
    // Os campos de agenda somem da tela, mas o react-hook-form guarda o valor digitado antes
    // da troca: cobrar "só permitido para BOOKING" prendia o envio num erro invisível.
    const r = formularioProdutoSchema.safeParse({
      ...base,
      tipo: 'SIMPLE',
      estoque: 10,
      duracaoMin: 90,
      capacidadeSlot: 3,
    });
    expect(r.success).toBe(true);
  });

  it('continua exigindo os campos de agenda quando o tipo é BOOKING', () => {
    const r = formularioProdutoSchema.safeParse({ ...base, tipo: 'BOOKING' });
    expect(r.success).toBe(false);
    expect(r.error?.issues.map((i) => i.path[0]).sort()).toEqual(['capacidadeSlot', 'duracaoMin']);
  });
});
