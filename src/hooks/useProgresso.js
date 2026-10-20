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
      setSalas(Array.isArray(resSalas.data) ? resSalas.data : []);

      // 2. Busca o histórico de visitas do usuário logado
      const resVisitas = await api.get('/locais');
      if (Array.isArray(resVisitas.data)) {
        // Converte todos os IDs para String para garantir a comparação
        const ids = resVisitas.data.map((item) =>
          String(item.sala_id ?? item.salaId ?? item.id ?? item)
        );
        setVisitedRooms(ids);
      }
    } catch (err) {
      console.error('Erro ao carregar progresso:', err);
      setError(err?.message || 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const registrarVisita = async ({ salaId }) => {
    try {
      const payload = { salaId: String(salaId).trim() };
      
      const response = await api.post('/locais/registrarLocal', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      // Se a API retornar a lista atualizada de salas visitadas, salva no estado local
      if (response.data?.visitedRooms && Array.isArray(response.data.visitedRooms)) {
        setVisitedRooms(response.data.visitedRooms.map(String));
      } else {
        // Fallback: recarrega do banco
        await carregarDados();
      }

      return response.data;
    } catch (err) {
      console.error('Erro ao registrar visita:', err);
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

// Export padrão também para garantir compatibilidade completa
export default useProgresso;