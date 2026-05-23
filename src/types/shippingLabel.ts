export interface AddressRequest {
  name: string;
  street1: string;
  street2?: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string | null;
  email?: string | null;
}

export interface AddressResponse extends AddressRequest {
  id: number;
  user_id: number;
  easypost_address_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParcelRequest {
  length: number;
  width: number;
  height: number;
  weight: number;
}

export interface ParcelResponse {
  id: number;
  user_id: number;
  length: string;
  width: string;
  height: string;
  weight: string;
  created_at: string;
  updated_at: string;
}

export type LabelFormat = 'PDF' | 'PNG' | 'ZPL';
export type LabelStatus = 'DRAFT' | 'RATED' | 'PURCHASED' | 'FAILED';

export interface CreateShippingLabelRequest {
  from_address: AddressRequest;
  to_address: AddressRequest;
  parcel: ParcelRequest;
  label_format?: LabelFormat;
  rate_id?: string | null;
}

export interface ShippingLabel {
  id: number;
  user_id: number;
  easypost_shipment_id: string;
  easypost_rate_id: string;
  tracking_code: string | null;
  carrier: string;
  service: string;
  rate_amount: string;
  rate_currency: string;
  label_url: string | null;
  label_format: LabelFormat;
  status: LabelStatus;
  purchased_at: string | null;
  from_address?: AddressResponse;
  to_address?: AddressResponse;
  parcel?: ParcelResponse;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
