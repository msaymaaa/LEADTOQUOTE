import React from 'react';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { Quote } from '../../types';
import { formatPKR } from '../../lib/currency';
import {
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Printer,
  Send,
  ExternalLink,
  DollarSign
} from 'lucide-react';

interface QuoteDetailModalProps {
  quote: Quote | null;
  isOpen: boolean;
  onClose: () => void;
  onApproveClick: (quote: Quote) => void;
  onDeclineClick: (quote: Quote) => void;
  onSendQuote: (quote: Quote) => void;
  onOpenCustomerPreview: (quote: Quote) => void;
  onPrintPdf: (quote: Quote) => void;
}

export const QuoteDetailModal: React.FC<QuoteDetailModalProps> = ({
  quote,
  isOpen,
  onClose,
  onApproveClick,
  onDeclineClick,
  onSendQuote,
  onOpenCustomerPreview,
  onPrintPdf
}) => {
  if (!quote) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Quotation Specification: ${quote.id}`}
      subtitle={`Created on ${quote.createdAt} • Valid until ${quote.validUntil}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Top Operational Status Bar */}
        <div className="p-4 rounded-2xl bg-[#080D18] border border-[#18243A] flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-[#91A0B8] uppercase tracking-wider block">
              Quotation Status
            </span>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={quote.status} />
              {quote.declineReason && (
                <span className="text-xs text-[#FF647C] italic">
                  (Reason: {quote.declineReason})
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onOpenCustomerPreview(quote)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#39D9FF] bg-[#39D9FF]/10 hover:bg-[#39D9FF]/20 border border-[#39D9FF]/30 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Open public customer portal preview"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Customer Portal View</span>
            </button>

            <button
              onClick={() => onPrintPdf(quote)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#91A0B8] hover:text-[#F4F7FB] bg-[#151F33] hover:bg-[#18243A] border border-[#18243A] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print PDF</span>
            </button>
          </div>
        </div>

        {/* Customer & Location Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#0D1424] border border-[#18243A] space-y-2">
            <span className="text-xs font-bold text-[#39D9FF] uppercase tracking-wider block">
              Customer Information
            </span>
            <div className="text-xs space-y-1.5 text-[#91A0B8]">
              <div className="text-sm font-semibold text-[#F4F7FB]">{quote.customerName}</div>
              <div>{quote.customerEmail}</div>
              <div>{quote.customerPhone}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D1424] border border-[#18243A] space-y-2">
            <span className="text-xs font-bold text-[#6C63FF] uppercase tracking-wider block">
              Service Target
            </span>
            <div className="text-xs space-y-1.5 text-[#91A0B8]">
              <div className="text-sm font-semibold text-[#F4F7FB]">{quote.serviceTitle}</div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#91A0B8]" />
                <span>{quote.location}</span>
              </div>
              <div className="text-[11px] text-[#91A0B8]/80 leading-relaxed">
                {quote.serviceDescription}
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Table (Prompt #11: Labor, Parts, Travel, Additional Services, Tax, Subtotal, Tax, Total) */}
        <div className="rounded-2xl bg-[#080D18] border border-[#18243A] overflow-hidden">
          <div className="px-4 py-3 bg-[#0D1424] border-b border-[#18243A] flex items-center justify-between">
            <span className="text-xs font-bold text-[#F4F7FB] tracking-wider uppercase">
              Quotation Line Items Breakdown
            </span>
            <span className="text-xs text-[#91A0B8]">{quote.lineItems.length} items</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#18243A] text-[#91A0B8] bg-[#080D18]/50">
                <tr>
                  <th className="py-2.5 px-4">Item & Description</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4 text-center">Qty / Hrs</th>
                  <th className="py-2.5 px-4 text-right">Unit Rate</th>
                  <th className="py-2.5 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18243A]/60">
                {quote.lineItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#151F33]/30">
                    <td className="py-3 px-4 font-medium text-[#F4F7FB]">{item.description}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#151F33] text-[#91A0B8] border border-white/5">
                        {item.category}
                      </span>
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
          </div>

          {/* Pricing Totals Summary */}
          <div className="p-4 bg-[#0D1424] border-t border-[#18243A] flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-[#91A0B8]">
                <span>Subtotal</span>
                <span className="font-mono">{formatPKR(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#91A0B8]">
                <span>Tax (Standard)</span>
                <span className="font-mono">{formatPKR(quote.tax)}</span>
              </div>
              <div className="pt-2 border-t border-[#18243A] flex justify-between font-bold text-sm text-[#F4F7FB]">
                <span>TOTAL</span>
                <span className="font-mono text-base text-[#35D07F]">
                  {formatPKR(quote.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {quote.notes && (
          <div className="p-3 rounded-xl bg-[#151F33]/40 border border-[#18243A] text-xs text-[#91A0B8]">
            <span className="font-semibold text-[#F4F7FB] block mb-0.5">Commercial Terms:</span>
            {quote.notes}
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-4 border-t border-[#18243A] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSendQuote(quote)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#F4F7FB] bg-[#151F33] hover:bg-[#18243A] border border-[#18243A] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-[#39D9FF]" />
              <span>Send Quote to Client</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {quote.status !== 'Declined' && (
              <button
                onClick={() => onDeclineClick(quote)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#FF647C] bg-[#FF647C]/10 hover:bg-[#FF647C]/20 border border-[#FF647C]/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Decline</span>
              </button>
            )}

            {quote.status !== 'Approved' && (
              <button
                onClick={() => onApproveClick(quote)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-black bg-[#35D07F] hover:bg-[#35D07F]/90 shadow-lg shadow-[#35D07F]/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Quotation</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
