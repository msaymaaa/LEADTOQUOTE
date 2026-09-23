import React from 'react';
import { Modal } from '../common/Modal';
import { Quote } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { CheckCircle2, XCircle, ShieldCheck, Printer, ArrowLeft } from 'lucide-react';
import { formatPKR } from '../../lib/currency';

interface CustomerQuoteViewModalProps {
  quote: Quote | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (quote: Quote) => void;
  onDecline: (quote: Quote) => void;
}

export const CustomerQuoteViewModal: React.FC<CustomerQuoteViewModalProps> = ({
  quote,
  isOpen,
  onClose,
  onApprove,
  onDecline
}) => {
  if (!quote) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Client Portal — Official Proposal"
      subtitle="Public customer approval experience"
      maxWidth="3xl"
    >
      {/* Container simulating a standalone customer document */}
      <div className="bg-[#080D18] border border-[#18243A] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-[#18243A] gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#6C63FF] flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                L
              </div>
              <span className="text-base font-extrabold tracking-wider text-[#F4F7FB]">
                LEADTOQUOTE
              </span>
            </div>
            <p className="text-xs text-[#91A0B8] mt-1 italic">
              "From First Lead to Final Payment."
            </p>
            <p className="text-[11px] text-[#91A0B8]/80 mt-1">
              Industrial & Commercial Field Operations Group
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-xs font-mono font-bold text-[#39D9FF] block">
              {quote.id}
            </span>
            <div className="text-xs text-[#91A0B8] mt-1">
              Date: <span className="text-[#F4F7FB]">{quote.createdAt}</span>
            </div>
            <div className="text-xs text-[#91A0B8]">
              Valid Until: <span className="text-[#F5B942] font-semibold">{quote.validUntil}</span>
            </div>
            <div className="mt-2">
              <StatusBadge status={quote.status} />
            </div>
          </div>
        </div>

        {/* Customer & Prepared For */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 text-xs">
          <div className="p-4 rounded-xl bg-[#0D1424] border border-[#18243A]">
            <span className="text-[11px] font-bold text-[#91A0B8] uppercase tracking-wider block mb-2">
              Prepared For
            </span>
            <div className="text-sm font-semibold text-[#F4F7FB]">{quote.customerName}</div>
            <div className="text-[#91A0B8] mt-1">{quote.customerEmail}</div>
            <div className="text-[#91A0B8]">{quote.customerPhone}</div>
            <div className="text-[#91A0B8] mt-1">{quote.location}</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0D1424] border border-[#18243A]">
            <span className="text-[11px] font-bold text-[#91A0B8] uppercase tracking-wider block mb-2">
              Service Scope
            </span>
            <div className="text-sm font-semibold text-[#F4F7FB]">{quote.serviceTitle}</div>
            <p className="text-[#91A0B8] mt-1 leading-relaxed">{quote.serviceDescription}</p>
          </div>
        </div>

        {/* Line Items */}
        <div className="rounded-xl border border-[#18243A] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D1424] text-[#91A0B8] border-b border-[#18243A]">
              <tr>
                <th className="py-2.5 px-4">Item & Description</th>
                <th className="py-2.5 px-4 text-center">Qty</th>
                <th className="py-2.5 px-4 text-right">Unit Rate</th>
                <th className="py-2.5 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#18243A]/60">
              {quote.lineItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#0D1424]/40">
                  <td className="py-3 px-4 text-[#F4F7FB] font-medium">
                    {item.description}
                  </td>
                  <td className="py-3 px-4 text-center text-[#91A0B8]">{item.quantity}</td>
                  <td className="py-3 px-4 text-right font-mono text-[#91A0B8]">
                    {formatPKR(item.unitPrice)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-[#F4F7FB]">
                    {formatPKR(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pricing Totals */}
          <div className="p-4 bg-[#0D1424] border-t border-[#18243A] flex justify-end">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#91A0B8]">
                <span>Subtotal</span>
                <span className="font-mono">{formatPKR(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#91A0B8]">
                <span>Sales Tax / Fees</span>
                <span className="font-mono">{formatPKR(quote.tax)}</span>
              </div>
              <div className="pt-2 border-t border-[#18243A] flex justify-between font-bold text-sm text-[#F4F7FB]">
                <span>Total Due</span>
                <span className="font-mono text-lg text-[#35D07F]">
                  {formatPKR(quote.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Guarantee Note */}
        <div className="mt-4 p-3 rounded-xl bg-[#0D1424] border border-[#18243A] flex items-center gap-2.5 text-xs text-[#91A0B8]">
          <ShieldCheck className="w-4 h-4 text-[#35D07F] shrink-0" />
          <span>
            Includes 12-month craftsmanship guarantee and certified technician dispatch coverage.
          </span>
        </div>

        {/* Two Prominent Customer Actions (Requirement #12) */}
        <div className="mt-8 pt-6 border-t border-[#18243A] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#91A0B8]">
            Need adjustments? Call our operations desk directly at +92 42 3587 0199.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => onDecline(quote)}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-semibold text-[#FF647C] bg-[#FF647C]/10 hover:bg-[#FF647C]/20 border border-[#FF647C]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>Decline Quote</span>
            </button>

            <button
              onClick={() => onApprove(quote)}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold text-black bg-[#35D07F] hover:bg-[#35D07F]/90 shadow-xl shadow-[#35D07F]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Quote</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
