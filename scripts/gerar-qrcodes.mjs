import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import QRCode from 'qrcode';
import { buildQrPayload } from '../src/utils/qrCode.js';

// Carrega o .env sem quebrar o build na Vercel (onde process.loadEnvFile pode não existir)
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env');
  }
} catch {
  /* ignora se o arquivo .env não existir */
}

const apiUrl = (process.argv[2] || process.env.VITE_API_URL || '').replace(/\/+$/, '');

// Se for um build automático (como na Vercel) e não houver URL de API rodando, encerra suavemente (exit 0)
if (!apiUrl.startsWith('http')) {
  console.log('ℹ️ Nenhuma URL de API válida fornecida. Ignorando geração de QR codes estáticos no build.');
  process.exit(0);
}

const slug = (text) =>
  String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

let salas;
try {
  const response = await fetch(`${apiUrl}/salas`);
  if (!response.ok) throw new Error(`Status ${response.status}`);
  salas = await response.json();
} catch (err) {
  console.error(`Não foi possível acessar ${apiUrl}/salas:`, err.message);
  // Encerra com 0 para não travar o deploy da Vercel caso a API backend esteja offline durante a compilação
  process.exit(0);
}

const outDir = path.resolve('qrcodes');
await mkdir(outDir, { recursive: true });

if (Array.isArray(salas)) {
  for (const item of salas) {
    const id = item.salaId ?? item.id ?? item._id ?? item.id_sala;
    const nome = item.sala ?? item.nome ?? item.nomeSala ?? `sala-${id}`;

    if (!id) {
      console.warn('⚠️ Registro ignorado por falta de ID válido:', item);
      continue;
    }

    const file = path.join(outDir, `sala-${id}-${slug(nome)}.png`);
    await QRCode.toFile(file, buildQrPayload(item), {
      width: 600,
      margin: 2,
      errorCorrectionLevel: 'M'
    });

    console.log(`✓ ${nome} -> ${path.relative(process.cwd(), file)}`);
  }
}