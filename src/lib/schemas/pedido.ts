import { z } from 'zod';
import { StatusPedidoEnum } from './enums';

/* Espelho de src/modules/orders/dto/orders.dto.ts do back-end. */

export const changeOrderStatusSchema = z.strictObject({
  status: StatusPedidoEnum,
  observacao: z.string().trim().max(500).optional(),
});
export type AlterarStatusPedido = z.infer<typeof changeOrderStatusSchema>;

export const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: StatusPedidoEnum.optional(),
  usuarioId: z.uuid().optional(),
});

/* ---- Formulário do front (observação em branco vira ausente) ---- */

export const formularioStatusSchema = z.strictObject({
  status: StatusPedidoEnum,
  observacao: z.string().trim().max(500, 'máximo de 500 caracteres'),
});
export type FormularioStatus = z.infer<typeof formularioStatusSchema>;
