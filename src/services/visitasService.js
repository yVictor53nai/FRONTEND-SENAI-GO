import api from './api';

// POST /registrarLocal (autenticada) -> 201 { sucesso, localDeVisita }
export const registrarVisita = ({ salaId }) =>
  api.post('/registrarLocal', { salaId }).then(({ data }) => data);

// GET /locais -> todas as visitas [{ id, nome, salaId, sala, criadoEm, pontuacao }]
export const listarVisitas = () => api.get('/locais').then(({ data }) => data);
