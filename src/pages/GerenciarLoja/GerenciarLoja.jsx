import React, { useState } from 'react';
import { useProdutos } from '../../hooks/useProdutos';
import Header from '../../components/Header/Header';
import AdminTabs from '../../components/AdminTabs/AdminTabs';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Alert from '../../components/Alert/Alert';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import ProdutoFormModal from '../../components/ProdutoFormModal/ProdutoFormModal';
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import styles from './GerenciarLoja.module.css';

const GerenciarLoja = () => {
  const { produtos, loading, error, recarregar, cadastrar, atualizar, remover } = useProdutos();

  const [formAberto, setFormAberto] = useState(false);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);
  const [produtoParaRemover, setProdutoParaRemover] = useState(null);
  const [removendo, setRemovendo] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const abrirNovo = () => { setProdutoEmEdicao(null); setFormAberto(true); };
  const abrirEdicao = (produto) => { setProdutoEmEdicao(produto); setFormAberto(true); };
  const fecharForm = () => setFormAberto(false);

  // Erros são lançados de volta para o formulário exibir a mensagem da API.
  const handleSalvar = async (dados) => {
    const resposta = produtoEmEdicao ? await atualizar(produtoEmEdicao.id, dados) : await cadastrar(dados);
    setFeedback({ variant: 'success', message: resposta.sucesso });
    setFormAberto(false);
  };

  const handleRemover = async () => {
    setRemovendo(true);
    try {
      const resposta = await remover(produtoParaRemover.id);
      setFeedback({ variant: 'success', message: resposta.sucesso });
    } catch (err) {
      setFeedback({ variant: 'error', message: err.message });
    } finally {
      setRemovendo(false);
      setProdutoParaRemover(null);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={styles.mainContent}>
        <AdminTabs />
        <div className={styles.titleRow}>
          <div>
            <h2>Gerenciar Loja</h2>
            <p>Cadastre, edite ou remova os brindes disponíveis para resgate.</p>
          </div>
          <Button icon={Plus} onClick={abrirNovo}>Novo produto</Button>
        </div>

        {feedback && <Alert variant={feedback.variant}>{feedback.message}</Alert>}
        {loading && <Alert variant="info">Carregando produtos...</Alert>}
        {error && (
          <div className={styles.errorBox}>
            <Alert variant="error">{error}</Alert>
            <Button variant="outline" icon={RefreshCw} onClick={() => recarregar()}>Tentar novamente</Button>
          </div>
        )}
        {!loading && !error && produtos.length === 0 && <Alert variant="info">Nenhum produto cadastrado ainda.</Alert>}

        <ul className={styles.list}>
          {produtos.map((produto) => (
            <li key={produto.id}>
              <Card className={styles.row}>
                <span className={styles.emoji}>{produto.imagem}</span>
                <div className={styles.info}>
                  <strong>{produto.nome}</strong>
                  <small>{produto.pontos} pontos · {produto.estoque} em estoque</small>
                </div>
                <div className={styles.actions}>
                  <Button variant="outline" icon={Pencil} onClick={() => abrirEdicao(produto)}>Editar</Button>
                  <Button variant="danger" icon={Trash2} onClick={() => { setFeedback(null); setProdutoParaRemover(produto); }}>Remover</Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </main>

      <ProdutoFormModal isOpen={formAberto} produto={produtoEmEdicao} onSubmit={handleSalvar} onClose={fecharForm} />
      <ConfirmModal isOpen={Boolean(produtoParaRemover)} title="Remover produto" confirmLabel="Remover" variant="danger" loading={removendo} onConfirm={handleRemover} onCancel={() => { if (!removendo) setProdutoParaRemover(null); }}>
        {produtoParaRemover && <>Tem certeza que deseja remover <strong>{produtoParaRemover.nome}</strong>? O histórico de resgates já feitos é mantido.</>}
      </ConfirmModal>
    </div>
  );
};
export default GerenciarLoja;