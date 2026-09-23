import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Quote } from '../../types';
import { XCircle, AlertTriangle } from 'lucide-react';

interface QuoteDeclineModalProps {
  quote: Quote | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDecline: (quoteId: string, reason: string) => void;
}

export const QuoteDeclineModal: React.FC<QuoteDeclineModalProps> = ({
  quote,
  isOpen,
  onClose,
  onConfirmDecline
}) => {
  const [reason, setReason] = useState('Price exceeded budget expectations');
  const [customReason, setCustomReason] = useState('');

  if (!quote) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = reason === 'Other' ? customReason : reason;
    onConfirmDecline(quote.id, finalReason || 'Declined by customer');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Decline Quotation"
      subtitle={`Specify the reason for declining quotation ${quote.id}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 rounded-xl bg-[#FF647C]/10 border border-[#FF647C]/20 flex items-start gap-2.5 text-xs text-[#FF647C]">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Declining will change the status of {quote.id} to "Declined" and log this feedback in the operational pipeline.
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#91A0B8] mb-1.5">
            Primary Reason
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-[#151F33] border border-[#18243A] rounded-xl px-3 py-2 text-xs text-[#F4F7FB] focus:border-[#FF647C] focus:outline-none"
          >
            <option value="Price exceeded budget expectations">Price exceeded budget expectations</option>
            <option value="Timeline / Schedule not fast enough">Timeline / Schedule not fast enough</option>
            <option value="Decided to postpone project">Decided to postpone project</option>
            <option value="Selected another competitor">Selected another competitor</option>
            <option value="Scope of work differed from requirements">Scope of work differed from requirements</option>
            <option value="Other">Other reason...</option>
          </select>
        </div>

        {reason === 'Other' && (
          <div>
            <label className="block text-xs font-semibold text-[#91A0B8] mb-1">
              Detailed Reason
            </label>
            <textarea
              rows={3}
              required
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Describe customer reason..."
              className="w-full bg-[#151F33] border border-[#18243A] rounded-xl px-3 py-2 text-xs text-[#F4F7FB] focus:border-[#FF647C] focus:outline-none resize-none"
            />
          </div>
        )}

        <div className="pt-3 border-t border-[#18243A] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#91A0B8] hover:text-[#F4F7FB]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-[#FF647C] hover:bg-[#FF647C]/90 rounded-xl shadow-lg shadow-[#FF647C]/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
            <span>Confirm Decline</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
