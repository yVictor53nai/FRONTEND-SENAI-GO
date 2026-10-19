import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Alert from '../Alert/Alert';
import { buildQrPayload, toSalaId } from '../../utils/qrCode';
import { Download } from 'lucide-react';
import styles from './QrCodeModal.module.css';

const QrCodeContent = ({ sala }) => {
  const [image, setImage] = useState('');
  const [error, setError] = useState('');

  const salaId = toSalaId(sala);
  const nomeSala = sala?.sala ?? sala?.nome ?? sala?.nomeSala ?? salaId ?? 'Sala';

  useEffect(() => {
    setImage('');
    setError('');

    const payload = buildQrPayload(sala);

    if (!payload) {
      setError('Não foi possível identificar esta sala para gerar o QR Code.');
      return;
    }

    QRCode.toDataURL(payload, { width: 600, margin: 2, errorCorrectionLevel: 'M' })
      .then(setImage)
      .catch(() => setError('Ocorreu um erro ao gerar a imagem do QR Code.'));
  }, [sala]);

  const baixar = () => {
    if (!image) return;
    const link = document.createElement('a');
    link.href = image;
    link.download = `qrcode-sala-${salaId || 'sala'}.png`;
    link.click();
  };

  return (
    <div className={styles.content}>
      {error && <Alert variant="error">{error}</Alert>}

      {image && (
        <img
          src={image}
          alt={`QR Code da sala ${nomeSala}`}
          className={styles.image}
        />
      )}

      <p className={styles.hint}>
        Imprima e cole este QR Code na sala <strong>{nomeSala}</strong>.
      </p>

      {image && (
        <Button fullWidth icon={Download} onClick={baixar}>
          Baixar PNG
        </Button>
      )}
    </div>
  );
};

const QrCodeModal = ({ sala, onClose }) => {
  const nomeSala = sala?.sala ?? sala?.nome ?? sala?.nomeSala ?? 'Sala';

  return (
    <Modal
      isOpen={Boolean(sala)}
      onClose={onClose}
      title={sala ? `QR Code: ${nomeSala}` : 'QR Code'}
    >
      {sala && <QrCodeContent sala={sala} />}
    </Modal>
  );
};

export default QrCodeModal;