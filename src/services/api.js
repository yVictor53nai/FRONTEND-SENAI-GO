import axios from 'axios';
import { env } from '../config/env';
import { getToken } from '../utils/storage';

export class ApiError extends Error {
  constructor(message, { status = 0 } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const FALLBACK_MESSAGES = {
  400: 'Dados inválidos. Revise as informações e tente novamente.',
  401: 'Sua sessão expirou. Faça login novamente.',
  403: 'Você não tem permissão para fazer isso.',
  404: 'Recurso não encontrado.',
  415: 'Formato de requisição inválido.',
  500: 'Erro interno no servidor. Tente novamente em instantes.',
};

// A API responde { erro: "..." } ou { erros: ["...", "..."] }.
const extractMessage = (data, status) => {
  if (data?.erro) return data.erro;
  if (Array.isArray(data?.erros) && data.erros.length) return data.erros.join(' ');
  return FALLBACK_MESSAGES[status] || `Erro inesperado (${status}).`;
};

const toApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    return new ApiError(extractMessage(data, status), { status });
  }
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new ApiError('O servidor demorou para responder. Tente novamente.');
  }
  return new ApiError('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
};

// Registrado pelo AuthContext para encerrar a sessão quando a API recusar o token.
let onUnauthorized = null;
export const setUnauthorizedHandler = (handler) => { onUnauthorized = handler; };

const api = axios.create({ baseURL: env.apiUrl, timeout: env.apiTimeoutMs });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = toApiError(error);
    if (apiError.status === 401 && getToken()) onUnauthorized?.();
    return Promise.reject(apiError);
  },
);

export default api;
