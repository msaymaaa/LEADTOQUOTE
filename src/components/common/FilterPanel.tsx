import React, { useState } from 'react';
import { Filter, X, RotateCcw, ChevronDown, ChevronUp, Calendar, Tag, DollarSign } from 'lucide-react';

export interface ActiveFilter {
  id: string;
  label: string;
  value: string;
}

interface FilterPanelProps {
  activeFilters: ActiveFilter[];
  onRemoveFilter: (id: string) => void;
  onResetAll: () => void;
  resultCount: number;
  totalCount: number;
  children?: React.ReactNode;
  hasAdvancedFilters?: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  activeFilters,
  onRemoveFilter,
  onResetAll,
  resultCount,
  totalCount,
  children,
  hasAdvancedFilters = false
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  return (
    <div className="space-y-3">
      {/* Top Bar: Controls & Active Filters Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Results Counter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-[#F4F7FB]">
            Showing <span className="font-mono text-[#39D9FF]">{resultCount}</span> of{' '}
            <span className="font-mono text-[#91A0B8]">{totalCount}</span> records
          </span>

          {activeFilters.length > 0 && (
            <button
              type="button"
              onClick={onResetAll}
              className="ml-2 inline-flex items-center gap-1 text-[11px] text-[#FF647C] hover:text-[#FF647C]/80 font-medium cursor-pointer transition-colors"
              aria-label="Reset all applied filters"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>

        {/* Collapsible toggle button if advanced filters are present */}
        {hasAdvancedFilters && (
          <button
            type="button"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isAdvancedOpen
                ? 'bg-[#6C63FF]/20 text-[#39D9FF] border-[#6C63FF]/40'
                : 'bg-[#151F33] text-[#91A0B8] hover:text-[#F4F7FB] border-[#18243A]'
            }`}
            aria-expanded={isAdvancedOpen}
            aria-controls="advanced-filters-section"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Advanced Filters</span>
            {isAdvancedOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1" aria-label="Active filters">
          <span className="text-[11px] text-[#91A0B8] uppercase font-semibold mr-1">Active:</span>
          {activeFilters.map((filter) => (
            <span
              key={filter.id}
              className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-medium bg-[#18243A] text-[#F4F7FB] border border-[#6C63FF]/30 shadow-xs group"
            >
              <span className="text-[#91A0B8] text-[10px] uppercase font-bold">{filter.label}:</span>
              <span className="text-[#39D9FF] font-semibold">{filter.value}</span>
              <button
                type="button"
                onClick={() => onRemoveFilter(filter.id)}
                className="p-0.5 rounded text-[#91A0B8] hover:text-[#FF647C] hover:bg-[#151F33] transition-colors cursor-pointer"
                aria-label={`Remove filter for ${filter.label}: ${filter.value}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Collapsible Advanced Filters Container */}
      {hasAdvancedFilters && isAdvancedOpen && (
        <div
          id="advanced-filters-section"
          className="p-4 rounded-xl bg-[#0D1424] border border-[#18243A] shadow-inner animate-in fade-in duration-150"
        >
          {children}
        </div>
      )}
    </div>
  );
};
