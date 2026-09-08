'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Botao } from '@/components/ui/botao';
import { Campo, Input } from '@/components/ui/campo';
import { ehApiError, mensagemDeErro } from '@/lib/api/cliente';
import { loginSchema, type DadosLogin } from '@/lib/schemas/auth';
import { destinoSeguro } from '@/lib/utils';
import { useSessao } from '@/providers/sessao-provider';
import { ContasDeTeste } from './contas-de-teste';

/** Login. `?voltar=` devolve o usuário para onde estava (só caminhos do próprio site). */
export function FormularioEntrar() {
  const { status, entrar } = useSessao();
  const router = useRouter();
  const searchParams = useSearchParams();
  const voltar = destinoSeguro(searchParams.get('voltar'));
  const [erro, setErro] = useState<string | null>(null);

  const form = useForm<DadosLogin>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', senha: '' },
    mode: 'onBlur',
  });

  // Já logado (ou acabou de logar): sai daqui.
  useEffect(() => {
    if (status === 'autenticado') router.replace(voltar);
  }, [status, router, voltar]);

  async function aoEnviar(dados: DadosLogin) {
    setErro(null);
    try {
      await entrar(dados);
    } catch (e) {
      if (ehApiError(e, 'CREDENCIAIS_INVALIDAS')) setErro('E-mail ou senha inválidos.');
      else if (ehApiError(e) && e.status === 429)
        setErro('Muitas tentativas. Aguarde um minuto e tente de novo.');
      else setErro(mensagemDeErro(e));
    }
  }

  const enviando = form.formState.isSubmitting;
  const erros = form.formState.errors;
  const cadastroHref =
    voltar !== '/' ? `/criar-conta?voltar=${encodeURIComponent(voltar)}` : '/criar-conta';

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-h1">Entrar</h1>
        <p className="text-corpo text-suave mt-1">
          Ainda não tem conta?{' '}
          <Link href={cadastroHref} className="text-verde-nota underline-offset-4 hover:underline">
            Crie uma em um minuto
          </Link>
          .
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(aoEnviar)}
        noValidate
        className="rounded-card border-borda bg-branco flex flex-col gap-4 border p-5"
      >
        {erro && (
          <p
            role="alert"
            className="rounded-campo bg-alerta-suave text-apoio text-alerta px-3 py-2"
          >
            {erro}
          </p>
        )}
        <Campo rotulo="E-mail" erro={erros.email?.message} obrigatorio>
          {(a11y) => (
            <Input
              {...a11y}
              {...form.register('email')}
              type="email"
              autoComplete="email"
              inputMode="email"
              disabled={enviando}
            />
          )}
        </Campo>
        <Campo rotulo="Senha" erro={erros.senha?.message} obrigatorio>
          {(a11y) => (
            <Input
              {...a11y}
              {...form.register('senha')}
              type="password"
              autoComplete="current-password"
              disabled={enviando}
            />
          )}
        </Campo>
        <Botao type="submit" tamanho="lg" carregando={enviando} className="mt-1">
          {enviando ? 'Entrando…' : 'Entrar'}
        </Botao>
      </form>

      <ContasDeTeste
        aoEscolher={(email, senha) => {
          form.setValue('email', email, { shouldValidate: true });
          form.setValue('senha', senha, { shouldValidate: true });
          setErro(null);
        }}
      />
    </div>
  );
}
