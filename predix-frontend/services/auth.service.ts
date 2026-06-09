import api, { setTokens } from './api';
import type {
  LoginPayload,
  RegisterPayload,
  TokenResponse,
  User,
  UserStats,
} from '@/types/auth';

export const authService = {
  async login(payload: LoginPayload): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>('/auth/login', payload);
    setTokens(data.access_token, data.refresh_token);
    return data;
  },

  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await api.post<User>('/auth/register', payload);
    return data;
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<User>('/users/me');
    return data;
  },

  async getMyStats(): Promise<UserStats> {
    const { data } = await api.get<UserStats>('/users/me/stats');
    return data;
  },

  async updateMe(payload: { nombre?: string; foto_url?: string }): Promise<User> {
    const { data } = await api.put<User>('/users/me', payload);
    return data;
  },
};

export const loginUser = (p: LoginPayload) => authService.login(p);
export const registerUser = (p: RegisterPayload) => authService.register(p);
export const getMe = () => authService.getMe();
export const getMyStats = () => authService.getMyStats();
export const updateMe = (p: { nombre?: string; foto_url?: string }) => authService.updateMe(p);
