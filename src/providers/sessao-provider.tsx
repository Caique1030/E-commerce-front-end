'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { definirToken, obterTokenAtual, registrarRenovador } from '@/lib/api/auth-token';
import { sessaoApi } from '@/lib/api/sessao';
import { temMarcadorSessao } from '@/lib/auth/cookies';
import { ehEquipe } from '@/lib/constantes';
import { qk } from '@/lib/query-keys';
import type { DadosCadastro, DadosLogin } from '@/lib/schemas/auth';
import type { SessaoPublica, Usuario } from '@/lib/tipos';

export type StatusSessao = 'carregando' | 'anonimo' | 'autenticado';

export interface Sessao {
  status: StatusSessao;
  usuario: Usuario | null;
  /** Atalhos para não repetir a checagem de papel em todo componente. */
  ehCliente: boolean;
  ehEquipe: boolean;
  ehAdmin: boolean;
  entrar: (dados: DadosLogin) => Promise<Usuario>;
  criarConta: (dados: DadosCadastro) => Promise<Usuario>;
  sair: () => Promise<void>;
  atualizarUsuario: (usuario: Usuario) => void;
}

const SessaoContext = createContext<Sessao | null>(null);

/**
 * Sessão do usuário: access token em memória, refresh token em cookie httpOnly (via BFF).
 *
 * O marcador é lido no navegador, não no layout raiz: qualquer leitura de cookie no servidor
 * tirava o site inteiro do render estático. O HTML sai igual para todo mundo (status
 * "carregando") e a primeira execução do efeito resolve entre renovar e assumir anônimo —
 * sem 401 gratuito para quem nunca entrou.
 */
export function SessaoProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [status, setStatus] = useState<StatusSessao>('carregando');
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [expiresIn, setExpiresIn] = useState(0);
  const timerRenovacao = useRef<ReturnType<typeof setTimeout> | null>(null);

  const aplicarSessao = useCallback((s: SessaoPublica | null) => {
    if (s) {
      definirToken(s.accessToken, s.expiresIn);
      setUsuario(s.usuario);
      setExpiresIn(s.expiresIn);
      setStatus('autenticado');
    } else {
      definirToken(null);
      setUsuario(null);
      setExpiresIn(0);
      setStatus('anonimo');
    }
  }, []);

  const renovar = useCallback(async (): Promise<string | null> => {
    try {
      const s = await sessaoApi.renovar();
      aplicarSessao(s);
      return s.accessToken;
    } catch {
      aplicarSessao(null);
      return null;
    }
  }, [aplicarSessao]);

  // O cliente HTTP pede renovação por aqui quando recebe 401.
  useEffect(() => {
    registrarRenovador(renovar);
    return () => registrarRenovador(null);
  }, [renovar]);

  // Restaura a sessão ao montar. Sem marcador o resultado já é "anônimo", mas mesmo esse caso
  // passa pela promessa: resolver de forma síncrona aqui seria um setState dentro do corpo do
  // efeito, com o render em cascata que vem junto.
  useEffect(() => {
    let ativo = true;
    const promessa: Promise<SessaoPublica | null> = temMarcadorSessao()
      ? sessaoApi.renovar()
      : Promise.resolve(null);

    promessa.then(
      (s) => {
        if (ativo) aplicarSessao(s);
      },
      () => {
        if (ativo) aplicarSessao(null);
      },
    );
    return () => {
      ativo = false;
    };
  }, [aplicarSessao]);

  // Renovação proativa aos 80% da validade: o usuário nunca vê um 401 no meio de uma ação.
  useEffect(() => {
    if (timerRenovacao.current) clearTimeout(timerRenovacao.current);
    if (status !== 'autenticado' || !expiresIn) return;
    timerRenovacao.current = setTimeout(() => void renovar(), expiresIn * 1000 * 0.8);
    return () => {
      if (timerRenovacao.current) clearTimeout(timerRenovacao.current);
    };
  }, [status, expiresIn, renovar]);

  const limparDadosPrivados = useCallback(() => {
    qc.removeQueries({ queryKey: qk.carrinho.atual });
    qc.removeQueries({ queryKey: qk.pedidos.todos });
    qc.removeQueries({ queryKey: qk.usuarios.todos });
    qc.removeQueries({ queryKey: qk.dashboard.todos });
  }, [qc]);

  const entrar = useCallback(
    async (dados: DadosLogin) => {
      const s = await sessaoApi.entrar(dados);
      limparDadosPrivados();
      aplicarSessao(s);
      return s.usuario;
    },
    [aplicarSessao, limparDadosPrivados],
  );

  const criarConta = useCallback(
    async (dados: DadosCadastro) => {
      const s = await sessaoApi.criarConta(dados);
      limparDadosPrivados();
      aplicarSessao(s);
      return s.usuario;
    },
    [aplicarSessao, limparDadosPrivados],
  );

  const sair = useCallback(async () => {
    const token = obterTokenAtual();
    aplicarSessao(null);
    limparDadosPrivados();
    await sessaoApi.sair(token).catch(() => undefined);
  }, [aplicarSessao, limparDadosPrivados]);

  const atualizarUsuario = useCallback((u: Usuario) => setUsuario(u), []);

  const valor = useMemo<Sessao>(
    () => ({
      status,
      usuario,
      ehCliente: usuario?.role === 'CLIENTE',
      ehEquipe: ehEquipe(usuario?.role),
      ehAdmin: usuario?.role === 'ADMIN',
      entrar,
      criarConta,
      sair,
      atualizarUsuario,
    }),
    [status, usuario, entrar, criarConta, sair, atualizarUsuario],
  );

  return <SessaoContext.Provider value={valor}>{children}</SessaoContext.Provider>;
}

export function useSessao(): Sessao {
  const ctx = useContext(SessaoContext);
  if (!ctx) throw new Error('useSessao precisa estar dentro de <SessaoProvider>');
  return ctx;
}
