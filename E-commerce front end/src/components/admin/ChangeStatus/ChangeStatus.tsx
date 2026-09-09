'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Field, NativeSelect, Textarea } from '@/components/ui/Field';
import { mensagemDeErro } from '@/lib/api/cliente';
import { ROTULO_STATUS, TRANSICOES } from '@/lib/constantes';
import { useAlterarStatusPedido } from '@/lib/hooks/use-pedidos';
import {
  changeOrderStatusSchema,
  formularioStatusSchema,
  type FormularioStatus,
} from '@/lib/schemas/pedido';
import type { StatusPedido } from '@/lib/tipos';
import { notificar } from '@/stores/ui-store';
import * as S from './style';

export interface ChangeStatusProps {
  pedidoId: string;
  statusAtual: StatusPedido;
  /** Chamado após sucesso (ex.: fechar modal). */
  onDone?: () => void;
  compact?: boolean;
}

/** Só oferece as transições permitidas pela máquina de estados; cancelar devolve o estoque. */
export function ChangeStatus({
  pedidoId,
  statusAtual,
  onDone,
  compact = false,
}: ChangeStatusProps) {
  const permitidas = TRANSICOES[statusAtual];
  const alterar = useAlterarStatusPedido(pedidoId);
  const form = useForm<FormularioStatus>({
    resolver: zodResolver(formularioStatusSchema),
    defaultValues: { status: permitidas[0] ?? statusAtual, observacao: '' },
  });

  const statusEscolhido = useWatch({ control: form.control, name: 'status' });

  if (permitidas.length === 0) {
    return (
      <S.Note>
        Pedido {ROTULO_STATUS[statusAtual].toLowerCase()}: não há mais transições possíveis.
      </S.Note>
    );
  }

  async function aoEnviar(dados: FormularioStatus) {
    try {
      await alterar.mutateAsync(
        changeOrderStatusSchema.parse({
          status: dados.status,
          observacao: dados.observacao.trim() || undefined,
        }),
      );
      notificar({
        tipo: 'sucesso',
        titulo: `Pedido marcado como ${ROTULO_STATUS[dados.status].toLowerCase()}.`,
      });
      form.reset({ status: TRANSICOES[dados.status][0] ?? dados.status, observacao: '' });
      onDone?.();
    } catch (erro) {
      notificar({
        tipo: 'erro',
        titulo: 'O status não foi alterado.',
        descricao: mensagemDeErro(erro),
      });
    }
  }

  return (
    <S.Root onSubmit={form.handleSubmit(aoEnviar)} noValidate>
      <Field label="Novo status" error={form.formState.errors.status?.message}>
        {(a11y) => (
          <NativeSelect {...a11y} {...form.register('status')} disabled={alterar.isPending}>
            {permitidas.map((s) => (
              <option key={s} value={s}>
                {ROTULO_STATUS[s]}
              </option>
            ))}
          </NativeSelect>
        )}
      </Field>
      <Field
        label="Observação"
        error={form.formState.errors.observacao?.message}
        hint="Opcional. Fica no histórico do pedido."
      >
        {(a11y) => (
          <Textarea
            {...a11y}
            {...form.register('observacao')}
            rows={compact ? 2 : 3}
            disabled={alterar.isPending}
          />
        )}
      </Field>
      {statusEscolhido === 'CANCELADO' && (
        <S.Warning role="status">
          Cancelar devolve o estoque dos produtos físicos e libera os horários agendados. Não dá
          para desfazer.
        </S.Warning>
      )}
      <Button
        type="submit"
        variant={statusEscolhido === 'CANCELADO' ? 'danger' : 'primary'}
        loading={alterar.isPending}
      >
        {statusEscolhido === 'CANCELADO'
          ? 'Cancelar pedido'
          : `Marcar como ${ROTULO_STATUS[statusEscolhido].toLowerCase()}`}
      </Button>
    </S.Root>
  );
}
