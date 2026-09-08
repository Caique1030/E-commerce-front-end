import { chamarBack, erroBff, repassarErro, responderComSessao } from '@/lib/auth/bff';
import { registerSchema } from '@/lib/schemas/auth';
import type { RespostaAuthBack } from '@/lib/tipos';

export async function POST(req: Request): Promise<Response> {
  const corpo: unknown = await req.json().catch(() => null);
  const dados = registerSchema.safeParse(corpo);
  if (!dados.success) return erroBff(400, 'VALIDACAO', 'Dados de cadastro inválidos');

  const res = await chamarBack('/auth/register', {
    method: 'POST',
    body: JSON.stringify(dados.data),
  });
  if (!res.ok) return repassarErro(res);

  return responderComSessao((await res.json()) as RespostaAuthBack);
}
