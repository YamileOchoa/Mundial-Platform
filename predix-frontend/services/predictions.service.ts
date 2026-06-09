import api from './api';
import type {
  Prediction,
  PredictionPublic,
  CreatePredictionPayload,
  UpdatePredictionPayload,
} from '@/types/prediction';

export async function getMyPredictions(): Promise<Prediction[]> {
  const { data } = await api.get<Prediction[]>('/predictions/my');
  return data;
}

export async function getMatchPredictions(matchId: number): Promise<PredictionPublic[]> {
  const { data } = await api.get<PredictionPublic[]>('/predictions/', { params: { match_id: matchId } });
  return data;
}

export async function createPrediction(payload: CreatePredictionPayload): Promise<Prediction> {
  const { data } = await api.post<Prediction>('/predictions/', payload);
  return data;
}

export async function updatePrediction(id: number, payload: UpdatePredictionPayload): Promise<Prediction> {
  const { data } = await api.put<Prediction>(`/predictions/${id}`, payload);
  return data;
}
