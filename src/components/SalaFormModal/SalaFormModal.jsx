import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import Input from '../Input/Input';
import Button from '../Button/Button';
import Alert from '../Alert/Alert';
import { ICON_OPTIONS } from '../../constants/salaIcons';
import { DoorOpen, Trophy, AlignLeft } from 'lucide-react';
import styles from './SalaFormModal.module.css';

const isIntegerText = (value) =>
  value.trim() !== '' && Number.isInteger(Number(value));

const validate = ({ sala, pontos }) => {
  const errors = {};
  if (sala.trim().length < 3)
    errors.sala = 'O nome deve ter pelo menos 3 caracteres.';
  if (!isIntegerText(pontos) || Number(pontos) < 1)
    errors.pontos = 'Informe um número inteiro maior que zero.';
  return errors;
};

const SalaForm = ({ sala, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    sala: sala?.sala ?? sala?.nome ?? sala?.nomeSala ?? '',
    descricao: sala?.descricao ?? '',
    pontos: sala?.pontos?.toString() ?? '',
    icone: sala?.icone ?? 'map-pin',
    ativa: sala?.ativa ?? sala?.isAtiva ?? true,
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
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
      const nomeLimpo = form.sala.trim();

      await onSubmit({
        sala: nomeLimpo,
        nome: nomeLimpo,
        descricao: form.descricao.trim(),
        pontos: Number(form.pontos),
        icone: form.icone,
        ativa: form.ativa,
      });
    } catch (err) {
      setSubmitError(err?.message || 'Ocorreu um erro ao salvar os dados.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <Input
        id="sala-nome"
        label="Nome da sala"
        placeholder="Ex.: Eletrônica"
        value={form.sala}
        onChange={handleChange('sala')}
        error={errors.sala}
        icon={DoorOpen}
        required
      />

      <Input
        id="sala-descricao"
        label="Descrição"
        placeholder="Ex.: Laboratório de Eletrônica"
        value={form.descricao}
        onChange={handleChange('descricao')}
        error={errors.descricao}
        icon={AlignLeft}
        maxLength={120}
      />

      <div className={styles.row}>
        <Input
          id="sala-pontos"
          type="number"
          min="1"
          label="Pontos"
          placeholder="5"
          value={form.pontos}
          onChange={handleChange('pontos')}
          error={errors.pontos}
          icon={Trophy}
          required
        />

        <div className={styles.field}>
          <label htmlFor="sala-icone" className={styles.label}>
            Ícone
          </label>
          <select
            id="sala-icone"
            className={styles.select}
            value={form.icone}
            onChange={handleChange('icone')}
          >
            {ICON_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {sala && (
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={form.ativa}
            onChange={handleChange('ativa')}
          />
          <span>Sala ativa (visível para os alunos)</span>
        </label>
      )}

      {submitError && <Alert variant="error">{submitError}</Alert>}

      <div className={styles.actions}>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          {sala ? 'Salvar alterações' : 'Cadastrar sala'}
        </Button>
      </div>
    </form>
  );
};

const SalaFormModal = ({ isOpen, sala = null, onSubmit, onClose }) => {
  if (!isOpen) return null;

  const formKey = sala?.salaId ?? sala?.id ?? sala?._id ?? 'nova-sala';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={sala ? 'Editar sala' : 'Nova sala'}
    >
      <SalaForm
        key={formKey}
        sala={sala}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
};

export default SalaFormModal;