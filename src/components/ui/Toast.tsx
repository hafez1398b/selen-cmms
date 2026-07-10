"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, XCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (t: Omit<Toast, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...t, id }]);
    setTimeout(() => removeToast(id), 4000);
  }, []);

  const success = useCallback((title: string, message?: string) => {
    toast({ type: "success", title, message });
  }, [toast]);

  const error = useCallback((title: string, message?: string) => {
    toast({ type: "error", title, message });
  }, [toast]);

  const info = useCallback((title: string, message?: string) => {
    toast({ type: "info", title, message });
  }, [toast]);

  const warning = useCallback((title: string, message?: string) => {
    toast({ type: "warning", title, message });
  }, [toast]);

  const iconMap = {
    success: CheckCircle2,
    error: XCircle,
    info: Info,
    warning: AlertCircle,
  };

  const colorMap = {
    success: "border-green-500/40 bg-green-500/10 text-green-500",
    error: "border-red-500/40 bg-red-500/10 text-red-500",
    info: "border-blue-500/40 bg-blue-500/10 text-blue-500",
    warning: "border-amber-500/40 bg-amber-500/10 text-amber-500",
  };

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      <div className="fixed top-16 md:top-20 left-4 md:left-6 z-[2000] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => {
          const Icon = iconMap[t.type];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-3 pr-4 min-w-[280px] max-w-[400px] rounded-xl border shadow-2xl backdrop-blur-lg bg-white/95 dark:bg-[#111]/95 ${colorMap[t.type]} animate-slide-in`}
            >
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{t.title}</p>
                {t.message && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{t.message}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-gray-500 flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
