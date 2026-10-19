import api from './api';

// POST /resgatarProduto -> 201 { sucesso, resgate, pontosGanhos, pontosGastos, saldo }
export const resgatarProduto = ({ produtoId }) =>
  api.post('/resgatarProduto', { produtoId }).then(({ data }) => data);

// GET /resgates -> resgates do usuário logado
export const listarResgates = () => api.get('/resgates').then(({ data }) => data);
