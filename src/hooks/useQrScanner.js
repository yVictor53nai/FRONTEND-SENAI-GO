import { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { env } from '../config/env';

const SCAN_INTERVAL_MS = 120;
const MAX_DECODE_WIDTH = 720;

const CAMERA_MESSAGES = {
  insecure: 'A câmera só funciona em conexão segura (HTTPS) ou em localhost. Veja o README para testar no celular.',
  unsupported: 'Este navegador não permite acessar a câmera.',
  denied: 'Permissão da câmera negada. Libere o acesso nas configurações do navegador e tente novamente.',
  notFound: 'Nenhuma câmera foi encontrada neste dispositivo.',
  busy: 'A câmera está sendo usada por outro aplicativo. Feche-o e tente novamente.',
  unknown: 'Não foi possível iniciar a câmera. Tente novamente.',
};

const buildError = (code) => ({ code, message: CAMERA_MESSAGES[code] });

const classifyCameraError = (err) => {
  switch (err?.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
    case 'SecurityError':
      return buildError('denied');
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return buildError('notFound');
    case 'NotReadableError':
    case 'TrackStartError':
    case 'AbortError':
      return buildError('busy');
    default:
      return buildError('unknown');
  }
};

const requestCamera = async () => {
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
  } catch (err) {
    // Dispositivos sem câmera traseira/resolução pedida: tenta qualquer câmera disponível.
    if (err?.name === 'OverconstrainedError' || err?.name === 'ConstraintNotSatisfiedError') {
      return navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }
    throw err;
  }
};

const decodeFrame = (video, canvas) => {
  const scale = Math.min(1, MAX_DECODE_WIDTH / video.videoWidth);
  const width = Math.round(video.videoWidth * scale);
  const height = Math.round(video.videoHeight * scale);
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(video, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);
  return jsQR(data, width, height, { inversionAttempts: 'dontInvert' })?.data || null;
};

/**
 * Controla a câmera e lê QR Codes em tempo real.
 * `onDetect(texto)` pode ser assíncrona: enquanto ela roda a leitura fica pausada, e o
 * mesmo QR Code só é processado de novo depois de `cooldownMs` (evita leituras duplicadas).
 */
export const useQrScanner = ({ onDetect, cooldownMs = env.scanCooldownMs } = {}) => {
  const [status, setStatus] = useState('idle'); // idle | starting | scanning | error
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const frameRef = useRef(null);
  const sessionRef = useRef(0);
  const busyRef = useRef(false);
  const lastReadRef = useRef({ value: null, time: 0 });
  const onDetectRef = useRef(onDetect);
  const cooldownRef = useRef(cooldownMs);

  useEffect(() => {
    onDetectRef.current = onDetect;
    cooldownRef.current = cooldownMs;
  });

  const releaseCamera = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const stop = useCallback(() => {
    sessionRef.current += 1; // invalida qualquer início de câmera ainda pendente
    releaseCamera();
    setStatus('idle');
  }, [releaseCamera]);

  const handleCode = useCallback(async (value) => {
    const last = lastReadRef.current;
    if (value === last.value && Date.now() - last.time < cooldownRef.current) return;

    busyRef.current = true;
    lastReadRef.current = { value, time: Date.now() };
    try {
      await onDetectRef.current?.(value);
    } catch (err) {
      console.error('[QrScanner] erro ao processar leitura:', err);
    } finally {
      lastReadRef.current = { value, time: Date.now() };
      busyRef.current = false;
    }
  }, []);

  const scanLoop = useCallback((session) => {
    let lastTick = 0;

    const loop = (now) => {
      if (sessionRef.current !== session) return;
      frameRef.current = requestAnimationFrame(loop);

      const video = videoRef.current;
      if (busyRef.current || now - lastTick < SCAN_INTERVAL_MS) return;
      if (!video || !video.videoWidth || video.readyState < video.HAVE_CURRENT_DATA) return;
      lastTick = now;

      canvasRef.current ??= document.createElement('canvas');
      const value = decodeFrame(video, canvasRef.current);
      if (value) handleCode(value);
    };

    frameRef.current = requestAnimationFrame(loop);
  }, [handleCode]);

  const fail = useCallback((session, cameraError) => {
    if (sessionRef.current !== session) return;
    releaseCamera();
    setError(cameraError);
    setStatus('error');
  }, [releaseCamera]);

  const start = useCallback(async () => {
    sessionRef.current += 1;
    const session = sessionRef.current;
    releaseCamera();
    busyRef.current = false;
    lastReadRef.current = { value: null, time: 0 };
    setError(null);
    setStatus('starting');

    if (!window.isSecureContext) return fail(session, buildError('insecure'));
    if (!navigator.mediaDevices?.getUserMedia) return fail(session, buildError('unsupported'));

    try {
      const stream = await requestCamera();
      const video = videoRef.current;

      if (sessionRef.current !== session || !video) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();
      if (sessionRef.current !== session) return;

      setStatus('scanning');
      scanLoop(session);
    } catch (err) {
      fail(session, classifyCameraError(err));
    }
  }, [fail, releaseCamera, scanLoop]);

  return { videoRef, status, error, start, stop };
};
