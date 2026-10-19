import React from 'react';
import styles from './Input.module.css';

const Input = ({ label, id, type = 'text', placeholder, value, onChange, error, icon: Icon, required = false, ...props }) => (
  <div className={styles.inputContainer}>
    {label && <label htmlFor={id} className={styles.label}>{label} {required && <span className={styles.required}>*</span>}</label>}
    <div className={`${styles.inputWrapper} ${error ? styles.hasError : ''}`}>
      {Icon && <Icon className={styles.inputIcon} size={18} />}
      <input id={id} type={type} placeholder={placeholder} value={value} onChange={onChange} className={`${styles.input} ${Icon ? styles.withIcon : ''}`} {...props} />
    </div>
    {error && <span className={styles.errorMessage}>{error}</span>}
  </div>
);
export default Input;