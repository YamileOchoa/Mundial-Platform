import api from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  response: string;
  messages_today: number;
  limit: number;
}

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>('/chat/message', { message });
  return data;
}
