import React, { useState } from 'react';
import { BarChart3, Table, Info } from 'lucide-react';

interface ResponsiveChartContainerProps {
  title: string;
  subtitle?: string;
  badge?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  accessibleDataTable?: {
    headers: string[];
    rows: (string | number)[][];
  };
  className?: string;
}

export const ResponsiveChartContainer: React.FC<ResponsiveChartContainerProps> = ({
  title,
  subtitle,
  badge,
  headerAction,
  children,
  accessibleDataTable,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  return (
    <div className={`p-5 rounded-2xl bg-[#0D1424] border border-[#18243A] shadow-xl ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#18243A]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#F4F7FB]">{title}</h3>
            {badge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#39D9FF]/10 text-[#39D9FF] border border-[#39D9FF]/20">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-[#91A0B8] mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {accessibleDataTable && (
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'chart' ? 'table' : 'chart')}
              className="p-1.5 rounded-lg bg-[#151F33] hover:bg-[#18243A] text-[#91A0B8] hover:text-[#F4F7FB] border border-[#18243A] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title={viewMode === 'chart' ? 'Switch to accessible data table' : 'Switch to chart'}
              aria-label={viewMode === 'chart' ? 'Switch to accessible data table' : 'Switch to chart'}
            >
              {viewMode === 'chart' ? (
                <>
                  <Table className="w-3.5 h-3.5 text-[#39D9FF]" />
                  <span className="text-[11px] hidden sm:inline">Table</span>
                </>
              ) : (
                <>
                  <BarChart3 className="w-3.5 h-3.5 text-[#39D9FF]" />
                  <span className="text-[11px] hidden sm:inline">Chart</span>
                </>
              )}
            </button>
          )}
          {headerAction}
        </div>
      </div>

      {/* Chart or Accessible Data Table */}
      <div className="pt-4">
        {viewMode === 'chart' ? (
          <div className="w-full overflow-hidden focus-visible:outline-none" tabIndex={0} role="region" aria-label={`${title} chart visualizer`}>
            {children}
          </div>
        ) : (
          accessibleDataTable && (
            <div className="overflow-x-auto rounded-xl border border-[#18243A]">
              <table className="w-full text-left text-xs" aria-label={`${title} data table`}>
                <thead className="bg-[#080D18] text-[#91A0B8] uppercase text-[10px] font-semibold">
                  <tr>
                    {accessibleDataTable.headers.map((h, i) => (
                      <th key={i} className="py-2.5 px-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#18243A]">
                  {accessibleDataTable.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[#151F33]/40">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="py-2.5 px-3 font-mono text-[#F4F7FB]">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};
