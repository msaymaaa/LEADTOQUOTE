import React, { useState, useMemo } from 'react';
import { PageHeader } from '../common/PageHeader';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
import { SearchBar } from '../common/SearchBar';
import { SortControl, SortOption } from '../common/SortControl';
import { FilterPanel, ActiveFilter } from '../common/FilterPanel';
import { Pagination } from '../common/Pagination';
import { Lead } from '../../types';
import { formatPKR } from '../../lib/currency';
import {
  Plus,
  Eye,
  FileText,
  MapPin,
  Calendar,
  UserCheck,
  Building2,
  Tag,
  AlertCircle
} from 'lucide-react';

interface LeadsViewProps {
  leads: Lead[];
  onOpenNewLead: () => void;
  onSelectLead: (lead: Lead) => void;
  onCreateQuoteFromLead: (lead: Lead) => void;
}

type LeadSortField = 'createdAt' | 'estimatedValue' | 'customerName' | 'status';

export const LeadsView: React.FC<LeadsViewProps> = ({
  leads,
  onOpenNewLead,
  onSelectLead,
  onCreateQuoteFromLead
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [serviceFilter, setServiceFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<LeadSortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const statusTabs = ['All', 'New', 'Contacted', 'Qualified', 'Quoted', 'Converted'];

  // Dynamically extract unique services from dataset
  const uniqueServices = useMemo(() => {
    const services = new Set<string>();
    leads.forEach((l) => {
      if (l.serviceType) services.add(l.serviceType);
    });
    return ['All', ...Array.from(services).sort()];
  }, [leads]);

  // Compute active filters for FilterPanel chips
  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const list: ActiveFilter[] = [];
    if (statusFilter !== 'All') {
      list.push({ id: 'status', label: 'Status', value: statusFilter });
    }
    if (serviceFilter !== 'All') {
      list.push({ id: 'service', label: 'Service', value: serviceFilter });
    }
    if (searchTerm.trim()) {
      list.push({ id: 'search', label: 'Query', value: `"${searchTerm}"` });
    }
    return list;
  }, [statusFilter, serviceFilter, searchTerm]);

  const handleRemoveFilter = (filterId: string) => {
    if (filterId === 'status') setStatusFilter('All');
    if (filterId === 'service') setServiceFilter('All');
    if (filterId === 'search') setSearchTerm('');
    setCurrentPage(1);
  };

  const handleResetAll = () => {
    setStatusFilter('All');
    setServiceFilter('All');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Filtered & Sorted leads
  const processedLeads = useMemo(() => {
    // 1. Filter
    const filtered = leads.filter((l) => {
      const matchStatus = statusFilter === 'All' || l.status.toLowerCase() === statusFilter.toLowerCase();
      const matchService = serviceFilter === 'All' || l.serviceType === serviceFilter;

      const term = searchTerm.trim().toLowerCase();
      const matchSearch =
        !term ||
        l.customerName.toLowerCase().includes(term) ||
        l.serviceType.toLowerCase().includes(term) ||
        (l.location && l.location.toLowerCase().includes(term)) ||
        (l.phone && l.phone.includes(term)) ||
        l.id.toLowerCase().includes(term);

      return matchStatus && matchService && matchSearch;
    });

    // 2. Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'estimatedValue') {
        comparison = a.estimatedValue - b.estimatedValue;
      } else if (sortBy === 'customerName') {
        comparison = a.customerName.localeCompare(b.customerName);
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else {
        // 'createdAt'
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [leads, statusFilter, serviceFilter, searchTerm, sortBy, sortDirection]);

  // Pagination slicing
  const totalPages = Math.ceil(processedLeads.length / pageSize) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedLeads.slice(start, start + pageSize);
  }, [processedLeads, currentPage, pageSize]);

  const sortOptions: SortOption<LeadSortField>[] = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'estimatedValue', label: 'Estimated Value' },
    { value: 'customerName', label: 'Customer Name' },
    { value: 'status', label: 'Lead Status' }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <PageHeader
        title="Leads"
        subtitle="Discover, filter, and qualify prospective customer work requests."
        badge={`${leads.length} Total`}
      >
        <button
          onClick={onOpenNewLead}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#6C63FF] hover:bg-[#6C63FF]/90 text-white text-xs font-bold rounded-xl shadow-md shadow-[#6C63FF]/20 transition-all cursor-pointer min-h-[38px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Lead</span>
        </button>
      </PageHeader>

      {/* Control Bar: Search + Sort */}
      <div className="p-4 rounded-2xl bg-[#0D1424] border border-[#18243A] shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Reusable Search Bar */}
          <div className="flex-1 max-w-xl">
            <SearchBar
              id="leads-search-input"
              value={searchTerm}
              onChange={(val) => {
                setSearchTerm(val);
                setCurrentPage(1);
              }}
              placeholder="Search leads by customer, service, city, phone, or ID..."
              ariaLabel="Search leads by customer, service type, location, or ID"
            />
          </div>

          {/* Sort Controls */}
          <div className="flex items-center justify-between lg:justify-end gap-3">
            <SortControl<LeadSortField>
              options={sortOptions}
              currentSort={sortBy}
              direction={sortDirection}
              onSortChange={(val) => setSortBy(val)}
              onDirectionToggle={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            />
          </div>
        </div>

        {/* Primary Filter Tabs (Status) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 pt-1 border-t border-[#18243A]/80">
          <span className="text-[11px] text-[#91A0B8] uppercase font-bold mr-1 hidden sm:inline">
            Status:
          </span>
          {statusTabs.map((tab) => (
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
          resultCount={processedLeads.length}
          totalCount={leads.length}
          hasAdvancedFilters={true}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="lead-service-filter" className="block text-[11px] text-[#91A0B8] font-semibold mb-1">
                Filter by Service Category:
              </label>
              <select
                id="lead-service-filter"
                value={serviceFilter}
                onChange={(e) => {
                  setServiceFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#151F33] text-[#F4F7FB] text-xs font-medium border border-[#18243A] rounded-xl px-3 py-2 appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]/40 cursor-pointer"
              >
                {uniqueServices.map((srv) => (
                  <option key={srv} value={srv} className="bg-[#0D1424]">
                    {srv === 'All' ? 'All Services' : srv}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </FilterPanel>
      </div>

      {/* Table or Empty State */}
      {processedLeads.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No matching leads found"
          description="None of your live leads matched the active search keywords or filter criteria."
          actionText="+ Create New Lead"
          onAction={onOpenNewLead}
          secondaryActionText="Reset All Filters"
          onSecondaryAction={handleResetAll}
        />
      ) : (
        <div className="rounded-2xl bg-[#0D1424] border border-[#18243A] overflow-hidden shadow-xl">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs" aria-label="Customer Leads Table">
              <thead className="bg-[#080D18] border-b border-[#18243A] text-[#91A0B8] uppercase tracking-wider font-semibold">
                <tr>
                  <th scope="col" className="py-3.5 px-4">Lead ID</th>
                  <th scope="col" className="py-3.5 px-4">Customer</th>
                  <th scope="col" className="py-3.5 px-4">Service</th>
                  <th scope="col" className="py-3.5 px-4">Location</th>
                  <th scope="col" className="py-3.5 px-4">Est. Value</th>
                  <th scope="col" className="py-3.5 px-4">Status</th>
                  <th scope="col" className="py-3.5 px-4">Created</th>
                  <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18243A]/80">
                {paginatedLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className="hover:bg-[#151F33]/60 transition-colors cursor-pointer group focus-within:bg-[#151F33]/60"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onSelectLead(lead);
                    }}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#39D9FF]">
                      {lead.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#F4F7FB] group-hover:text-[#39D9FF] transition-colors">
                        {lead.customerName}
                      </div>
                      <div className="text-[#91A0B8] text-[11px] font-mono">{lead.phone || 'No phone'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#F4F7FB] font-medium">
                      {lead.serviceType}
                    </td>
                    <td className="py-3.5 px-4 text-[#91A0B8]">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#91A0B8] shrink-0" />
                        <span className="truncate max-w-[140px]">{lead.location || 'Not specified'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#F4F7FB]">
                      {formatPKR(lead.estimatedValue)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={lead.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-[#91A0B8] text-[11px] font-mono">
                      {lead.createdAt}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectLead(lead)}
                          className="p-1.5 rounded-lg text-[#91A0B8] hover:text-[#F4F7FB] hover:bg-[#18243A] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#39D9FF]"
                          title="View Details"
                          aria-label={`View details for lead ${lead.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onCreateQuoteFromLead(lead)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#39D9FF] bg-[#39D9FF]/10 hover:bg-[#39D9FF]/20 rounded-lg transition-colors border border-[#39D9FF]/20 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#39D9FF]"
                          title="Generate formal quote"
                          aria-label={`Generate quote for lead ${lead.id}`}
                        >
                          Quote
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="block md:hidden divide-y divide-[#18243A]">
            {paginatedLeads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => onSelectLead(lead)}
                className="p-4 hover:bg-[#151F33]/40 transition-colors cursor-pointer space-y-2.5"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSelectLead(lead);
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#39D9FF]">{lead.id}</span>
                  <StatusBadge status={lead.status} size="sm" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#F4F7FB]">{lead.customerName}</h4>
                  <p className="text-xs text-[#91A0B8]">{lead.serviceType}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-[#91A0B8] pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {lead.location}
                  </span>
                  <span className="font-mono font-bold text-[#F4F7FB]">
                    {formatPKR(lead.estimatedValue)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={processedLeads.length}
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
