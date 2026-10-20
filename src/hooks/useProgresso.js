import { useState, useEffect } from 'react';
import api from '../services/api'; // Sua instância do Axios configurada

export const useProgresso = () => {
  const [visitedRooms, setVisitedRooms] = useState([]);
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carrega as salas e o histórico de visitas ao iniciar
  const carregarDados = async () => {
    setLoading(true);
    try {
      const [resSalas, resVisitas] = await Promise.all([
        api.get('/salas'),
        api.get('/visitas/progresso'),
      ]);

      setSalas(resSalas.data);
      setVisitedRooms(resVisitas.data.visitedRooms || []);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar seu progresso.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Função chamada pelo Home.jsx ao ler o QR Code
  const registrarVisita = async ({ salaId }) => {
    await api.post('/visitas', { salaId });

    // Adiciona o ID da sala ao estado local imediatamente
    setVisitedRooms((prev) => {
      const idStr = String(salaId);
      return prev.includes(idStr) ? prev : [...prev, idStr];
    });
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