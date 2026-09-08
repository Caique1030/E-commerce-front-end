import { z } from 'zod';
import { brlParaCentavos } from '@/lib/formatadores';
import { TipoProdutoEnum, zodBooleanString } from './enums';

/* Espelho de src/modules/products/dto/products.dto.ts do back-end. */

interface CamposBooking {
  tipo: z.infer<typeof TipoProdutoEnum>;
  duracaoMin?: number | null;
  capacidadeSlot?: number | null;
}

/** Regras de consistência entre tipo e campos de agenda (mesma função do back). */
export function errosCamposBooking(p: CamposBooking): { campo: string; mensagem: string }[] {
  const erros: { campo: string; mensagem: string }[] = [];
  if (p.tipo === 'BOOKING') {
    if (!p.duracaoMin) erros.push({ campo: 'duracaoMin', mensagem: 'obrigatório para BOOKING' });
    if (!p.capacidadeSlot) {
      erros.push({ campo: 'capacidadeSlot', mensagem: 'obrigatório para BOOKING' });
    }
  } else {
    if (p.duracaoMin != null) {
      erros.push({ campo: 'duracaoMin', mensagem: 'só permitido para produtos BOOKING' });
    }
    if (p.capacidadeSlot != null) {
      erros.push({ campo: 'capacidadeSlot', mensagem: 'só permitido para produtos BOOKING' });
    }
  }
  return erros;
}

const baseProductSchema = z.strictObject({
  sku: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .regex(/^[A-Za-z0-9._-]+$/, 'use letras, números, ponto, hífen ou underscore'),
  nome: z.string().trim().min(2).max(200),
  descricao: z.string().trim().min(1).max(5000),
  precoCentavos: z.number().int().min(0),
  estoque: z.number().int().min(0).default(0),
  imagemUrl: z.url().max(2000).nullable().optional(),
  marca: z.string().trim().max(120).nullable().optional(),
  tipo: TipoProdutoEnum.default('SIMPLE'),
  categoriaId: z.uuid(),
  duracaoMin: z.number().int().min(5).max(1440).nullable().optional(),
  capacidadeSlot: z.number().int().min(1).max(1000).nullable().optional(),
  ativo: z.boolean().default(true),
});

export const createProductSchema = baseProductSchema.superRefine((p, ctx) => {
  for (const erro of errosCamposBooking(p)) {
    ctx.addIssue({ code: 'custom', path: [erro.campo], message: erro.mensagem });
  }
});
export type CriarProduto = z.input<typeof createProductSchema>;

/** DTO de update separado: parcial e sem defaults, para não sobrescrever campos por acidente. */
export const updateProductSchema = baseProductSchema
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: 'informe ao menos um campo' });
export type AtualizarProduto = z.infer<typeof updateProductSchema>;

export const ORDENACOES = ['preco', 'nome', 'recente'] as const;

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  categoria: z.string().trim().min(1).max(80).optional(),
  busca: z.string().trim().min(1).max(100).optional(),
  tipo: TipoProdutoEnum.optional(),
  precoMin: z.coerce.number().int().min(0).optional(),
  precoMax: z.coerce.number().int().min(0).optional(),
  ordenar: z.enum(ORDENACOES).default('recente'),
  direcao: z.enum(['asc', 'desc']).optional(),
  incluirInativos: zodBooleanString.optional(),
});

export const disponibilidadeQuerySchema = z.object({
  data: z.iso.date(),
});

/* ---- Formulário administrativo (front). Aceita texto nos campos numéricos e converte. ---- */

const numeroOpcional = (schema: z.ZodNumber) =>
  z.preprocess((v) => {
    if (v === '' || v === null || v === undefined) return undefined;
    if (typeof v === 'string') return Number(v.replace(',', '.'));
    return v;
  }, schema.optional());

const numeroObrigatorio = (schema: z.ZodNumber) =>
  z.preprocess((v) => {
    if (v === '' || v === null || v === undefined) return undefined;
    if (typeof v === 'string') return Number(v.replace(',', '.'));
    return v;
  }, schema);

export const formularioProdutoSchema = z
  .object({
    sku: baseProductSchema.shape.sku,
    nome: baseProductSchema.shape.nome,
    descricao: baseProductSchema.shape.descricao,
    /** Aceita "R$ 1.299,90"; convertido para centavos inteiros antes de enviar. */
    preco: z
      .string()
      .trim()
      .min(1, 'informe o preço')
      .refine((v) => brlParaCentavos(v) !== null, 'informe um preço válido')
      .refine((v) => (brlParaCentavos(v) ?? -1) >= 0, 'o preço não pode ser negativo'),
    estoque: numeroObrigatorio(z.number().int('use um número inteiro').min(0)),
    imagemUrl: z.union([z.literal(''), z.url('informe uma URL válida').max(2000)]),
    marca: z.string().trim().max(120),
    tipo: TipoProdutoEnum,
    categoriaId: z.uuid('escolha uma categoria'),
    duracaoMin: numeroOpcional(z.number().int().min(5, 'mínimo de 5 minutos').max(1440)),
    capacidadeSlot: numeroOpcional(z.number().int().min(1, 'mínimo de 1').max(1000)),
    ativo: z.boolean(),
  })
  .superRefine((v, ctx) => {
    for (const erro of errosCamposBooking(v)) {
      ctx.addIssue({ code: 'custom', path: [erro.campo], message: erro.mensagem });
    }
  });

export type FormularioProdutoEntrada = z.input<typeof formularioProdutoSchema>;
export type FormularioProduto = z.output<typeof formularioProdutoSchema>;

/** Do formulário para o payload da API (o mesmo objeto que o back valida). */
export function formularioParaPayload(v: FormularioProduto): CriarProduto {
  const booking = v.tipo === 'BOOKING';
  return {
    sku: v.sku,
    nome: v.nome,
    descricao: v.descricao,
    precoCentavos: brlParaCentavos(v.preco) ?? 0,
    estoque: booking ? 0 : v.estoque,
    imagemUrl: v.imagemUrl ? v.imagemUrl : null,
    marca: v.marca ? v.marca : null,
    tipo: v.tipo,
    categoriaId: v.categoriaId,
    duracaoMin: booking ? (v.duracaoMin ?? null) : null,
    capacidadeSlot: booking ? (v.capacidadeSlot ?? null) : null,
    ativo: v.ativo,
  };
}
