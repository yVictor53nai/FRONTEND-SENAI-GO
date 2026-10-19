import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api'; // Ajuste o caminho da sua API de acordo com o seu projeto

const ProgressoContext = createContext({});

export const ProgressoProvider = ({ children }) => {
  const [salas, setSalas] = useState([]);
  const [visitedRooms, setVisitedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Busca as salas e as visitas cadastradas no backend
      const [resSalas, resVisitas] = await Promise.all([
        api.get('/salas').catch(() => ({ data: [] })),
        api.get('/visitas/locais').catch(() => ({ data: [] })),
      ]);

      const listaSalas = Array.isArray(resSalas.data) ? resSalas.data : [];
      const listaVisitas = Array.isArray(resVisitas.data) ? resVisitas.data : [];

      // Mapeia e normaliza os IDs das salas visitadas para Strings simples
      const idsVisitados = listaVisitas.map((v) =>
        String(v.sala_id ?? v.salaId ?? v.id_sala ?? v.id ?? '')
      ).filter(Boolean);

      setSalas(listaSalas);
      setVisitedRooms(idsVisitados);
    } catch (err) {
      console.error('[ERRO AO CARREGAR PROGRESSO]:', err);
      setError('Não foi possível carregar seus dados de visita.');
    } finally {
      setLoading(false);
    }
  }, []);

  const registrarVisita = async ({ salaId }) => {
    try {
      const response = await api.post('/visitas/registrarLocal', { salaId });
      
      // Atualiza o estado local imediatamente
      setVisitedRooms((prev) => {
        const idString = String(salaId);
        return prev.includes(idString) ? prev : [...prev, idString];
      });

      // Recarrega do servidor para garantir sincronia com a pontuação
      await carregarDados();
      return response.data;
    } catch (err) {
      console.error('[ERRO REGISTRAR VISITA]:', err);
      throw new Error(err.response?.data?.message || 'Erro ao registrar visita.');
    }
  };

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return (
    <ProgressoContext.Provider
      value={{
        salas,
        visitedRooms,
        loading,
        error,
        registrarVisita,
        recarregar: carregarDados,
      }}
    >
      {children}
    </ProgressoContext.Provider>
  );
};

export const useProgresso = () => useContext(ProgressoContext);