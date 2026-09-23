import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface SortOption<T extends string = string> {
  value: T;
  label: string;
}

interface SortControlProps<T extends string = string> {
  options: SortOption<T>[];
  currentSort: T;
  direction: 'asc' | 'desc';
  onSortChange: (value: T) => void;
  onDirectionToggle: () => void;
  id?: string;
  className?: string;
}

export const SortControl = <T extends string = string>({
  options,
  currentSort,
  direction,
  onSortChange,
  onDirectionToggle,
  id = 'sort-control',
  className = ''
}: SortControlProps<T>) => {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-xs text-[#91A0B8] hidden sm:inline whitespace-nowrap">
        Sort by:
      </label>
      <div className="relative">
        <select
          id={id}
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value as T)}
          aria-label="Sort dataset by field"
          className="bg-[#151F33] hover:bg-[#18243A] text-[#F4F7FB] text-xs font-medium border border-[#18243A] rounded-xl px-3 py-2 pr-7 appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]/40 cursor-pointer transition-colors"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0D1424] text-[#F4F7FB]">
              {opt.label}
            </option>
          ))}
        </select>
        <ArrowUpDown className="w-3 h-3 text-[#91A0B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      <button
        type="button"
        onClick={onDirectionToggle}
        className="p-2 rounded-xl bg-[#151F33] hover:bg-[#18243A] text-[#91A0B8] hover:text-[#F4F7FB] border border-[#18243A] transition-colors cursor-pointer"
        aria-label={`Sort direction currently ${direction === 'asc' ? 'ascending' : 'descending'}. Click to reverse.`}
        title={`Sort ${direction === 'asc' ? 'Ascending' : 'Descending'}`}
      >
        {direction === 'asc' ? (
          <ArrowUp className="w-3.5 h-3.5 text-[#39D9FF]" />
        ) : (
          <ArrowDown className="w-3.5 h-3.5 text-[#39D9FF]" />
        )}
      </button>
    </div>
  );
};
