export interface LeaderboardEntry {
  user_id: number;
  nombre: string;
  puntos_total: number;
  racha_actual: number;
}

export interface ScoreHistory {
  id: number;
  user_id: number;
  match_id: number;
  puntos_ganados: number;
  regla_aplicada: string;
  descripcion: string | null;
  created_at: string;
}

export interface ScoreHistoryPublic extends ScoreHistory {
  user_nombre: string;
}
