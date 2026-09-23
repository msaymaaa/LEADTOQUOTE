import React from 'react';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { Invoice } from '../../types';
import { Printer, Download, CreditCard, Send, CheckCircle2 } from 'lucide-react';
import { formatPKR } from '../../lib/currency';

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onRecordPaymentClick: (invoice: Invoice) => void;
  onSendReminderClick: (invoice: Invoice) => void;
  onPrintInvoice: (invoice: Invoice) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onRecordPaymentClick,
  onSendReminderClick,
  onPrintInvoice
}) => {
  if (!invoice) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Commercial Invoice: ${invoice.id}`}
      subtitle={`Billing Record for Work Order ${invoice.jobId}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Invoice Statement Box */}
        <div className="p-6 rounded-2xl bg-[#080D18] border border-[#18243A] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#18243A]">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#6C63FF] text-white flex items-center justify-center font-extrabold text-xs">
                  L
                </div>
                <span className="font-extrabold tracking-wider text-[#F4F7FB] text-sm">
                  LEADTOQUOTE
                </span>
              </div>
              <span className="text-xs text-[#91A0B8] block mt-1">
                Operations & Invoicing Desk
              </span>
            </div>

            <div className="sm:text-right">
              <span className="font-mono text-sm font-bold text-[#35D07F] block">
                {invoice.id}
              </span>
              <div className="text-xs text-[#91A0B8] mt-1">
                Issued: <span className="text-[#F4F7FB]">{invoice.issuedDate || invoice.issueDate || 'Sep 18, 2026'}</span>
              </div>
              <div className="text-xs text-[#91A0B8]">
                Due: <span className="text-[#FF647C] font-semibold">{invoice.dueDate}</span>
              </div>
              <div className="mt-2">
                <StatusBadge status={invoice.status} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-[#0D1424] border border-[#18243A]">
              <span className="text-[11px] font-bold text-[#91A0B8] uppercase block mb-1">
                Billed To
              </span>
              <div className="font-semibold text-[#F4F7FB] text-sm">{invoice.customerName}</div>
              <div className="text-[#91A0B8] mt-0.5">{invoice.customerEmail || 'Commercial Account Reference'}</div>
            </div>

            <div className="p-3 rounded-xl bg-[#0D1424] border border-[#18243A]">
              <span className="text-[11px] font-bold text-[#91A0B8] uppercase block mb-1">
                Service Order Summary
              </span>
              <div className="font-medium text-[#F4F7FB]">{invoice.serviceDescription || 'Field Service & Diagnostics'}</div>
              <div className="text-[11px] text-[#39D9FF] mt-1">Order Ref: {invoice.jobId}</div>
            </div>
          </div>

          {/* Amount Balance */}
          <div className="p-4 rounded-xl bg-[#0D1424] border border-[#18243A] flex items-center justify-between">
            <div>
              <span className="text-xs text-[#91A0B8] block">Total Invoiced Balance</span>
              {invoice.paidDate && (
                <span className="text-[11px] text-[#35D07F]">
                  Paid on {invoice.paidDate} {invoice.paymentMethod ? `(${invoice.paymentMethod})` : ''}
                </span>
              )}
            </div>
            <span className="font-mono text-2xl font-bold text-[#35D07F]">
              {formatPKR(invoice.amount)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintInvoice(invoice)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#91A0B8] hover:text-[#F4F7FB] bg-[#151F33] hover:bg-[#18243A] border border-[#18243A] flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={() => onSendReminderClick(invoice)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#F4F7FB] bg-[#151F33] hover:bg-[#18243A] border border-[#18243A] flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-[#39D9FF]" />
              <span>Send Reminder</span>
            </button>
          </div>

          {invoice.status !== 'Paid' && (
            <button
              onClick={() => onRecordPaymentClick(invoice)}
              className="px-5 py-2 rounded-xl text-xs font-bold text-black bg-[#35D07F] hover:bg-[#35D07F]/90 shadow-lg shadow-[#35D07F]/20 flex items-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Record Payment</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
