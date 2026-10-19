import React from 'react';
import styles from './ProgressBar.module.css';

const ProgressBar = ({ current = 0, total = 10, label = '' }) => {
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  return (
    <div className={styles.progressContainer}>
      {label && <div className={styles.labelRow}><span className={styles.labelText}>{label}</span><span className={styles.percentageText}>{percentage}% Concluído</span></div>}
      <div className={styles.track}><div className={styles.fill} style={{ width: `${percentage}%` }} /></div>
    </div>
  );
};
export default ProgressBar;