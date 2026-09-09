import {
  chamarBack,
  erroBff,
  erroOrigem,
  mesmaOrigem,
  repassarErro,
  responderComSessao,
} from '@/lib/auth/bff';
import { loginSchema } from '@/lib/schemas/auth';
import type { RespostaAuthBack } from '@/lib/tipos';

export async function POST(req: Request): Promise<Response> {
  if (!mesmaOrigem(req)) return erroOrigem();

  const corpo: unknown = await req.json().catch(() => null);
  const dados = loginSchema.safeParse(corpo);
  if (!dados.success) return erroBff(400, 'VALIDACAO', 'Informe e-mail e senha');

  const res = await chamarBack('/auth/login', { method: 'POST', body: JSON.stringify(dados.data) });
  if (!res.ok) return repassarErro(res);

  return responderComSessao((await res.json()) as RespostaAuthBack);
}
