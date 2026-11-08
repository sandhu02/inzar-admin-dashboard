'use client';

import * as React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  toast: (toast: Omit<ToastItem, 'id'>) => string;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (newToast: Omit<ToastItem, 'id'>) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const item: ToastItem = { ...newToast, id };
      setToasts((prev) => [...prev, item]);

      const duration = newToast.durationMs ?? 4000;
      setTimeout(() => {
        dismiss(id);
      }, duration);

      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    // Graceful fallback if called outside provider
    return {
      toasts: [],
      toast: (t: Omit<ToastItem, 'id'>) => {
        console.info(`[Toast: ${t.variant || 'info'}] ${t.title}${t.description ? ` - ${t.description}` : ''}`);
        return 'fallback_id';
      },
      dismiss: () => {},
    };
  }
  return context;
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} onDismiss={() => onDismiss(item.id)} />
      ))}
    </div>
  );
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const variantIcons: Record<ToastVariant, React.ComponentType<{ className?: string }>> = {
    default: Info,
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    danger: AlertCircle,
  };

  const variantStyles: Record<ToastVariant, string> = {
    default: 'border-border bg-card text-foreground',
    info: 'border-status-info/30 bg-card text-foreground',
    success: 'border-status-success/40 bg-card text-foreground',
    warning: 'border-status-warning/40 bg-card text-foreground',
    danger: 'border-status-danger/40 bg-card text-foreground',
  };

  const iconColors: Record<ToastVariant, string> = {
    default: 'text-muted-foreground',
    info: 'text-status-info',
    success: 'text-status-success',
    warning: 'text-status-warning',
    danger: 'text-status-danger',
  };

  const variant = item.variant || 'default';
  const Icon = variantIcons[variant];

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg bg-surface-elevated/95 backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-3 duration-200',
        variantStyles[variant]
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', iconColors[variant])} />
      <div className="flex-1 min-w-0 pr-1">
        <h4 className="text-sm font-sans font-semibold text-foreground tracking-tight">
          {item.title}
        </h4>
        {item.description && (
          <p className="text-xs font-sans text-muted-foreground mt-0.5 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-muted-foreground hover:text-foreground rounded p-0.5 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
