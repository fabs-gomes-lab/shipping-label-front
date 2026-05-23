import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { shippingLabelService } from '../services/api/shippingLabelService';
import type { AddressRequest, ParcelRequest, LabelFormat } from '../types/shippingLabel';
import type { ApiError } from '../types/api';
import { AxiosError } from 'axios';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorMessage } from '../components/ErrorMessage';
import { US_STATES } from '../utils/usStates';
import styles from './CreateLabel.module.css';

const EMPTY_ADDRESS: AddressRequest = {
  name: '',
  street1: '',
  street2: '',
  city: '',
  state: '',
  zip: '',
  country: 'US',
  phone: '',
  email: '',
};

const ZIP_RE = /^\d{5}(-\d{4})?$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateAddress(addr: AddressRequest, prefix: string): Record<string, string> {
  const errs: Record<string, string> = {};
  if (!addr.name) errs[`${prefix}.name`] = 'Campo obrigatório.';
  if (!addr.street1) errs[`${prefix}.street1`] = 'Campo obrigatório.';
  if (!addr.city) errs[`${prefix}.city`] = 'Campo obrigatório.';
  if (!addr.state) errs[`${prefix}.state`] = 'Campo obrigatório.';
  if (!addr.zip) errs[`${prefix}.zip`] = 'Campo obrigatório.';
  else if (!ZIP_RE.test(addr.zip)) errs[`${prefix}.zip`] = 'Formato inválido (##### ou #####-####).';
  if (addr.email && !EMAIL_RE.test(addr.email)) errs[`${prefix}.email`] = 'Email inválido.';
  return errs;
}

interface CreateLabelProps {
  onClose?: () => void;
}

