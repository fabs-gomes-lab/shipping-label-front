import http from '../http';

export const healthService = {
  check(): Promise<{ status: string }> {
    return http.get<{ status: string }>('/health-check').then((r) => r.data);
  },
};
