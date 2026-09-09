'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { ehApiError, mensagemDeErro } from '@/lib/api/cliente';
import {
  formularioCadastroSchema,
  registerSchema,
  type FormularioCadastro,
} from '@/lib/schemas/auth';
import { destinoSeguro } from '@/lib/utils';
import { useSessao } from '@/providers/sessao-provider';
import * as S from './style';

/** Cadastro. A confirmação de senha existe só na tela; o payload é exatamente o registerSchema do back. */
export function RegisterForm() {
  const { status, criarConta } = useSessao();
  const router = useRouter();
  const searchParams = useSearchParams();
  const voltar = destinoSeguro(searchParams.get('voltar'));
  const [erro, setErro] = useState<string | null>(null);

  const form = useForm<FormularioCadastro>({
    resolver: zodResolver(formularioCadastroSchema),
    defaultValues: { nome: '', email: '', senha: '', confirmarSenha: '' },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (status === 'autenticado') router.replace(voltar);
  }, [status, router, voltar]);

  async function aoEnviar(dados: FormularioCadastro) {
    setErro(null);
    try {
      // `confirmarSenha` existe só na tela; registerSchema é strict e recusaria a chave extra.
      // O payload é montado campo a campo, como nos outros formulários do projeto.
      await criarConta(
        registerSchema.parse({ nome: dados.nome, email: dados.email, senha: dados.senha }),
      );
    } catch (e) {
      if (ehApiError(e, 'EMAIL_JA_CADASTRADO')) {
        form.setError('email', { message: 'já existe uma conta com este e-mail' });
        return;
      }
      if (ehApiError(e) && e.status === 429)
        setErro('Muitas tentativas. Aguarde um minuto e tente de novo.');
      else setErro(mensagemDeErro(e));
    }
  }

  const enviando = form.formState.isSubmitting;
  const erros = form.formState.errors;
  const entrarHref = voltar !== '/' ? `/entrar?voltar=${encodeURIComponent(voltar)}` : '/entrar';

  return (
    <S.Root>
      <div>
        <S.Title>Criar conta</S.Title>
        <S.Lead>
          Já tem conta? <S.LeadLink href={entrarHref}>Entre</S.LeadLink>.
        </S.Lead>
      </div>

      <S.Form onSubmit={form.handleSubmit(aoEnviar)} noValidate>
        {erro && <S.Alert role="alert">{erro}</S.Alert>}
        <Field label="Nome completo" error={erros.nome?.message} required>
          {(a11y) => (
            <Input {...a11y} {...form.register('nome')} autoComplete="name" disabled={enviando} />
          )}
        </Field>
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
        <Field
          label="Senha"
          error={erros.senha?.message}
          hint="Ao menos 8 caracteres, com letra e número."
          required
        >
          {(a11y) => (
            <Input
              {...a11y}
              {...form.register('senha')}
              type="password"
              autoComplete="new-password"
              disabled={enviando}
            />
          )}
        </Field>
        <Field label="Confirmar senha" error={erros.confirmarSenha?.message} required>
          {(a11y) => (
            <Input
              {...a11y}
              {...form.register('confirmarSenha')}
              type="password"
              autoComplete="new-password"
              disabled={enviando}
            />
          )}
        </Field>
        <Button type="submit" size="lg" loading={enviando} className="mt-1">
          {enviando ? 'Criando conta…' : 'Criar conta'}
        </Button>
      </S.Form>
    </S.Root>
  );
}
