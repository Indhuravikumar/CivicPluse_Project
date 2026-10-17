import { create } from 'zustand';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastStore {
  toasts: Toast[];
  add: (t: Omit<Toast, 'id'>) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (t) => set((s) => ({ toasts: [...s.toasts, { ...t, id: crypto.randomUUID() }] })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

export const toast = {
  success: (title: string, description?: string) => useToastStore.getState().add({ title, description, type: 'success' }),
  error: (title: string, description?: string) => useToastStore.getState().add({ title, description, type: 'error' }),
  warning: (title: string, description?: string) => useToastStore.getState().add({ title, description, type: 'warning' }),
  info: (title: string, description?: string) => useToastStore.getState().add({ title, description, type: 'info' }),
};

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const bg = {
  success: 'border-green-200 dark:border-green-800',
  error: 'border-red-200 dark:border-red-800',
  warning: 'border-yellow-200 dark:border-yellow-800',
  info: 'border-blue-200 dark:border-blue-800',
};

function ToastItem({ toast: t }: { toast: Toast }) {
  const remove = useToastStore((s) => s.remove);
  useEffect(() => {
    const timer = setTimeout(() => remove(t.id), 4000);
    return () => clearTimeout(timer);
  }, [t.id, remove]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border bg-card text-card-foreground min-w-72 max-w-sm ${bg[t.type]}`}
    >
      {icons[t.type]}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{t.title}</p>
        {t.description && <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>}
      </div>
      <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-foreground transition-colors">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => <ToastItem key={t.id} toast={t} />)}
      </AnimatePresence>
    </div>
  );
}
