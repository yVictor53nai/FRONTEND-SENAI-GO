import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './AdminTabs.module.css';

const AdminTabs = () => (
  <nav className={styles.tabs}>
    <NavLink to="/admin/loja" className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}>Produtos</NavLink>
    <NavLink to="/admin/salas" className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}>Salas</NavLink>
  </nav>
);

export default AdminTabs;