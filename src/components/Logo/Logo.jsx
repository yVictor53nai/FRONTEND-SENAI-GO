import React from 'react';
import { Gamepad2 } from 'lucide-react';
import styles from './Logo.module.css';

const Logo = ({ size = 'medium', className = '' }) => (
  <div className={`${styles.logoWrapper} ${styles[size]} ${className}`}>
    <div className={styles.iconBadge}><Gamepad2 className={styles.icon} /></div>
    <div className={styles.textWrapper}><span className={styles.senaiText}>SENAI</span><span className={styles.goText}>go</span></div>
  </div>
);
export default Logo;