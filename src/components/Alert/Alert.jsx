import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import styles from './Alert.module.css';

const ICONS = { error: AlertCircle, success: CheckCircle2, warning: AlertTriangle, info: Info };

const Alert = ({ variant = 'info', children, className = '' }) => {
  const Icon = ICONS[variant] || Info;
  const role = variant === 'error' || variant === 'warning' ? 'alert' : 'status';
  return (
    <div role={role} className={`${styles.alert} ${styles[variant]} ${className}`}>
      <Icon size={18} className={styles.icon} />
      <span>{children}</span>
    </div>
  );
};

export default Alert;
