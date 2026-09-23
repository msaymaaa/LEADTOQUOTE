import React, { useState, useMemo } from 'react';
import { PageHeader } from '../common/PageHeader';
import { StatusBadge } from '../common/StatusBadge';
import { Technician, Job } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Search,
  Star,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Briefcase,
  Wrench,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Check,
  X,
  Clock
} from 'lucide-react';

interface TechniciansViewProps {
  technicians: Technician[];
  jobs: Job[];
  onSelectTechnician: (tech: Technician) => void;
  onAssignTechToJob: (tech: Technician) => void;
  onUpdateTechnicianStatus?: (techId: string, status: 'approved' | 'rejected') => Promise<void>;
}

export const TechniciansView: React.FC<TechniciansViewProps> = ({
  technicians,
  jobs,
  onSelectTechnician,
  onAssignTechToJob,
  onUpdateTechnicianStatus
}) => {
  const { profile } = useAuth();
  const isOwner = profile?.role === 'owner';

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [updatingTechId, setUpdatingTechId] = useState<string | null>(null);

  const filterTabs = ['All', 'Available', 'On Job', 'Off Duty', 'Pending Approval'];

  const pendingCount = useMemo(() => {
    return technicians.filter(
      (t) => (t.approvalStatus || t.technician_status) === 'pending'
    ).length;
  }, [technicians]);

  const filteredTechs = useMemo(() => {
    return technicians.filter((t) => {
      const techStatus = t.approvalStatus || t.technician_status || 'approved';
      let matchStatus = true;
      if (statusFilter === 'Pending Approval') {
        matchStatus = techStatus === 'pending';
      } else if (statusFilter !== 'All') {
        matchStatus = t.availability === statusFilter && techStatus === 'approved';
      }

      const term = searchTerm.toLowerCase();
      const matchSearch =
        t.name.toLowerCase().includes(term) ||
        t.specialization.toLowerCase().includes(term) ||
        (t.skills || []).some((s: string) => s.toLowerCase().includes(term));
      return matchStatus && matchSearch;
    });
  }, [technicians, statusFilter, searchTerm]);

  const handleStatusChange = async (techId: string, status: 'approved' | 'rejected') => {
    if (!onUpdateTechnicianStatus) return;
    setUpdatingTechId(techId);
    try {
      await onUpdateTechnicianStatus(techId, status);
    } finally {
      setUpdatingTechId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <PageHeader
        title="Technicians"
        subtitle="Manage field service specialists, certifications, onboarding verification, and real-time dispatch status."
        badge={`${technicians.length} Field Crew`}
      />

      {/* Owner Pending Onboarding Alert */}
      {isOwner && pendingCount > 0 && (
        <div className="p-4 rounded-2xl bg-[#F5B942]/10 border border-[#F5B942]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-[#F5B942]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              <strong>{pendingCount} field specialist{pendingCount > 1 ? 's are' : ' is'}</strong> awaiting onboarding review and approval before they can receive work order dispatches.
            </span>
          </div>
          <button
            onClick={() => setStatusFilter('Pending Approval')}
            className="px-3 py-1.5 rounded-xl bg-[#F5B942] hover:bg-[#F5B942]/90 text-black font-bold text-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            Review Pending
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0D1424] border border-[#18243A]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91A0B8]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, skill, or specialization..."
            className="w-full bg-[#151F33] border border-[#18243A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F4F7FB] placeholder-[#91A0B8]/60 focus:outline-none focus:border-[#6C63FF]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {filterTabs.map((tab) => {
            const isPendingTab = tab === 'Pending Approval';
            return (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === tab
                    ? 'bg-[#6C63FF] text-white shadow-md shadow-[#6C63FF]/25'
                    : 'bg-[#151F33] text-[#91A0B8] hover:text-[#F4F7FB] border border-[#18243A]'
                }`}
              >
                <span>{tab}</span>
                {isPendingTab && pendingCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#F5B942] text-black">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Technicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTechs.map((tech) => {
          const techStatus = tech.approvalStatus || tech.technician_status || 'approved';
          const isPending = techStatus === 'pending';
          const isRejected = techStatus === 'rejected';
          const isApproved = techStatus === 'approved';
          const isUpdating = updatingTechId === tech.id;

          return (
            <div
              key={tech.id}
              className={`p-5 rounded-2xl bg-[#0D1424] border transition-all duration-200 flex flex-col justify-between group shadow-lg ${
                isPending
                  ? 'border-[#F5B942]/40 shadow-[#F5B942]/5'
                  : isRejected
                  ? 'border-[#FF4D4D]/30 opacity-75'
                  : 'border-[#18243A] hover:border-[#1E2E4A]'
              }`}
            >
              <div>
                {/* Card Top: Avatar + Name + Availability / Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={tech.avatar}
                      alt={tech.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-2xl object-cover border border-[#18243A] group-hover:border-[#6C63FF]/50 transition-colors"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-[#F4F7FB] group-hover:text-[#39D9FF] transition-colors">
                        {tech.name}
                      </h4>
                      <span className="text-xs text-[#91A0B8] font-medium">
                        {tech.specialization}
                      </span>
                      <div className="flex items-center gap-1 text-[#F5B942] text-xs font-semibold mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{tech.rating}</span>
                        <span className="text-[#91A0B8] text-[11px] font-normal">
                          ({tech.jobsCompleted} completed)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {isPending ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F5B942]/20 text-[#F5B942] border border-[#F5B942]/40 animate-pulse flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Pending Review</span>
                      </span>
                    ) : isRejected ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF4D4D]/20 text-[#FF6B6B] border border-[#FF4D4D]/40">
                        Rejected
                      </span>
                    ) : (
                      <StatusBadge status={tech.availability} size="sm" />
                    )}
                  </div>
                </div>

                {/* Skills Tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(tech.skills || [tech.specialization]).map((skill: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-[#151F33] text-[#91A0B8] border border-white/5"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Current Assigned Job / Status */}
                <div className="mt-4 p-3 rounded-xl bg-[#151F33]/60 border border-[#18243A] text-xs space-y-1">
                  <span className="text-[10px] text-[#91A0B8] uppercase tracking-wider block">
                    {isPending ? 'Onboarding Status' : 'Current Assignment'}
                  </span>
                  {isPending ? (
                    <span className="text-xs text-[#F5B942] font-medium">
                      Requires Owner approval before receiving dispatches
                    </span>
                  ) : (tech.currentJob || tech.currentJobTitle) ? (
                    <div className="flex items-center justify-between font-semibold text-[#F4F7FB]">
                      <span className="truncate">{tech.currentJob || tech.currentJobTitle}</span>
                      <span className="text-[10px] text-[#39D9FF] font-mono shrink-0">ACTIVE</span>
                    </div>
                  ) : (
                    <span className="text-xs text-[#35D07F]">Ready for Next Dispatch</span>
                  )}
                </div>

                {/* Contact info */}
                <div className="mt-3 pt-3 border-t border-[#18243A] text-xs text-[#91A0B8] space-y-1">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#91A0B8]" />
                    <span>{tech.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#91A0B8]" />
                    <span className="truncate">{tech.email}</span>
                  </div>
                </div>

                {/* Owner Verification Actions */}
                {isOwner && (isPending || isRejected) && (
                  <div className="mt-4 p-2.5 rounded-xl bg-[#6C63FF]/10 border border-[#6C63FF]/20 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#8B83FF] font-semibold">
                      Owner Action:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(tech.id, 'approved')}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#35D07F] hover:bg-[#35D07F]/90 text-black flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        <span>Approve</span>
                      </button>
                      {isPending && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(tech.id, 'rejected')}
                          className="px-2 py-1 rounded-lg text-xs font-bold bg-[#FF4D4D]/20 hover:bg-[#FF4D4D]/30 text-[#FF6B6B] border border-[#FF4D4D]/30 flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-colors"
                        >
                          <X className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-[#18243A] flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectTechnician(tech)}
                  className="flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold text-[#91A0B8] hover:text-[#F4F7FB] bg-[#151F33] hover:bg-[#18243A] transition-colors text-center cursor-pointer"
                >
                  Profile & Logs
                </button>
                <button
                  onClick={() => isApproved && onAssignTechToJob(tech)}
                  disabled={!isApproved}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                    isApproved
                      ? 'text-white bg-[#6C63FF] hover:bg-[#6C63FF]/90 shadow-sm shadow-[#6C63FF]/20 cursor-pointer'
                      : 'text-[#91A0B8]/50 bg-[#151F33]/60 cursor-not-allowed border border-[#18243A]'
                  }`}
                  title={!isApproved ? 'Technician must be approved by Owner before dispatching' : undefined}
                >
                  {isPending ? 'Pending Approval' : isRejected ? 'Rejected' : 'Dispatch Job'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
