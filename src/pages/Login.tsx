import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ErrorMessage } from '../components/ErrorMessage';
import styles from './Login.module.css';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/labels');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <i className="ti ti-package" style={{ fontSize: 28, color: '#3b82f6' }} />
          <h1 className={styles.title}>Shipping labels</h1>
        </div>
        <p className={styles.subtitle}>Faça login para acessar suas etiquetas</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="user@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            type="password"
            label="Senha"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <ErrorMessage message={error} />}
          <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
