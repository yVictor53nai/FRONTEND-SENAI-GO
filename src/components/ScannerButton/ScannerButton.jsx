import React from 'react';
import { QrCode, CheckCircle2 } from 'lucide-react';
import Button from '../Button/Button';
import styles from './ScannerButton.module.css';

const ScannerButton = ({ isVisited, onClick, disabled = false }) => {
  if (isVisited) {
    return (
      <div className={styles.visitedBadge}>
        <CheckCircle2 size={18} className={styles.checkIcon} />
        <span>Visitado ✔️</span>
      </div>
    );
  }
  return <Button variant="primary" fullWidth onClick={onClick} disabled={disabled} icon={QrCode}>Escanear QR Code</Button>;
};
export default ScannerButton;