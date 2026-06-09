export type MatchStatus = 'pendiente' | 'en_curso' | 'terminado';

export interface Match {
  id: number;
  equipo_local: string;
  equipo_visita: string;
  fecha_inicio: string;
  goles_local: number | null;
  goles_visita: number | null;
  goleador_real: string | null;
  jugador_tarjeta_real: string | null;
  tipo_tarjeta_real: string | null;
  minuto_primer_gol: number | null;
  estado: MatchStatus;
  room_id: number;
}

export interface CreateMatchPayload {
  equipo_local: string;
  equipo_visita: string;
  fecha_inicio: string;
  room_id: number;
}
