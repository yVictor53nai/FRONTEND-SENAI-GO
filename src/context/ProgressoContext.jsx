import React, { createContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as salasService from '../services/salasService';
import * as visitasService from '../services/visitasService';
import * as saldoService from '../services/saldoService';
import { ApiError } from '../services/api';

export const ProgressoContext = createContext(null);

const PONTOS_INICIAIS = { pontosGanhos: 0, pontosGastos: 0, saldo: 0 };

// Dados do aluno logado: áreas, visitas e saldo de pontos. Tudo vem da API.
export const ProgressoProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id;

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
      setSalas(listaSalas);
      setVisits(todasVisitas.filter((v) => v.id === userId));
      setPontos(saldo);
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
    setPontos(await saldoService.obterSaldo());
  }, []);

  // Salas desativadas deixam de contar no progresso (os pontos já ganhos continuam no saldo).
  const visitedRooms = useMemo(
    () => [...new Set(visits.map((v) => v.salaId))].filter((id) => salas.some((s) => s.salaId === id)),
    [visits, salas],
  );

  const registrarVisita = useCallback(async ({ salaId }) => {
    if (visitedRooms.includes(salaId)) {
      throw new ApiError('Você já visitou esta área.', { status: 409 });
    }
    try {
      const { localDeVisita } = await visitasService.registrarVisita({ salaId });
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
  }, [visitedRooms, sincronizar, atualizarSaldo]);

  const value = useMemo(() => ({
    salas,
    visitedRooms,
    saldo: pontos.saldo,
    pontosGanhos: pontos.pontosGanhos,
    loading,
    error,
    recarregar: sincronizar,
    registrarVisita,
    atualizarSaldo,
  }), [salas, visitedRooms, pontos, loading, error, sincronizar, registrarVisita, atualizarSaldo]);

  return <ProgressoContext.Provider value={value}>{children}</ProgressoContext.Provider>;
};