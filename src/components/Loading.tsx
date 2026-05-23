import styles from './Loading.module.css';

export function Loading() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.spinner} />
    </div>
  );
}
