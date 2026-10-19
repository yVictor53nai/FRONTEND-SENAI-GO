# SENAIgo — Frontend

React + Vite (JavaScript). Consome a API `projeto_senaigo` (Express + JWT).

## Rodando

```bash
npm install
npm run dev
```

O arquivo `.env` já vem com valores padrão (API em `http://localhost:3000`). Para recriá-lo: `cp .env.example .env`.
Atenção: variáveis `VITE_*` vão para o navegador — nunca coloque segredos (como o `JWT_SECRET`) aqui.

## Variáveis de ambiente

| Variável | Para que serve |
|---|---|
| `VITE_API_URL` | URL base da API |
| `VITE_API_TIMEOUT_MS` | Tempo máximo de resposta da API |
| `VITE_SCAN_COOLDOWN_MS` | Tempo em que o mesmo QR Code é ignorado após a leitura |
| `VITE_DEV_PORT` / `VITE_DEV_HTTPS` / `VITE_DEV_PROXY_TARGET` | Só no desenvolvimento (veja abaixo) |

## Scanner de QR Code

- Usa a câmera (`getUserMedia`) + `jsQR`. Pede permissão ao abrir o scanner e trata permissão negada, câmera ausente/ocupada e navegador sem suporte.
- Os QR Codes das salas contêm `senaigo:sala:<salaId>` (ex.: `senaigo:sala:1`). Para gerar os PNGs: `npm run qrcodes` (saída em `qrcodes/`).
- Ao ler o QR Code da sala escolhida, o app chama `POST /registrarLocal`. O mesmo QR Code não é processado duas vezes em sequência.
- As salas vêm da API (`GET /salas`). O ícone de cada uma é escolhido em `src/constants/salaIcons.js`.
- `npm run qrcodes` lê as salas da API, então ela precisa estar rodando (ou use `npm run qrcodes -- http://localhost:3000`).

### Testando no celular

Navegadores só liberam a câmera em **HTTPS** (ou `localhost`). Para testar no celular pela rede local, no `.env`:

```
VITE_DEV_HTTPS=true
VITE_API_URL=/api
VITE_DEV_PROXY_TARGET=http://localhost:3000
```

Rode `npm run dev` e abra `https://<IP-do-seu-PC>:5173` no celular (aceite o aviso do certificado de desenvolvimento). O Vite encaminha `/api` para a sua API, sem problemas de CORS ou *mixed content*.

## Rotas da API usadas

| Tela | Método e rota |
|---|---|
| Login | `POST /auth/login` |
| Cadastro | `POST /cadastrarUsuario` |
| Áreas | `GET /salas` |
| Registrar visita | `POST /registrarLocal` (Bearer token) |
| Visitas do aluno | `GET /locais` (filtrado pelo id do usuário) |
| Saldo de pontos | `GET /saldo` |
| Produtos da loja | `GET /produtos` |
| Resgatar / histórico | `POST /resgatarProduto`, `GET /resgates` |
| Gerenciar produtos (admin) | `POST /cadastrarProduto`, `PUT /atualizarProduto/:id`, `DELETE /removerProduto/:id` |

Todas as chamadas passam pelo Axios configurado em `src/services/api.js`. Se a API recusar o token (401), a sessão é encerrada automaticamente.

## Administrador

Quem faz login com um e-mail listado em `ADMIN_EMAILS` (arquivo `.env` da API) vê o botão **Gerenciar** no topo e pode cadastrar, editar e remover produtos da loja. Use a versão da API que acompanha este projeto (`projeto_senaigo_api.zip`).

O navegador guarda apenas o token da sessão. Visitas, saldo, produtos e resgates vêm sempre da API.

## Estrutura

```
src/
  components/   componentes reutilizáveis (Alert, Button, QrScanner, ConfirmModal, ...)
  config/       leitura das variáveis de ambiente
  constants/    ícones das salas
  context/      AuthContext (sessão) e ProgressoContext (áreas, visitas e saldo)
  hooks/        useAuth, useProgresso, useProdutos, useResgates, useQrScanner
  pages/        Tutorial, Cadastro, Login, Home, Loja, GerenciarLoja
  routes/       AppRoutes e PrivateRoute
  services/     api (Axios) e um serviço por recurso da API
  utils/        masks, validators, qrCode, storage, jwt, formatters
scripts/        gerar-qrcodes.mjs
```
