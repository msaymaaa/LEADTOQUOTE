import React, { useState, useMemo } from 'react';
import { PageHeader } from '../common/PageHeader';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
import { SearchBar } from '../common/SearchBar';
import { SortControl, SortOption } from '../common/SortControl';
import { FilterPanel, ActiveFilter } from '../common/FilterPanel';
import { Pagination } from '../common/Pagination';
import { KpiCard } from '../dashboard/KpiCard';
import { Invoice } from '../../types';
import { formatPKR } from '../../lib/currency';
import {
  Receipt,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Send
} from 'lucide-react';

interface InvoicesViewProps {
  invoices: Invoice[];
  onSelectInvoice: (invoice: Invoice) => void;
  onRecordPaymentClick: (invoice: Invoice) => void;
  onSendReminderClick: (invoice: Invoice) => void;
}

type InvoiceSortField = 'dueDate' | 'amount' | 'customerName' | 'status' | 'issuedDate';

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  onSelectInvoice,
  onRecordPaymentClick,
  onSendReminderClick
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<InvoiceSortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const filterTabs = ['All', 'Draft', 'Sent', 'Pending', 'Paid', 'Overdue'];

  // Live KPI Calculations from actual Supabase invoices
  const totalInvoiced = useMemo(
    () => invoices.reduce((sum, i) => sum + (i.amount || 0), 0),
    [invoices]
  );
  const paidInvoices = useMemo(
    () => invoices.filter((i) => i.status === 'Paid'),
    [invoices]
  );
  const paidTotal = useMemo(
    () => paidInvoices.reduce((sum, i) => sum + (i.amount || 0), 0),
    [paidInvoices]
  );
  const pendingInvoices = useMemo(
    () => invoices.filter((i) => i.status === 'Pending'),
    [invoices]
  );
  const pendingTotal = useMemo(
    () => pendingInvoices.reduce((sum, i) => sum + (i.amount || 0), 0),
    [pendingInvoices]
  );
  const overdueInvoices = useMemo(
    () => invoices.filter((i) => i.status === 'Overdue'),
    [invoices]
  );
  const overdueTotal = useMemo(
    () => overdueInvoices.reduce((sum, i) => sum + (i.amount || 0), 0),
    [overdueInvoices]
  );
  const recoveryRate = totalInvoiced > 0 ? Math.round((paidTotal / totalInvoiced) * 100) : 0;

  // Active filters
  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const list: ActiveFilter[] = [];
    if (statusFilter !== 'All') {
      list.push({ id: 'status', label: 'Status', value: statusFilter });
    }
    if (searchTerm.trim()) {
      list.push({ id: 'search', label: 'Query', value: `"${searchTerm}"` });
    }
    return list;
  }, [statusFilter, searchTerm]);

  const handleRemoveFilter = (id: string) => {
    if (id === 'status') setStatusFilter('All');
    if (id === 'search') setSearchTerm('');
    setCurrentPage(1);
  };

  const handleResetAll = () => {
    setStatusFilter('All');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Filter & Sort
  const processedInvoices = useMemo(() => {
    const filtered = invoices.filter((inv) => {
      const matchStatus = statusFilter === 'All' || inv.status.toLowerCase() === statusFilter.toLowerCase();
      const term = searchTerm.trim().toLowerCase();
      const matchSearch =
        !term ||
        inv.id.toLowerCase().includes(term) ||
        inv.customerName.toLowerCase().includes(term) ||
        inv.jobId.toLowerCase().includes(term) ||
        (inv.serviceDescription || '').toLowerCase().includes(term);

      return matchStatus && matchSearch;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'amount') {
        comparison = (a.amount || 0) - (b.amount || 0);
      } else if (sortBy === 'customerName') {
        comparison = a.customerName.localeCompare(b.customerName);
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortBy === 'issuedDate') {
        comparison = new Date(a.issuedDate || a.issueDate || 0).getTime() - new Date(b.issuedDate || b.issueDate || 0).getTime();
      } else {
        // dueDate
        comparison = new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime();
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [invoices, statusFilter, searchTerm, sortBy, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedInvoices.length / pageSize) || 1;
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedInvoices.slice(start, start + pageSize);
  }, [processedInvoices, currentPage, pageSize]);

  const sortOptions: SortOption<InvoiceSortField>[] = [
    { value: 'dueDate', label: 'Due Date' },
    { value: 'amount', label: 'Invoice Amount' },
    { value: 'customerName', label: 'Customer Name' },
    { value: 'status', label: 'Payment Status' },
    { value: 'issuedDate', label: 'Issued Date' }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <PageHeader
        title="Invoices & Payments"
        subtitle="Track billing, receivables collection, and financial settlements."
        badge={`${invoices.length} Invoices`}
      />

      {/* Top Financial KPI Metrics with live aggregated values */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Invoiced"
          value={formatPKR(totalInvoiced)}
          change={`${invoices.length} total billings`}
          isPositive={true}
          icon={Receipt}
          color="#6C63FF"
          subtitle="Cumulative billing"
        />
        <KpiCard
          label="Collected"
          value={formatPKR(paidTotal)}
          change={`${recoveryRate}% recovery rate`}
          isPositive={true}
          icon={CheckCircle2}
          color="#35D07F"
          subtitle={`${paidInvoices.length} paid invoices`}
        />
        <KpiCard
          label="Outstanding"
          value={formatPKR(pendingTotal)}
          change={`${pendingInvoices.length} pending`}
          isPositive={pendingInvoices.length === 0}
          icon={Clock}
          color="#F5B942"
          subtitle="Current billing cycle"
        />
        <KpiCard
          label="Overdue"
          value={formatPKR(overdueTotal)}
          change={overdueInvoices.length > 0 ? `${overdueInvoices.length} overdue` : '0 overdue'}
          isPositive={overdueInvoices.length === 0}
          icon={AlertCircle}
          color="#FF647C"
          subtitle={overdueInvoices.length > 0 ? 'Follow-up required' : 'All accounts current'}
        />
      </div>

      {/* Control Bar: Search + Filters + Sort */}
      <div className="p-4 rounded-2xl bg-[#0D1424] border border-[#18243A] shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex-1 max-w-xl">
            <SearchBar
              id="invoices-search-input"
              value={searchTerm}
              onChange={(val) => {
                setSearchTerm(val);
                setCurrentPage(1);
              }}
              placeholder="Search by invoice #, customer, or job ref..."
              ariaLabel="Search invoices by number or customer"
            />
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-3">
            <SortControl<InvoiceSortField>
              options={sortOptions}
              currentSort={sortBy}
              direction={sortDirection}
              onSortChange={(val) => setSortBy(val)}
              onDirectionToggle={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 pt-1 border-t border-[#18243A]/80">
          <span className="text-[11px] text-[#91A0B8] uppercase font-bold mr-1 hidden sm:inline">
            Status:
          </span>
          {filterTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setStatusFilter(tab);
                setCurrentPage(1);
              }}
              aria-pressed={statusFilter === tab}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[32px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35D07F] ${
                statusFilter === tab
                  ? 'bg-[#35D07F] text-black shadow-md shadow-[#35D07F]/25 font-bold'
                  : 'bg-[#151F33] text-[#91A0B8] hover:text-[#F4F7FB] border border-[#18243A]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filter Panel Chips */}
        <FilterPanel
          activeFilters={activeFilters}
          onRemoveFilter={handleRemoveFilter}
          onResetAll={handleResetAll}
          resultCount={processedInvoices.length}
          totalCount={invoices.length}
          hasAdvancedFilters={false}
        />
      </div>

      {/* Invoices Table or Empty State */}
      {processedInvoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No matching invoices found"
          description="There are currently no invoices matching your selected search keywords or filter criteria."
          actionText="Reset All Filters"
          onAction={handleResetAll}
        />
      ) : (
        <div className="rounded-2xl bg-[#0D1424] border border-[#18243A] overflow-hidden shadow-xl">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs" aria-label="Invoices and Settlements Table">
              <thead className="bg-[#080D18] border-b border-[#18243A] text-[#91A0B8] uppercase tracking-wider font-semibold">
                <tr>
                  <th scope="col" className="py-3.5 px-4">Invoice #</th>
                  <th scope="col" className="py-3.5 px-4">Customer</th>
                  <th scope="col" className="py-3.5 px-4">Job Ref</th>
                  <th scope="col" className="py-3.5 px-4">Amount</th>
                  <th scope="col" className="py-3.5 px-4">Issued Date</th>
                  <th scope="col" className="py-3.5 px-4">Due Date</th>
                  <th scope="col" className="py-3.5 px-4">Status</th>
                  <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18243A]/80">
                {paginatedInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => onSelectInvoice(inv)}
                    className="hover:bg-[#151F33]/60 transition-colors cursor-pointer group focus-within:bg-[#151F33]/60"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onSelectInvoice(inv);
                    }}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#35D07F]">
                      {inv.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#F4F7FB] group-hover:text-[#39D9FF] transition-colors">
                        {inv.customerName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#39D9FF]">
                      {inv.jobId}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-sm text-[#F4F7FB]">
                      {formatPKR(inv.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-[#91A0B8] font-mono">{inv.issuedDate || inv.issueDate || '—'}</td>
                    <td className="py-3.5 px-4 text-[#91A0B8] font-mono">{inv.dueDate}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={inv.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectInvoice(inv)}
                          className="p-1.5 rounded-lg text-[#91A0B8] hover:text-[#F4F7FB] hover:bg-[#18243A] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#39D9FF]"
                          title="View Invoice"
                          aria-label={`View details for invoice ${inv.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {inv.status !== 'Paid' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => onSendReminderClick(inv)}
                              className="p-1.5 rounded-lg text-[#39D9FF] hover:bg-[#39D9FF]/10 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#39D9FF]"
                              title="Send Payment Reminder"
                              aria-label={`Send payment reminder for invoice ${inv.id}`}
                            >
                              <Send className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onRecordPaymentClick(inv)}
                              className="px-2.5 py-1 text-xs font-semibold text-black bg-[#35D07F] hover:bg-[#35D07F]/90 rounded-lg shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-[#35D07F]"
                              aria-label={`Record payment for invoice ${inv.id}`}
                            >
                              Record Payment
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-[#35D07F] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="block md:hidden divide-y divide-[#18243A]">
            {paginatedInvoices.map((inv) => (
              <div
                key={inv.id}
                onClick={() => onSelectInvoice(inv)}
                className="p-4 hover:bg-[#151F33]/40 transition-colors cursor-pointer space-y-2"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSelectInvoice(inv);
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#35D07F]">{inv.id}</span>
                  <StatusBadge status={inv.status} size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-[#F4F7FB]">{inv.customerName}</h4>
                    <p className="text-xs text-[#91A0B8]">Job: {inv.jobId}</p>
                  </div>
                  <span className="font-mono font-bold text-sm text-[#F4F7FB]">
                    {formatPKR(inv.amount)}
                  </span>
                </div>
                <div className="text-xs text-[#91A0B8] flex items-center justify-between pt-1">
                  <span>Due: {inv.dueDate}</span>
                  {inv.status !== 'Paid' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRecordPaymentClick(inv);
                      }}
                      className="text-xs text-[#35D07F] font-semibold hover:underline cursor-pointer"
                    >
                      Record Payment →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={processedInvoices.length}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
            onPageSizeChange={(s) => setPageSize(s)}
            pageSizeOptions={[10, 25, 50]}
          />
        </div>
      )}
    </div>
  );
};
