import { useContext } from 'react';
import { ProgressoContext } from '../context/ProgressoContext';

export const useProgresso = () => {
  const context = useContext(ProgressoContext);
  if (!context) throw new Error('useProgresso deve ser usado dentro de <ProgressoProvider>.');
  return context;
};
