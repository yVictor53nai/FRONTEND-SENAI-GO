import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Alert from '../../components/Alert/Alert';
import Logo from '../../components/Logo/Logo';
import { Mail, Lock, LogIn } from 'lucide-react';
import styles from './Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !senha) {
      setError('Preencha todos os campos para entrar.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), senha);
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.cardWrapper}>
        <div className={styles.logoHeader}>
          <Logo size="large" />
          <span className={styles.gamerSubtitle}>Plataforma de Gamificação</span>
        </div>
        <Card className={styles.loginCard}>
          <div className={styles.headerText}>
            <h2>Bem-vindo de volta!</h2>
            <p>Entre com suas credenciais para continuar</p>
          </div>
          <form onSubmit={handleLoginSubmit} className={styles.form}>
            {state?.cadastroOk && !error && <Alert variant="success">Cadastro realizado! Faça login para continuar.</Alert>}
            <Input id="login-email" type="email" label="E-mail" placeholder="seu.email@aluno.senai.br" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} icon={Mail} required />
            <Input id="login-senha" type="password" label="Senha" placeholder="••••••••" value={senha} onChange={(e) => { setSenha(e.target.value); setError(''); }} icon={Lock} required />
            {error && <Alert variant="error">{error}</Alert>}
            <Button type="submit" variant="primary" fullWidth icon={LogIn} loading={loading}>{loading ? 'Entrando...' : 'Entrar'}</Button>
          </form>
          <div className={styles.footerText}>
            <span>Ainda não tem conta? </span><Link to="/cadastro" className={styles.link}>Cadastre-se</Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
export default Login;
