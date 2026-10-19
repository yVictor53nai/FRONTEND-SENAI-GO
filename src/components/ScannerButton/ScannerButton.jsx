import React from 'react';
import { QrCode, CheckCircle2 } from 'lucide-react';
import Button from '../Button/Button';
import styles from './ScannerButton.module.css';

const ScannerButton = ({
  isVisited = false,
  onClick,
  disabled = false,
  label = 'Escanear QR Code',
  visitedLabel = 'Visitado',
  ...props
}) => {
  if (isVisited) {
    return (
      <div className={styles.visitedBadge} role="status" aria-live="polite">
        <CheckCircle2 size={18} className={styles.checkIcon} />
        <span>{visitedLabel}</span>
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      fullWidth
      onClick={onClick}
      disabled={disabled}
      icon={QrCode}
      {...props}
    >
      {label}
    </Button>
  );
};

export default ScannerButton;