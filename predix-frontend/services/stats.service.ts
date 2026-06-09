import api from './api';
import type { LeaderboardEntry, ScoreHistory, ScoreHistoryPublic } from '@/types/score';

export const statsService = {
  async getGlobalLeaderboard(): Promise<LeaderboardEntry[]> {
    const { data } = await api.get<LeaderboardEntry[]>('/leaderboard/global');
    return data;
  },

  async getRoomLeaderboard(roomId: number): Promise<LeaderboardEntry[]> {
    const { data } = await api.get<LeaderboardEntry[]>(`/leaderboard/room/${roomId}`);
    return data;
  },

  async getMyScoreHistory(matchId?: number): Promise<ScoreHistory[]> {
    const { data } = await api.get<ScoreHistory[]>('/score-history/my', {
      params: matchId ? { match_id: matchId } : undefined,
    });
    return data;
  },

  async getMatchScoreHistory(matchId: number): Promise<ScoreHistoryPublic[]> {
    const { data } = await api.get<ScoreHistoryPublic[]>('/score-history/', {
      params: { match_id: matchId },
    });
    return data;
  },
};

export const getGlobalLeaderboard  = () => statsService.getGlobalLeaderboard();
export const getRoomLeaderboard    = (id: number) => statsService.getRoomLeaderboard(id);
export const getMyScoreHistory     = (matchId?: number) => statsService.getMyScoreHistory(matchId);
export const getMatchScoreHistory  = (matchId: number) => statsService.getMatchScoreHistory(matchId);
