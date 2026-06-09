import api from './api';

export interface Reward {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  puntos_requeridos: number;
  imagen_url?: string;
  obtenida: boolean;
  fecha_obtenida?: string;
}

export async function getMyRewards(): Promise<Reward[]> {
  const { data } = await api.get<Reward[]>('/rewards/my');
  return data;
}
