import { z } from 'zod';
import { PapelEnum } from './enums';

/*
 * Espelho de src/modules/users/dto/users.dto.ts do back-end.
 * As regras e mensagens são as mesmas; a interface capitaliza a mensagem ao exibir.
 */

export const nomeSchema = z.string().trim().min(2, 'mínimo de 2 caracteres').max(120);

export const emailSchema = z.string().trim().toLowerCase().max(160).email('e-mail inválido');

export const senhaSchema = z
  .string()
  .min(8, 'mínimo de 8 caracteres')
  .max(72)
  .regex(/[A-Za-z]/, 'precisa conter ao menos uma letra')
  .regex(/\d/, 'precisa conter ao menos um número');

/** Atualização administrativa. DTO separado do de criação: evita overposting. */
export const updateUserSchema = z
  .strictObject({
    nome: nomeSchema.optional(),
    role: PapelEnum.optional(),
    ativo: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'informe ao menos um campo' });
export type AtualizarUsuario = z.infer<typeof updateUserSchema>;

/** Atualização do próprio perfil: nunca permite trocar o próprio papel. */
export const updateMeSchema = z
  .strictObject({
    nome: nomeSchema.optional(),
    senhaAtual: z.string().min(1).optional(),
    novaSenha: senhaSchema.optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'informe ao menos um campo' })
  .refine((d) => !d.novaSenha || !!d.senhaAtual, {
    message: 'senhaAtual é obrigatória para trocar a senha',
    path: ['senhaAtual'],
  });
export type AtualizarPerfil = z.infer<typeof updateMeSchema>;

/* ---- Formulários do front (derivados dos schemas compartilhados) ---- */

export const formularioNomeSchema = z.strictObject({ nome: nomeSchema });
export type FormularioNome = z.infer<typeof formularioNomeSchema>;

export const formularioSenhaSchema = z
  .strictObject({
    senhaAtual: z.string().min(1, 'informe a senha atual'),
    novaSenha: senhaSchema,
    confirmarSenha: z.string(),
  })
  .refine((d) => d.novaSenha === d.confirmarSenha, {
    message: 'as senhas não conferem',
    path: ['confirmarSenha'],
  });
export type FormularioSenha = z.infer<typeof formularioSenhaSchema>;
