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
import { parseQrPayload, toSalaId } from '../../utils/qrCode';
import Button from '../../components/Button/Button';
import { Sparkles, RefreshCw } from 'lucide-react';
import styles from './Home.module.css';

const CLOSE_DELAY_MS = 1400;

// Função utilitária para extrair o ID com fallback para qualquer propriedade
const getRoomId = (item) => toSalaId(item) ?? item?.salaId ?? item?.id ?? item?._id ?? item?.id_sala;

const Home = () => {
  const { salas, visitedRooms, registrarVisita, loading, error, recarregar } = useProgresso();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const closeTimer = useRef(null);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const handleOpenScanner = (sala) => {
    const roomId = getRoomId(sala);
    const isAlreadyVisited = visitedRooms.some((vId) => String(vId) === String(roomId));

    if (isAlreadyVisited) {
      setFeedback({ variant: 'warning', message: 'Esta sala já foi visitada!' });
      return;
    }

    setFeedback(null);
    setSelectedRoom(sala);
  };

  const handleCloseScanner = useCallback(() => {
    clearTimeout(closeTimer.current);
    setSelectedRoom(null);
    setFeedback(null);
  }, []);

  const handleDetect = async (text) => {
    const scannedId = parseQrPayload(text);

    if (!scannedId) {
      setFeedback({ variant: 'warning', message: 'Este QR Code não pertence ao SENAIgo.' });
      return;
    }

    // Procura a sala lida no array de salas da API
    const salaLida = salas.find((item) => String(getRoomId(item)) === String(scannedId));

    if (!salaLida) {
      setFeedback({ variant: 'warning', message: 'QR Code de sala não cadastrada no sistema.' });
      return;
    }

    const selectedRoomId = getRoomId(selectedRoom);
    const scannedRoomId = getRoomId(salaLida);

    // Se o utilizador abriu o leitor de uma sala específica e leu o QR Code de outra
    if (selectedRoomId && String(scannedRoomId) !== String(selectedRoomId)) {
      const nomeSalaLida = salaLida.sala ?? salaLida.nome ?? 'outra área';
      const nomeSalaEsperada = selectedRoom?.sala ?? selectedRoom?.nome ?? 'área selecionada';
      setFeedback({
        variant: 'warning',
        message: `Este QR Code é da área "${nomeSalaLida}". Escaneie o QR Code de "${nomeSalaEsperada}".`,
      });
      return;
    }

    // Verifica se a sala já foi visitada antes de registar
    const jaVisitou = visitedRooms.some((vId) => String(vId) === String(scannedRoomId));
    if (jaVisitou) {
      setFeedback({
        variant: 'warning',
        message: `A sala "${salaLida.sala || salaLida.nome}" já foi visitada por você!`,
      });
      return;
    }

    setFeedback({ variant: 'info', message: 'QR Code lido! Registrando sua visita...' });

    try {
      await registrarVisita({ salaId: scannedRoomId });
      setFeedback({
        variant: 'success',
        message: `Visita registrada com sucesso! +${salaLida.pontos || 5} pontos.`,
      });
      
      // Fecha o modal do scanner após o tempo de delay
      closeTimer.current = setTimeout(handleCloseScanner, CLOSE_DELAY_MS);
    } catch (err) {
      setFeedback({ variant: 'error', message: err?.message || 'Erro ao registrar visita.' });
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
            <Button variant="outline" icon={RefreshCw} onClick={recarregar}>
              Tentar novamente
            </Button>
          </div>
        )}

        <section className={styles.welcomeBanner}>
          <div className={styles.bannerInfo}>
            <div className={styles.tagGroup}>
              <Sparkles size={16} />
              <span>Jornada de Gamificação</span>
            </div>
            <h2>Explore as Áreas e Ganhe Pontos</h2>
            <p>Escaneie os QR Codes localizados nos ambientes do SENAI para acumular pontos e subir de nível.</p>
          </div>
          <div className={styles.progressCard}>
            <ProgressBar
              current={visitedRooms.length}
              total={salas.length}
              label="Progresso de Visitas"
            />
          </div>
        </section>

        <section className={styles.cardsSection}>
          <h3 className={styles.sectionTitle}>Áreas Disponíveis para Leitura</h3>
          <div className={styles.gridCards}>
            {salas.map((item) => {
              const roomId = getRoomId(item);
              const isVisited = visitedRooms.some((vId) => String(vId) === String(roomId));
              const RoomIcon = getSalaIcon(item.icone);
              const nomeSala = item.sala ?? item.nome ?? 'Sala';

              return (
                <Card
                  key={roomId}
                  className={`${styles.roomCard} ${isVisited ? styles.cardCompleted : ''}`}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.roomBadgeIcon}>
                      <RoomIcon size={24} />
                    </div>
                    <div className={styles.pointsTag}>+{item.pontos} Pts</div>
                  </div>
                  <div className={styles.cardBody}>
                    <h4 className={styles.roomTitle}>{nomeSala}</h4>
                    <p className={styles.roomDesc}>{item.descricao}</p>
                    <div className={styles.statusIndicator}>
                      <span>Status: </span>
                      <span className={isVisited ? styles.statusVisited : styles.statusPending}>
                        {isVisited ? 'Visitado ✔️' : 'Não visitado'}
                      </span>
                    </div>
                  </div>
                  <div className={styles.cardFooter}>
                    <ScannerButton
                      isVisited={isVisited}
                      onClick={() => handleOpenScanner(item)}
                      disabled={isVisited}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </main>

      <Modal
        isOpen={Boolean(selectedRoom)}
        onClose={handleCloseScanner}
        title={`Escanear: ${selectedRoom?.sala || selectedRoom?.nome || 'Área'}`}
      >
        {selectedRoom && (
          <div className={styles.scannerModalContent}>
            <p className={styles.scannerInstructions}>
              Aponte a câmera do seu dispositivo para o QR Code localizado na área de{' '}
              <strong>{selectedRoom.sala || selectedRoom.nome}</strong>.
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