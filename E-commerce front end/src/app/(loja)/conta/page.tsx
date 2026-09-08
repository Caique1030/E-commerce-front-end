'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { GuardaSessao } from '@/components/layout/guardas';
import { Badge } from '@/components/ui/badge';
import { Botao } from '@/components/ui/botao';
import { Campo, Input } from '@/components/ui/campo';
import { Esqueleto } from '@/components/ui/esqueleto';
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

function EsqueletoPagina() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6" aria-busy>
      <Esqueleto className="h-8 w-40" />
      <Esqueleto className="h-40 w-full" />
      <Esqueleto className="h-64 w-full" />
    </div>
  );
}

export default function ContaPage() {
  return (
    <GuardaSessao esqueleto={<EsqueletoPagina />}>
      <Conta />
    </GuardaSessao>
  );
}

function Conta() {
  const { usuario } = useSessao();
  if (!usuario) return null;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-h1">Minha conta</h1>
        <p className="text-corpo text-suave mt-1 flex flex-wrap items-center gap-2">
          {usuario.email}
          <Badge variante="neutro">{ROTULO_PAPEL[usuario.role]}</Badge>
        </p>
      </div>
      <FormularioNome nomeAtual={usuario.nome} />
      <FormularioSenhaConta />
    </div>
  );
}

function FormularioNome({ nomeAtual }: { nomeAtual: string }) {
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
    <form
      onSubmit={form.handleSubmit(aoEnviar)}
      noValidate
      className="rounded-card border-borda bg-branco shadow-card flex flex-col gap-4 border p-5"
    >
      <h2 className="text-h2">Seus dados</h2>
      <Campo rotulo="Nome completo" erro={form.formState.errors.nome?.message} obrigatorio>
        {(a11y) => <Input {...a11y} {...form.register('nome')} autoComplete="name" />}
      </Campo>
      <div>
        <Botao
          type="submit"
          variante="secundario"
          carregando={atualizar.isPending}
          disabled={!form.formState.isDirty}
        >
          Salvar nome
        </Botao>
      </div>
    </form>
  );
}

function FormularioSenhaConta() {
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
    <form
      onSubmit={form.handleSubmit(aoEnviar)}
      noValidate
      className="rounded-card border-borda bg-branco shadow-card flex flex-col gap-4 border p-5"
    >
      <h2 className="text-h2">Senha</h2>
      <Campo rotulo="Senha atual" erro={erros.senhaAtual?.message} obrigatorio>
        {(a11y) => (
          <Input
            {...a11y}
            {...form.register('senhaAtual')}
            type="password"
            autoComplete="current-password"
          />
        )}
      </Campo>
      <Campo
        rotulo="Nova senha"
        erro={erros.novaSenha?.message}
        dica="Ao menos 8 caracteres, com letra e número."
        obrigatorio
      >
        {(a11y) => (
          <Input
            {...a11y}
            {...form.register('novaSenha')}
            type="password"
            autoComplete="new-password"
          />
        )}
      </Campo>
      <Campo rotulo="Confirmar nova senha" erro={erros.confirmarSenha?.message} obrigatorio>
        {(a11y) => (
          <Input
            {...a11y}
            {...form.register('confirmarSenha')}
            type="password"
            autoComplete="new-password"
          />
        )}
      </Campo>
      <div>
        <Botao type="submit" variante="secundario" carregando={atualizar.isPending}>
          Alterar senha
        </Botao>
      </div>
    </form>
  );
}
