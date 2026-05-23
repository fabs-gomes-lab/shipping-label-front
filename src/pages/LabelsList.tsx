import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useShippingLabels } from '../hooks/useShippingLabels';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { Modal } from '../components/Modal';
import { CreateLabel } from './CreateLabel';
import type { LabelStatus } from '../types/shippingLabel';
import styles from './LabelsList.module.css';

function truncateTracking(code: string | null): string {
  if (!code) return '—';
  if (code.length <= 10) return code;
  return `${code.slice(0, 10)}...${code.slice(-5)}`;
}

const STATUS_LABEL: Record<LabelStatus, string> = {
  PURCHASED: 'Purchased',
  FAILED: 'Failed',
  RATED: 'Rated',
  DRAFT: 'Draft',
};

export function LabelsList() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const { data, loading, error } = useShippingLabels(page);

  const perPage = data?.per_page ?? 0;
  const total = data?.total ?? 0;
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  return (
    <>
    {showCreate && (
      <Modal title="Nova etiqueta" onClose={() => setShowCreate(false)}>
        <CreateLabel onClose={() => setShowCreate(false)} />
      </Modal>
    )}
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <i className="ti ti-package" style={{ fontSize: 26, color: '#3b82f6' }} />
          <h1 className={styles.title}>Minhas etiquetas</h1>
        </div>
        <div className={styles.headerRight}>
          <Button onClick={() => setShowCreate(true)}>
            <i className="ti ti-plus" />
            Nova etiqueta
          </Button>
          <Button variant="icon" onClick={logout} title="Sair">
            <i className="ti ti-logout" />
          </Button>
        </div>
      </header>

      <div className={styles.content}>
        {loading && <Loading />}
        {error && <ErrorMessage message={error} />}
        {!loading && !error && data && (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tracking</th>
                  <th>Destinatário</th>
                  <th>Serviço</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((label) => (
                  <tr key={label.id}>
                    <td className={styles.mono}>{truncateTracking(label.tracking_code)}</td>
                    <td><strong>{label.to_address?.name ?? '—'}</strong></td>
                    <td>{label.carrier} {label.service}</td>
                    <td>${label.rate_amount} {label.rate_currency}</td>
                    <td>
                      <Badge label={STATUS_LABEL[label.status]} variant={
                        label.status === 'PURCHASED' ? 'success' :
                        label.status === 'FAILED' ? 'danger' :
                        label.status === 'RATED' ? 'info' : 'neutral'
                      } />
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Button
                          variant="icon"
                          onClick={() => navigate(`/labels/${label.id}`)}
                          title="Ver detalhes"
                        >
                          <i className="ti ti-eye" />
                        </Button>
                        {label.label_url && (
                          <Button
                            variant="icon"
                            onClick={() => window.open(label.label_url!, '_blank')}
                            title="Baixar etiqueta"
                          >
                            <i className="ti ti-download" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.pagination}>
              <span className={styles.paginationInfo}>
                Exibindo {start}–{end} de {total}
              </span>
              <div className={styles.paginationButtons}>
                <Button
                  variant="secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="secondary"
                  disabled={page >= (data.last_page ?? 1)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Próximo
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
}
