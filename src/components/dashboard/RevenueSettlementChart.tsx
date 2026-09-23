import React, { useState } from 'react';
import { Invoice, Quote } from '../../types';
import { ResponsiveChartContainer } from '../common/ResponsiveChartContainer';
import { DollarSign, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { formatPKR } from '../../lib/currency';

interface RevenueSettlementChartProps {
  invoices: Invoice[];
  quotes: Quote[];
  onNavigateTab?: (tab: string) => void;
}

export const RevenueSettlementChart: React.FC<RevenueSettlementChartProps> = ({
  invoices,
  quotes,
  onNavigateTab
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Aggregations
  const paidInvoices = invoices.filter((i) => i.status === 'Paid');
  const pendingInvoices = invoices.filter((i) => i.status === 'Pending');
  const overdueInvoices = invoices.filter((i) => i.status === 'Overdue');
  const approvedQuotes = quotes.filter((q) => q.status === 'Approved');

  const paidTotal = paidInvoices.reduce((acc, i) => acc + i.amount, 0);
  const pendingTotal = pendingInvoices.reduce((acc, i) => acc + i.amount, 0);
  const overdueTotal = overdueInvoices.reduce((acc, i) => acc + i.amount, 0);
  const approvedQuotesTotal = approvedQuotes.reduce((acc, q) => acc + q.total, 0);

  const totalInvoiced = paidTotal + pendingTotal + overdueTotal;
  const collectionRate = totalInvoiced > 0 ? Math.round((paidTotal / totalInvoiced) * 100) : 0;

  const categories = [
    {
      id: 'paid',
      label: 'Settled & Paid',
      amount: paidTotal,
      count: paidInvoices.length,
      color: '#35D07F',
      icon: CheckCircle2,
      description: 'Successfully collected revenue'
    },
    {
      id: 'pending',
      label: 'Pending Settlement',
      amount: pendingTotal,
      count: pendingInvoices.length,
      color: '#39D9FF',
      icon: Clock,
      description: 'Awaiting customer payment'
    },
    {
      id: 'overdue',
      label: 'Overdue Balance',
      amount: overdueTotal,
      count: overdueInvoices.length,
      color: '#FF647C',
      icon: AlertTriangle,
      description: 'Passed payment terms'
    },
    {
      id: 'pipeline',
      label: 'Approved Quotes',
      amount: approvedQuotesTotal,
      count: approvedQuotes.length,
      color: '#F5B942',
      icon: DollarSign,
      description: 'Committed future billings'
    }
  ];

  const totalTracked = categories.reduce((sum, c) => sum + c.amount, 0) || 1;

  const accessibleDataTable = {
    headers: ['Revenue Category', 'Amount', 'Invoice / Quote Count', 'Share of Volume'],
    rows: categories.map((c) => [
      c.label,
      formatPKR(c.amount),
      c.count,
      `${Math.round((c.amount / totalTracked) * 100)}%`
    ])
  };

  return (
    <ResponsiveChartContainer
      title="Revenue Health & Settlement Trends"
      subtitle="Invoiced balances, realized revenue, and collection rate"
      badge={`Collection Rate: ${collectionRate}%`}
      accessibleDataTable={accessibleDataTable}
    >
      <div className="space-y-5 pt-2">
        {/* Visual Stacked Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#91A0B8] font-medium">Settlement Distribution</span>
            <span className="font-mono text-[#F4F7FB] font-bold">
              {formatPKR(totalInvoiced)} Invoiced Total
            </span>
          </div>

          <div className="w-full h-4 bg-[#080D18] rounded-full overflow-hidden flex p-0.5 border border-[#18243A]">
            {categories.map((cat) => {
              const widthPct = Math.max(Math.round((cat.amount / totalTracked) * 100), cat.amount > 0 ? 3 : 0);
              if (cat.amount === 0) return null;

              return (
                <div
                  key={cat.id}
                  title={`${cat.label}: ${formatPKR(cat.amount)}`}
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: cat.color,
                    opacity: hoveredCategory === cat.id ? 1 : 0.85
                  }}
                  onMouseEnter={() => setHoveredCategory(cat.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className="h-full first:rounded-l-full last:rounded-r-full transition-opacity cursor-pointer"
                />
              );
            })}
          </div>
        </div>

        {/* 4 Revenue Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isHovered = hoveredCategory === cat.id;

            return (
              <div
                key={cat.id}
                onMouseEnter={() => setHoveredCategory(cat.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                onClick={() => onNavigateTab && onNavigateTab(cat.id === 'pipeline' ? 'quotes' : 'invoices')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isHovered
                    ? 'bg-[#151F33] border-[#39D9FF]/40 shadow-md'
                    : 'bg-[#080D18]/60 border-[#18243A] hover:bg-[#151F33]/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: `${cat.color}15`,
                        color: cat.color
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#F4F7FB] block">
                        {cat.label}
                      </span>
                      <span className="text-[10px] text-[#91A0B8]">
                        {cat.count} {cat.id === 'pipeline' ? 'quotes' : 'invoices'}
                      </span>
                    </div>
                  </div>

                  <span className="font-mono text-sm font-bold" style={{ color: cat.color }}>
                    {formatPKR(cat.amount)}
                  </span>
                </div>

                <div className="mt-2 pt-2 border-t border-[#18243A]/60 flex items-center justify-between text-[11px] text-[#91A0B8]">
                  <span>{cat.description}</span>
                  <span className="font-mono font-medium">
                    {Math.round((cat.amount / totalTracked) * 100)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ResponsiveChartContainer>
  );
};
