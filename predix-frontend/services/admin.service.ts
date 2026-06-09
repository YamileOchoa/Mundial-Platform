import api from './api';
import type { Match, MatchStatus } from '@/types/match';
import type { User } from '@/types/auth';
import type { Room } from '@/types/room';
import type { Player } from '@/types/player';

export interface MatchResultPayload {
  goles_local: number;
  goles_visita: number;
  goleador_real?: string;
  jugador_tarjeta_real?: string;
  tipo_tarjeta_real?: string;
  minuto_primer_gol?: number;
}

export interface CreatePlayerPayload {
  nombre: string;
  pais: string;
  posicion: string;
  foto_url?: string;
}

export const adminService = {
  async getAllMatches(): Promise<Match[]> {
    const { data } = await api.get<Match[]>('/admin/matches/');
    return data;
  },

  async updateMatchStatus(matchId: number, estado: MatchStatus): Promise<Match> {
    const { data } = await api.patch<Match>(`/admin/matches/${matchId}/status`, { estado });
    return data;
  },

  async setMatchResult(matchId: number, payload: MatchResultPayload): Promise<Match> {
    const { data } = await api.put<Match>(`/admin/matches/${matchId}/result`, payload);
    return data;
  },

  async getAllUsers(): Promise<User[]> {
    const { data } = await api.get<User[]>('/admin/users/');
    return data;
  },

  async makeAdmin(userId: number): Promise<User> {
    const { data } = await api.put<User>(`/admin/users/${userId}/make-admin`);
    return data;
  },

  async deleteUser(userId: number): Promise<void> {
    await api.delete(`/admin/users/${userId}`);
  },

  async getAllRooms(): Promise<Room[]> {
    const { data } = await api.get<Room[]>('/admin/rooms/');
    return data;
  },

  async deleteRoom(roomId: number): Promise<void> {
    await api.delete(`/admin/rooms/${roomId}`);
  },

  async createPlayer(payload: CreatePlayerPayload): Promise<Player> {
    const { data } = await api.post<Player>('/admin/players/', payload);
    return data;
  },

  async bulkCreatePlayers(players: CreatePlayerPayload[]): Promise<Player[]> {
    const { data } = await api.post<Player[]>('/admin/players/bulk', players);
    return data;
  },

  async deletePlayer(playerId: number): Promise<void> {
    await api.delete(`/admin/players/${playerId}`);
  },
};

export const getAllAdminMatches = () => adminService.getAllMatches();
export const updateAdminMatchStatus = (id: number, estado: MatchStatus) =>
  adminService.updateMatchStatus(id, estado);
export const setAdminMatchResult = (id: number, payload: MatchResultPayload) =>
  adminService.setMatchResult(id, payload);
export const getAllAdminUsers = () => adminService.getAllUsers();
export const makeUserAdmin = (id: number) => adminService.makeAdmin(id);
export const deleteAdminUser = (id: number) => adminService.deleteUser(id);
export const getAllAdminRooms = () => adminService.getAllRooms();
export const deleteAdminRoom = (id: number) => adminService.deleteRoom(id);
export const createAdminPlayer = (p: CreatePlayerPayload) => adminService.createPlayer(p);
export const bulkCreateAdminPlayers = (p: CreatePlayerPayload[]) => adminService.bulkCreatePlayers(p);
export const deleteAdminPlayer = (id: number) => adminService.deletePlayer(id);
