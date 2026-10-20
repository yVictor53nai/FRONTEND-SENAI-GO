import { useContext } from 'react';
import { ProgressoContext } from '../context/ProgressoContext';

export const useProgresso = () => {
  const context = useContext(ProgressoContext);
  if (!context) {
    return {
      salas: [],
      visitedRooms: [],
      saldo: 0,
      pontosGanhos: 0,
      loading: false,
      error: '',
      recarregar: () => {},
      registrarVisita: async () => {},
      atualizarSaldo: async () => {},
    };
  }
  return context;
};

export default useProgresso;