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
      // 1. Busca todas as salas
      const resSalas = await api.get('/salas');
      const rawSalas = Array.isArray(resSalas.data) ? resSalas.data : [];

      // Filtra estritamente APENAS as salas ATIVAS
      const salasAtivas = rawSalas.filter((s) => {
        const status = s.ativa ?? s.ativo ?? s.is_active ?? s.status;
        return status === true || status === 1 || String(status).toLowerCase() === 'true';
      });

      setSalas(salasAtivas);

      // Conjunto de IDs das salas ativas
      const idsSalasAtivas = new Set(
        salasAtivas.map((s) => String(s.sala_id ?? s.salaId ?? s.id))
      );

      // 2. Busca as visitas e FILTRA apenas as visitas de salas que estão ATIVAS
      const resVisitas = await api.get('/locais');
      const rawVisitas = Array.isArray(resVisitas.data) ? resVisitas.data : [];

      const visitasValidas = rawVisitas
        .map((item) => String(item.sala_id ?? item.salaId ?? item.id ?? item))
        .filter((id) => idsSalasAtivas.has(id));

      setVisitedRooms(visitasValidas);
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
        // Atualiza garantindo que apenas salas ativas fiquem na contagem
        const idsSalasAtivas = new Set(salas.map((s) => String(s.sala_id ?? s.salaId ?? s.id)));
        const visitadasFiltradas = response.data.visitedRooms
          .map(String)
          .filter((id) => idsSalasAtivas.has(id));

        setVisitedRooms(visitadasFiltradas);
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