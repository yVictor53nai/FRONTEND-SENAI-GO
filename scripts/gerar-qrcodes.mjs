// Gera um PNG de QR Code para cada sala cadastrada na API em ./qrcodes (npm run qrcodes).
// Uso: npm run qrcodes [-- http://localhost:3000]   (a API precisa estar rodando)
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import QRCode from 'qrcode';
import { buildQrPayload } from '../src/utils/qrCode.js';

try { process.loadEnvFile('.env'); } catch { /* .env opcional */ }

const apiUrl = (process.argv[2] || process.env.VITE_API_URL || '').replace(/\/+$/, '');
if (!apiUrl.startsWith('http')) {
  console.error('Informe a URL da API: npm run qrcodes -- http://localhost:3000');
  process.exit(1);
}

const slug = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');

let salas;
try {
  salas = await (await fetch(`${apiUrl}/salas`)).json();
} catch {
  console.error(`Não foi possível acessar ${apiUrl}/salas. A API está rodando?`);
  process.exit(1);
}

const outDir = path.resolve('qrcodes');
await mkdir(outDir, { recursive: true });

for (const { salaId, sala } of salas) {
  const file = path.join(outDir, `sala-${salaId}-${slug(sala)}.png`);
  await QRCode.toFile(file, buildQrPayload(salaId), { width: 600, margin: 2, errorCorrectionLevel: 'M' });
  console.log(`✔ ${sala} -> ${path.relative(process.cwd(), file)}`);
}
