export interface Prediction {
  id: number;
  user_id: number;
  match_id: number;
  goles_local_pred: number;
  goles_visita_pred: number;
  goleador_pred: string | null;
  jugador_tarjeta_pred: string | null;
  tipo_tarjeta_pred: string | null;
  minuto_gol_pred: number | null;
  fecha_prediccion: string;
}

export interface PredictionPublic extends Prediction {
  user_nombre: string;
}

export interface CreatePredictionPayload {
  match_id: number;
  goles_local_pred: number;
  goles_visita_pred: number;
  goleador_pred?: string;
  jugador_tarjeta_pred?: string;
  tipo_tarjeta_pred?: string;
  minuto_gol_pred?: number;
}

export interface UpdatePredictionPayload {
  goles_local_pred?: number;
  goles_visita_pred?: number;
  goleador_pred?: string;
  jugador_tarjeta_pred?: string;
  tipo_tarjeta_pred?: string;
  minuto_gol_pred?: number;
}
