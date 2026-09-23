import React, { useState, useMemo } from 'react';
import { PageHeader } from '../common/PageHeader';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
import { SearchBar } from '../common/SearchBar';
import { SortControl, SortOption } from '../common/SortControl';
import { FilterPanel, ActiveFilter } from '../common/FilterPanel';
import { Pagination } from '../common/Pagination';
import { Customer } from '../../types';
import {
  Users,
  Building,
  Eye
} from 'lucide-react';

interface CustomersViewProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
  onCreateLeadForCustomer: (customer: Customer) => void;
}

type CustomerSortField = 'totalSpend' | 'name' | 'company' | 'totalJobs';

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  onSelectCustomer,
  onCreateLeadForCustomer
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<CustomerSortField>('totalSpend');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

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

  const processedCustomers = useMemo(() => {
    const filtered = customers.filter((c) => {
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        c.name.toLowerCase().includes(term) ||
        (c.company && c.company.toLowerCase().includes(term)) ||
        c.email.toLowerCase().includes(term) ||
        c.location.toLowerCase().includes(term);

      const matchStatus = statusFilter === 'All' || c.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'company') {
        comparison = (a.company || '').localeCompare(b.company || '');
      } else if (sortBy === 'totalJobs') {
        const jobsA = a.totalJobs || a.activeJobsCount || 0;
        const jobsB = b.totalJobs || b.activeJobsCount || 0;
        comparison = jobsA - jobsB;
      } else {
        // totalSpend
        const spendA = a.totalSpent || a.totalSpend || 0;
        const spendB = b.totalSpent || b.totalSpend || 0;
        comparison = spendA - spendB;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [customers, searchTerm, statusFilter, sortBy, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedCustomers.length / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedCustomers.slice(start, start + pageSize);
  }, [processedCustomers, currentPage, pageSize]);

  const sortOptions: SortOption<CustomerSortField>[] = [
    { value: 'totalSpend', label: 'Lifetime Spend' },
    { value: 'name', label: 'Customer Name' },
    { value: 'company', label: 'Company Name' },
    { value: 'totalJobs', label: 'Job Count' }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <PageHeader
        title="Customers"
        subtitle="Manage commercial client relationships, lifetime billing, and service histories."
        badge={`${customers.length} Accounts`}
      />

      {/* Control Bar: Search + Filter + Sort */}
      <div className="p-4 rounded-2xl bg-[#0D1424] border border-[#18243A] shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex-1 max-w-xl">
            <SearchBar
              id="customers-search-input"
              value={searchTerm}
              onChange={(val) => {
                setSearchTerm(val);
                setCurrentPage(1);
              }}
              placeholder="Search by customer name, company, email, or city..."
              ariaLabel="Search customers directory"
            />
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-3">
            <SortControl<CustomerSortField>
              options={sortOptions}
              currentSort={sortBy}
              direction={sortDirection}
              onSortChange={(val) => setSortBy(val)}
              onDirectionToggle={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            />
          </div>
        </div>

        {/* Filter Panel with status selector */}
        <FilterPanel
          activeFilters={activeFilters}
          onRemoveFilter={handleRemoveFilter}
          onResetAll={handleResetAll}
          resultCount={processedCustomers.length}
          totalCount={customers.length}
          hasAdvancedFilters={true}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="customer-status-filter" className="block text-[11px] text-[#91A0B8] font-semibold mb-1">
                Account Status:
              </label>
              <select
                id="customer-status-filter"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#151F33] text-[#F4F7FB] text-xs font-medium border border-[#18243A] rounded-xl px-3 py-2 appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#39D9FF]/40 cursor-pointer"
              >
                <option value="All" className="bg-[#0D1424]">All Statuses</option>
                <option value="Active" className="bg-[#0D1424]">Active</option>
                <option value="Inactive" className="bg-[#0D1424]">Inactive</option>
              </select>
            </div>
          </div>
        </FilterPanel>
      </div>

      {/* Table / Cards / EmptyState */}
      {processedCustomers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customer accounts found"
          description="There are currently no customer accounts matching your search query or filter selection."
          actionText="Reset All Filters"
          onAction={handleResetAll}
        />
      ) : (
        <div className="rounded-2xl bg-[#0D1424] border border-[#18243A] overflow-hidden shadow-xl">
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs" aria-label="Customer Accounts Table">
              <thead className="bg-[#080D18] border-b border-[#18243A] text-[#91A0B8] uppercase tracking-wider font-semibold">
                <tr>
                  <th scope="col" className="py-3.5 px-4">Customer Name</th>
                  <th scope="col" className="py-3.5 px-4">Company</th>
                  <th scope="col" className="py-3.5 px-4">Email</th>
                  <th scope="col" className="py-3.5 px-4">Phone</th>
                  <th scope="col" className="py-3.5 px-4">Location</th>
                  <th scope="col" className="py-3.5 px-4 font-mono">Total Spend</th>
                  <th scope="col" className="py-3.5 px-4 text-center">Jobs</th>
                  <th scope="col" className="py-3.5 px-4">Status</th>
                  <th scope="col" className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18243A]/80">
                {paginatedCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    onClick={() => onSelectCustomer(cust)}
                    className="hover:bg-[#151F33]/60 transition-colors cursor-pointer group focus-within:bg-[#151F33]/60"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onSelectCustomer(cust);
                    }}
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#F4F7FB] group-hover:text-[#39D9FF] transition-colors">
                        {cust.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#91A0B8]">
                      {cust.company ? (
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3 text-[#91A0B8]" />
                          {cust.company}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#91A0B8]">{cust.email}</td>
                    <td className="py-3.5 px-4 text-[#91A0B8]">{cust.phone}</td>
                    <td className="py-3.5 px-4 text-[#91A0B8]">{cust.location}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#35D07F]">
                      ${(cust.totalSpent || cust.totalSpend || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-[#F4F7FB]">
                      {cust.totalJobs || cust.activeJobsCount || 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={cust.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectCustomer(cust)}
                          className="p-1.5 rounded-lg text-[#91A0B8] hover:text-[#F4F7FB] hover:bg-[#18243A] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#39D9FF]"
                          title="View Customer Profile"
                          aria-label={`View customer profile for ${cust.name}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onCreateLeadForCustomer(cust)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#39D9FF] bg-[#39D9FF]/10 hover:bg-[#39D9FF]/20 rounded-lg transition-colors border border-[#39D9FF]/20 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#39D9FF]"
                        >
                          + Lead
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="block md:hidden divide-y divide-[#18243A]">
            {paginatedCustomers.map((cust) => (
              <div
                key={cust.id}
                onClick={() => onSelectCustomer(cust)}
                className="p-4 hover:bg-[#151F33]/40 transition-colors cursor-pointer space-y-2"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSelectCustomer(cust);
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-[#F4F7FB]">{cust.name}</span>
                  <StatusBadge status={cust.status} size="sm" />
                </div>
                <div className="text-xs text-[#91A0B8]">
                  {cust.company && <div className="text-[#F4F7FB]/90">{cust.company}</div>}
                  <div>{cust.email} • {cust.phone}</div>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[#91A0B8]">{cust.location}</span>
                  <span className="font-mono font-bold text-[#35D07F]">
                    ${(cust.totalSpent || cust.totalSpend || 0).toLocaleString()} ({cust.totalJobs || cust.activeJobsCount || 1} jobs)
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={processedCustomers.length}
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
