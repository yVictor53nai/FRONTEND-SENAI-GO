import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useProgresso } from '../../hooks/useProgresso';
import Header from '../../components/Header/Header';
import Card from '../../components/Card/Card';
import Alert from '../../components/Alert/Alert';
import ScannerButton from '../../components/ScannerButton/ScannerButton';
import QrScanner from '../../components/QrScanner/QrScanner';
import Modal from '../../components/Modal/Modal';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import { getSalaIcon } from '../../constants/salaIcons';
import { parseQrPayload } from '../../utils/qrCode';
import Button from '../../components/Button/Button';
import { Sparkles, RefreshCw } from 'lucide-react';
import styles from './Home.module.css';

const CLOSE_DELAY_MS = 1400;

const Home = () => {
  const { salas, visitedRooms, registrarVisita, loading, error, recarregar } = useProgresso();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const closeTimer = useRef(null);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const handleOpenScanner = (sala) => {
    if (visitedRooms.includes(sala.salaId)) return;
    setFeedback(null);
    setSelectedRoom(sala);
  };

  const handleCloseScanner = useCallback(() => {
    clearTimeout(closeTimer.current);
    setSelectedRoom(null);
    setFeedback(null);
  }, []);

  const handleDetect = async (text) => {
    const salaId = parseQrPayload(text);
    const sala = salas.find((item) => item.salaId === salaId);

    if (!sala) {
      setFeedback({ variant: 'warning', message: 'Este QR Code não pertence ao SENAIgo.' });
      return;
    }
    if (sala.salaId !== selectedRoom.salaId) {
      setFeedback({ variant: 'warning', message: `Este QR Code é da área ${sala.sala}. Escaneie o QR Code de ${selectedRoom.sala}.` });
      return;
    }

    setFeedback({ variant: 'info', message: 'QR Code lido! Registrando sua visita...' });
    try {
      await registrarVisita({ salaId: sala.salaId });
      setFeedback({ variant: 'success', message: `Visita registrada com sucesso! +${sala.pontos} pontos.` });
      closeTimer.current = setTimeout(handleCloseScanner, CLOSE_DELAY_MS);
    } catch (err) {
      setFeedback({ variant: 'error', message: err.message });
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={styles.mainContent}>
        {loading && <Alert variant="info">Carregando suas áreas e seu progresso...</Alert>}
        {error && (
          <div className={styles.syncAlert}>
            <Alert variant="warning">{error}</Alert>
            <Button variant="outline" icon={RefreshCw} onClick={recarregar}>Tentar novamente</Button>
          </div>
        )}
        <section className={styles.welcomeBanner}>
          <div className={styles.bannerInfo}>
            <div className={styles.tagGroup}><Sparkles size={16} /><span>Jornada de Gamificação</span></div>
            <h2>Explore as Áreas e Ganhe Pontos</h2>
            <p>Escaneie os QR Codes localizados nos ambientes do SENAI para acumular pontos e subir de nível.</p>
          </div>
          <div className={styles.progressCard}>
            <ProgressBar current={visitedRooms.length} total={salas.length} label="Progresso de Visitas" />
          </div>
        </section>

        <section className={styles.cardsSection}>
          <h3 className={styles.sectionTitle}>Áreas Disponíveis para Leitura</h3>
          <div className={styles.gridCards}>
            {salas.map((item) => {
              const isVisited = visitedRooms.includes(item.salaId);
              const RoomIcon = getSalaIcon(item.icone);
              return (
                <Card key={item.salaId} className={`${styles.roomCard} ${isVisited ? styles.cardCompleted : ''}`}>
                  <div className={styles.cardHeader}>
                    <div className={styles.roomBadgeIcon}><RoomIcon size={24} /></div>
                    <div className={styles.pointsTag}>+{item.pontos} Pts</div>
                  </div>
                  <div className={styles.cardBody}>
                    <h4 className={styles.roomTitle}>{item.sala}</h4>
                    <p className={styles.roomDesc}>{item.descricao}</p>
                    <div className={styles.statusIndicator}>
                      <span>Status: </span>
                      <span className={isVisited ? styles.statusVisited : styles.statusPending}>
                        {isVisited ? 'Visitado ✔️' : 'Não visitado'}
                      </span>
                    </div>
                  </div>
                  <div className={styles.cardFooter}>
                    <ScannerButton isVisited={isVisited} onClick={() => handleOpenScanner(item)} disabled={isVisited} />
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </main>

      <Modal isOpen={Boolean(selectedRoom)} onClose={handleCloseScanner} title={`Escanear: ${selectedRoom?.sala}`}>
        {selectedRoom && (
          <div className={styles.scannerModalContent}>
            <p className={styles.scannerInstructions}>
              Aponte a câmera do seu dispositivo para o QR Code localizado na área de <strong>{selectedRoom.sala}</strong>.
            </p>
            <QrScanner onDetect={handleDetect} />
            {feedback && <Alert variant={feedback.variant}>{feedback.message}</Alert>}
          </div>
        )}
      </Modal>
    </div>
  );
};
export default Home;
