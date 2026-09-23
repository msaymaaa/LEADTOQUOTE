import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-[#0D1424]/50 border border-dashed border-[#18243A] my-6">
      <div className="w-14 h-14 rounded-2xl bg-[#151F33] border border-[#18243A] flex items-center justify-center text-[#6C63FF] mb-4 shadow-inner">
        <Icon className="w-7 h-7 stroke-[1.5]" />
      </div>
      <h4 className="text-base font-semibold text-[#F4F7FB]">{title}</h4>
      <p className="text-sm text-[#91A0B8] max-w-md mt-1.5 leading-relaxed">{description}</p>
      
      {(actionText || secondaryActionText) && (
        <div className="flex items-center gap-3 mt-6">
          {actionText && onAction && (
            <button
              onClick={onAction}
              className="px-4 py-2 text-sm font-medium text-white bg-[#6C63FF] hover:bg-[#6C63FF]/90 rounded-xl transition-all shadow-md shadow-[#6C63FF]/20"
            >
              {actionText}
            </button>
          )}
          {secondaryActionText && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="px-4 py-2 text-sm font-medium text-[#91A0B8] hover:text-[#F4F7FB] bg-[#151F33] hover:bg-[#18243A] rounded-xl transition-colors border border-[#18243A]"
            >
              {secondaryActionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
