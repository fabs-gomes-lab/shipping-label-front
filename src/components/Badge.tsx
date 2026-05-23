import styles from './Badge.module.css';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  PURCHASED: 'success',
  FAILED: 'danger',
  RATED: 'info',
  DRAFT: 'neutral',
};

export function Badge({ label, variant }: BadgeProps) {
  const v = variant ?? STATUS_VARIANT[label] ?? 'neutral';
  return <span className={`${styles.badge} ${styles[v]}`}>{label}</span>;
}
