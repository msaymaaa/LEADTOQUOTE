import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Invoice } from '../../types';
import { DollarSign, CreditCard, Landmark, CheckCircle2, FileCheck, Smartphone } from 'lucide-react';
import { formatPKR } from '../../lib/currency';

interface RecordPaymentModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: (invoiceId: string, paymentMethod: string, amount: number) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onConfirmPayment
}) => {
  const [method, setMethod] = useState<'Bank Transfer / Raast' | 'Credit Card' | 'JazzCash / EasyPaisa' | 'Cash'>('Bank Transfer / Raast');
  const [reference, setReference] = useState('REF-PK-' + Math.floor(100000 + Math.random() * 900000));
  const [notes, setNotes] = useState('Payment collected & reconciled successfully in PKR.');

  if (!invoice) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmPayment(invoice.id, method, invoice.amount);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Payment Settlement"
      subtitle={`Settle balance for ${invoice.id} • Customer: ${invoice.customerName}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount to settle */}
        <div className="p-4 rounded-2xl bg-[#080D18] border border-[#18243A] text-center">
          <span className="text-[11px] font-semibold text-[#91A0B8] uppercase tracking-wider block">
            Payment Amount Due
          </span>
          <span className="text-3xl font-mono font-extrabold text-[#35D07F] mt-1 block">
            {formatPKR(invoice.amount)}
          </span>
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="block text-xs font-semibold text-[#91A0B8] mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'Bank Transfer / Raast', icon: Landmark },
              { id: 'JazzCash / EasyPaisa', icon: Smartphone },
              { id: 'Credit Card', icon: CreditCard },
              { id: 'Cash', icon: DollarSign }
            ].map(({ id, icon: Icon }) => (
              <button
                type="button"
                key={id}
                onClick={() => setMethod(id as any)}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  method === id
                    ? 'bg-[#18243A] border-[#35D07F] text-[#35D07F] shadow-sm'
                    : 'bg-[#0D1424] border-[#18243A] text-[#91A0B8] hover:text-[#F4F7FB]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reference / Transaction ID */}
        <div>
          <label className="block text-xs font-semibold text-[#91A0B8] mb-1">
            Transaction Reference / Check #
          </label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full bg-[#151F33] border border-[#18243A] rounded-xl px-3 py-2 text-xs font-mono text-[#F4F7FB] focus:outline-none focus:border-[#35D07F]"
          />
        </div>

        {/* Internal Settlement Note */}
        <div>
          <label className="block text-xs font-semibold text-[#91A0B8] mb-1">
            Accounting Note
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-[#151F33] border border-[#18243A] rounded-xl px-3 py-2 text-xs text-[#F4F7FB] focus:outline-none focus:border-[#35D07F]"
          />
        </div>

        {/* Submit */}
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
            className="px-5 py-2 text-xs font-bold text-black bg-[#35D07F] hover:bg-[#35D07F]/90 rounded-xl shadow-lg shadow-[#35D07F]/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm & Reconcile</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
