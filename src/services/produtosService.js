import api from './api';

// GET /produtos -> [{ id, nome, imagem, pontos, estoque }]
export const listarProdutos = () => api.get('/produtos').then(({ data }) => data);

// Rotas abaixo exigem usuário administrador.
export const cadastrarProduto = (produto) =>
  api.post('/cadastrarProduto', produto).then(({ data }) => data);

export const atualizarProduto = (id, produto) =>
  api.put(`/atualizarProduto/${id}`, produto).then(({ data }) => data);

export const removerProduto = (id) =>
  api.delete(`/removerProduto/${id}`).then(({ data }) => data);
