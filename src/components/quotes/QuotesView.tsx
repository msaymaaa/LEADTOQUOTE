import React, { useState, useMemo } from 'react';
import { PageHeader } from '../common/PageHeader';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
import { SearchBar } from '../common/SearchBar';
import { SortControl, SortOption } from '../common/SortControl';
import { FilterPanel, ActiveFilter } from '../common/FilterPanel';
import { Pagination } from '../common/Pagination';
import { Quote } from '../../types';
import { formatPKR } from '../../lib/currency';
import {
  Plus,
  FileText,
  Eye,
  ExternalLink,
  DollarSign
} from 'lucide-react';

interface QuotesViewProps {
  quotes: Quote[];
  onOpenNewQuote: () => void;
  onSelectQuote: (quote: Quote) => void;
  onOpenCustomerPreview: (quote: Quote) => void;
  onApproveQuoteClick: (quote: Quote) => void;
  onDeclineQuoteClick: (quote: Quote) => void;
}

type QuoteSortField = 'createdAt' | 'total' | 'validUntil' | 'customerName' | 'status';

export const QuotesView: React.FC<QuotesViewProps> = ({
  quotes,
  onOpenNewQuote,
  onSelectQuote,
  onOpenCustomerPreview,
  onApproveQuoteClick,
  onDeclineQuoteClick
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [valueRangeFilter, setValueRangeFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<QuoteSortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const filterTabs = ['All', 'Draft', 'Sent', 'Awaiting Approval', 'Approved', 'Declined', 'Expired'];

  // Active filter chips
  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const list: ActiveFilter[] = [];
    if (statusFilter !== 'All') {
      list.push({ id: 'status', label: 'Status', value: statusFilter });
    }
    if (valueRangeFilter !== 'All') {
      list.push({ id: 'valueRange', label: 'Amount', value: valueRangeFilter });
    }
    if (searchTerm.trim()) {
      list.push({ id: 'search', label: 'Query', value: `"${searchTerm}"` });
    }
    return list;
  }, [statusFilter, valueRangeFilter, searchTerm]);

  const handleRemoveFilter = (id: string) => {
    if (id === 'status') setStatusFilter('All');
    if (id === 'valueRange') setValueRangeFilter('All');
    if (id === 'search') setSearchTerm('');
    setCurrentPage(1);
  };

  const handleResetAll = () => {
    setStatusFilter('All');
    setValueRangeFilter('All');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Filter & Sort
  const processedQuotes = useMemo(() => {
    const filtered = quotes.filter((q) => {
      const matchStatus = statusFilter === 'All' || q.status.toLowerCase() === statusFilter.toLowerCase();

      let matchValue = true;
      if (valueRangeFilter === 'under1k') matchValue = q.total < 1000;
      else if (valueRangeFilter === '1k-5k') matchValue = q.total >= 1000 && q.total <= 5000;
      else if (valueRangeFilter === 'above5k') matchValue = q.total > 5000;

      const term = searchTerm.trim().toLowerCase();
      const matchSearch =
        !term ||
        q.id.toLowerCase().includes(term) ||
        q.customerName.toLowerCase().includes(term) ||
        q.serviceTitle.toLowerCase().includes(term) ||
        (q.location && q.location.toLowerCase().includes(term)) ||
        (q.customerEmail && q.customerEmail.toLowerCase().includes(term));

      return matchStatus && matchValue && matchSearch;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'total') {
        comparison = a.total - b.total;
      } else if (sortBy === 'customerName') {
        comparison = a.customerName.localeCompare(b.customerName);
      } else if (sortBy === 'validUntil') {
        comparison = new Date(a.validUntil || 0).getTime() - new Date(b.validUntil || 0).getTime();
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else {
        // createdAt
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [quotes, statusFilter, valueRangeFilter, searchTerm, sortBy, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedQuotes.length / pageSize) || 1;
  const paginatedQuotes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedQuotes.slice(start, start + pageSize);
  }, [processedQuotes, currentPage, pageSize]);

  const sortOptions: SortOption<QuoteSortField>[] = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'total', label: 'Total Amount' },
    { value: 'validUntil', label: 'Valid Until' },
    { value: 'customerName', label: 'Customer Name' },
    { value: 'status', label: 'Quote Status' }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <PageHeader
        title="Quotes"
        subtitle="Create, review, filter, and track customer quotations."
        badge={`${quotes.length} Quotes`}
      >
        <button
          onClick={onOpenNewQuote}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#6C63FF] hover:bg-[#6C63FF]/90 text-white text-xs font-bold rounded-xl shadow-md shadow-[#6C63FF]/20 transition-all cursor-pointer min-h-[38px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Quote</span>
        </button>
      </PageHeader>

      {/* Control Bar: Search + Sort */}
      <div className="p-4 rounded-2xl bg-[#0D1424] border border-[#18243A] shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex-1 max-w-xl">
            <SearchBar
              id="quotes-search-input"
              value={searchTerm}
              onChange={(val) => {
                setSearchTerm(val);
                setCurrentPage(1);
              }}
              placeholder="Search by quote #, customer, service, or email..."
              ariaLabel="Search quotes by number, customer name, or service title"
            />
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-3">
            <SortControl<QuoteSortField>
              options={sortOptions}
              currentSort={sortBy}
              direction={sortDirection}
              onSortChange={(val) => setSortBy(val)}
              onDirectionToggle={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 pt-1 border-t border-[#18243A]/80">
          <span className="text-[11px] text-[#91A0B8] uppercase font-bold mr-1 hidden sm:inline">
            Status:
          </span>
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatusFilter(tab);
                setCurrentPage(1);
              }}
              aria-pressed={statusFilter === tab}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[32px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] ${
                statusFilter === tab
                  ? 'bg-[#6C63FF] text-white shadow-md shadow-[#6C63FF]/25'
                  : 'bg-[#151F33] text-[#91A0B8] hover:text-[#F4F7FB] border border-[#18243A]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Reusable Filter Panel with Advanced Dropdowns & Chips */}
        <FilterPanel
          activeFilters={activeFilters}
          onRemoveFilter={handleRemoveFilter}
          onResetAll={handleResetAll}
          resultCount={processedQuotes.length}
          totalCount={quotes.length}
          hasAdvancedFilters={true}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="quote-value-range-filter" className="block text-[11px] text-[#91A0B8] font-semibold mb-1">
                Filter by Value Range:
              </label>
              <select
                id="quote-value-range-filter"
                value={valueRangeFilter}
                onChange={(e) => {
                  setValueRangeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#151F33] text-[#F4F7FB] text-xs font-medium border border-[#18243A] rounded-xl px-3 py-2 appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]/40 cursor-pointer"
              >
                <option value="All" className="bg-[#0D1424]">All Values</option>
                <option value="under1k" className="bg-[#0D1424]">Under $1,000</option>
                <option value="1k-5k" className="bg-[#0D1424]">$1,000 – $5,000</option>
                <option value="above5k" className="bg-[#0D1424]">Over $5,000</option>
              </select>
            </div>
          </div>
        </FilterPanel>
      </div>

      {/* Table or Empty State */}
      {processedQuotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No matching quotes found"
          description="There are currently no quotations matching your selected search keywords or filter criteria."
          actionText="+ Create Quote"
          onAction={onOpenNewQuote}
          secondaryActionText="Reset All Filters"
          onSecondaryAction={handleResetAll}
        />
      ) : (
        <div className="rounded-2xl bg-[#0D1424] border border-[#18243A] overflow-hidden shadow-xl">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs" aria-label="Quotations Table">
              <thead className="bg-[#080D18] border-b border-[#18243A] text-[#91A0B8] uppercase tracking-wider font-semibold">
                <tr>
                  <th scope="col" className="py-3.5 px-4">Quote #</th>
                  <th scope="col" className="py-3.5 px-4">Customer</th>
                  <th scope="col" className="py-3.5 px-4">Service</th>
                  <th scope="col" className="py-3.5 px-4">Amount</th>
                  <th scope="col" className="py-3.5 px-4">Status</th>
                  <th scope="col" className="py-3.5 px-4">Created</th>
                  <th scope="col" className="py-3.5 px-4">Valid Until</th>
                  <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18243A]/80">
                {paginatedQuotes.map((quote) => (
                  <tr
                    key={quote.id}
                    onClick={() => onSelectQuote(quote)}
                    className="hover:bg-[#151F33]/60 transition-colors cursor-pointer group focus-within:bg-[#151F33]/60"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onSelectQuote(quote);
                    }}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#F5B942]">
                      {quote.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#F4F7FB] group-hover:text-[#39D9FF] transition-colors">
                        {quote.customerName}
                      </div>
                      <div className="text-[#91A0B8] text-[11px]">{quote.location}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#F4F7FB] font-medium max-w-xs truncate">
                      {quote.serviceTitle}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-sm text-[#F4F7FB]">
                      {formatPKR(quote.total)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={quote.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-[#91A0B8] text-[11px] font-mono">
                      {quote.createdAt}
                    </td>
                    <td className="py-3.5 px-4 text-[#91A0B8] text-[11px] font-mono">
                      {quote.validUntil}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenCustomerPreview(quote)}
                          className="p-1.5 rounded-lg text-[#39D9FF] hover:bg-[#39D9FF]/10 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#39D9FF]"
                          title="Preview Customer View"
                          aria-label={`Open customer preview for quote ${quote.id}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectQuote(quote)}
                          className="p-1.5 rounded-lg text-[#91A0B8] hover:text-[#F4F7FB] hover:bg-[#18243A] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#39D9FF]"
                          title="View Details"
                          aria-label={`View details for quote ${quote.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {quote.status === 'Awaiting Approval' && (
                          <button
                            type="button"
                            onClick={() => onApproveQuoteClick(quote)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-black bg-[#35D07F] hover:bg-[#35D07F]/90 transition-all shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-[#35D07F]"
                            title="Quick Approve"
                            aria-label={`Approve quote ${quote.id}`}
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="block md:hidden divide-y divide-[#18243A]">
            {paginatedQuotes.map((quote) => (
              <div
                key={quote.id}
                onClick={() => onSelectQuote(quote)}
                className="p-4 hover:bg-[#151F33]/40 transition-colors cursor-pointer space-y-2.5"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSelectQuote(quote);
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#F5B942]">{quote.id}</span>
                  <StatusBadge status={quote.status} size="sm" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#F4F7FB]">{quote.customerName}</h4>
                  <p className="text-xs text-[#91A0B8] truncate">{quote.serviceTitle}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-[#91A0B8] pt-1">
                  <span>Valid until {quote.validUntil}</span>
                  <span className="font-mono font-bold text-[#35D07F] text-sm">
                    {formatPKR(quote.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={processedQuotes.length}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => setPageSize(size)}
            pageSizeOptions={[10, 25, 50]}
          />
        </div>
      )}
    </div>
  );
};
