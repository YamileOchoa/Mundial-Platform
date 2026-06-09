import api from './api';
import type { Reward, RewardPdfResponse } from '@/types/reward';

export async function getMyRewards(): Promise<Reward[]> {
  const { data } = await api.get<Reward[]>('/rewards/my');
  return data;
}

export async function getRewardPdf(rewardId: number): Promise<string> {
  const { data } = await api.get<RewardPdfResponse>(`/rewards/${rewardId}/pdf`);
  return data.pdf_url;
}
