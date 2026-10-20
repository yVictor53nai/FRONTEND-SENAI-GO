import api from '../services/api';

export const registrarVisita = async ({ salaId }) => {
  try {
    // Garante que o salaId vai como String ou Número limpo
    const payload = { 
      salaId: String(salaId).trim() 
    };

    const response = await api.post('/locais/registrarLocal', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erro no registrarVisita:', error);
    throw error;
  }
};