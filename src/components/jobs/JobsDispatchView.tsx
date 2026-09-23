import React, { useState, useMemo } from 'react';
import { PageHeader } from '../common/PageHeader';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
import { SearchBar } from '../common/SearchBar';
import { SortControl, SortOption } from '../common/SortControl';
import { FilterPanel, ActiveFilter } from '../common/FilterPanel';
import { Pagination } from '../common/Pagination';
import { Job, JobStatus, Technician } from '../../types';
import {
  Truck,
  Kanban,
  List,
  Clock,
  MapPin,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface JobsDispatchViewProps {
  jobs: Job[];
  technicians: Technician[];
  onSelectJob: (job: Job) => void;
  onStatusChange: (jobId: string, newStatus: JobStatus) => void;
  onOpenAssignTech: (job: Job) => void;
}

type JobSortField = 'scheduledDate' | 'priority' | 'customerName' | 'status' | 'title';

export const JobsDispatchView: React.FC<JobsDispatchViewProps> = ({
  jobs,
  technicians,
  onSelectJob,
  onStatusChange,
  onOpenAssignTech
}) => {
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [techFilter, setTechFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<JobSortField>('scheduledDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const kanbanColumns: JobStatus[] = [
    'Scheduled',
    'Assigned',
    'In Progress',
    'Awaiting Completion',
    'Completed'
  ];

  // Active filters
  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const list: ActiveFilter[] = [];
    if (priorityFilter !== 'All') {
      list.push({ id: 'priority', label: 'Priority', value: priorityFilter });
    }
    if (techFilter !== 'All') {
      const techName = techFilter === 'unassigned' ? 'Unassigned' : techFilter;
      list.push({ id: 'tech', label: 'Tech', value: techName });
    }
    if (searchTerm.trim()) {
      list.push({ id: 'search', label: 'Query', value: `"${searchTerm}"` });
    }
    return list;
  }, [priorityFilter, techFilter, searchTerm]);

  const handleRemoveFilter = (id: string) => {
    if (id === 'priority') setPriorityFilter('All');
    if (id === 'tech') setTechFilter('All');
    if (id === 'search') setSearchTerm('');
    setCurrentPage(1);
  };

  const handleResetAll = () => {
    setPriorityFilter('All');
    setTechFilter('All');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Filtered & Sorted jobs
  const processedJobs = useMemo(() => {
    const filtered = jobs.filter((j) => {
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        j.id.toLowerCase().includes(term) ||
        j.title.toLowerCase().includes(term) ||
        j.customerName.toLowerCase().includes(term) ||
        j.location.toLowerCase().includes(term) ||
        (j.technicianName && j.technicianName.toLowerCase().includes(term));

      const matchPriority = priorityFilter === 'All' || j.priority?.toLowerCase() === priorityFilter.toLowerCase();

      let matchTech = true;
      if (techFilter === 'unassigned') {
        matchTech = !j.technicianName;
      } else if (techFilter !== 'All') {
        matchTech = j.technicianName === techFilter;
      }

      return matchSearch && matchPriority && matchTech;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'priority') {
        const priorityWeight: Record<string, number> = { Urgent: 3, High: 2, Normal: 1, Low: 0 };
        comparison = (priorityWeight[a.priority] || 0) - (priorityWeight[b.priority] || 0);
      } else if (sortBy === 'customerName') {
        comparison = a.customerName.localeCompare(b.customerName);
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else {
        // scheduledDate
        comparison = new Date(a.scheduledDate || 0).getTime() - new Date(b.scheduledDate || 0).getTime();
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [jobs, searchTerm, priorityFilter, techFilter, sortBy, sortDirection]);

  // Pagination for table
  const totalPages = Math.ceil(processedJobs.length / pageSize) || 1;
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedJobs.slice(start, start + pageSize);
  }, [processedJobs, currentPage, pageSize]);

  const sortOptions: SortOption<JobSortField>[] = [
    { value: 'scheduledDate', label: 'Date Scheduled' },
    { value: 'priority', label: 'Priority Level' },
    { value: 'customerName', label: 'Customer Name' },
    { value: 'status', label: 'Status' },
    { value: 'title', label: 'Service Title' }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <PageHeader
        title="Jobs & Dispatch"
        subtitle="Manage dispatch board, schedule routes, and track field progress."
        badge={`${jobs.length} Work Orders`}
      >
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0D1424] border border-[#18243A]">
          <button
            type="button"
            onClick={() => setViewMode('board')}
            aria-pressed={viewMode === 'board'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer min-h-[32px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39D9FF] ${
              viewMode === 'board'
                ? 'bg-[#18243A] text-[#39D9FF] shadow-xs'
                : 'text-[#91A0B8] hover:text-[#F4F7FB]'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Board</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            aria-pressed={viewMode === 'table'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer min-h-[32px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39D9FF] ${
              viewMode === 'table'
                ? 'bg-[#18243A] text-[#39D9FF] shadow-xs'
                : 'text-[#91A0B8] hover:text-[#F4F7FB]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
        </div>
      </PageHeader>

      {/* Control Bar: Search + Filters + Sort */}
      <div className="p-4 rounded-2xl bg-[#0D1424] border border-[#18243A] shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex-1 max-w-xl">
            <SearchBar
              id="jobs-search-input"
              value={searchTerm}
              onChange={(val) => {
                setSearchTerm(val);
                setCurrentPage(1);
              }}
              placeholder="Search by job ID, customer, technician, or address..."
              ariaLabel="Search work orders and jobs"
            />
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-3">
            <SortControl<JobSortField>
              options={sortOptions}
              currentSort={sortBy}
              direction={sortDirection}
              onSortChange={(val) => setSortBy(val)}
              onDirectionToggle={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            />
          </div>
        </div>

        {/* Filter Panel */}
        <FilterPanel
          activeFilters={activeFilters}
          onRemoveFilter={handleRemoveFilter}
          onResetAll={handleResetAll}
          resultCount={processedJobs.length}
          totalCount={jobs.length}
          hasAdvancedFilters={true}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="job-priority-filter" className="block text-[11px] text-[#91A0B8] font-semibold mb-1">
                Filter by Priority:
              </label>
              <select
                id="job-priority-filter"
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#151F33] text-[#F4F7FB] text-xs font-medium border border-[#18243A] rounded-xl px-3 py-2 appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#39D9FF]/40 cursor-pointer"
              >
                <option value="All" className="bg-[#0D1424]">All Priorities</option>
                <option value="Normal" className="bg-[#0D1424]">Normal</option>
                <option value="High" className="bg-[#0D1424]">High</option>
                <option value="Urgent" className="bg-[#0D1424]">Urgent</option>
              </select>
            </div>

            <div>
              <label htmlFor="job-tech-filter" className="block text-[11px] text-[#91A0B8] font-semibold mb-1">
                Filter by Assigned Technician:
              </label>
              <select
                id="job-tech-filter"
                value={techFilter}
                onChange={(e) => {
                  setTechFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#151F33] text-[#F4F7FB] text-xs font-medium border border-[#18243A] rounded-xl px-3 py-2 appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#39D9FF]/40 cursor-pointer"
              >
                <option value="All" className="bg-[#0D1424]">All Technicians</option>
                <option value="unassigned" className="bg-[#0D1424]">Unassigned Work Orders</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.name} className="bg-[#0D1424]">
                    {tech.name} ({tech.specialization})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </FilterPanel>
      </div>

      {processedJobs.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No work orders found"
          description="There are currently no jobs matching your active search keywords or filter criteria."
          actionText="Reset All Filters"
          onAction={handleResetAll}
        />
      ) : viewMode === 'board' ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map((colStatus) => {
            const colJobs = processedJobs.filter((j) => j.status === colStatus);

            return (
              <div
                key={colStatus}
                className="flex flex-col rounded-2xl bg-[#0D1424] border border-[#18243A] min-w-[240px]"
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-[#18243A] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#F4F7FB]">{colStatus}</span>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-[#151F33] text-[11px] font-mono text-[#91A0B8] flex items-center justify-center font-bold">
                    {colJobs.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[640px]">
                  {colJobs.length === 0 ? (
                    <div className="p-6 text-center text-[11px] text-[#91A0B8]/60 border border-dashed border-[#18243A]/60 rounded-xl">
                      No jobs in {colStatus}
                    </div>
                  ) : (
                    colJobs.map((job) => (
                      <div
                        key={job.id}
                        onClick={() => onSelectJob(job)}
                        className="p-3.5 rounded-xl bg-[#151F33]/80 hover:bg-[#151F33] border border-[#18243A] hover:border-[#39D9FF]/40 transition-all cursor-pointer space-y-2.5 shadow-xs group"
                        tabIndex={0}
                        role="button"
                        aria-label={`Job ${job.id}: ${job.title}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') onSelectJob(job);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-[#39D9FF]">
                            {job.id}
                          </span>
                          <span className="text-[10px] font-bold text-[#F5B942]">
                            {job.priority}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-[#F4F7FB] group-hover:text-[#39D9FF] transition-colors leading-snug">
                            {job.title}
                          </h4>
                          <span className="text-[11px] text-[#91A0B8] block mt-0.5">
                            {job.customerName}
                          </span>
                        </div>

                        <div className="text-[11px] text-[#91A0B8] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#91A0B8] shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </div>

                        <div className="pt-2 border-t border-[#18243A] flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1 text-[#91A0B8]">
                            <Clock className="w-3 h-3" />
                            <span>{job.scheduledTime}</span>
                          </div>

                          <div className="text-right">
                            {job.technicianName ? (
                              <span className="font-semibold text-[#F4F7FB] text-[11px]">
                                {job.technicianName.split(' ')[0]}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenAssignTech(job);
                                }}
                                className="text-[10px] text-[#39D9FF] hover:underline cursor-pointer"
                              >
                                + Assign
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="rounded-2xl bg-[#0D1424] border border-[#18243A] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" aria-label="Work Orders and Dispatch Table">
              <thead className="bg-[#080D18] border-b border-[#18243A] text-[#91A0B8] uppercase tracking-wider font-semibold">
                <tr>
                  <th scope="col" className="py-3.5 px-4">Job ID</th>
                  <th scope="col" className="py-3.5 px-4">Customer & Service</th>
                  <th scope="col" className="py-3.5 px-4">Location</th>
                  <th scope="col" className="py-3.5 px-4">Assigned Tech</th>
                  <th scope="col" className="py-3.5 px-4">Scheduled</th>
                  <th scope="col" className="py-3.5 px-4">Status</th>
                  <th scope="col" className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18243A]/80">
                {paginatedJobs.map((job) => (
                  <tr
                    key={job.id}
                    onClick={() => onSelectJob(job)}
                    className="hover:bg-[#151F33]/60 transition-colors cursor-pointer group focus-within:bg-[#151F33]/60"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onSelectJob(job);
                    }}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#39D9FF]">
                      {job.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#F4F7FB] group-hover:text-[#39D9FF] transition-colors">
                        {job.title}
                      </div>
                      <div className="text-[#91A0B8] text-[11px]">{job.customerName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#91A0B8]">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#91A0B8]" />
                        <span>{job.location}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {job.technicianName ? (
                        <span className="font-semibold text-[#F4F7FB]">{job.technicianName}</span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenAssignTech(job);
                          }}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#39D9FF]/10 text-[#39D9FF] border border-[#39D9FF]/30 cursor-pointer"
                        >
                          + Assign
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#91A0B8]">
                      <div>{job.scheduledDate}</div>
                      <div className="text-[11px] text-[#39D9FF] font-semibold">
                        {job.scheduledTime}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={job.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectJob(job);
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-semibold text-[#39D9FF] bg-[#39D9FF]/10 hover:bg-[#39D9FF]/20 transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={processedJobs.length}
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
