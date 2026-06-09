import api from './api';
import type { LeaderboardEntry } from '@/types/score';

export async function getGlobalLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data } = await api.get<LeaderboardEntry[]>('/leaderboard/global');
  return data;
}

export async function getRoomLeaderboard(roomId: number): Promise<LeaderboardEntry[]> {
  const { data } = await api.get<LeaderboardEntry[]>(`/leaderboard/room/${roomId}`);
  return data;
}
