import http from '../http';
import type { LoginRequest, LoginResponse } from '../../types/auth';

export const authService = {
  login(payload: LoginRequest): Promise<LoginResponse> {
    return http.post<LoginResponse>('/auth/login', payload).then((r) => r.data);
  },
};
