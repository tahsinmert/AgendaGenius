import React, { useEffect } from 'react';
import { X, Check, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-6 md:bottom-24 z-[60] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icons = {
    success: <Check className="w-4 h-4 text-green-500" />,
    error: <AlertCircle className="w-4 h-4 text-red-500" />,
    info: <Info className="w-4 h-4 text-blue-500" />
  };

  const bgColors = {
    success: 'bg-white dark:bg-zinc-800 border-green-200 dark:border-green-900',
    error: 'bg-white dark:bg-zinc-800 border-red-200 dark:border-red-900',
    info: 'bg-white dark:bg-zinc-800 border-blue-200 dark:border-blue-900'
  };

  return (
    <div className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg shadow-black/5 animate-in slide-in-from-bottom-5 fade-in duration-300 ${bgColors[toast.type]}`}>
      <div className={`p-1 rounded-full ${toast.type === 'success' ? 'bg-green-50 dark:bg-green-900/30' : toast.type === 'error' ? 'bg-red-50 dark:bg-red-900/30' : 'bg-blue-50 dark:bg-blue-900/30'}`}>
        {icons[toast.type]}
      </div>
      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{toast.message}</p>
      <button onClick={() => onRemove(toast.id)} className="ml-2 hover:opacity-70">
        <X className="w-4 h-4 text-zinc-400" />
      </button>
    </div>
  );
};

export default ToastContainer;