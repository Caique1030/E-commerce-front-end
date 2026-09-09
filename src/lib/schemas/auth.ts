import { z } from 'zod';
import { emailSchema, nomeSchema, senhaSchema } from './usuario';

/* Espelho de src/modules/auth/dto/auth.dto.ts do back-end. */

export const registerSchema = z.strictObject({
  nome: nomeSchema,
  email: emailSchema,
  senha: senhaSchema,
});
export type DadosCadastro = z.infer<typeof registerSchema>;

export const loginSchema = z.strictObject({
  email: emailSchema,
  senha: z.string().min(1, 'informe a senha'),
});
export type DadosLogin = z.infer<typeof loginSchema>;

export const refreshSchema = z.strictObject({
  refreshToken: z.string().min(20, 'refresh token inválido'),
});

/* ---- Formulário do front: confirmação de senha existe só na tela; o payload é o registerSchema ---- */

export const formularioCadastroSchema = registerSchema
  .extend({ confirmarSenha: z.string() })
  .refine((d) => d.senha === d.confirmarSenha, {
    message: 'as senhas não conferem',
    path: ['confirmarSenha'],
  });
export type FormularioCadastro = z.infer<typeof formularioCadastroSchema>;
