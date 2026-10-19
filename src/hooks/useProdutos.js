import { useCallback, useEffect, useState } from 'react';
import * as produtosService from '../services/produtosService';

// Lista de produtos da loja + operações de administração. Após cada alteração a lista é recarregada da API.
export const useProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const carregar = useCallback(async ({ silencioso = false } = {}) => {
    if (!silencioso) setLoading(true);
    setError('');
    try {
      setProdutos(await produtosService.listarProdutos());
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
    return resultado;
  }, [carregar]);

  const cadastrar = useCallback((dados) => executar(() => produtosService.cadastrarProduto(dados)), [executar]);
  const atualizar = useCallback((id, dados) => executar(() => produtosService.atualizarProduto(id, dados)), [executar]);
  const remover = useCallback((id) => executar(() => produtosService.removerProduto(id)), [executar]);

  return { produtos, loading, error, recarregar: carregar, cadastrar, atualizar, remover };
};
