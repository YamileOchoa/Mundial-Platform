import api from './api';
import type { Room, RoomMember, CreateRoomPayload, JoinRoomPayload } from '@/types/room';

export const roomsService = {
  async getMyRooms(): Promise<Room[]> {
    const { data } = await api.get<Room[]>('/rooms/');
    return data;
  },

  async getRoom(id: number): Promise<Room> {
    const { data } = await api.get<Room>(`/rooms/${id}`);
    return data;
  },

  async createRoom(payload: CreateRoomPayload): Promise<Room> {
    const { data } = await api.post<Room>('/rooms/', payload);
    return data;
  },

  async joinRoom(payload: JoinRoomPayload): Promise<Room> {
    const { data } = await api.post<Room>('/rooms/join', payload);
    return data;
  },

  async getMembers(roomId: number): Promise<RoomMember[]> {
    const { data } = await api.get<RoomMember[]>(`/rooms/${roomId}/members`);
    return data;
  },

  async leaveRoom(roomId: number): Promise<void> {
    await api.post(`/rooms/${roomId}/leave`);
  },
};

export const getMyRooms = () => roomsService.getMyRooms();
export const getRoom = (id: number) => roomsService.getRoom(id);
export const createRoom = (p: CreateRoomPayload) => roomsService.createRoom(p);
export const joinRoom = (p: JoinRoomPayload) => roomsService.joinRoom(p);
export const getMembers = (id: number) => roomsService.getMembers(id);
export const leaveRoom = (id: number) => roomsService.leaveRoom(id);
