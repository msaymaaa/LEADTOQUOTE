import React from 'react';
import { ToastMessage } from '../../types';
import { CheckCircle2, Info, AlertTriangle, AlertCircle, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-5 h-5 text-[#35D07F]" />;
        let borderClass = 'border-[#35D07F]/40';

        if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-[#FF647C]" />;
          borderClass = 'border-[#FF647C]/40';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-[#F5B942]" />;
          borderClass = 'border-[#F5B942]/40';
        } else if (toast.type === 'info') {
          icon = <Info className="w-5 h-5 text-[#39D9FF]" />;
          borderClass = 'border-[#39D9FF]/40';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-[#0D1424]/95 backdrop-blur-md border ${borderClass} shadow-xl shadow-black/60 transition-all transform animate-in slide-in-from-bottom-3 duration-200`}
          >
            <div className="shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-semibold text-[#F4F7FB]">{toast.title}</h5>
              <p className="text-xs text-[#91A0B8] mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#91A0B8] hover:text-[#F4F7FB] p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
