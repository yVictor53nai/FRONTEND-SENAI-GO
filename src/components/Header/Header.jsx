import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useProgresso } from '../../hooks/useProgresso';
import Logo from '../Logo/Logo';
import { ShoppingBag, LogOut, MapPin, Trophy, User, Settings } from 'lucide-react';
import styles from './Header.module.css';

const Header = () => {
  const { user, isAdmin, logout } = useAuth();
  const { salas, visitedRooms, saldo } = useProgresso();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };
  const totalSalasDisponiveis = salas.length;
  const salasVisitadasCount = visitedRooms.length;

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.leftSection}><Link to="/home"><Logo size="small" /></Link></div>
        <div className={styles.centerSection}>
          <div className={styles.greetingBox}><User className={styles.userIcon} size={18} /><span>Olá, <strong>{user?.nome || 'Aluno'}</strong></span></div>
          <div className={styles.badgeVisitas} title="Áreas visitadas"><MapPin size={16} className={styles.badgeIcon} /><span><strong>{salasVisitadasCount}</strong> / {totalSalasDisponiveis}<span className={styles.badgeLabel}> áreas visitadas</span></span></div>
        </div>
        <div className={styles.rightSection}>
          <div className={styles.pointsPill}><Trophy size={16} className={styles.trophyIcon} /><span><strong>{saldo}</strong> pts</span></div>
          <nav className={styles.navLinks}>
            {isAdmin && <Link to="/admin/loja" aria-label="Gerenciar" className={`${styles.navBtn} ${location.pathname.startsWith('/admin') ? styles.active : ''}`}><Settings size={18} /><span>Gerenciar</span></Link>}
            <Link to="/loja" aria-label="Loja" className={`${styles.navBtn} ${location.pathname === '/loja' ? styles.active : ''}`}><ShoppingBag size={18} /><span>Loja</span></Link>
            <button onClick={handleLogout} className={styles.logoutBtn} title="Sair"><LogOut size={18} /></button>
          </nav>
        </div>
      </div>
    </header>
  );
};
export default Header;