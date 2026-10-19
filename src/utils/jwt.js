// Lê o conteúdo (payload) do token apenas para exibir dados da sessão. A validação real é feita pela API.
export const decodeToken = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
};

export const isTokenExpired = (payload) => !payload?.exp || payload.exp * 1000 <= Date.now();