export function CreateLabel({ onClose }: CreateLabelProps = {}) {
  const navigate = useNavigate();
  const [from, setFrom] = useState<AddressRequest>({ ...EMPTY_ADDRESS });
  const [to, setTo] = useState<AddressRequest>({ ...EMPTY_ADDRESS });
  const [parcel, setParcel] = useState<ParcelRequest>({ length: 0, width: 0, height: 0, weight: 0 });
  const [labelFormat, setLabelFormat] = useState<LabelFormat>('PDF');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  function patchFrom(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFrom((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFieldErrors((prev) => { const n = { ...prev }; delete n[`from.${e.target.name}`]; return n; });
  }

  function patchTo(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setTo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFieldErrors((prev) => { const n = { ...prev }; delete n[`to.${e.target.name}`]; return n; });
  }

  function patchParcel(e: ChangeEvent<HTMLInputElement>) {
    setParcel((prev) => ({ ...prev, [e.target.name]: parseFloat(e.target.value) || 0 }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGlobalError(null);

    const errs = {
      ...validateAddress(from, 'from'),
      ...validateAddress(to, 'to'),
    };
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const label = await shippingLabelService.create({
        from_address: from,
        to_address: to,
        parcel,
        label_format: labelFormat,
      });
      navigate(`/labels/${label.id}`);
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      const apiError = axiosErr.response?.data;
      if (apiError?.errors) {
        const mapped: Record<string, string> = {};
        Object.entries(apiError.errors).forEach(([key, msgs]) => {
          mapped[key] = msgs[0] ?? '';
        });
        setFieldErrors(mapped);
      } else {
        setGlobalError(apiError?.message ?? 'Erro ao criar etiqueta.');
      }
    } finally {
      setLoading(false);
    }
  }

  function fe(field: string) {
    return fieldErrors[field];
  }

  const isModal = !!onClose;

  return (
    <div className={isModal ? styles.formModal : styles.page}>
      {!isModal && (
        <header className={styles.header}>
          <Button variant="icon" onClick={() => navigate('/labels')} className={styles.backBtn}>
            <i className="ti ti-arrow-left" />
          </Button>
          <div>
            <h1 className={styles.title}>Nova etiqueta</h1>
            <p className={styles.subtitle}>Preencha os dados de envio. Apenas endereços nos EUA.</p>
          </div>
        </header>
      )}

      {isModal && (
        <p className={styles.subtitleModal}>Preencha os dados de envio. Apenas endereços nos EUA.</p>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.addressGrid}>
          <Card>
            <div className={styles.sectionHeader}>
              <i className="ti ti-map-pin" />
              <span>Remetente</span>
            </div>
            <div className={styles.fields}>
              <Input name="name" placeholder="Nome completo" value={from.name} onChange={patchFrom} error={fe('from.name')} />
              <Input name="street1" placeholder="Endereço" value={from.street1} onChange={patchFrom} error={fe('from.street1')} />
              <Input name="street2" placeholder="Complemento (opcional)" value={from.street2 ?? ''} onChange={patchFrom} />
              <div className={styles.cityRow}>
                <Input name="city" placeholder="Cidade" value={from.city} onChange={patchFrom} error={fe('from.city')} className={styles.cityInput} />
                <div className={styles.selectWrapper}>
                  <select name="state" value={from.state} onChange={patchFrom} className={`${styles.select} ${fe('from.state') ? styles.selectError : ''}`}>
                    <option value="">UF</option>
                    {US_STATES.map((s) => <option key={s.code} value={s.code}>{s.code}</option>)}
                  </select>
                </div>
                <Input name="zip" placeholder="ZIP" value={from.zip} onChange={patchFrom} error={fe('from.zip')} className={styles.zipInput} />
              </div>
              <Input name="email" type="email" placeholder="from@exemplo.com" value={from.email ?? ''} onChange={patchFrom} error={fe('from.email')} />
            </div>
          </Card>

          <Card>
            <div className={styles.sectionHeader}>
              <i className="ti ti-flag" />
              <span>Destinatário</span>
            </div>
            <div className={styles.fields}>
              <Input name="name" placeholder="Nome completo" value={to.name} onChange={patchTo} error={fe('to.name')} />
              <Input name="street1" placeholder="Endereço" value={to.street1} onChange={patchTo} error={fe('to.street1')} />
              <Input name="street2" placeholder="Complemento (opcional)" value={to.street2 ?? ''} onChange={patchTo} />
              <div className={styles.cityRow}>
                <Input name="city" placeholder="Cidade" value={to.city} onChange={patchTo} error={fe('to.city')} className={styles.cityInput} />
                <div className={styles.selectWrapper}>
                  <select name="state" value={to.state} onChange={patchTo} className={`${styles.select} ${fe('to.state') ? styles.selectError : ''}`}>
                    <option value="">UF</option>
                    {US_STATES.map((s) => <option key={s.code} value={s.code}>{s.code}</option>)}
                  </select>
                </div>
                <Input name="zip" placeholder="ZIP" value={to.zip} onChange={patchTo} error={fe('to.zip')} className={styles.zipInput} />
              </div>
              <Input name="email" type="email" placeholder="to@exemplo.com" value={to.email ?? ''} onChange={patchTo} error={fe('to.email')} />
            </div>
          </Card>
        </div>

        <Card>
          <div className={styles.sectionHeader}>
            <i className="ti ti-package" />
            <span>Pacote</span>
          </div>
          <div className={styles.parcelRow}>
            <div className={styles.parcelField}>
              <label className={styles.parcelLabel}>Comprimento (in)</label>
              <input name="length" type="number" min="0" step="0.1" value={parcel.length || ''} onChange={patchParcel} className={styles.parcelInput} />
            </div>
            <div className={styles.parcelField}>
              <label className={styles.parcelLabel}>Largura (in)</label>
              <input name="width" type="number" min="0" step="0.1" value={parcel.width || ''} onChange={patchParcel} className={styles.parcelInput} />
            </div>
            <div className={styles.parcelField}>
              <label className={styles.parcelLabel}>Altura (in)</label>
              <input name="height" type="number" min="0" step="0.1" value={parcel.height || ''} onChange={patchParcel} className={styles.parcelInput} />
            </div>
            <div className={styles.parcelField}>
              <label className={styles.parcelLabel}>Peso (oz)</label>
              <input name="weight" type="number" min="0" step="0.1" value={parcel.weight || ''} onChange={patchParcel} className={styles.parcelInput} />
            </div>
            <div className={styles.parcelField}>
              <label className={styles.parcelLabel}>Formato</label>
              <select
                value={labelFormat}
                onChange={(e) => setLabelFormat(e.target.value as LabelFormat)}
                className={styles.select}
              >
                <option value="PDF">PDF</option>
                <option value="PNG">PNG</option>
                <option value="ZPL">ZPL</option>
              </select>
            </div>
          </div>
        </Card>

        {globalError && <ErrorMessage message={globalError} />}

        <div className={styles.footer}>
          <Button
            variant="secondary"
            type="button"
            onClick={isModal ? onClose : () => navigate('/labels')}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            <i className="ti ti-check" />
            Gerar etiqueta
          </Button>
        </div>
      </form>
    </div>
  );
}
