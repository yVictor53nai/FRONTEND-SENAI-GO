import React, { createContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as salasService from '../services/salasService';
import * as visitasService from '../services/visitasService';
import * as saldoService from '../services/saldoService';
import { ApiError } from '../services/api';
import { toSalaId } from '../utils/qrCode';

export const ProgressoContext = createContext(null);

const PONTOS_INICIAIS = { pontosGanhos: 0, pontosGastos: 0, saldo: 0 };

const getRoomId = (item) => {
  if (!item) return null;
  return toSalaId(item) ?? item?.sala_id ?? item?.salaId ?? item?.id ?? item?._id ?? item?.id_sala;
};

export const ProgressoProvider = ({ children }) => {
  const auth = useAuth ? useAuth() : {};
  const { user, isAuthenticated } = auth;
  const userId = user?.id ?? user?.userId ?? user?._id ?? user?.id_usuario;

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
        salasService.listarSalas ? salasService.listarSalas().catch(() => []) : [],
        visitasService.listarVisitas ? visitasService.listarVisitas().catch(() => []) : [],
        saldoService.obterSaldo ? saldoService.obterSaldo().catch(() => PONTOS_INICIAIS) : PONTOS_INICIAIS,
      ]);

      if (loadId !== loadIdRef.current) return;

      setSalas(Array.isArray(listaSalas) ? listaSalas : []);

      const visitasDoUsuario = Array.isArray(todasVisitas)
        ? todasVisitas.filter((v) => {
            const vUserId = v.usuario_id ?? v.usuarioId ?? v.userId ?? v.id_usuario ?? v.id;
            return String(vUserId) === String(userId);
          })
        : [];

      setVisits(visitasDoUsuario);
      setPontos(saldo || PONTOS_INICIAIS);
    } catch (err) {
      if (loadId === loadIdRef.current) setError(err?.message || 'Erro ao carregar dados');
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
      if (saldoService.obterSaldo) {
        const novoSaldo = await saldoService.obterSaldo();
        if (novoSaldo) setPontos(novoSaldo);
      }
    } catch (err) {
      console.warn('Não foi possível atualizar o saldo de pontos:', err);
    }
  }, []);

  // Mapeia todas as salas lidas padronizadas em String[cite: 1]
  const visitedRooms = useMemo(() => {
    const rawVisitedIds = visits.map((v) => {
      const idEncontrado = v?.sala_id ?? v?.salaId ?? v?.id_sala ?? v?.id ?? getRoomId(v);
      return idEncontrado ? String(idEncontrado) : null;
    });

    return [...new Set(rawVisitedIds.filter(Boolean))];
  }, [visits]);

  const registrarVisita = useCallback(
    async ({ salaId }) => {
      const targetId = toSalaId(salaId) ?? salaId;
      const targetIdStr = String(targetId);

      const jaVisitada = visitedRooms.some((vId) => String(vId) === targetIdStr);
      if (jaVisitada) {
        throw new ApiError('Você já visitou esta área.', { status: 409 });
      }

      try {
        const res = await visitasService.registrarVisita({
          salaId: targetId,
          id: targetId,
        });

        const localDeVisita = res?.localDeVisita || res || { sala_id: targetId, usuario_id: userId };
        setVisits((prev) => [...prev, localDeVisita]);
      } catch (err) {
        if (err.status === 409) await sincronizar();
        throw err;
      }

      try {
        await atualizarSaldo();
        await sincronizar();
      } catch {
        setError('Visita registrada, mas não foi possível atualizar seu saldo.');
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

export default ProgressoContext;