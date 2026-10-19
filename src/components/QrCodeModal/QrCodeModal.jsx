import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Alert from '../Alert/Alert';
import { buildQrPayload } from '../../utils/qrCode';
import { Download } from 'lucide-react';
import styles from './QrCodeModal.module.css';

const QrCodeContent = ({ sala }) => {
  const [image, setImage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    QRCode.toDataURL(buildQrPayload(sala.salaId), { width: 600, margin: 2, errorCorrectionLevel: 'M' })
      .then(setImage)
      .catch(() => setError('Não foi possível gerar o QR Code.'));
  }, [sala.salaId]);

  const baixar = () => {
    const link = document.createElement('a');
    link.href = image;
    link.download = `qrcode-sala-${sala.salaId}.png`;
    link.click();
  };

  return (
    <div className={styles.content}>
      {error && <Alert variant="error">{error}</Alert>}
      {image && <img src={image} alt={`QR Code da sala ${sala.sala}`} className={styles.image} />}
      <p className={styles.hint}>Imprima e cole este QR Code na sala <strong>{sala.sala}</strong>.</p>
      {image && <Button fullWidth icon={Download} onClick={baixar}>Baixar PNG</Button>}
    </div>
  );
};

const QrCodeModal = ({ sala, onClose }) => (
  <Modal isOpen={Boolean(sala)} onClose={onClose} title={sala ? `QR Code: ${sala.sala}` : 'QR Code'}>
    {sala && <QrCodeContent sala={sala} />}
  </Modal>
);

export default QrCodeModal;