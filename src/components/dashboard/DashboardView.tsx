import React, { useMemo } from 'react';
import {
  UserCheck,
  FileText,
  Truck,
  Receipt,
  DollarSign,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { PageHeader } from '../common/PageHeader';
import { KpiCard } from './KpiCard';
import { PipelineBar } from './PipelineBar';
import { PipelineFlowChart } from './PipelineFlowChart';
import { RevenueSettlementChart } from './RevenueSettlementChart';
import { StatusBadge } from '../common/StatusBadge';
import { Lead, Quote, Job, Invoice, NavigationTab } from '../../types';
import { formatPKR } from '../../lib/currency';

interface DashboardViewProps {
  leads: Lead[];
  quotes: Quote[];
  jobs: Job[];
  invoices: Invoice[];
  onNavigateTab: (tab: NavigationTab) => void;
  onOpenLead: (lead: Lead) => void;
  onOpenQuote: (quote: Quote) => void;
  onOpenJob: (job: Job) => void;
  onOpenInvoice: (invoice: Invoice) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  leads,
  quotes,
  jobs,
  invoices,
  onNavigateTab,
  onOpenLead,
  onOpenQuote,
  onOpenJob,
  onOpenInvoice
}) => {
  // Live KPI Calculations from Supabase entities
  const activeLeads = useMemo(
    () => leads.filter((l) => l.status === 'New' || l.status === 'Contacted' || l.status === 'Qualified'),
    [leads]
  );
  const newLeads = useMemo(() => leads.filter((l) => l.status === 'New'), [leads]);

  const awaitingQuotes = useMemo(() => quotes.filter((q) => q.status === 'Awaiting Approval'), [quotes]);
  const awaitingQuotesVolume = useMemo(
    () => awaitingQuotes.reduce((acc, q) => acc + (q.total || 0), 0),
    [awaitingQuotes]
  );

  const activeJobs = useMemo(
    () => jobs.filter((j) => j.status === 'In Progress' || j.status === 'Assigned' || j.status === 'Scheduled' || j.status === 'Awaiting Completion'),
    [jobs]
  );
  const inProgressJobs = useMemo(() => jobs.filter((j) => j.status === 'In Progress'), [jobs]);

  const outstandingInvoices = useMemo(
    () => invoices.filter((i) => i.status === 'Pending' || i.status === 'Overdue'),
    [invoices]
  );
  const overdueInvoices = useMemo(() => invoices.filter((i) => i.status === 'Overdue'), [invoices]);
  const outstandingTotal = useMemo(
    () => outstandingInvoices.reduce((acc, i) => acc + (i.amount || 0), 0),
    [outstandingInvoices]
  );

  const paidInvoices = useMemo(() => invoices.filter((i) => i.status === 'Paid'), [invoices]);
  const paidTotal = useMemo(
    () => paidInvoices.reduce((acc, i) => acc + (i.amount || 0), 0),
    [paidInvoices]
  );
  const totalInvoiced = useMemo(
    () => invoices.reduce((acc, i) => acc + (i.amount || 0), 0),
    [invoices]
  );
  const collectionRate = totalInvoiced > 0 ? Math.round((paidTotal / totalInvoiced) * 100) : 0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <PageHeader
        title="Operational Command Center"
        subtitle="Monitor your service pipeline from lead intake to payment."
        badge="Live Supabase Data"
      >
        <button
          onClick={() => onNavigateTab('leads')}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#F4F7FB] bg-[#151F33] hover:bg-[#18243A] border border-[#18243A] transition-colors cursor-pointer min-h-[36px]"
        >
          View All Leads
        </button>
        <button
          onClick={() => onNavigateTab('quotes')}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#6C63FF] hover:bg-[#6C63FF]/90 shadow-md shadow-[#6C63FF]/20 transition-all cursor-pointer flex items-center gap-1.5 min-h-[36px]"
        >
          <span>Awaiting Quotes</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </PageHeader>

      {/* Top KPI Cards (5 Cards with live aggregated values) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Active Leads"
          value={activeLeads.length}
          change={newLeads.length > 0 ? `${newLeads.length} new intake` : 'All contacted'}
          isPositive={true}
          icon={UserCheck}
          color="#6C63FF"
          subtitle={`${leads.length} total leads recorded`}
          onClick={() => onNavigateTab('leads')}
        />
        <KpiCard
          label="Quotes Awaiting Approval"
          value={awaitingQuotes.length}
          change={awaitingQuotes.length > 0 ? formatPKR(awaitingQuotesVolume) : '0 pending'}
          isPositive={awaitingQuotes.length > 0}
          icon={FileText}
          color="#F5B942"
          subtitle={`${quotes.filter((q) => q.status === 'Approved').length} quotes approved`}
          onClick={() => onNavigateTab('quotes')}
        />
        <KpiCard
          label="Jobs In Progress"
          value={activeJobs.length}
          change={`${inProgressJobs.length} active in field`}
          isPositive={true}
          icon={Truck}
          color="#39D9FF"
          subtitle={`${jobs.filter((j) => j.status === 'Completed').length} jobs completed`}
          onClick={() => onNavigateTab('jobs')}
        />
        <KpiCard
          label="Outstanding Invoices"
          value={formatPKR(outstandingTotal)}
          change={overdueInvoices.length > 0 ? `${overdueInvoices.length} overdue` : 'Current on schedule'}
          isPositive={overdueInvoices.length === 0}
          icon={Receipt}
          color="#FF647C"
          subtitle={`${outstandingInvoices.length} unpaid invoices`}
          onClick={() => onNavigateTab('invoices')}
        />
        <KpiCard
          label="Settled Revenue"
          value={formatPKR(paidTotal)}
          change={`${collectionRate}% collection rate`}
          isPositive={true}
          icon={DollarSign}
          color="#35D07F"
          subtitle={`${paidInvoices.length} paid invoices`}
          onClick={() => onNavigateTab('invoices')}
        />
      </div>

      {/* Dynamic AI Business Insight Visual Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#18243A] via-[#0D1424] to-[#151F33] border border-[#6C63FF]/40 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#6C63FF]/20 border border-[#6C63FF]/40 flex items-center justify-center text-[#39D9FF] shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#6C63FF] uppercase tracking-wider">
                  Operational Insight
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#39D9FF]/15 text-[#39D9FF]">
                  {awaitingQuotes.length > 0 ? 'Action Recommended' : 'System Optimized'}
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#F4F7FB] mt-1">
                {awaitingQuotes.length > 0
                  ? `${awaitingQuotes.length} quotations totaling ${formatPKR(awaitingQuotesVolume)} are awaiting customer sign-off.`
                  : 'All issued quotations have been processed. Service pipeline is executing with zero approval bottlenecks.'}
              </h4>
              <p className="text-xs text-[#91A0B8] mt-0.5">
                {awaitingQuotes.length > 0
                  ? 'Customer check-ins within 48 hours increase proposal win rates by up to 38%. Review quotes and send prompt follow-ups.'
                  : 'Focus on incoming leads and dispatch schedules to maintain velocity.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('quotes')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#6C63FF] hover:bg-[#6C63FF]/90 transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-[#6C63FF]/20 cursor-pointer min-h-[38px]"
          >
            <span>Review Quotes</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Pipeline Bar with Live Counts */}
      <PipelineBar
        leads={leads}
        quotes={quotes}
        jobs={jobs}
        invoices={invoices}
        onSelectStage={(stage) => {
          if (stage === 'New' || stage === 'Contacted' || stage === 'Qualified') {
            onNavigateTab('leads');
          } else if (stage === 'Quoted' || stage === 'Approved') {
            onNavigateTab('quotes');
          } else if (stage === 'In Progress' || stage === 'Completed') {
            onNavigateTab('jobs');
          } else if (stage === 'Paid') {
            onNavigateTab('invoices');
          }
        }}
      />

      {/* Live Interactive Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PipelineFlowChart
          leads={leads}
          quotes={quotes}
          jobs={jobs}
          invoices={invoices}
          onSelectStage={(tab) => onNavigateTab(tab as NavigationTab)}
        />
        <RevenueSettlementChart
          invoices={invoices}
          quotes={quotes}
          onNavigateTab={(tab) => onNavigateTab(tab as NavigationTab)}
        />
      </div>

      {/* 2x2 Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="p-5 rounded-2xl bg-[#0D1424] border border-[#18243A]">
          <div className="flex items-center justify-between pb-4 border-b border-[#18243A]">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#6C63FF]" />
              <h3 className="text-sm font-bold text-[#F4F7FB]">Recent Leads</h3>
            </div>
            <button
              onClick={() => onNavigateTab('leads')}
              className="text-xs text-[#39D9FF] hover:underline flex items-center gap-1"
            >
              View all ({leads.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#18243A]">
            {leads.slice(0, 4).map((lead) => (
              <div
                key={lead.id}
                onClick={() => onOpenLead(lead)}
                className="py-3 px-2 flex items-center justify-between hover:bg-[#151F33]/50 rounded-xl transition-colors cursor-pointer group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#F4F7FB] group-hover:text-[#39D9FF] transition-colors">
                      {lead.customerName}
                    </span>
                    <span className="text-[11px] text-[#91A0B8]">({lead.id})</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#91A0B8] mt-1">
                    <span>{lead.serviceType}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#91A0B8]" />
                      {lead.location}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-[#F4F7FB]">
                    {formatPKR(lead.estimatedValue)}
                  </div>
                  <div className="mt-1">
                    <StatusBadge status={lead.status} size="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Jobs */}
        <div className="p-5 rounded-2xl bg-[#0D1424] border border-[#18243A]">
          <div className="flex items-center justify-between pb-4 border-b border-[#18243A]">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#39D9FF]" />
              <h3 className="text-sm font-bold text-[#F4F7FB]">Upcoming & Active Jobs</h3>
            </div>
            <button
              onClick={() => onNavigateTab('jobs')}
              className="text-xs text-[#39D9FF] hover:underline flex items-center gap-1"
            >
              Dispatch Board ({jobs.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#18243A]">
            {jobs.slice(0, 4).map((job) => (
              <div
                key={job.id}
                onClick={() => onOpenJob(job)}
                className="py-3 px-2 flex items-center justify-between hover:bg-[#151F33]/50 rounded-xl transition-colors cursor-pointer group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#39D9FF] font-mono">
                      {job.id}
                    </span>
                    <span className="text-xs font-semibold text-[#F4F7FB] group-hover:text-[#39D9FF] transition-colors">
                      {job.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#91A0B8] mt-1">
                    <span>{job.customerName}</span>
                    <span>•</span>
                    <span className="text-[#F4F7FB]/90 font-medium">
                      Tech: {job.technicianName || 'Unassigned'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-[#91A0B8] flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3" />
                    {job.scheduledTime}
                  </div>
                  <div className="mt-1">
                    <StatusBadge status={job.status} size="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Quotes */}
        <div className="p-5 rounded-2xl bg-[#0D1424] border border-[#18243A]">
          <div className="flex items-center justify-between pb-4 border-b border-[#18243A]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#F5B942]" />
              <h3 className="text-sm font-bold text-[#F4F7FB]">Recent Quotations</h3>
            </div>
            <button
              onClick={() => onNavigateTab('quotes')}
              className="text-xs text-[#39D9FF] hover:underline flex items-center gap-1"
            >
              All Quotes ({quotes.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#18243A]">
            {quotes.slice(0, 4).map((q) => (
              <div
                key={q.id}
                onClick={() => onOpenQuote(q)}
                className="py-3 px-2 flex items-center justify-between hover:bg-[#151F33]/50 rounded-xl transition-colors cursor-pointer group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#F5B942] font-mono">
                      {q.id}
                    </span>
                    <span className="text-xs font-semibold text-[#F4F7FB] group-hover:text-[#39D9FF] transition-colors">
                      {q.customerName}
                    </span>
                  </div>
                  <p className="text-xs text-[#91A0B8] mt-0.5 truncate max-w-xs">
                    {q.serviceTitle}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-[#F4F7FB]">
                    {formatPKR(q.total)}
                  </div>
                  <div className="mt-1">
                    <StatusBadge status={q.status} size="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Activity */}
        <div className="p-5 rounded-2xl bg-[#0D1424] border border-[#18243A]">
          <div className="flex items-center justify-between pb-4 border-b border-[#18243A]">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#35D07F]" />
              <h3 className="text-sm font-bold text-[#F4F7FB]">Payment & Billing Activity</h3>
            </div>
            <button
              onClick={() => onNavigateTab('invoices')}
              className="text-xs text-[#39D9FF] hover:underline flex items-center gap-1"
            >
              Invoices ({invoices.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#18243A]">
            {invoices.slice(0, 4).map((inv) => (
              <div
                key={inv.id}
                onClick={() => onOpenInvoice(inv)}
                className="py-3 px-2 flex items-center justify-between hover:bg-[#151F33]/50 rounded-xl transition-colors cursor-pointer group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#35D07F] font-mono">
                      {inv.id}
                    </span>
                    <span className="text-xs font-semibold text-[#F4F7FB] group-hover:text-[#39D9FF] transition-colors">
                      {inv.customerName}
                    </span>
                  </div>
                  <div className="text-xs text-[#91A0B8] mt-0.5">
                    Due: {inv.dueDate} {inv.paidDate && `• Settled: ${inv.paidDate}`}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-[#F4F7FB]">
                    {formatPKR(inv.amount)}
                  </div>
                  <div className="mt-1">
                    <StatusBadge status={inv.status} size="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
