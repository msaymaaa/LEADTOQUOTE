import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Job, Technician } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { UserCheck, Star, Wrench, Phone } from 'lucide-react';

interface AssignTechnicianModalProps {
  job: Job | null;
  technicians: Technician[];
  isOpen: boolean;
  onClose: () => void;
  onAssign: (jobId: string, technician: Technician) => void;
}

export const AssignTechnicianModal: React.FC<AssignTechnicianModalProps> = ({
  job,
  technicians,
  isOpen,
  onClose,
  onAssign
}) => {
  const [selectedTechId, setSelectedTechId] = useState<string>(
    job?.technicianId || technicians[0]?.id || ''
  );

  if (!job) return null;

  const handleConfirm = () => {
    const tech = technicians.find((t) => t.id === selectedTechId);
    if (tech) {
      onAssign(job.id, tech);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dispatch Assignment"
      subtitle={`Assign field specialist for ${job.id} — ${job.title}`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        <p className="text-xs text-[#91A0B8]">
          Select an available certified technician matching the job requirements:
        </p>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {technicians.map((tech) => {
            const isSelected = selectedTechId === tech.id;

            return (
              <div
                key={tech.id}
                onClick={() => setSelectedTechId(tech.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#18243A] border-[#39D9FF] shadow-md shadow-[#39D9FF]/20'
                    : 'bg-[#0D1424] border-[#18243A] hover:bg-[#151F33]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={tech.avatar}
                    alt={tech.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-[#18243A]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#F4F7FB]">{tech.name}</span>
                      <span className="flex items-center text-[11px] text-[#F5B942]">
                        <Star className="w-3 h-3 fill-current inline mr-0.5" />
                        {tech.rating}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#91A0B8] block">
                      {tech.specialization}
                    </span>
                    <span className="text-[10px] text-[#39D9FF]">
                      {tech.activeJobsCount} Active Jobs • {tech.jobsCompleted} Completed
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <StatusBadge status={tech.availability} size="sm" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-[#18243A] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#91A0B8] hover:text-[#F4F7FB] rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2 text-xs font-bold text-black bg-[#39D9FF] hover:bg-[#39D9FF]/90 rounded-xl shadow-lg shadow-[#39D9FF]/20 transition-all flex items-center gap-1.5"
          >
            <UserCheck className="w-4 h-4" />
            <span>Confirm Assignment</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
