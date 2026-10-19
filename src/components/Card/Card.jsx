import React from 'react';
import styles from './Card.module.css';

const Card = ({ children, className = '', hoverEffect = true, ...props }) => (
  <div className={`${styles.card} ${hoverEffect ? styles.hoverable : ''} ${className}`} {...props}>{children}</div>
);
export default Card;