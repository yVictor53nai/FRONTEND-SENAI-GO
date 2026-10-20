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
      
      // Trata respostas em formato de array ou de objeto com propriedade .data
      const rawData = resSalas.data;
      const listaSalas = Array.isArray(rawData) 
        ? rawData 
        : (rawData?.salas && Array.isArray(rawData.salas) ? rawData.salas : []);

      // Filtra apenas se a sala tiver explicitamente uma flag de desativada
      const salasValidas = listaSalas.filter((s) => {
        if (!s) return false;
        const status = s.ativa ?? s.ativo ?? s.is_active ?? s.status;
        return status !== false && status !== 0 && String(status).toLowerCase() !== 'false';
      });

      setSalas(salasValidas);

      const resVisitas = await api.get('/locais');
      const visitasData = resVisitas.data;
      const listaVisitas = Array.isArray(visitasData)
        ? visitasData
        : (visitasData?.visitedRooms && Array.isArray(visitasData.visitedRooms) ? visitasData.visitedRooms : []);

      if (Array.isArray(listaVisitas)) {
        const ids = listaVisitas.map((item) =>
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