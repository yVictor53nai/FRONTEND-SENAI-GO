const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const apiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');

if (!apiUrl) {
  console.error('VITE_API_URL não definida. Copie o .env.example para .env e preencha os valores.');
}

export const env = {
  apiUrl,
  apiTimeoutMs: toNumber(import.meta.env.VITE_API_TIMEOUT_MS, 10000),
  scanCooldownMs: toNumber(import.meta.env.VITE_SCAN_COOLDOWN_MS, 3000),
};
