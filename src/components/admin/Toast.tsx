'use client';

import { AlertCircle, Check, X } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type ToastTone = 'success' | 'error';

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  toast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

/** 後台共用的 Toast。不使用瀏覽器原生 alert。 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, tone: ToastTone = 'success') => {
      const id = Date.now() + Math.random();
      setItems((current) => [...current, { id, message, tone }]);
      window.setTimeout(() => dismiss(id), 3600);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:items-end"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 border px-4 py-3 shadow-sm ${
              item.tone === 'error'
                ? 'border-red-900/20 bg-red-50 text-red-900'
                : 'border-ink/15 bg-ink text-paper'
            }`}
          >
            {item.tone === 'error' ? (
              <AlertCircle aria-hidden strokeWidth={1.5} className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <Check aria-hidden strokeWidth={1.5} className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <p className="flex-1 font-sans text-sm leading-relaxed">{item.message}</p>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="關閉提示"
              className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
            >
              <X aria-hidden strokeWidth={1.5} className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast 必須在 ToastProvider 內使用');
  }
  return context;
}
