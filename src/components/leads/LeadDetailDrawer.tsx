import React from 'react';
import { Drawer } from '../common/Drawer';
import { StatusBadge } from '../common/StatusBadge';
import { Lead, LeadStatus } from '../../types';
import { formatPKR } from '../../lib/currency';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Send,
  PlusCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  onContactCustomer: (lead: Lead) => void;
  onCreateQuoteFromLead: (lead: Lead) => void;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  isOpen,
  onClose,
  onStatusChange,
  onContactCustomer,
  onCreateQuoteFromLead
}) => {
  if (!lead) return null;

  const statusOptions: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Quoted', 'Converted', 'Lost'];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Lead Details: ${lead.id}`}
      subtitle={`Created on ${lead.createdAt}`}
      width="xl"
      footer={
        <div className="w-full flex items-center justify-between gap-3">
          <button
            onClick={() => onContactCustomer(lead)}
            className="flex-1 px-4 py-2 text-xs font-semibold text-[#F4F7FB] bg-[#151F33] hover:bg-[#18243A] rounded-xl border border-[#18243A] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-[#39D9FF]" />
            <span>Contact Customer</span>
          </button>
          <button
            onClick={() => {
              onCreateQuoteFromLead(lead);
              onClose();
            }}
            className="flex-1 px-4 py-2 text-xs font-bold text-white bg-[#6C63FF] hover:bg-[#6C63FF]/90 rounded-xl shadow-lg shadow-[#6C63FF]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Quote</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Top Status & Value Banner */}
        <div className="p-4 rounded-2xl bg-[#080D18] border border-[#18243A] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#91A0B8] uppercase tracking-wider block">
              Estimated Value
            </span>
            <span className="text-2xl font-bold font-mono text-[#F4F7FB] mt-0.5 block">
              {formatPKR(lead.estimatedValue)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-[#91A0B8] uppercase tracking-wider block mb-1">
              Current Status
            </span>
            <StatusBadge status={lead.status} />
          </div>
        </div>

        {/* Change Status Fast Selector */}
        <div className="p-3.5 rounded-xl bg-[#151F33]/60 border border-[#18243A]">
          <label className="block text-xs font-semibold text-[#91A0B8] mb-2">
            Update Workflow Stage
          </label>
          <div className="flex flex-wrap gap-1.5">
            {statusOptions.map((st) => (
              <button
                key={st}
                onClick={() => onStatusChange(lead.id, st)}
                className={`px-2.5 py-1 text-xs rounded-lg transition-all font-medium cursor-pointer ${
                  lead.status === st
                    ? 'bg-[#6C63FF] text-white font-bold shadow-md shadow-[#6C63FF]/30'
                    : 'bg-[#0D1424] text-[#91A0B8] hover:text-[#F4F7FB] border border-[#18243A]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Customer Information Card */}
        <div className="p-4 rounded-2xl bg-[#0D1424] border border-[#18243A] space-y-3">
          <h4 className="text-xs font-bold text-[#39D9FF] uppercase tracking-wider">
            Customer Information
          </h4>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2.5 text-[#F4F7FB]">
              <User className="w-4 h-4 text-[#91A0B8]" />
              <span className="font-semibold text-sm">{lead.customerName}</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#91A0B8]">
              <Mail className="w-4 h-4 text-[#91A0B8]" />
              <a href={`mailto:${lead.email}`} className="hover:text-[#39D9FF] underline">
                {lead.email}
              </a>
            </div>
            <div className="flex items-center gap-2.5 text-[#91A0B8]">
              <Phone className="w-4 h-4 text-[#91A0B8]" />
              <span>{lead.phone}</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#91A0B8]">
              <MapPin className="w-4 h-4 text-[#91A0B8]" />
              <span>{lead.address}</span>
            </div>
          </div>
        </div>

        {/* Service Scope & Description */}
        <div className="p-4 rounded-2xl bg-[#0D1424] border border-[#18243A] space-y-3">
          <h4 className="text-xs font-bold text-[#6C63FF] uppercase tracking-wider">
            Service Request Scope
          </h4>

          <div className="flex items-center justify-between text-xs pb-2 border-b border-[#18243A]">
            <span className="text-[#91A0B8]">Category</span>
            <span className="font-semibold text-[#F4F7FB]">{lead.serviceType}</span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2 border-b border-[#18243A]">
            <span className="text-[#91A0B8]">Target Date</span>
            <span className="font-medium text-[#F4F7FB]">{lead.preferredDate}</span>
          </div>

          <div>
            <span className="text-xs text-[#91A0B8] block mb-1">Issue Description</span>
            <p className="text-xs text-[#F4F7FB]/90 leading-relaxed p-3 rounded-xl bg-[#080D18] border border-[#18243A]">
              {lead.description}
            </p>
          </div>
        </div>

        {/* Lead Timeline History */}
        <div className="p-4 rounded-2xl bg-[#0D1424] border border-[#18243A] space-y-3">
          <h4 className="text-xs font-bold text-[#35D07F] uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Activity Log & Timeline
          </h4>

          <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#18243A]">
            {lead.timeline && lead.timeline.map((item, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-[#6C63FF] border-2 border-[#0D1424]" />
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#F4F7FB]">{item.title}</span>
                  <span className="text-[10px] text-[#91A0B8]">{item.time}</span>
                </div>
                <p className="text-xs text-[#91A0B8] mt-0.5">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
};
