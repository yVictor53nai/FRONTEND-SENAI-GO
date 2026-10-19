import { useCallback, useEffect, useState } from 'react';
import * as resgatesService from '../services/resgatesService';

export const useResgates = () => {
  const [resgates, setResgates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const carregar = useCallback(async () => {
    setError('');
    try {
      setResgates(await resgatesService.listarResgates());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const resgatar = useCallback((produtoId) => resgatesService.resgatarProduto({ produtoId }), []);

  return { resgates, loading, error, recarregar: carregar, resgatar };
};
