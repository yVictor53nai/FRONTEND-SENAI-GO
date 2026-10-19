const PREFIX = 'senaigo:sala:';

// Conteúdo gravado nos QR Codes de cada sala.
export const buildQrPayload = (salaId) => `${PREFIX}${salaId}`;

const toSalaId = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

/**
 * Extrai o salaId do texto lido no QR Code.
 * Formatos aceitos: "senaigo:sala:1", JSON {"salaId":1} ou URL com ?salaId=1 (ou /sala/1).
 * Retorna null quando o QR Code não pertence ao sistema.
 */
export const parseQrPayload = (text) => {
  const content = String(text || '').trim();
  if (!content) return null;

  if (content.toLowerCase().startsWith(PREFIX)) {
    return toSalaId(content.slice(PREFIX.length));
  }

  if (content.startsWith('{')) {
    try { return toSalaId(JSON.parse(content).salaId); } catch { return null; }
  }

  try {
    const url = new URL(content);
    const fromQuery = url.searchParams.get('salaId');
    if (fromQuery) return toSalaId(fromQuery);
    const match = url.pathname.match(/\/sala\/(\d+)\/?$/i);
    return match ? toSalaId(match[1]) : null;
  } catch {
    return null;
  }
};
