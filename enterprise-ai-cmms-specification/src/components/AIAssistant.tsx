import { useState, useEffect, useRef } from 'react';
import { useApp } from '../lib/store';
import { I } from './Icon';
import { uid, timeAgo, faNum } from '../lib/utils';
import { answerQuestion, type ChatMessage, type AssistantContext } from '../lib/assistant';

interface Props {
  context: AssistantContext;
}

const STORAGE_KEY = 'baspar_assistant_chat_v1';

export function AIAssistant({ context }: Props) {
  const { equipment, workOrders, pms, parts, users, currentUser } = useApp();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) return JSON.parse(s);
    } catch { /* */ }
    return [{
      id: uid('m'),
      role: 'assistant',
      content: '👋 سلام! من **دستیار هوش مصنوعی بسپارفوم غرب** هستم.\n\nمن می‌توانم در تشخیص علل خرابی، توضیح شاخص‌های KPI، تحلیل وضعیت و ارائه راهکار کمک کنم. سوال خود را بپرسید!',
      at: new Date().toISOString(),
      suggestions: ['وضعیت کارخانه چطوره؟', 'MTBF را توضیح بده', 'چطور خرابی پمپ را رفع کنم؟', 'دستور کارهای معوق'],
    }];
  });
  const [typing, setTyping] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [unreadHint, setUnreadHint] = useState(0);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50))); } catch { /* */ }
  }, [messages]);

  useEffect(() => {
    if (open && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, open, typing]);

  useEffect(() => {
    if (open) {
      setUnreadHint(0);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open, minimized]);

  const send = (text?: string) => {
    const q = (text ?? input).trim();
    if (!q) return;
    const userMsg: ChatMessage = { id: uid('m'), role: 'user', content: q, at: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const resp = answerQuestion(q, { equipment, workOrders, pms, parts, users, context });
      const blocks = resp.blocks ? '\n\n' + resp.blocks.map(b => {
        if (b.type === 'list') return `${b.title ? '**' + b.title + '**\n' : ''}${(b.items || []).map(i => '• ' + i).join('\n')}`;
        if (b.type === 'metric') return `**${b.title}:** ${b.value}`;
        if (b.type === 'warning') return `⚠ **${b.title || 'هشدار'}:** ${b.value}`;
        if (b.type === 'success') return `✓ **${b.title || 'موفق'}:** ${b.value}`;
        if (b.type === 'code') return '```\n' + b.value + '\n```';
        return '';
      }).join('\n\n') : '';

      const reply: ChatMessage = {
        id: uid('m'), role: 'assistant',
        content: resp.text + blocks,
        at: new Date().toISOString(),
        context, suggestions: resp.suggestions,
      };
      setMessages(prev => [...prev, reply]);
      setTyping(false);
      if (!open) setUnreadHint(prev => prev + 1);
    }, 400 + Math.random() * 400);
  };

  const reset = () => {
    setMessages([{
      id: uid('m'), role: 'assistant',
      content: `سلام مجدد ${currentUser?.name?.split(' ')[1] ?? ''}! 👋 چطور می‌توانم کمک کنم؟`,
      at: new Date().toISOString(),
      suggestions: ['وضعیت کارخانه چطوره؟', 'MTBF', 'دستور کارهای معوق'],
    }]);
  };

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setMinimized(false); }}
        className="fixed bottom-4 left-4 z-40 group"
        title="دستیار هوش مصنوعی"
      >
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-300 to-amber-700 flex items-center justify-center text-ink-900 shadow-2xl gold-glow pulse-gold group-hover:scale-110 transition">
            <I.AI size={24} />
          </div>
          {unreadHint > 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center border-2 border-ink-900">
              {faNum(unreadHint)}
            </div>
          )}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 surface ring-gold rounded-lg px-3 py-1.5 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
            <span className="text-amber-200 font-bold">دستیار AI</span> — کلیک کنید
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 left-4 z-40 surface ring-gold rounded-2xl flex flex-col shadow-2xl transition-all overflow-hidden ${minimized ? 'w-64 h-14' : 'w-[380px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-2rem)]'}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-amber-500/15 flex items-center gap-3 bg-gradient-to-l from-amber-500/10 to-transparent">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 to-amber-700 flex items-center justify-center text-ink-900 shrink-0">
          <I.AI size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-gold-gradient truncate">دستیار هوشمند</div>
          <div className="text-[10px] text-amber-300/80 truncate">
            {typing ? '✏ در حال نوشتن...' : '● آنلاین'}
          </div>
        </div>
        <button onClick={reset} className="p-1.5 rounded-lg hover:bg-amber-500/10 text-amber-300" title="چت جدید">
          <I.Plus size={14} />
        </button>
        <button onClick={() => setMinimized(!minimized)} className="p-1.5 rounded-lg hover:bg-amber-500/10 text-amber-300" title={minimized ? 'بازشو' : 'بسته'}>
          <I.ChevronDown size={14} className={`transition ${minimized ? 'rotate-180' : ''}`} />
        </button>
        <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-amber-500/10 text-amber-300" title="بستن">
          <I.X size={14} />
        </button>
      </div>

      {!minimized && (
        <>
          {/* Body */}
          <div ref={bodyRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map(m => (
              <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  m.role === 'user'
                    ? 'bg-gradient-to-br from-amber-300 to-amber-700 text-ink-900'
                    : 'bg-amber-500/15 text-amber-300'
                }`}>
                  {m.role === 'user' ? (currentUser?.name.charAt(0) ?? 'م') : <I.AI size={12} />}
                </div>
                <div className={`flex-1 min-w-0 ${m.role === 'user' ? 'text-left' : ''}`}>
                  <div className={`inline-block rounded-2xl px-3 py-2 max-w-[90%] ${
                    m.role === 'user'
                      ? 'bg-amber-500/15 text-amber-100 rounded-tr-sm'
                      : 'surface-soft text-ink-100 rounded-tl-sm'
                  }`}>
                    <FormattedContent text={m.content} />
                  </div>
                  <div className="text-[9px] text-ink-500 mt-1 px-2">{timeAgo(m.at)}</div>
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {m.suggestions.map(s => (
                        <button key={s} onClick={() => send(s)}
                          className="text-[10px] px-2 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 border border-amber-500/25 transition">
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-500/15 text-amber-300 flex items-center justify-center"><I.AI size={12} /></div>
                <div className="surface-soft rounded-2xl px-3 py-2.5 rounded-tl-sm">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={e => { e.preventDefault(); send(); }} className="p-3 border-t border-amber-500/15">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="سوال خود را بپرسید..."
                className="input-dark py-2 text-sm flex-1"
              />
              <button type="submit" disabled={!input.trim()}
                className="btn-gold px-4 rounded-lg text-xs disabled:opacity-50 shrink-0">
                <I.Chevron size={14} className="rotate-180" />
              </button>
            </div>
            <div className="text-[9px] text-ink-500 mt-1.5 text-center">
              💡 می‌توانید درباره خرابی، شاخص‌ها، یا وضعیت تجهیزات بپرسید
            </div>
          </form>
        </>
      )}
    </div>
  );
}

// Simple markdown-like formatter
function FormattedContent({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="text-xs leading-6 whitespace-pre-wrap break-words">
      {lines.map((line, i) => {
        // Bold **text**
        const parts = line.split(/\*\*(.+?)\*\*/g);
        return (
          <div key={i}>
            {parts.map((p, j) => j % 2 === 1
              ? <span key={j} className="font-bold text-amber-200">{p}</span>
              : <span key={j}>{p}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
