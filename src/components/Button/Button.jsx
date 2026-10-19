import React from 'react';
import { Loader2 } from 'lucide-react';
import styles from './Button.module.css';

const Button = ({ children, variant = 'primary', fullWidth = false, disabled = false, loading = false, type = 'button', onClick, icon: Icon, className = '', ...props }) => (
  <button type={type} disabled={disabled || loading} aria-busy={loading || undefined} onClick={onClick} className={`${styles.button} ${styles[variant]} ${fullWidth ? styles.fullWidth : ''} ${className}`} {...props}>
    {loading ? <Loader2 className={styles.spinner} size={18} /> : Icon && <Icon className={styles.icon} size={18} />}
    <span>{children}</span>
  </button>
);
export default Button;
