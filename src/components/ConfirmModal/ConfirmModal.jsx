import React from 'react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import styles from './ConfirmModal.module.css';

const ConfirmModal = ({ isOpen, title, children, confirmLabel = 'Confirmar', variant = 'primary', loading = false, onConfirm, onCancel }) => (
  <Modal isOpen={isOpen} onClose={onCancel} title={title}>
    <div className={styles.content}>
      <div className={styles.message}>{children}</div>
      <div className={styles.actions}>
        <Button variant="outline" onClick={onCancel} disabled={loading}>Cancelar</Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </div>
    </div>
  </Modal>
);

export default ConfirmModal;
