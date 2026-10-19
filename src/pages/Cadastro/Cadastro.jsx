import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { maskCPF } from '../../utils/masks';
import { isValidEmail } from '../../utils/validators';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Alert from '../../components/Alert/Alert';
import Logo from '../../components/Logo/Logo';
import { User, Mail, Lock, CreditCard, UserPlus } from 'lucide-react';
import styles from './Cadastro.module.css';

const Cadastro = () => {
  const [formData, setFormData] = useState({ cpf: '', nome: '', email: '', senha: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const { cadastrar } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    let formattedValue = value;
    if (field === 'cpf') formattedValue = maskCPF(value);
    setFormData((prev) => ({ ...prev, [field]: formattedValue }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    setSubmitError('');
  };

  const cadastrarUsuario = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.cpf || formData.cpf.length < 14) newErrors.cpf = 'CPF incompleto.';
    if (formData.nome.trim().length < 3) newErrors.nome = 'Digite seu nome completo.';
    if (!isValidEmail(formData.email.trim())) newErrors.email = 'Insira um e-mail válido.';
    if (formData.senha.length < 6) newErrors.senha = 'A senha deve conter ao menos 6 dígitos.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await cadastrar({
        cpf: formData.cpf.replace(/\D/g, ''),
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        senha: formData.senha
      });
      navigate('/login', { state: { cadastroOk: true } });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.cardWrapper}>
        <div className={styles.logoBox}><Logo size="medium" /></div>
        <Card className={styles.formCard}>
          <div className={styles.headerText}>
            <h2>Crie sua conta</h2>
            <p>Preencha os campos para começar no SENAIgo</p>
          </div>
          <form onSubmit={cadastrarUsuario} className={styles.form}>
            <Input id="cpf" label="CPF" placeholder="000.000.000-00" value={formData.cpf} onChange={(e) => handleChange('cpf', e.target.value)} icon={CreditCard} error={errors.cpf} required />
            <Input id="nome" label="Nome Completo" placeholder="Seu nome completo" value={formData.nome} onChange={(e) => handleChange('nome', e.target.value)} icon={User} error={errors.nome} required />
            <Input id="email" type="email" label="E-mail" placeholder="seu.email@aluno.senai.br" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} icon={Mail} error={errors.email} required />
            <Input id="senha" type="password" label="Criar Senha" placeholder="••••••••" value={formData.senha} onChange={(e) => handleChange('senha', e.target.value)} icon={Lock} error={errors.senha} required />
            {submitError && <Alert variant="error">{submitError}</Alert>}
            <Button type="submit" variant="primary" fullWidth icon={UserPlus} loading={loading}>{loading ? 'Cadastrando...' : 'Cadastrar'}</Button>
          </form>
          <div className={styles.footerLink}>
            <span>Já possui uma conta? </span><Link to="/login" className={styles.link}>Faça Login</Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
export default Cadastro;