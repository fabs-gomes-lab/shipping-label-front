import http from '../http';
import type {
  ShippingLabel,
  CreateShippingLabelRequest,
  PaginatedResponse,
} from '../../types/shippingLabel';

export const shippingLabelService = {
  list(page = 1): Promise<PaginatedResponse<ShippingLabel>> {
    return http
      .get<PaginatedResponse<ShippingLabel>>('/shipping-labels', { params: { page } })
      .then((r) => r.data);
  },

  get(id: number): Promise<ShippingLabel> {
    return http.get<ShippingLabel>(`/shipping-labels/${id}`).then((r) => r.data);
  },

  create(payload: CreateShippingLabelRequest): Promise<ShippingLabel> {
    return http.post<ShippingLabel>('/shipping-labels', payload).then((r) => r.data);
  },
};
