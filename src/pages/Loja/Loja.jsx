import React, { useState } from 'react';
import { useProgresso } from '../../hooks/useProgresso';
import { useProdutos } from '../../hooks/useProdutos';
import { useResgates } from '../../hooks/useResgates';
import Header from '../../components/Header/Header';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Alert from '../../components/Alert/Alert';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import { formatDate } from '../../utils/formatters';
import { Gift, Trophy, Sparkles, RefreshCw } from 'lucide-react';
import styles from './Loja.module.css';

const Loja = () => {
  const { saldo, atualizarSaldo } = useProgresso();
  const { produtos, loading, error, recarregar: recarregarProdutos } = useProdutos();
  const { resgates, loading: loadingResgates, error: errorResgates, recarregar: recarregarResgates, resgatar } = useResgates();

  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [resgatando, setResgatando] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fecharConfirmacao = () => { if (!resgatando) setProdutoSelecionado(null); };

  const handleConfirmarResgate = async () => {
    setResgatando(true);
    try {
      await resgatar(produtoSelecionado.id);
      setFeedback({ variant: 'success', message: `${produtoSelecionado.nome} resgatado com sucesso!` });
    } catch (err) {
      setFeedback({ variant: 'error', message: err.message });
    } finally {
      // Mesmo em caso de erro, saldo, estoque e histórico são relidos da API para refletir o estado real.
      await Promise.allSettled([atualizarSaldo(), recarregarProdutos({ silencioso: true }), recarregarResgates()]);
      setResgatando(false);
      setProdutoSelecionado(null);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={styles.mainContent}>
        <section className={styles.bannerLoja}>
          <div className={styles.bannerInfo}>
            <div className={styles.tagLoja}><Sparkles size={16} /><span>Loja de Recompensas</span></div>
            <h2>Troque seus pontos por Brindes</h2>
            <p>Sua participação nas salas do SENAI garante brindes e prêmios exclusivos!</p>
          </div>
          <div className={styles.saldoPill}>
            <Trophy size={20} />
            <div><small>Seu Saldo</small><br /><strong>{saldo} Pontos</strong></div>
          </div>
        </section>

        {feedback && <Alert variant={feedback.variant}>{feedback.message}</Alert>}
        {loading && <Alert variant="info">Carregando produtos...</Alert>}
        {error && (
          <div className={styles.errorBox}>
            <Alert variant="error">{error}</Alert>
            <Button variant="outline" icon={RefreshCw} onClick={() => recarregarProdutos()}>Tentar novamente</Button>
          </div>
        )}
        {!loading && !error && produtos.length === 0 && <Alert variant="info">Nenhum produto disponível no momento.</Alert>}

        <section className={styles.productsGrid}>
          {produtos.map((item) => {
            const esgotado = item.estoque <= 0;
            const podeResgatar = !esgotado && saldo >= item.pontos;
            const rotulo = esgotado ? 'Esgotado' : podeResgatar ? 'Resgatar' : 'Pontos Insuficientes';
            return (
              <Card key={item.id} className={styles.productCard}>
                <div className={styles.imagePlaceholder}><span className={styles.emojiImg}>{item.imagem}</span></div>
                <div className={styles.productInfo}>
                  <h4 className={styles.productName}>{item.nome}</h4>
                  <div className={styles.pointsCost}><Trophy size={16} /><span>{item.pontos} Pontos</span></div>
                  {!esgotado && <small className={styles.stockInfo}>{item.estoque} em estoque</small>}
                </div>
                <div className={styles.cardFooter}>
                  <Button variant={podeResgatar ? 'primary' : 'outline'} fullWidth disabled={!podeResgatar} icon={Gift} onClick={() => { setFeedback(null); setProdutoSelecionado(item); }}>
                    {rotulo}
                  </Button>
                </div>
              </Card>
            );
          })}
        </section>

        <section className={styles.historySection}>
          <h3 className={styles.sectionTitle}>Meus Resgates</h3>
          {loadingResgates && <Alert variant="info">Carregando seus resgates...</Alert>}
          {errorResgates && <Alert variant="error">{errorResgates}</Alert>}
          {!loadingResgates && !errorResgates && resgates.length === 0 && <p className={styles.emptyText}>Você ainda não resgatou nenhum brinde.</p>}
          <ul className={styles.historyList}>
            {[...resgates].reverse().map((resgate) => (
              <li key={resgate.id} className={styles.historyItem}>
                <span className={styles.historyEmoji}>{resgate.produtoImagem}</span>
                <div className={styles.historyInfo}><strong>{resgate.produtoNome}</strong><small>{formatDate(resgate.criadoEm)}</small></div>
                <span className={styles.historyPoints}>-{resgate.pontos} pts</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <ConfirmModal isOpen={Boolean(produtoSelecionado)} title="Confirmar resgate" confirmLabel="Resgatar" loading={resgatando} onConfirm={handleConfirmarResgate} onCancel={fecharConfirmacao}>
        {produtoSelecionado && <>Deseja trocar <strong>{produtoSelecionado.pontos} pontos</strong> por <strong>{produtoSelecionado.nome}</strong>?</>}
      </ConfirmModal>
    </div>
  );
};
export default Loja;
