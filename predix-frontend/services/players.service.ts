import api from './api';
import type { Player } from '@/types/player';

export async function searchPlayers(params: {
  q?: string;
  pais?: string;
  limit?: number;
}): Promise<Player[]> {
  const { data } = await api.get<Player[]>('/players/', { params });
  return data;
}
