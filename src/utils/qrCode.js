// src/utils/qrCode.js

const URL_PREFIX = 'https://frontend-senai-go.vercel.app/sala/';
const CUSTOM_PREFIX = 'senaigo:sala:';

/**
 * Extrai o identificador da sala (ID ou Nome) lido da câmera do celular.
 */
export const parseQrPayload = (text) => {
  const content = String(text || '').trim();
  if (!content) return null;

  // 1. Tenta extrair de URL (ex: https://frontend-senai-go.vercel.app/sala/1 ou /sala/eletro)
  try {
    const match = content.match(/\/sala\/([^/?]+)/i);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
  } catch { /* ignora */ }

  // 2. Tenta extrair do prefixo antigo (ex: "senaigo:sala:1" ou "senaigo:sala:eletro")
  if (content.toLowerCase().startsWith(CUSTOM_PREFIX)) {
    return content.slice(CUSTOM_PREFIX.length).trim();
  }

  // 3. Tenta extrair de JSON (ex: {"salaId": 1} ou {"sala": "eletro"})
  if (content.startsWith('{')) {
    try {
      const data = JSON.parse(content);
      return data.salaId ?? data.id ?? data.sala ?? data.nome ?? null;
    } catch {
      return null;
    }
  }

  // 4. Tenta extrair de parâmetro da URL (ex: ?salaId=1 ou ?id=1)
  try {
    const url = new URL(content);
    const fromQuery = url.searchParams.get('salaId') || url.searchParams.get('id');
    if (fromQuery) return fromQuery;
  } catch { /* ignora */ }

  // 5. Fallback: Se for apenas o ID ou nome direto (ex: "1" ou "eletro")
  if (content.length > 0 && !content.includes('http')) {
    return content;
  }

  return null;
}