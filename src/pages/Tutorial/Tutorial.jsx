import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo/Logo';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import { Gamepad2, QrCode, Target, ShieldCheck, ArrowRight } from 'lucide-react';
import styles from './Tutorial.module.css';

const Tutorial = () => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigate = useNavigate();

  const handleStartCadastro = () => { if (acceptedTerms) navigate('/cadastro'); };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}><Logo size="large" /></header>
      <main className={styles.content}>
        <div className={styles.titleSection}>
          <h1 className={styles.mainTitle}>🎮 Gamificação SENAI</h1>
          <p className={styles.subtitle}>Explore os ambientes do SENAI, acumule pontos, desbloqueie conquistas e troque por recompensas incríveis!</p>
        </div>
        <div className={styles.cardsGrid}>
          <Card className={styles.stepCard}>
            <div className={`${styles.iconBadge} ${styles.blue}`}><Gamepad2 size={24} /></div>
            <h3>Bem-vindo</h3>
            <p>O sistema utiliza gamificação para incentivar os alunos a visitarem diferentes ambientes e salas do SENAI, acumulando progresso em tempo real.</p>
          </Card>
          <Card className={styles.stepCard}>
            <div className={`${styles.iconBadge} ${styles.terracotta}`}><QrCode size={24} /></div>
            <h3>Como Funciona</h3>
            <p>Você realiza o cadastro, faz login, visita os ambientes do SENAI, escaneia os QR Codes disponíveis nas salas e ganha progresso instantâneo.</p>
          </Card>
          <Card className={styles.stepCard}>
            <div className={`${styles.iconBadge} ${styles.blue}`}><Target size={24} /></div>
            <h3>Objetivo</h3>
            <p>Incentivar a participação ativa e o engajamento dos alunos nas atividades práticas e na infraestrutura da instituição.</p>
          </Card>
          <Card className={styles.stepCard}>
            <div className={`${styles.iconBadge} ${styles.terracotta}`}><ShieldCheck size={24} /></div>
            <h3>Segurança</h3>
            <p>Seus dados ficam protegidos com criptografia e autenticação por token seguro para garantir sua privacidade.</p>
          </Card>
        </div>
        <div className={styles.footerAction}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className={styles.checkbox} />
            <span>Aceito os termos de uso do SENAIgo</span>
          </label>
          <Button variant="primary" disabled={!acceptedTerms} onClick={handleStartCadastro} icon={ArrowRight} className={styles.submitBtn}>
            Cadastrar
          </Button>
        </div>
      </main>
    </div>
  );
};
export default Tutorial;