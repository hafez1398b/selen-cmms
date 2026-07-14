import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { I } from './Icon';

type ToastKind = 'success' | 'error' | 'info' | 'warning';
interface Toast { id: number; kind: ToastKind; text: string; }

const Ctx = createContext<{ push: (text: string, kind?: ToastKind) => void } | null>(null);

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast inside ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, kind: ToastKind = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, kind, text }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed top-20 left-4 z-[60] flex flex-col gap-2 max-w-sm">
        {toasts.map(t => {
          const color = t.kind === 'success' ? 'border-emerald-400/40 text-emerald-200' :
            t.kind === 'error' ? 'border-rose-400/40 text-rose-200' :
              t.kind === 'warning' ? 'border-amber-400/40 text-amber-200' :
                'border-sky-400/40 text-sky-200';
          const Icon = t.kind === 'success' ? I.Check : t.kind === 'error' ? I.X : I.Alert;
          return (
            <div key={t.id} className={`surface ring-gold rounded-xl px-4 py-3 flex items-start gap-3 ${color}`}>
              <Icon size={18} />
              <p className="text-sm flex-1">{t.text}</p>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}
