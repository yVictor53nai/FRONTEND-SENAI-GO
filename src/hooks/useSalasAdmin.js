import { useCallback, useEffect, useState } from 'react';
import * as salasService from '../services/salasService';
import { useProgresso } from './useProgresso';

// Todas as salas (inclusive desativadas) + operações de administração.
// Após cada alteração, a lista e o progresso do aluno (Home/Header) são recarregados da API.
export const useSalasAdmin = () => {
  const { recarregar: recarregarProgresso } = useProgresso();
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const carregar = useCallback(async ({ silencioso = false } = {}) => {
    if (!silencioso) setLoading(true);
    setError('');
    try {
      setSalas(await salasService.listarTodasSalas());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const executar = useCallback(async (operacao) => {
    const resultado = await operacao();
    await carregar({ silencioso: true });
    recarregarProgresso();
    return resultado;
  }, [carregar, recarregarProgresso]);

  const cadastrar = useCallback((dados) => executar(() => salasService.cadastrarSala(dados)), [executar]);
  const atualizar = useCallback((id, dados) => executar(() => salasService.atualizarSala(id, dados)), [executar]);
  const remover = useCallback((id) => executar(() => salasService.removerSala(id)), [executar]);

  return { salas, loading, error, recarregar: carregar, cadastrar, atualizar, remover };
};