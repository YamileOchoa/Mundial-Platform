export interface User {
  id: number;
  nombre: string;
  email: string;
  foto_url: string | null;
  es_admin_global: boolean;
  created_at: string;
}

export interface UserStats {
  total_predicciones: number;
  partidos_ganador_correcto: number;
  puntos_totales: number;
  racha_maxima_actual: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  nombre: string;
  email: string;
  password: string;
}
