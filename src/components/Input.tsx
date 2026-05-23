import type { InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, className = '', ...rest }: InputProps) {
  return (
    <div className={styles.wrapper}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      <input
        id={id}
        {...rest}
        className={`${styles.input} ${error ? styles.hasError : ''} ${className}`}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
