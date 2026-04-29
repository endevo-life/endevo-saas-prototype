'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';

interface ToastItem {
  id: number;
  message: string;
  tone: 'info' | 'success' | 'warn';
}

interface ToastApi {
  toast: (message: string, tone?: ToastItem['tone']) => void;
}

const ToastContext = createContext<ToastApi | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const toast = useCallback<ToastApi['toast']>((message, tone = 'info') => {
    const id = ++idRef.current;
    setItems((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {items.map((t) => (
          <ToastBubble key={t.id} item={t} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastBubble({ item }: { item: ToastItem }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const tint =
    item.tone === 'success'
      ? 'rgba(92,138,111,0.16)'
      : item.tone === 'warn'
      ? 'rgba(166,84,84,0.18)'
      : 'rgba(212,190,148,0.16)';

  const border =
    item.tone === 'success'
      ? '#5C8A6F'
      : item.tone === 'warn'
      ? '#A65454'
      : 'var(--lr-gold)';

  return (
    <div
      className="rounded-[10px] px-4 py-3 max-w-sm transition-all duration-300 pointer-events-auto"
      style={{
        background: `linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)`,
        border: `1px solid ${border}`,
        color: 'var(--lr-pearl)',
        boxShadow: '0 18px 40px -16px rgba(0,0,0,0.55)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(20px)',
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="text-[0.7rem] mt-0.5"
          style={{ color: border }}
        >
          ◆
        </span>
        <div className="flex-1">
          <p className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.22em] uppercase mb-0.5" style={{ color: 'var(--lr-gold-soft)' }}>
            Demo
          </p>
          <p className="text-sm leading-relaxed" style={{ background: tint, padding: '0', borderRadius: 0 }}>
            {item.message}
          </p>
        </div>
      </div>
    </div>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: (msg) => {
        if (typeof window !== 'undefined') console.info('[demo toast]', msg);
      },
    };
  }
  return ctx;
}
