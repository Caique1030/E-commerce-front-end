'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Botao } from '@/components/ui/botao';
import { Campo, Selecao, Textarea } from '@/components/ui/campo';
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

interface AlterarStatusProps {
  pedidoId: string;
  statusAtual: StatusPedido;
  /** Chamado após sucesso (ex.: fechar modal). */
  aoConcluir?: () => void;
  compacto?: boolean;
}

/** Só oferece as transições permitidas pela máquina de estados; cancelar devolve o estoque. */
export function AlterarStatus({
  pedidoId,
  statusAtual,
  aoConcluir,
  compacto = false,
}: AlterarStatusProps) {
  const permitidas = TRANSICOES[statusAtual];
  const alterar = useAlterarStatusPedido(pedidoId);
  const form = useForm<FormularioStatus>({
    resolver: zodResolver(formularioStatusSchema),
    defaultValues: { status: permitidas[0] ?? statusAtual, observacao: '' },
  });

  const statusEscolhido = useWatch({ control: form.control, name: 'status' });

  if (permitidas.length === 0) {
    return (
      <p className="text-apoio text-suave">
        Pedido {ROTULO_STATUS[statusAtual].toLowerCase()}: não há mais transições possíveis.
      </p>
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
      aoConcluir?.();
    } catch (erro) {
      notificar({
        tipo: 'erro',
        titulo: 'O status não foi alterado.',
        descricao: mensagemDeErro(erro),
      });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(aoEnviar)} noValidate className="flex flex-col gap-3">
      <Campo rotulo="Novo status" erro={form.formState.errors.status?.message}>
        {(a11y) => (
          <Selecao {...a11y} {...form.register('status')} disabled={alterar.isPending}>
            {permitidas.map((s) => (
              <option key={s} value={s}>
                {ROTULO_STATUS[s]}
              </option>
            ))}
          </Selecao>
        )}
      </Campo>
      <Campo
        rotulo="Observação"
        erro={form.formState.errors.observacao?.message}
        dica="Opcional. Fica no histórico do pedido."
      >
        {(a11y) => (
          <Textarea
            {...a11y}
            {...form.register('observacao')}
            rows={compacto ? 2 : 3}
            disabled={alterar.isPending}
          />
        )}
      </Campo>
      {statusEscolhido === 'CANCELADO' && (
        <p className="rounded-campo bg-aviso-suave text-apoio text-aviso px-3 py-2" role="status">
          Cancelar devolve o estoque dos produtos físicos e libera os horários agendados. Não dá
          para desfazer.
        </p>
      )}
      <Botao
        type="submit"
        variante={statusEscolhido === 'CANCELADO' ? 'perigo' : 'primario'}
        carregando={alterar.isPending}
      >
        {statusEscolhido === 'CANCELADO'
          ? 'Cancelar pedido'
          : `Marcar como ${ROTULO_STATUS[statusEscolhido].toLowerCase()}`}
      </Botao>
    </form>
  );
}
