import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Lead, Quote, Job, Invoice } from '../../types';

interface PipelineBarProps {
  onSelectStage?: (stageName: string) => void;
  activeStageFilter?: string | null;
  leads?: Lead[];
  quotes?: Quote[];
  jobs?: Job[];
  invoices?: Invoice[];
}

export const PipelineBar: React.FC<PipelineBarProps> = ({
  onSelectStage,
  activeStageFilter,
  leads = [],
  quotes = [],
  jobs = [],
  invoices = []
}) => {
  const newCount = leads.filter((l) => l.status === 'New').length;
  const contactedCount = leads.filter((l) => l.status === 'Contacted').length;
  const qualifiedCount = leads.filter((l) => l.status === 'Qualified').length;
  const quotedCount = quotes.filter((q) => q.status === 'Sent' || q.status === 'Draft' || q.status === 'Awaiting Approval').length;
  const approvedCount = quotes.filter((q) => q.status === 'Approved').length;
  const inProgressCount = jobs.filter((j) => j.status === 'In Progress' || j.status === 'Assigned' || j.status === 'Scheduled' || j.status === 'Awaiting Completion').length;
  const completedCount = jobs.filter((j) => j.status === 'Completed').length;
  const paidCount = invoices.filter((i) => i.status === 'Paid').length;

  const pipelineStages = [
    { name: 'New', count: newCount, color: '#6C63FF' },
    { name: 'Contacted', count: contactedCount, color: '#8B5CF6' },
    { name: 'Qualified', count: qualifiedCount, color: '#39D9FF' },
    { name: 'Quoted', count: quotedCount, color: '#00F0FF' },
    { name: 'Approved', count: approvedCount, color: '#35D07F' },
    { name: 'In Progress', count: inProgressCount, color: '#F5B942' },
    { name: 'Completed', count: completedCount, color: '#38BDF8' },
    { name: 'Paid', count: paidCount, color: '#35D07F' }
  ];

  return (
    <div className="p-5 rounded-2xl bg-[#0D1424] border border-[#18243A]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#F4F7FB] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#39D9FF]" />
            Active Service Pipeline
          </h3>
          <p className="text-xs text-[#91A0B8] mt-0.5">
            Real-time stage velocity from customer intake to payment settlement
          </p>
        </div>
        {activeStageFilter && (
          <button
            onClick={() => onSelectStage && onSelectStage('')}
            className="text-xs text-[#39D9FF] hover:underline"
          >
            Clear stage filter
          </button>
        )}
      </div>

      {/* Pipeline Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {pipelineStages.map((stage, idx) => {
          const isSelected = activeStageFilter === stage.name;

          return (
            <div
              key={stage.name}
              onClick={() => onSelectStage && onSelectStage(stage.name)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer text-center relative group ${
                isSelected
                  ? 'bg-[#18243A] border-[#39D9FF] shadow-md shadow-[#39D9FF]/20'
                  : 'bg-[#151F33]/60 border-[#18243A] hover:border-[#6C63FF]/50 hover:bg-[#151F33]'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: stage.color }}
                />
                <span className="text-xs font-semibold text-[#F4F7FB] truncate">
                  {stage.name}
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-[#F4F7FB]">
                {stage.count}
              </div>

              {idx < pipelineStages.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-[#18243A] absolute -right-3 top-1/2 -translate-y-1/2 hidden lg:block z-10" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
