'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Send, Bot, User, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { sendChatMessage, type ChatMessage } from '@/services/chat.service';

const DAILY_LIMIT = 10;

export default function ChatPage() {
  const [messages, setMessages]       = useState<ChatMessage[]>([]);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [usedToday, setUsedToday]     = useState(0);
  const bottomRef                     = useRef<HTMLDivElement>(null);
  const inputRef                      = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading || usedToday >= DAILY_LIMIT) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(text);
      setMessages(prev => [...prev, { role: 'assistant', content: res.response }]);
      setUsedToday(res.messages_today);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: detail ?? 'Ocurrio un error. Intenta de nuevo.',
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const remaining = DAILY_LIMIT - usedToday;
  const exhausted = usedToday >= DAILY_LIMIT;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col pb-4">

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Chat IA</h1>
          <p className="text-sm text-slate-500">Asistente de futbol — pregunta lo que quieras del Mundial</p>
        </div>
        <div className={`rounded-full px-3 py-1 text-xs font-semibold ${
          remaining <= 2 ? 'bg-danger-light text-red-700' :
          remaining <= 5 ? 'bg-warning-light text-amber-700' :
          'bg-slate-100 text-slate-500'
        }`}>
          {remaining}/{DAILY_LIMIT} mensajes hoy
        </div>
      </div>

      {/* Mensaje area */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-4">

        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-xlight">
              <Bot size={28} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-slate-700">Asistente PREDIX</p>
              <p className="text-sm text-slate-400">
                Hazme preguntas sobre el Mundial 2026, estadisticas, equipos o predicciones.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {['¿Quien es favorito para ganar?', '¿Cuantos equipos hay en cada grupo?', '¿Como funciona el sistema de puntos?'].map(q => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:border-primary hover:text-primary transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${
              msg.role === 'assistant' ? 'bg-primary-xlight text-primary' : 'bg-slate-200 text-slate-600'
            }`}>
              {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
            </div>
            <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'rounded-tr-sm bg-primary text-white'
                : 'rounded-tl-sm bg-white border border-slate-100 text-slate-800 shadow-card'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-xlight text-primary">
              <Bot size={14} />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-white border border-slate-100 px-4 py-3 shadow-card">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {exhausted ? (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-warning-light px-4 py-3 text-sm text-amber-700">
          <AlertCircle size={16} />
          Alcanzaste el limite de {DAILY_LIMIT} mensajes por hoy. Vuelve manana.
        </div>
      ) : (
        <form onSubmit={sendMessage} className="mt-3 flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Pregunta sobre el Mundial 2026..."
            className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            disabled={loading}
            maxLength={500}
          />
          <Button type="submit" loading={loading} disabled={!input.trim()}>
            <Send size={16} />
          </Button>
        </form>
      )}
    </div>
  );
}
