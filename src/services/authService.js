import api from './api';

// POST /auth/login -> { sucesso, usuarioLogin, token }
export const login = ({ email, senha }) =>
  api.post('/auth/login', { email, senha }).then(({ data }) => data);

// POST /cadastrarUsuario -> 201 { sucesso, usuario }
export const cadastrar = ({ cpf, nome, email, senha }) =>
  api.post('/cadastrarUsuario', { cpf, nome, email, senha }).then(({ data }) => data);
