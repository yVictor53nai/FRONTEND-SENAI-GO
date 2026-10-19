// O navegador guarda apenas o token da sessão; todos os dados vêm da API.
const TOKEN_KEY = 'token';

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};
export const setToken = (token) => {
  try { localStorage.setItem(TOKEN_KEY, token); } catch { /* armazenamento indisponível */ }
};
export const removeToken = () => {
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* armazenamento indisponível */ }
};
