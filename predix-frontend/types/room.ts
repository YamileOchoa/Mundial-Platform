export interface Room {
  id: number;
  nombre: string;
  descripcion?: string;
  codigo_invitacion: string;
  admin_id: number;
  max_members?: number;
  created_at: string;
}

export interface RoomMember {
  user_id: number;
  nombre: string;
  foto_url: string | null;
  es_admin: boolean;
  joined_at: string;
}

export interface CreateRoomPayload {
  nombre: string;
}

export interface JoinRoomPayload {
  codigo_invitacion: string;
}
