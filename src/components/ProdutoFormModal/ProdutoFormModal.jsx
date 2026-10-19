import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import Input from '../Input/Input';
import Button from '../Button/Button';
import Alert from '../Alert/Alert';
import { Package, Smile, Trophy, Boxes } from 'lucide-react';
import styles from './ProdutoFormModal.module.css';

const isIntegerText = (value) => value.trim() !== '' && Number.isInteger(Number(value));

const validate = ({ nome, pontos, estoque }) => {
  const errors = {};
  if (nome.trim().length < 3) errors.nome = 'O nome deve ter pelo menos 3 caracteres.';
  if (!isIntegerText(pontos) || Number(pontos) < 1) errors.pontos = 'Informe um número inteiro maior que zero.';
  if (!isIntegerText(estoque) || Number(estoque) < 0) errors.estoque = 'Informe um número inteiro, zero ou mais.';
  return errors;
};

const ProdutoForm = ({ produto, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    nome: produto?.nome ?? '',
    imagem: produto?.imagem ?? '',
    pontos: produto?.pontos?.toString() ?? '',
    estoque: produto?.estoque?.toString() ?? '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        nome: form.nome.trim(),
        imagem: form.imagem.trim(),
        pontos: Number(form.pontos),
        estoque: Number(form.estoque),
      });
    } catch (err) {
      setSubmitError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <Input id="produto-nome" label="Nome" placeholder="Ex.: Caneca SENAI" value={form.nome} onChange={handleChange('nome')} error={errors.nome} icon={Package} required />
      <Input id="produto-imagem" label="Emoji" placeholder="🎁" value={form.imagem} onChange={handleChange('imagem')} error={errors.imagem} icon={Smile} maxLength={10} />
      <div className={styles.row}>
        <Input id="produto-pontos" type="number" min="1" label="Pontos" placeholder="15" value={form.pontos} onChange={handleChange('pontos')} error={errors.pontos} icon={Trophy} required />
        <Input id="produto-estoque" type="number" min="0" label="Estoque" placeholder="10" value={form.estoque} onChange={handleChange('estoque')} error={errors.estoque} icon={Boxes} required />
      </div>
      {submitError && <Alert variant="error">{submitError}</Alert>}
      <div className={styles.actions}>
        <Button variant="outline" onClick={onCancel} disabled={loading}>Cancelar</Button>
        <Button type="submit" loading={loading}>{produto ? 'Salvar alterações' : 'Cadastrar produto'}</Button>
      </div>
    </form>
  );
};

// O formulário só existe enquanto o modal está aberto, então os campos reiniciam a cada abertura.
const ProdutoFormModal = ({ isOpen, produto = null, onSubmit, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={produto ? 'Editar produto' : 'Novo produto'}>
    <ProdutoForm produto={produto} onSubmit={onSubmit} onCancel={onClose} />
  </Modal>
);

export default ProdutoFormModal;
