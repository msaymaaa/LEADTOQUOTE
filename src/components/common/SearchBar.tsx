import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  resultCount?: number;
  totalCount?: number;
  isLoading?: boolean;
  className?: string;
  id?: string;
  debounceMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search by keyword, customer, email, ID...',
  ariaLabel,
  resultCount,
  totalCount,
  isLoading = false,
  className = '',
  id = 'global-search-bar',
  debounceMs = 250
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external value changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalValue(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onChange(val);
    }, debounceMs);
  };

  const handleClear = () => {
    setInternalValue('');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onChange('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <label htmlFor={id} className="sr-only">
        {ariaLabel || placeholder}
      </label>
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#91A0B8]">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#39D9FF]" />
        ) : (
          <Search className="w-4 h-4" />
        )}
      </div>

      <input
        id={id}
        type="search"
        role="searchbox"
        value={internalValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel || placeholder}
        className="w-full bg-[#151F33] hover:bg-[#18243A]/80 border border-[#18243A] focus:border-[#6C63FF] rounded-xl pl-9 pr-24 py-2 text-xs text-[#F4F7FB] placeholder-[#91A0B8]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]/30 transition-all"
      />

      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {internalValue && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-lg text-[#91A0B8] hover:text-[#F4F7FB] hover:bg-[#18243A] transition-colors cursor-pointer"
            aria-label="Clear search input"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {resultCount !== undefined && totalCount !== undefined && internalValue && (
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#18243A] text-[#39D9FF] border border-[#39D9FF]/20">
            {resultCount} / {totalCount}
          </span>
        )}
      </div>
    </div>
  );
};
