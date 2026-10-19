// Alterado para URL completa para permitir que a câmara do telemóvel abra o link
const URL_PREFIX = 'https://frontend-senai-go.vercel.app/sala/';
const CUSTOM_PREFIX = 'senaigo:sala:';

/**
 * Converte o valor para um identificador de sala válido (número ou texto).
 */
export const toSalaId = (value) => {
  if (value === null || value === undefined || value === '') return null;

  if (typeof value === 'object') {
    value = value.salaId ?? value.id ?? value._id ?? value.id_sala ?? value.sala ?? value.nome;
  }

  if (value === null || value === undefined || value === '') return null;

  const n = Number(value);
  if (!isNaN(n) && Number.isInteger(n) && n > 0) {
    return n;
  }

  return String(value).trim();
};

/**
 * Gera a string do QR Code.
 */
export const buildQrPayload = (salaOrId) => {
  const id = toSalaId(salaOrId);

  if (!id) {
    console.warn('[QR Code] Não foi possível obter o ID da sala:', salaOrId);
    return '';
  }

  return `${URL_PREFIX}${id}`;
};

/**
 * Extrai o identificador da sala lido pelo leitor.
 */
export const parseQrPayload = (text) => {
  const content = String(text || '').trim();
  if (!content) return null;

  // 1. Leitura de URL (ex: https://frontend-senai-go.vercel.app/sala/1)
  try {
    const match = content.match(/\/sala\/([^/?]+)/i);
    if (match && match[1]) {
      return toSalaId(match[1]);
    }
  } catch { /* ignora */ }

  // 2. Leitura do prefixo antigo ("senaigo:sala:1")
  if (content.toLowerCase().startsWith(CUSTOM_PREFIX)) {
    return toSalaId(content.slice(CUSTOM_PREFIX.length).trim());
  }

  // 3. Leitura de JSON (ex: {"salaId": 1})
  if (content.startsWith('{')) {
    try {
      const data = JSON.parse(content);
      return toSalaId(data);
    } catch {
      return null;
    }
  }

  // 4. Leitura de parâmetro de URL (ex: ?salaId=1 ou ?id=1)
  try {
    const url = new URL(content);
    const fromQuery = url.searchParams.get('salaId') || url.searchParams.get('id');
    if (fromQuery) return toSalaId(fromQuery);
  } catch {
    return null;
  }

  return null;
};