import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, UserCheck, Check, DollarSign } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload?: string) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'approve' | 'decline' | 'assign' | 'complete' | 'payment' | 'danger';
  requireReason?: boolean;
  reasonPlaceholder?: string;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'approve',
  requireReason = false,
  reasonPlaceholder = 'Please state the reason...'
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setError('Please provide a reason to continue.');
      return;
    }
    onConfirm(reason);
    onClose();
  };

  const getIconAndColor = () => {
    switch (type) {
      case 'approve':
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-[#35D07F]" />,
          bg: 'bg-[#35D07F]/10 border-[#35D07F]/30',
          btn: 'bg-[#35D07F] hover:bg-[#35D07F]/90 text-black font-semibold'
        };
      case 'decline':
      case 'danger':
        return {
          icon: <XCircle className="w-6 h-6 text-[#FF647C]" />,
          bg: 'bg-[#FF647C]/10 border-[#FF647C]/30',
          btn: 'bg-[#FF647C] hover:bg-[#FF647C]/90 text-white font-semibold'
        };
      case 'payment':
        return {
          icon: <DollarSign className="w-6 h-6 text-[#35D07F]" />,
          bg: 'bg-[#35D07F]/10 border-[#35D07F]/30',
          btn: 'bg-[#35D07F] hover:bg-[#35D07F]/90 text-black font-semibold'
        };
      case 'assign':
        return {
          icon: <UserCheck className="w-6 h-6 text-[#39D9FF]" />,
          bg: 'bg-[#39D9FF]/10 border-[#39D9FF]/30',
          btn: 'bg-[#39D9FF] hover:bg-[#39D9FF]/90 text-black font-semibold'
        };
      case 'complete':
        return {
          icon: <Check className="w-6 h-6 text-[#35D07F]" />,
          bg: 'bg-[#35D07F]/10 border-[#35D07F]/30',
          btn: 'bg-[#35D07F] hover:bg-[#35D07F]/90 text-black font-semibold'
        };
      default:
        return {
          icon: <AlertTriangle className="w-6 h-6 text-[#F5B942]" />,
          bg: 'bg-[#F5B942]/10 border-[#F5B942]/30',
          btn: 'bg-[#6C63FF] hover:bg-[#6C63FF]/90 text-white font-semibold'
        };
    }
  };

  const style = getIconAndColor();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#080D18]/85 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0D1424] border border-[#18243A] rounded-2xl p-6 shadow-2xl z-10">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl border ${style.bg} shrink-0`}>
            {style.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-[#F4F7FB]">{title}</h4>
            <p className="text-sm text-[#91A0B8] mt-1.5 leading-relaxed">{description}</p>
          </div>
        </div>

        {requireReason && (
          <div className="mt-4">
            <label className="block text-xs font-medium text-[#91A0B8] mb-1.5">
              Decline Reason / Explanation <span className="text-[#FF647C]">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder={reasonPlaceholder}
              className="w-full rounded-xl bg-[#151F33] border border-[#18243A] px-3 py-2 text-sm text-[#F4F7FB] placeholder-[#91A0B8]/50 focus:outline-none focus:border-[#6C63FF] transition-colors resize-none"
            />
            {error && <p className="text-xs text-[#FF647C] mt-1">{error}</p>}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#91A0B8] hover:text-[#F4F7FB] hover:bg-[#151F33] rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-5 py-2 text-sm rounded-xl transition-all shadow-lg ${style.btn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
