'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => {
      const newToasts = [...prev, { id, message, type }];
      if (newToasts.length > 3) {
        return newToasts.slice(newToasts.length - 3);
      }
      return newToasts;
    });

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-20 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastItem({ toast, onRemove }: { toast: Toast, onRemove: (id: string) => void }) {
  const config = {
    success: { icon: CheckCircle2, color: 'var(--green)', border: 'border-l-4 border-[var(--green)]' },
    error: { icon: XCircle, color: 'var(--red)', border: 'border-l-4 border-[var(--red)]' },
    warning: { icon: AlertTriangle, color: 'var(--amber)', border: 'border-l-4 border-[var(--amber)]' },
    info: { icon: Info, color: 'var(--cyan)', border: 'border-l-4 border-[var(--cyan)]' },
  }[toast.type];

  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      className={`min-w-[280px] max-w-[360px] bg-[#080C14]/90 backdrop-blur-[20px] border border-[var(--border-2)] rounded-xl py-3 px-4 pointer-events-auto overflow-hidden relative shadow-lg ${config.border}`}
    >
      <div className="flex items-start gap-3">
        <Icon size={18} color={config.color} className="shrink-0 mt-0.5" />
        <p className="text-[13px] text-[var(--text-1)] font-medium leading-relaxed">{toast.message}</p>
      </div>
      
      {/* Auto dismiss progress */}
      <div className="absolute bottom-0 left-0 h-[2px] bg-[var(--border)] w-full">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: 4, ease: 'linear' }}
          className="h-full"
          style={{ backgroundColor: config.color }}
        />
      </div>
    </motion.div>
  );
}
