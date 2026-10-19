import api from './api';

// GET /saldo -> { pontosGanhos, pontosGastos, saldo }
export const obterSaldo = () => api.get('/saldo').then(({ data }) => data);
