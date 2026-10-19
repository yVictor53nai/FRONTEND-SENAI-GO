import React, { createContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as salasService from '../services/salasService';
import * as visitasService from '../services/visitasService';
import * as saldoService from '../services/saldoService';
import { ApiError } from '../services/api';
import { toSalaId } from '../utils/qrCode';

export const ProgressoContext = createContext(null);

const PONTOS_INICIAIS = { pontosGanhos: 0, pontosGastos: 0, saldo: 0 };

// Função auxiliar para normalizar o ID de uma sala
const getRoomId = (item) => toSalaId(item) ?? item?.salaId ?? item?.id ?? item?._id ?? item?.id_sala;

export const ProgressoProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id ?? user?.userId ?? user?._id;

  const [salas, setSalas] = useState([]);
  const [visits, setVisits] = useState([]);
  const [pontos, setPontos] = useState(PONTOS_INICIAIS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const loadIdRef = useRef(0);

  const sincronizar = useCallback(async () => {
    if (userId == null) return;
    const loadId = ++loadIdRef.current;
    setLoading(true);
    setError('');
    try {
      const [listaSalas, todasVisitas, saldo] = await Promise.all([
        salasService.listarSalas(),
        visitasService.listarVisitas(),
        saldoService.obterSaldo(),
      ]);
      if (loadId !== loadIdRef.current) return;

      setSalas(Array.isArray(listaSalas) ? listaSalas : []);

      // Filtro flexível para capturar as visitas do usuário logado suportando diferentes nomes de propriedade
      const visitasDoUsuario = Array.isArray(todasVisitas)
        ? todasVisitas.filter((v) => {
            const vUserId = v.usuarioId ?? v.userId ?? v.id_usuario ?? v.id;
            return String(vUserId) === String(userId);
          })
        : [];

      setVisits(visitasDoUsuario);
      setPontos(saldo || PONTOS_INICIAIS);
    } catch (err) {
      if (loadId === loadIdRef.current) setError(err.message);
    } finally {
      if (loadId === loadIdRef.current) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isAuthenticated) {
      sincronizar();
      return;
    }
    loadIdRef.current += 1;
    setSalas([]);
    setVisits([]);
    setPontos(PONTOS_INICIAIS);
    setError('');
    setLoading(false);
  }, [isAuthenticated, sincronizar]);

  const atualizarSaldo = useCallback(async () => {
    try {
      const novoSaldo = await saldoService.obterSaldo();
      if (novoSaldo) setPontos(novoSaldo);
    } catch (err) {
      console.warn('Não foi possível atualizar o saldo de pontos:', err);
    }
  }, []);

  // Extrai IDs únicos visitados e verifica se a sala correspondente existe na lista de salas ativas
  const visitedRooms = useMemo(() => {
    const rawVisitedIds = visits.map((v) => getRoomId(v) ?? toSalaId(v.salaId));
    const uniqueIds = [...new Set(rawVisitedIds.filter(Boolean))];

    return uniqueIds.filter((id) =>
      salas.some((s) => String(getRoomId(s)) === String(id))
    );
  }, [visits, salas]);

  const registrarVisita = useCallback(
    async ({ salaId }) => {
      const targetId = toSalaId(salaId);

      // Verificação defensiva de duplicidade (String com String)
      const jaVisitada = visitedRooms.some((vId) => String(vId) === String(targetId));
      if (jaVisitada) {
        throw new ApiError('Você já visitou esta área.', { status: 409 });
      }

      try {
        // Envia o objeto formatado aceitando tanto 'salaId' quanto 'id'
        const res = await visitasService.registrarVisita({
          salaId: targetId,
          id: targetId,
        });

        const localDeVisita = res?.localDeVisita || res || { salaId: targetId, usuarioId: userId };
        setVisits((prev) => [...prev, localDeVisita]);
      } catch (err) {
        if (err.status === 409) sincronizar();
        throw err;
      }

      try {
        await atualizarSaldo();
      } catch {
        setError('Visita registrada, mas não foi possível atualizar seu saldo de pontos.');
      }
    },
    [visitedRooms, userId, sincronizar, atualizarSaldo]
  );

  const value = useMemo(
    () => ({
      salas,
      visitedRooms,
      saldo: pontos.saldo ?? 0,
      pontosGanhos: pontos.pontosGanhos ?? 0,
      loading,
      error,
      recarregar: sincronizar,
      registrarVisita,
      atualizarSaldo,
    }),
    [salas, visitedRooms, pontos, loading, error, sincronizar, registrarVisita, atualizarSaldo]
  );

  return <ProgressoContext.Provider value={value}>{children}</ProgressoContext.Provider>;
};