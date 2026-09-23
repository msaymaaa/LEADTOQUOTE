import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { Job, Technician, JobStatus } from '../../types';
import {
  Wrench,
  User,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Upload,
  Camera,
  UserCheck,
  FileCheck,
  ChevronRight,
  ShieldCheck,
  Image as ImageIcon
} from 'lucide-react';

interface JobDetailModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  technicians: Technician[];
  onStatusChange: (jobId: string, newStatus: JobStatus) => void;
  onMarkCompleteClick: (job: Job) => void;
  onOpenAssignTech: (job: Job) => void;
  onUploadEvidenceMock: (jobId: string, title: string) => void;
  onGenerateInvoiceFromJob: (job: Job) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  isOpen,
  onClose,
  technicians,
  onStatusChange,
  onMarkCompleteClick,
  onOpenAssignTech,
  onUploadEvidenceMock,
  onGenerateInvoiceFromJob
}) => {
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [showUploadInput, setShowUploadInput] = useState(false);

  if (!job) return null;

  const handleUpload = () => {
    if (!evidenceTitle.trim()) return;
    onUploadEvidenceMock(job.id, evidenceTitle);
    setEvidenceTitle('');
    setShowUploadInput(false);
  };

  const statusOptions: JobStatus[] = [
    'Scheduled',
    'Assigned',
    'In Progress',
    'Awaiting Completion',
    'Completed'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Job Dispatch Record: ${job.id}`}
      subtitle={`${job.title} • Customer: ${job.customerName}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Top Operational Status Header */}
        <div className="p-4 rounded-2xl bg-[#080D18] border border-[#18243A] flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-[#91A0B8] uppercase tracking-wider block">
              Job Status & Priority
            </span>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={job.status} />
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF647C]/15 text-[#FF647C] border border-[#FF647C]/20">
                {job.priority} Priority
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAssignTech(job)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#39D9FF] bg-[#39D9FF]/10 hover:bg-[#39D9FF]/20 border border-[#39D9FF]/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{job.technicianName ? 'Reassign Tech' : 'Assign Technician'}</span>
            </button>

            {job.status !== 'Completed' && (
              <button
                onClick={() => onMarkCompleteClick(job)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-black bg-[#35D07F] hover:bg-[#35D07F]/90 shadow-lg shadow-[#35D07F]/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Work Complete</span>
              </button>
            )}

            {job.status === 'Completed' && (
              <button
                onClick={() => onGenerateInvoiceFromJob(job)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#6C63FF] hover:bg-[#6C63FF]/90 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Generate Invoice</span>
              </button>
            )}
          </div>
        </div>

        {/* Change Status Fast Selector */}
        <div className="p-3 rounded-xl bg-[#151F33]/40 border border-[#18243A]">
          <span className="text-xs font-semibold text-[#91A0B8] block mb-2">
            Advance Operational Phase
          </span>
          <div className="flex flex-wrap gap-1.5">
            {statusOptions.map((st) => (
              <button
                key={st}
                onClick={() => onStatusChange(job.id, st)}
                className={`px-3 py-1 text-xs rounded-lg transition-all font-medium cursor-pointer ${
                  job.status === st
                    ? 'bg-[#39D9FF] text-black font-bold shadow-md shadow-[#39D9FF]/30'
                    : 'bg-[#0D1424] text-[#91A0B8] hover:text-[#F4F7FB] border border-[#18243A]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#0D1424] border border-[#18243A] space-y-2">
            <span className="text-[11px] font-bold text-[#39D9FF] uppercase tracking-wider block">
              Customer & Job Site
            </span>
            <div className="text-sm font-semibold text-[#F4F7FB]">{job.customerName}</div>
            <div className="text-[#91A0B8]">{job.customerPhone}</div>
            <div className="flex items-center gap-1 text-[#91A0B8]">
              <MapPin className="w-3.5 h-3.5 text-[#91A0B8]" />
              <span>{job.location}</span>
            </div>
            <div className="mt-2 pt-2 border-t border-[#18243A] text-[#91A0B8]">
              <span className="font-semibold text-[#F4F7FB] block mb-0.5">Scope of Work:</span>
              <p className="leading-relaxed">{job.description}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D1424] border border-[#18243A] space-y-2">
            <span className="text-[11px] font-bold text-[#6C63FF] uppercase tracking-wider block">
              Dispatch Schedule & Crew
            </span>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#6C63FF]" />
              <span className="font-semibold text-[#F4F7FB]">{job.scheduledDate}</span>
              <span className="text-[#91A0B8]">at</span>
              <span className="text-[#39D9FF] font-semibold">{job.scheduledTime}</span>
            </div>
            <div className="text-[#91A0B8] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Estimated Duration: {job.estimatedDuration}</span>
            </div>

            <div className="mt-3 pt-3 border-t border-[#18243A]">
              <span className="text-[11px] text-[#91A0B8] block mb-1">Assigned Specialist:</span>
              {job.technicianName ? (
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#151F33] border border-[#18243A]">
                  <div className="w-8 h-8 rounded-full bg-[#6C63FF]/20 text-[#6C63FF] flex items-center justify-center font-bold text-xs">
                    {job.technicianName.charAt(0)}
                  </div>
                  <div>
                    <span className="font-semibold text-[#F4F7FB] block">
                      {job.technicianName}
                    </span>
                    <span className="text-[10px] text-[#35D07F]">Active Dispatch Certified</span>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-[#F5B942] italic">
                  Unassigned — Needs immediate dispatch routing
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Workflow Timeline (Prompt #14: Quote Approved → Tech Assigned → Tech En Route → Work Started → Work Completed → Customer Confirmation → Invoice Generated) */}
        <div className="p-4 rounded-2xl bg-[#0D1424] border border-[#18243A] space-y-3">
          <span className="text-xs font-bold text-[#F4F7FB] uppercase tracking-wider block">
            Milestone Progression Log
          </span>

          <div className="relative pl-5 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#18243A]">
            {job.timeline.map((step, idx) => (
              <div key={idx} className="relative flex items-start justify-between text-xs">
                <div
                  className={`absolute -left-5 top-0.5 w-3 h-3 rounded-full border-2 border-[#0D1424] ${
                    step.completed
                      ? 'bg-[#35D07F]'
                      : step.active
                      ? 'bg-[#39D9FF] animate-ping'
                      : 'bg-[#18243A]'
                  }`}
                />
                <div>
                  <span
                    className={`font-semibold block ${
                      step.completed
                        ? 'text-[#F4F7FB]'
                        : step.active
                        ? 'text-[#39D9FF]'
                        : 'text-[#91A0B8]/60'
                    }`}
                  >
                    {step.stage}
                  </span>
                  {step.assignee && (
                    <span className="text-[10px] text-[#91A0B8]">
                      Signed: {step.assignee}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-[#91A0B8]">{step.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Completion Evidence Section (Prompt #14) */}
        <div className="p-4 rounded-2xl bg-[#080D18] border border-[#18243A] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#35D07F] uppercase tracking-wider block">
                Completion Evidence & Photo Log
              </span>
              <p className="text-[11px] text-[#91A0B8] mt-0.5">
                Proof of workmanship, diagnostics readouts, and customer sign-off photos
              </p>
            </div>

            <button
              onClick={() => setShowUploadInput(!showUploadInput)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#35D07F] bg-[#35D07F]/10 hover:bg-[#35D07F]/20 border border-[#35D07F]/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Upload Evidence</span>
            </button>
          </div>

          {showUploadInput && (
            <div className="p-3 rounded-xl bg-[#0D1424] border border-[#35D07F]/30 flex gap-2">
              <input
                type="text"
                value={evidenceTitle}
                onChange={(e) => setEvidenceTitle(e.target.value)}
                placeholder="Evidence description (e.g. Condenser coil pressure test readout)"
                className="flex-1 bg-[#151F33] border border-[#18243A] rounded-lg px-3 py-1.5 text-xs text-[#F4F7FB]"
              />
              <button
                onClick={handleUpload}
                className="px-3 py-1.5 rounded-lg bg-[#35D07F] text-black font-semibold text-xs transition-all"
              >
                Add Photo
              </button>
            </div>
          )}

          {job.evidence.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-[#0D1424] border border-dashed border-[#18243A] text-xs text-[#91A0B8]">
              <ImageIcon className="w-6 h-6 mx-auto mb-1.5 text-[#91A0B8]/50" />
              No photo evidence recorded yet. Click "Upload Evidence" to log field photos.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {job.evidence.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-xl overflow-hidden bg-[#0D1424] border border-[#18243A] group"
                >
                  <div className="h-32 w-full overflow-hidden bg-[#151F33] relative">
                    <img
                      src={ev.url}
                      alt={ev.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white backdrop-blur-sm border border-white/10">
                      {ev.type}
                    </span>
                  </div>
                  <div className="p-2.5 text-xs">
                    <div className="font-semibold text-[#F4F7FB] truncate">{ev.title}</div>
                    <div className="text-[10px] text-[#91A0B8] mt-0.5">{ev.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
