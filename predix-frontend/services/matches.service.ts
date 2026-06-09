import api from './api';
import type { Match, CreateMatchPayload } from '@/types/match';

export const matchesService = {
  async getRoomMatches(roomId: number): Promise<Match[]> {
    const { data } = await api.get<Match[]>('/matches/', { params: { room_id: roomId } });
    return data;
  },

  async getMatch(matchId: number): Promise<Match> {
    const { data } = await api.get<Match>(`/matches/${matchId}`);
    return data;
  },

  async createMatch(payload: CreateMatchPayload): Promise<Match> {
    const { data } = await api.post<Match>('/matches/', payload);
    return data;
  },
};

export const getRoomMatches = (roomId: number) => matchesService.getRoomMatches(roomId);
export const getMatch = (matchId: number) => matchesService.getMatch(matchId);
export const createMatch = (payload: CreateMatchPayload) => matchesService.createMatch(payload);
