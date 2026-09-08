'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Botao } from '@/components/ui/botao';
import { Campo, Input } from '@/components/ui/campo';
import { ehApiError, mensagemDeErro } from '@/lib/api/cliente';
import {
  formularioCadastroSchema,
  registerSchema,
  type FormularioCadastro,
} from '@/lib/schemas/auth';
import { destinoSeguro } from '@/lib/utils';
import { useSessao } from '@/providers/sessao-provider';

/** Cadastro. A confirmação de senha existe só na tela; o payload é exatamente o registerSchema do back. */
export function FormularioCadastro() {
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
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-h1">Criar conta</h1>
        <p className="text-corpo text-suave mt-1">
          Já tem conta?{' '}
          <Link href={entrarHref} className="text-verde-nota underline-offset-4 hover:underline">
            Entre
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
        <Campo rotulo="Nome completo" erro={erros.nome?.message} obrigatorio>
          {(a11y) => (
            <Input {...a11y} {...form.register('nome')} autoComplete="name" disabled={enviando} />
          )}
        </Campo>
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
        <Campo
          rotulo="Senha"
          erro={erros.senha?.message}
          dica="Ao menos 8 caracteres, com letra e número."
          obrigatorio
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
        </Campo>
        <Campo rotulo="Confirmar senha" erro={erros.confirmarSenha?.message} obrigatorio>
          {(a11y) => (
            <Input
              {...a11y}
              {...form.register('confirmarSenha')}
              type="password"
              autoComplete="new-password"
              disabled={enviando}
            />
          )}
        </Campo>
        <Botao type="submit" tamanho="lg" carregando={enviando} className="mt-1">
          {enviando ? 'Criando conta…' : 'Criar conta'}
        </Botao>
      </form>
    </div>
  );
}
