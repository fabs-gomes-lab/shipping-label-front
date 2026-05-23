import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shippingLabelService } from '../services/api/shippingLabelService';
import type { ShippingLabel, LabelStatus } from '../types/shippingLabel';
import type { ApiError } from '../types/api';
import { AxiosError } from 'axios';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import styles from './LabelDetails.module.css';

const STATUS_LABEL: Record<LabelStatus, string> = {
  PURCHASED: 'Purchased',
  FAILED: 'Failed',
  RATED: 'Rated',
  DRAFT: 'Draft',
};

export function LabelDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [label, setLabel] = useState<ShippingLabel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    shippingLabelService
      .get(Number(id))
      .then(setLabel)
      .catch((err: AxiosError<ApiError>) => {
        setError(err.response?.data?.message ?? 'Erro ao carregar etiqueta.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  function copyTracking() {
    if (!label?.tracking_code) return;
    navigator.clipboard.writeText(label.tracking_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) return <div className={styles.page}><Loading /></div>;
  if (error) return <div className={styles.page}><ErrorMessage message={error} /></div>;
  if (!label) return null;

  const addr = label.from_address;
  const dest = label.to_address;

  if (!addr || !dest) return (
    <div className={styles.page}>
      <ErrorMessage message="Dados de endereço não disponíveis para esta etiqueta." />
    </div>
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Button variant="icon" onClick={() => navigate('/labels')} className={styles.backBtn}>
          <i className="ti ti-arrow-left" />
        </Button>
        <h1 className={styles.title}>Etiqueta #{label.id}</h1>
        <Badge
          label={STATUS_LABEL[label.status]}
          variant={
            label.status === 'PURCHASED' ? 'success' :
            label.status === 'FAILED' ? 'danger' :
            label.status === 'RATED' ? 'info' : 'neutral'
          }
        />
      </header>

      <div className={styles.content}>
        <div className={styles.metricsGrid}>
          <Card>
            <div className={styles.metricLabel}>Transportadora</div>
            <div className={styles.metricValue}>{label.carrier}</div>
          </Card>
          <Card>
            <div className={styles.metricLabel}>Serviço</div>
            <div className={styles.metricValue}>{label.service}</div>
          </Card>
          <Card>
            <div className={styles.metricLabel}>Valor</div>
            <div className={styles.metricValue}>${label.rate_amount}</div>
          </Card>
          <Card>
            <div className={styles.metricLabel}>Formato</div>
            <div className={styles.metricValue}>{label.label_format}</div>
          </Card>
        </div>

        {label.tracking_code && (
          <Card className={styles.trackingCard}>
            <div className={styles.trackingInner}>
              <div className={styles.trackingLeft}>
                <i className="ti ti-truck" style={{ fontSize: 18, color: '#8b949e' }} />
                <div>
                  <div className={styles.trackingLabelText}>Código de rastreio</div>
                  <div className={styles.trackingCode}>{label.tracking_code}</div>
                </div>
              </div>
              <Button variant="icon" onClick={copyTracking} title="Copiar">
                <i className={copied ? 'ti ti-check' : 'ti ti-copy'} />
              </Button>
            </div>
          </Card>
        )}

        <div className={styles.addressGrid}>
          <Card>
            <div className={styles.addrSection}>REMETENTE</div>
            <div className={styles.addrName}>{addr.name}</div>
            <div className={styles.addrLine}>{addr.street1}{addr.street2 ? `, ${addr.street2}` : ''}</div>
            <div className={styles.addrLine}>{addr.city}, {addr.state} {addr.zip}</div>
            {addr.email && <div className={styles.addrLine}>{addr.email}</div>}
          </Card>
          <Card>
            <div className={styles.addrSection}>DESTINATÁRIO</div>
            <div className={styles.addrName}>{dest.name}</div>
            <div className={styles.addrLine}>{dest.street1}{dest.street2 ? `, ${dest.street2}` : ''}</div>
            <div className={styles.addrLine}>{dest.city}, {dest.state} {dest.zip}</div>
            {dest.email && <div className={styles.addrLine}>{dest.email}</div>}
          </Card>
        </div>

        {label.label_url && (
          <div className={styles.downloadRow}>
            <Button onClick={() => window.open(label.label_url!, '_blank')}>
              <i className="ti ti-download" />
              Baixar etiqueta
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
