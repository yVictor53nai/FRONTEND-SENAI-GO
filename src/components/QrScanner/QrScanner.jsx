import React, { useEffect } from 'react';
import { CameraOff, Loader2, RefreshCw } from 'lucide-react';
import { useQrScanner } from '../../hooks/useQrScanner';
import Alert from '../Alert/Alert';
import Button from '../Button/Button';
import styles from './QrScanner.module.css';

// A câmera liga quando o componente monta e desliga quando ele desmonta (ex.: modal fecha).
const QrScanner = ({ onDetect }) => {
  const { videoRef, status, error, start, stop } = useQrScanner({ onDetect });

  useEffect(() => {
    start();
    return stop;
  }, [start, stop]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.cameraBox}>
        <video ref={videoRef} className={styles.video} playsInline muted autoPlay />
        {status === 'scanning' && <div className={styles.target} aria-hidden="true" />}
        {status === 'starting' && (
          <div className={styles.placeholder}><Loader2 size={28} className={styles.spin} /><span>Iniciando câmera...</span></div>
        )}
        {status === 'error' && (
          <div className={styles.placeholder}><CameraOff size={28} /><span>Câmera indisponível</span></div>
        )}
      </div>
      {error && (
        <>
          <Alert variant="error">{error.message}</Alert>
          {error.code !== 'insecure' && error.code !== 'unsupported' && (
            <Button variant="outline" fullWidth icon={RefreshCw} onClick={start}>Tentar novamente</Button>
          )}
        </>
      )}
    </div>
  );
};

export default QrScanner;
