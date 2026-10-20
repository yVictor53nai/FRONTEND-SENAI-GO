import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useProgresso = () => {
  const [salas, setSalas] = useState([]);
  const [visitedRooms, setVisitedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resSalas = await api.get('/salas');
      const listaSalas = Array.isArray(resSalas.data) ? resSalas.data : [];

      // FILTRO ROBUSTO: Considera ativa se não for explicitamente desativada
      const salasAtivas = listaSalas.filter((s) => {
        const flagAtiva = s.ativa ?? s.ativo ?? s.is_active ?? s.status ?? true;
        return flagAtiva !== false && flagAtiva !== 0 && String(flagAtiva).toLowerCase() !== 'false';
      });

      setSalas(salasAtivas);

      const resVisitas = await api.get('/locais');
      if (Array.isArray(resVisitas.data)) {
        const ids = resVisitas.data.map((item) =>
          String(item.sala_id ?? item.salaId ?? item.id ?? item)
        );
        setVisitedRooms(ids);
      }
    } catch (err) {
      console.error('Erro ao carregar progresso:', err);
      setError(err?.message || 'Erro ao carregar dados do servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const registrarVisita = async ({ salaId }) => {
    const idFormatado = String(salaId).trim();

    try {
      const payload = { 
        salaId: idFormatado,
        id: idFormatado 
      };

      const response = await api.post('/locais', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      setVisitedRooms((prev) => Array.from(new Set([...prev, idFormatado])));

      if (response.data?.visitedRooms && Array.isArray(response.data.visitedRooms)) {
        setVisitedRooms(response.data.visitedRooms.map(String));
      }

      return response.data;
    } catch (err) {
      console.error('Erro detalhado ao registrar visita:', err);
      setVisitedRooms((prev) => Array.from(new Set([...prev, idFormatado])));
      throw err;
    }
  };

  return {
    salas,
    visitedRooms,
    registrarVisita,
    loading,
    error,
    recarregar: carregarDados,
  };
};

export default useProgresso;