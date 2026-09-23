import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  color?: string;
  subtitle?: string;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  change,
  isPositive = true,
  icon: Icon,
  color = '#6C63FF',
  subtitle,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl bg-[#0D1424] border border-[#18243A] hover:border-[#1E2E4A] transition-all duration-200 relative overflow-hidden group ${
        onClick ? 'cursor-pointer hover:shadow-lg' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-[#91A0B8] tracking-wider uppercase">
            {label}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#F4F7FB] mt-2 font-mono tracking-tight">
            {value}
          </div>
        </div>

        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
          style={{
            backgroundColor: `${color}15`,
            color: color,
            border: `1px solid ${color}30`
          }}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(change || subtitle) && (
        <div className="mt-4 pt-3 border-t border-[#18243A]/80 flex items-center justify-between text-xs">
          {change && (
            <span
              className={`flex items-center gap-1 font-semibold ${
                isPositive ? 'text-[#35D07F]' : 'text-[#FF647C]'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {change}
            </span>
          )}
          {subtitle && <span className="text-[#91A0B8] text-[11px] truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
