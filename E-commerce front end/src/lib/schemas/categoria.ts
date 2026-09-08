import { z } from 'zod';
import { zodBooleanString } from './enums';

/* Espelho de src/modules/categories/dto/categories.dto.ts do back-end. */

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'use letras minúsculas, números e hífens');

const baseCategorySchema = z.strictObject({
  slug: slugSchema,
  nome: z.string().trim().min(2).max(120),
  parentId: z.uuid().nullable().optional(),
  ordem: z.number().int().min(0).default(0),
  ativo: z.boolean().default(true),
});

export const createCategorySchema = baseCategorySchema;
export type CriarCategoria = z.input<typeof createCategorySchema>;

export const updateCategorySchema = baseCategorySchema
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: 'informe ao menos um campo' });
export type AtualizarCategoria = z.infer<typeof updateCategorySchema>;

export const listCategoriesQuerySchema = z.object({
  incluirInativas: zodBooleanString.optional(),
});

/* ---- Formulário do front ---- */

export const formularioCategoriaSchema = z.strictObject({
  nome: baseCategorySchema.shape.nome,
  slug: slugSchema,
  parentId: z.union([z.literal(''), z.uuid()]),
});
export type FormularioCategoria = z.infer<typeof formularioCategoriaSchema>;
