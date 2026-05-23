import { useState, useEffect } from 'react';
import { shippingLabelService } from '../services/api/shippingLabelService';
import type { ShippingLabel, PaginatedResponse } from '../types/shippingLabel';
import type { ApiError } from '../types/api';
import { AxiosError } from 'axios';

export function useShippingLabels(page: number) {
  const [data, setData] = useState<PaginatedResponse<ShippingLabel> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    shippingLabelService
      .list(page)
      .then(setData)
      .catch((err: AxiosError<ApiError>) => {
        setError(err.response?.data?.message ?? 'Erro ao carregar etiquetas.');
      })
      .finally(() => setLoading(false));
  }, [page]);

  return { data, loading, error };
}
