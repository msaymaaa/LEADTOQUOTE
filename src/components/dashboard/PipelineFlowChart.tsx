import React, { useState } from 'react';
import { Lead, Quote, Job, Invoice } from '../../types';
import { ResponsiveChartContainer } from '../common/ResponsiveChartContainer';
import { formatPKR } from '../../lib/currency';

interface PipelineFlowChartProps {
  leads: Lead[];
  quotes: Quote[];
  jobs: Job[];
  invoices: Invoice[];
  onSelectStage?: (stage: string) => void;
}

export const PipelineFlowChart: React.FC<PipelineFlowChartProps> = ({
  leads,
  quotes,
  jobs,
  invoices,
  onSelectStage
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Compute live stage counts & values
  const newLeads = leads.filter((l) => l.status === 'New');
  const contactedLeads = leads.filter((l) => l.status === 'Contacted');
  const qualifiedLeads = leads.filter((l) => l.status === 'Qualified');
  const activeQuotes = quotes.filter((q) => q.status !== 'Declined');
  const activeJobs = jobs.filter((j) => j.status === 'In Progress' || j.status === 'Assigned' || j.status === 'Scheduled' || j.status === 'Awaiting Completion');
  const completedJobs = jobs.filter((j) => j.status === 'Completed');
  const paidInvoices = invoices.filter((i) => i.status === 'Paid');

  const stages = [
    {
      id: 'new',
      name: 'New Intake',
      count: newLeads.length,
      value: newLeads.reduce((acc, l) => acc + (l.estimatedValue || 0), 0),
      color: '#6C63FF',
      tab: 'leads'
    },
    {
      id: 'contacted',
      name: 'Contacted',
      count: contactedLeads.length,
      value: contactedLeads.reduce((acc, l) => acc + (l.estimatedValue || 0), 0),
      color: '#8B5CF6',
      tab: 'leads'
    },
    {
      id: 'qualified',
      name: 'Qualified',
      count: qualifiedLeads.length,
      value: qualifiedLeads.reduce((acc, l) => acc + (l.estimatedValue || 0), 0),
      color: '#39D9FF',
      tab: 'leads'
    },
    {
      id: 'quoted',
      name: 'Quoted',
      count: activeQuotes.length,
      value: activeQuotes.reduce((acc, q) => acc + (q.total || 0), 0),
      color: '#00F0FF',
      tab: 'quotes'
    },
    {
      id: 'in_progress',
      name: 'Dispatched / In Progress',
      count: activeJobs.length,
      value: activeJobs.reduce((acc, j) => {
        const matchingQuote = quotes.find((q) => q.id === j.quoteId);
        return acc + (matchingQuote ? matchingQuote.total : 0);
      }, 0),
      color: '#F5B942',
      tab: 'jobs'
    },
    {
      id: 'completed',
      name: 'Completed Work',
      count: completedJobs.length,
      value: completedJobs.reduce((acc, j) => {
        const matchingQuote = quotes.find((q) => q.id === j.quoteId);
        return acc + (matchingQuote ? matchingQuote.total : 0);
      }, 0),
      color: '#38BDF8',
      tab: 'jobs'
    },
    {
      id: 'paid',
      name: 'Settled & Paid',
      count: paidInvoices.length,
      value: paidInvoices.reduce((acc, i) => acc + (i.amount || 0), 0),
      color: '#35D07F',
      tab: 'invoices'
    }
  ];

  const maxCount = Math.max(...stages.map((s) => s.count), 1);
  const totalIntake = stages[0].count + stages[1].count + stages[2].count;

  // Accessible data table representation
  const accessibleDataTable = {
    headers: ['Pipeline Stage', 'Count', 'Volume Value', 'Stage %'],
    rows: stages.map((s) => [
      s.name,
      s.count,
      formatPKR(s.value),
      `${totalIntake > 0 ? Math.round((s.count / Math.max(totalIntake, 1)) * 100) : 0}%`
    ])
  };

  return (
    <ResponsiveChartContainer
      title="Lead-to-Settlement Pipeline Flow"
      subtitle="Real-time volume and conversion across operational stages"
      badge="Live Supabase Data"
      accessibleDataTable={accessibleDataTable}
    >
      <div className="space-y-4 pt-2">
        {/* SVG Funnel / Bar Flow */}
        <div className="space-y-3">
          {stages.map((stage, idx) => {
            const widthPercent = Math.max(Math.round((stage.count / maxCount) * 100), 6);
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={stage.id}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSelectStage && onSelectStage(stage.tab)}
                className={`p-2.5 rounded-xl transition-all cursor-pointer group ${
                  isHovered ? 'bg-[#151F33] border border-[#18243A]' : 'hover:bg-[#151F33]/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="font-semibold text-[#F4F7FB] group-hover:text-[#39D9FF] transition-colors">
                      {stage.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[11px] text-[#91A0B8]">
                      ${stage.value.toLocaleString()} vol
                    </span>
                    <span className="font-mono font-bold text-xs text-[#F4F7FB] min-w-[28px] text-right">
                      {stage.count}
                    </span>
                  </div>
                </div>

                {/* Bar representation */}
                <div className="w-full h-3 bg-[#080D18] rounded-full overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: stage.color,
                      opacity: isHovered ? 1 : 0.85
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footnote summary */}
        <div className="pt-3 border-t border-[#18243A]/80 flex flex-wrap items-center justify-between text-xs text-[#91A0B8] px-1 gap-2">
          <span>Click any stage bar to jump into that workflow section</span>
          <span className="font-mono font-semibold text-[#35D07F]">
            {stages.reduce((sum, s) => sum + s.count, 0)} Total Active Items
          </span>
        </div>
      </div>
    </ResponsiveChartContainer>
  );
};
