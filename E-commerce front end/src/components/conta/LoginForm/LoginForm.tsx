'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { ehApiError, mensagemDeErro } from '@/lib/api/cliente';
import { loginSchema, type DadosLogin } from '@/lib/schemas/auth';
import { destinoSeguro } from '@/lib/utils';
import { useSessao } from '@/providers/sessao-provider';
import { TestAccounts } from '../TestAccounts/TestAccounts';
import * as S from './style';

/** Login. `?voltar=` devolve o usuário para onde estava (só caminhos do próprio site). */
export function LoginForm() {
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
    <S.Root>
      <div>
        <S.Title>Entrar</S.Title>
        <S.Lead>
          Ainda não tem conta? <S.LeadLink href={cadastroHref}>Crie uma em um minuto</S.LeadLink>.
        </S.Lead>
      </div>

      <S.Form onSubmit={form.handleSubmit(aoEnviar)} noValidate>
        {erro && <S.Alert role="alert">{erro}</S.Alert>}
        <Field label="E-mail" error={erros.email?.message} required>
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
        </Field>
        <Field label="Senha" error={erros.senha?.message} required>
          {(a11y) => (
            <Input
              {...a11y}
              {...form.register('senha')}
              type="password"
              autoComplete="current-password"
              disabled={enviando}
            />
          )}
        </Field>
        <Button type="submit" size="lg" loading={enviando} className="mt-1">
          {enviando ? 'Entrando…' : 'Entrar'}
        </Button>
      </S.Form>

      <TestAccounts
        onPick={(email, senha) => {
          form.setValue('email', email, { shouldValidate: true });
          form.setValue('senha', senha, { shouldValidate: true });
          setErro(null);
        }}
      />
    </S.Root>
  );
}
