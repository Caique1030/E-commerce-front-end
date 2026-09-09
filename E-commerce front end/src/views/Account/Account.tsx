'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { SessionGuard } from '@/components/layout/SessionGuard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { Skeleton } from '@/components/ui/Skeleton';
import { ehApiError, mensagemDeErro } from '@/lib/api/cliente';
import { ROTULO_PAPEL } from '@/lib/constantes';
import { useAtualizarPerfil } from '@/lib/hooks/use-usuarios';
import {
  formularioNomeSchema,
  formularioSenhaSchema,
  updateMeSchema,
  type FormularioNome,
  type FormularioSenha,
} from '@/lib/schemas/usuario';
import { useSessao } from '@/providers/sessao-provider';
import { notificar } from '@/stores/ui-store';
import * as S from './style';

function PageSkeleton() {
  return (
    <S.Skeletons aria-busy>
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-64 w-full" />
    </S.Skeletons>
  );
}

/** Minha conta: nome e senha. O e-mail e o papel são só leitura. */
export function Account() {
  return (
    <SessionGuard fallback={<PageSkeleton />}>
      <AccountContent />
    </SessionGuard>
  );
}

function AccountContent() {
  const { usuario } = useSessao();
  if (!usuario) return null;

  return (
    <S.Root>
      <div>
        <S.Title>Minha conta</S.Title>
        <S.Subtitle>
          {usuario.email}
          <Badge variant="neutral">{ROTULO_PAPEL[usuario.role]}</Badge>
        </S.Subtitle>
      </div>
      <NameForm nomeAtual={usuario.nome} />
      <PasswordForm />
    </S.Root>
  );
}

function NameForm({ nomeAtual }: { nomeAtual: string }) {
  const atualizar = useAtualizarPerfil();
  const form = useForm<FormularioNome>({
    resolver: zodResolver(formularioNomeSchema),
    defaultValues: { nome: nomeAtual },
    mode: 'onBlur',
  });

  async function aoEnviar(dados: FormularioNome) {
    try {
      const u = await atualizar.mutateAsync(updateMeSchema.parse({ nome: dados.nome }));
      form.reset({ nome: u.nome });
      notificar({ tipo: 'sucesso', titulo: 'Nome atualizado.' });
    } catch (erro) {
      notificar({
        tipo: 'erro',
        titulo: 'O nome não foi alterado.',
        descricao: mensagemDeErro(erro),
      });
    }
  }

  return (
    <S.FormCard onSubmit={form.handleSubmit(aoEnviar)} noValidate>
      <S.SectionTitle>Seus dados</S.SectionTitle>
      <Field label="Nome completo" error={form.formState.errors.nome?.message} required>
        {(a11y) => <Input {...a11y} {...form.register('nome')} autoComplete="name" />}
      </Field>
      <div>
        <Button
          type="submit"
          variant="secondary"
          loading={atualizar.isPending}
          disabled={!form.formState.isDirty}
        >
          Salvar nome
        </Button>
      </div>
    </S.FormCard>
  );
}

function PasswordForm() {
  const atualizar = useAtualizarPerfil();
  const form = useForm<FormularioSenha>({
    resolver: zodResolver(formularioSenhaSchema),
    defaultValues: { senhaAtual: '', novaSenha: '', confirmarSenha: '' },
    mode: 'onBlur',
  });

  async function aoEnviar(dados: FormularioSenha) {
    try {
      await atualizar.mutateAsync(
        updateMeSchema.parse({ senhaAtual: dados.senhaAtual, novaSenha: dados.novaSenha }),
      );
      form.reset();
      notificar({ tipo: 'sucesso', titulo: 'Senha alterada.' });
    } catch (erro) {
      if (ehApiError(erro) && (erro.status === 401 || erro.codigo === 'SENHA_ATUAL_INVALIDA')) {
        form.setError('senhaAtual', { message: 'a senha atual não confere' });
        return;
      }
      notificar({
        tipo: 'erro',
        titulo: 'A senha não foi alterada.',
        descricao: mensagemDeErro(erro),
      });
    }
  }

  const erros = form.formState.errors;

  return (
    <S.FormCard onSubmit={form.handleSubmit(aoEnviar)} noValidate>
      <S.SectionTitle>Senha</S.SectionTitle>
      <Field label="Senha atual" error={erros.senhaAtual?.message} required>
        {(a11y) => (
          <Input
            {...a11y}
            {...form.register('senhaAtual')}
            type="password"
            autoComplete="current-password"
          />
        )}
      </Field>
      <Field
        label="Nova senha"
        error={erros.novaSenha?.message}
        hint="Ao menos 8 caracteres, com letra e número."
        required
      >
        {(a11y) => (
          <Input
            {...a11y}
            {...form.register('novaSenha')}
            type="password"
            autoComplete="new-password"
          />
        )}
      </Field>
      <Field label="Confirmar nova senha" error={erros.confirmarSenha?.message} required>
        {(a11y) => (
          <Input
            {...a11y}
            {...form.register('confirmarSenha')}
            type="password"
            autoComplete="new-password"
          />
        )}
      </Field>
      <div>
        <Button type="submit" variant="secondary" loading={atualizar.isPending}>
          Alterar senha
        </Button>
      </div>
    </S.FormCard>
  );
}
