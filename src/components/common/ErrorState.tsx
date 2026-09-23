import React from 'react';
import { AlertOctagon, RefreshCw, X } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'Unable to complete this operation. Please verify parameters or retry.',
  onRetry,
  onDismiss
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-[#FF647C]/5 border border-[#FF647C]/20 my-4">
      <div className="w-12 h-12 rounded-xl bg-[#FF647C]/10 text-[#FF647C] flex items-center justify-center mb-3">
        <AlertOctagon className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-[#F4F7FB]">{title}</h4>
      <p className="text-sm text-[#91A0B8] max-w-sm mt-1">{message}</p>
      
      <div className="flex items-center gap-3 mt-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#18243A] hover:bg-[#1E2E4A] rounded-xl transition-all border border-[#1E2E4A]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Action
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex items-center gap-2 px-3 py-2 text-xs text-[#91A0B8] hover:text-[#F4F7FB] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};
