import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toLowerCase();

  let styles = 'bg-[#151F33] text-[#91A0B8] border-white/10';

  if (
    normalized === 'approved' ||
    normalized === 'completed' ||
    normalized === 'paid' ||
    normalized === 'converted' ||
    normalized === 'available' ||
    normalized === 'vip'
  ) {
    styles = 'bg-[#35D07F]/10 text-[#35D07F] border-[#35D07F]/30';
  } else if (
    normalized === 'in progress' ||
    normalized === 'on job' ||
    normalized === 'quoted' ||
    normalized === 'qualified' ||
    normalized === 'active'
  ) {
    styles = 'bg-[#39D9FF]/10 text-[#39D9FF] border-[#39D9FF]/30';
  } else if (
    normalized === 'awaiting approval' ||
    normalized === 'awaiting completion' ||
    normalized === 'assigned' ||
    normalized === 'scheduled' ||
    normalized === 'contacted'
  ) {
    styles = 'bg-[#F5B942]/10 text-[#F5B942] border-[#F5B942]/30';
  } else if (
    normalized === 'declined' ||
    normalized === 'overdue' ||
    normalized === 'lost' ||
    normalized === 'offline'
  ) {
    styles = 'bg-[#FF647C]/10 text-[#FF647C] border-[#FF647C]/30';
  } else if (normalized === 'new' || normalized === 'sent' || normalized === 'draft') {
    styles = 'bg-[#6C63FF]/15 text-[#6C63FF] border-[#6C63FF]/35';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border tracking-wide whitespace-nowrap ${padding} ${styles}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
};
