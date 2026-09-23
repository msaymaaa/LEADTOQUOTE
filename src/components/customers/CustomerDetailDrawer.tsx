import React from 'react';
import { Drawer } from '../common/Drawer';
import { StatusBadge } from '../common/StatusBadge';
import { Customer, Job, Quote } from '../../types';
import {
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Briefcase,
  FileText,
  Calendar,
  PlusCircle,
  ExternalLink
} from 'lucide-react';

interface CustomerDetailDrawerProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
  quotes: Quote[];
  onCreateLeadForCustomer: (customer: Customer) => void;
  onGenerateQuoteForCustomer: (customer: Customer) => void;
}

export const CustomerDetailDrawer: React.FC<CustomerDetailDrawerProps> = ({
  customer,
  isOpen,
  onClose,
  jobs,
  quotes,
  onCreateLeadForCustomer,
  onGenerateQuoteForCustomer
}) => {
  if (!customer) return null;

  const customerJobs = jobs.filter((j) => j.customerId === customer.id || j.customerName === customer.name);
  const customerQuotes = quotes.filter((q) => q.customerName === customer.name);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={customer.name}
      subtitle={customer.company ? `${customer.company} • ${customer.id}` : customer.id}
      width="xl"
      footer={
        <div className="w-full flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onCreateLeadForCustomer(customer);
              onClose();
            }}
            className="flex-1 px-4 py-2 text-xs font-semibold text-[#F4F7FB] bg-[#151F33] hover:bg-[#18243A] rounded-xl border border-[#18243A] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#39D9FF]" />
            <span>New Lead</span>
          </button>
          <button
            onClick={() => {
              onGenerateQuoteForCustomer(customer);
              onClose();
            }}
            className="flex-1 px-4 py-2 text-xs font-bold text-white bg-[#6C63FF] hover:bg-[#6C63FF]/90 rounded-xl shadow-lg shadow-[#6C63FF]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Quote</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Account Financial Banner */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#080D18] border border-[#18243A]">
          <div>
            <span className="text-[11px] text-[#91A0B8] uppercase tracking-wider block">
              Lifetime Spend
            </span>
            <span className="text-xl font-bold font-mono text-[#35D07F] mt-0.5 block">
              ${(customer.totalSpent || customer.totalSpend || 0).toLocaleString()}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[#91A0B8] uppercase tracking-wider block">
              Account Status
            </span>
            <div className="mt-1">
              <StatusBadge status={customer.status} />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="p-4 rounded-2xl bg-[#0D1424] border border-[#18243A] space-y-2.5 text-xs">
          <span className="text-xs font-bold text-[#39D9FF] uppercase tracking-wider block">
            Commercial Account Record
          </span>
          <div className="flex items-center gap-2.5 text-[#91A0B8]">
            <Building className="w-4 h-4 text-[#91A0B8]" />
            <span>{customer.company || 'Private Residence / Owner'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-[#91A0B8]">
            <Mail className="w-4 h-4 text-[#91A0B8]" />
            <a href={`mailto:${customer.email}`} className="text-[#39D9FF] hover:underline">
              {customer.email}
            </a>
          </div>
          <div className="flex items-center gap-2.5 text-[#91A0B8]">
            <Phone className="w-4 h-4 text-[#91A0B8]" />
            <span>{customer.phone}</span>
          </div>
          <div className="flex items-center gap-2.5 text-[#91A0B8]">
            <MapPin className="w-4 h-4 text-[#91A0B8]" />
            <span>{customer.address}</span>
          </div>
        </div>

        {/* Work Orders History */}
        <div className="p-4 rounded-2xl bg-[#0D1424] border border-[#18243A] space-y-3">
          <span className="text-xs font-bold text-[#F4F7FB] uppercase tracking-wider flex items-center justify-between">
            <span>Work Orders History ({customerJobs.length})</span>
          </span>

          {customerJobs.length === 0 ? (
            <p className="text-xs text-[#91A0B8]">No jobs on file for this account yet.</p>
          ) : (
            <div className="space-y-2">
              {customerJobs.map((j) => (
                <div
                  key={j.id}
                  className="p-3 rounded-xl bg-[#151F33]/60 border border-[#18243A] text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-[#F4F7FB]">{j.title}</div>
                    <div className="text-[11px] text-[#91A0B8]">
                      {j.scheduledDate} • {j.technicianName || 'Unassigned'}
                    </div>
                  </div>
                  <StatusBadge status={j.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quotations History */}
        <div className="p-4 rounded-2xl bg-[#0D1424] border border-[#18243A] space-y-3">
          <span className="text-xs font-bold text-[#F4F7FB] uppercase tracking-wider flex items-center justify-between">
            <span>Quotation History ({customerQuotes.length})</span>
          </span>

          {customerQuotes.length === 0 ? (
            <p className="text-xs text-[#91A0B8]">No quotes on file for this account yet.</p>
          ) : (
            <div className="space-y-2">
              {customerQuotes.map((q) => (
                <div
                  key={q.id}
                  className="p-3 rounded-xl bg-[#151F33]/60 border border-[#18243A] text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-[#F4F7FB]">{q.id}: {q.serviceTitle}</div>
                    <div className="text-[11px] text-[#91A0B8]">Valid until {q.validUntil}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-[#35D07F]">
                      ${q.total.toLocaleString()}
                    </span>
                    <div className="mt-1">
                      <StatusBadge status={q.status} size="sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account Notes */}
        {customer.notes && (
          <div className="p-4 rounded-2xl bg-[#0D1424] border border-[#18243A] text-xs">
            <span className="text-xs font-bold text-[#F5B942] uppercase tracking-wider block mb-1">
              Internal Account Notes
            </span>
            <p className="text-[#91A0B8] leading-relaxed">{customer.notes}</p>
          </div>
        )}
      </div>
    </Drawer>
  );
};
