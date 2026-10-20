import React, { useState } from 'react';
import { useSalasAdmin } from '../../hooks/useSalasAdmin';
import Header from '../../components/Header/Header';
import AdminTabs from '../../components/AdminTabs/AdminTabs';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Alert from '../../components/Alert/Alert';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import SalaFormModal from '../../components/SalaFormModal/SalaFormModal';
import QrCodeModal from '../../components/QrCodeModal/QrCodeModal';
import { getSalaIcon } from '../../constants/salaIcons';
import { Plus, Pencil, Trash2, QrCode, RefreshCw } from 'lucide-react';
import styles from '../GerenciarLoja/GerenciarLoja.module.css';

// Função auxiliar para obter o ID com segurança, independentemente do formato do BD
const getSalaId = (sala) => sala?.sala_id ?? sala?.salaId ?? sala?.id;

const GerenciarSalas = () => {
  const { salas, loading, error, recarregar, cadastrar, atualizar, remover } = useSalasAdmin();

  const [formAberto, setFormAberto] = useState(false);
  const [salaEmEdicao, setSalaEmEdicao] = useState(null);
  const [salaParaRemover, setSalaParaRemover] = useState(null);
  const [salaDoQr, setSalaDoQr] = useState(null);
  const [removendo, setRemovendo] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const abrirNova = () => { setSalaEmEdicao(null); setFormAberto(true); };
  const abrirEdicao = (sala) => { setSalaEmEdicao(sala); setFormAberto(true); };

  const handleSalvar = async (dados) => {
    const id = getSalaId(salaEmEdicao);
    const resposta = salaEmEdicao ? await atualizar(id, dados) : await cadastrar(dados);
    setFeedback({ variant: 'success', message: resposta.sucesso });
    setFormAberto(false);
  };

  const handleRemover = async () => {
    const id = getSalaId(salaParaRemover);
    
    if (!id) {
      setFeedback({ variant: 'error', message: 'ID da sala é inválido ou não foi encontrado.' });
      setSalaParaRemover(null);
      return;
    }

    setRemovendo(true);
    try {
      const resposta = await remover(id);
      setFeedback({ variant: 'success', message: resposta.sucesso });
    } catch (err) {
      setFeedback({ variant: 'error', message: err.message });
    } finally {
      setRemovendo(false);
      setSalaParaRemover(null);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={styles.mainContent}>
        <AdminTabs />
        <div className={styles.titleRow}>
          <div>
            <h2>Gerenciar Salas</h2>
            <p>Cadastre as áreas que os alunos podem visitar e gere o QR Code de cada uma.</p>
          </div>
          <Button icon={Plus} onClick={abrirNova}>Nova sala</Button>
        </div>

        {feedback && <Alert variant={feedback.variant}>{feedback.message}</Alert>}
        {loading && <Alert variant="info">Carregando salas...</Alert>}
        {error && (
          <div className={styles.errorBox}>
            <Alert variant="error">{error}</Alert>
            <Button variant="outline" icon={RefreshCw} onClick={() => recarregar()}>Tentar novamente</Button>
          </div>
        )}
        {!loading && !error && salas.length === 0 && <Alert variant="info">Nenhuma sala cadastrada ainda.</Alert>}

        <ul className={styles.list}>
          {salas.map((sala) => {
            const id = getSalaId(sala);
            const Icon = getSalaIcon(sala.icone);
            return (
              <li key={id ?? sala.sala}>
                <Card className={styles.row}>
                  <Icon size={30} />
                  <div className={styles.info}>
                    <strong>{sala.sala}{!sala.ativa && ' (desativada)'}</strong>
                    <small>{sala.pontos} pontos · {sala.descricao || 'Sem descrição'}</small>
                  </div>
                  <div className={styles.actions}>
                    <Button variant="outline" icon={QrCode} onClick={() => setSalaDoQr(sala)}>QR Code</Button>
                    <Button variant="outline" icon={Pencil} onClick={() => abrirEdicao(sala)}>Editar</Button>
                    <Button variant="danger" icon={Trash2} onClick={() => { setFeedback(null); setSalaParaRemover(sala); }}>Remover</Button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      </main>

      <SalaFormModal isOpen={formAberto} sala={salaEmEdicao} onSubmit={handleSalvar} onClose={() => setFormAberto(false)} />
      <QrCodeModal sala={salaDoQr} onClose={() => setSalaDoQr(null)} />

      <ConfirmModal isOpen={Boolean(salaParaRemover)} title="Remover sala" confirmLabel="Remover" variant="danger" loading={removendo} onConfirm={handleRemover} onCancel={() => { if (!removendo) setSalaParaRemover(null); }}>
        {salaParaRemover && <>Tem certeza que deseja remover <strong>{salaParaRemover.sala}</strong>? Salas que já têm visitas não podem ser removidas, apenas desativadas.</>}
      </ConfirmModal>
    </div>
  );
};

export default GerenciarSalas;