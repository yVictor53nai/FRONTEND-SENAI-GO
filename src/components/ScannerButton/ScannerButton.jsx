import React from 'react';
import { QrCode, CheckCircle } from 'lucide-react';
import styles from './ScannerButton.module.css';

const ScannerButton = ({ isVisited, onClick, disabled }) => {
  return (
    <button
      type="button"
      className={`${styles.button} ${isVisited ? styles.buttonVisited : ''}`}
      onClick={onClick}
      disabled={disabled || isVisited} // Bloqueia o clique se já foi visitado[cite: 1]
    >
      {isVisited ? (
        <>
          <CheckCircle size={18} />
          <span>Já lido ✔️</span>
        </>
      ) : (
        <>
          <QrCode size={18} />
          <span>Escanear QR Code</span>
        </>
      )}
    </button>
  );
};

export default ScannerButton;