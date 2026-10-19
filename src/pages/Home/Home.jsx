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

// Extrai o ID da sala de forma segura
const getRoomId = (item) => toSalaId(item) ?? item?.sala_id ?? item?.salaId ?? item?.id ?? item?._id ?? item?.id_sala;

// Função ultra-flexível para verificar se o item já consta nas visitas
const isRoomVisited = (visitedRooms, item, salas) => {
  if (!Array.isArray(visitedRooms) || !item) return false;

  const idDaSala = String(getRoomId(item) || '');
  const nomeDaSala = String(item.sala ?? item.nome ?? '').toLowerCase().trim();

  return visitedRooms.some((v) => {
    const vStr = String(v).toLowerCase().trim();
    
    // 1. Checa por ID idêntico
    if (idDaSala && vStr === idDaSala.toLowerCase()) return true;

    // 2. Checa por Nome de sala idêntico (ex: "eletro")
    if (nomeDaSala && vStr === nomeDaSala) return true;

    // 3. Se v for um objeto de visita completo do banco
    if (typeof v === 'object' && v !== null) {
      const vSalaId = String(v.sala_id ?? v.salaId ?? v.id ?? '');
      const vSalaNome = String(v.sala ?? v.nome ?? '').toLowerCase().trim();

      if (idDaSala && vSalaId === idDaSala) return true;
      if (nomeDaSala && vSalaNome === nomeDaSala) return true;
    }

    return false;
  });
};

const Home = () => {
  const { salas, visitedRooms, registrarVisita, loading, error, recarregar } = useProgresso();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const closeTimer = useRef(null);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const handleOpenScanner = (sala) => {
    const isAlreadyVisited = isRoomVisited(visitedRooms, sala, salas);

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
    const scannedPayload = parseQrPayload(text);

    if (!scannedPayload) {
      setFeedback({ variant: 'warning', message: 'Este QR Code não pertence ao SENAIgo.' });
      return;
    }

    // Procura a sala correspondente na lista pelo ID ou pelo Nome
    const salaLida = salas.find((item) => {
      const roomId = String(getRoomId(item) || '');
      const roomName = String(item.sala ?? item.nome ?? '').toLowerCase().trim();
      const payloadStr = String(scannedPayload).toLowerCase().trim();

      return roomId === payloadStr || roomName === payloadStr;
    });

    if (!salaLida) {
      setFeedback({ variant: 'warning', message: 'QR Code de sala não cadastrada no sistema.' });
      return;
    }

    const selectedRoomId = getRoomId(selectedRoom);
    const scannedRoomId = getRoomId(salaLida);

    // Validação se escaneou o QR Code da sala certa
    if (selectedRoom && selectedRoomId && String(scannedRoomId) !== String(selectedRoomId)) {
      const nomeSalaLida = salaLida.sala ?? salaLida.nome ?? 'outra área';
      const nomeSalaEsperada = selectedRoom?.sala ?? selectedRoom?.nome ?? 'área selecionada';
      setFeedback({
        variant: 'warning',
        message: `Este QR Code é da área "${nomeSalaLida}". Escaneie o QR Code de "${nomeSalaEsperada}".`,
      });
      return;
    }

    // Impede leitura dupla se já visitou
    if (isRoomVisited(visitedRooms, salaLida, salas)) {
      setFeedback({
        variant: 'warning',
        message: `A sala "${salaLida.sala || salaLida.nome}" já foi visitada por você!`,
      });
      return;
    }

    setFeedback({ variant: 'info', message: 'QR Code lido! Registrando sua visita...' });

    try {
      const targetIdParaEnvio = scannedRoomId ?? scannedPayload;
      await registrarVisita({ salaId: targetIdParaEnvio });

      if (typeof recarregar === 'function') {
        await recarregar();
      }

      setFeedback({
        variant: 'success',
        message: `Visita registrada com sucesso! +${salaLida.pontos || 5} pontos.`,
      });

      closeTimer.current = setTimeout(handleCloseScanner, CLOSE_DELAY_MS);
    } catch (err) {
      if (typeof recarregar === 'function') {
        await recarregar();
      }
      setFeedback({ variant: 'error', message: err?.message || 'Erro ao registrar visita.' });
    }
  };

  // Quantidade total de salas visitadas para o progresso
  const totalSalasVisitadas = salas.filter((s) => isRoomVisited(visitedRooms, s, salas)).length;

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
              current={totalSalasVisitadas}
              total={salas.length}
              label="Progresso de Visitas"
            />
          </div>
        </section>

        <section className={styles.cardsSection}>
          <h3 className={styles.sectionTitle}>Áreas Disponíveis para Leitura</h3>
          <div className={styles.gridCards}>
            {salas.map((item) => {
              const roomId = getRoomId(item) || item.sala || item.nome;
              const isVisited = isRoomVisited(visitedRooms, item, salas);
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