import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as authService from '../services/authService';
import { setUnauthorizedHandler, ApiError } from '../services/api';
import { getToken, setToken, removeToken } from '../utils/storage';
import { decodeToken, isTokenExpired } from '../utils/jwt';

export const AuthContext = createContext(null);

// Só aceita um token guardado se ele ainda não expirou.
const getValidStoredToken = () => {
  const token = getToken();
  if (!token) return null;
  if (isTokenExpired(decodeToken(token))) {
    removeToken();
    return null;
  }
  return token;
};

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(getValidStoredToken);

  const user = useMemo(() => {
    const payload = token ? decodeToken(token) : null;
    return payload ? { id: payload.id, nome: payload.nome, admin: Boolean(payload.admin) } : null;
  }, [token]);

  const logout = useCallback(() => {
    removeToken();
    setTokenState(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const login = useCallback(async (email, senha) => {
    const { token: novoToken } = await authService.login({ email, senha });
    if (!novoToken || !decodeToken(novoToken)) throw new ApiError('Resposta inesperada do servidor.');
    setToken(novoToken);
    setTokenState(novoToken);
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: Boolean(user),
    isAdmin: Boolean(user?.admin),
    cadastrar: authService.cadastrar,
    login,
    logout,
  }), [user, token, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
