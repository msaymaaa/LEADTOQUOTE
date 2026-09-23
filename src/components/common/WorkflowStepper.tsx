import React from 'react';
import { UserCheck, FileText, CheckCircle, Truck, Wrench, Receipt } from 'lucide-react';

interface WorkflowStepperProps {
  currentStage?: 'lead' | 'quote' | 'approval' | 'dispatch' | 'completion' | 'invoice';
  onStageClick?: (stage: string) => void;
  interactive?: boolean;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  currentStage = 'approval',
  onStageClick,
  interactive = true
}) => {
  const stages = [
    {
      id: 'lead',
      name: 'Lead Intake',
      desc: 'Capture & Qualify',
      icon: UserCheck,
      color: '#6C63FF'
    },
    {
      id: 'quote',
      name: 'Quote Creation',
      desc: 'Labor, Parts & Scope',
      icon: FileText,
      color: '#39D9FF'
    },
    {
      id: 'approval',
      name: 'Client Approval',
      desc: 'Review & Terms Sign-off',
      icon: CheckCircle,
      color: '#35D07F'
    },
    {
      id: 'dispatch',
      name: 'Dispatch & Work',
      desc: 'Tech Routing & Tasks',
      icon: Truck,
      color: '#F5B942'
    },
    {
      id: 'completion',
      name: 'Evidence & QA',
      desc: 'Photos & Confirmation',
      icon: Wrench,
      color: '#39D9FF'
    },
    {
      id: 'invoice',
      name: 'Invoice & Pay',
      desc: 'Final Settlement',
      icon: Receipt,
      color: '#35D07F'
    }
  ];

  return (
    <div className="w-full overflow-x-auto py-2">
      <div className="flex items-center justify-between min-w-[760px] relative px-4">
        {/* Background Connecting Line */}
        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-[#18243A] -z-0" />

        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isActive = currentStage === stage.id;
          const isDone = stages.findIndex((s) => s.id === currentStage) >= idx;

          return (
            <div
              key={stage.id}
              onClick={() => interactive && onStageClick && onStageClick(stage.id)}
              className={`relative z-10 flex flex-col items-center group ${
                interactive ? 'cursor-pointer' : ''
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 shadow-lg ${
                  isActive
                    ? 'bg-[#18243A] border-2 border-[#6C63FF] text-[#6C63FF] shadow-[#6C63FF]/30'
                    : isDone
                    ? 'bg-[#151F33] border border-[#35D07F]/40 text-[#35D07F]'
                    : 'bg-[#0D1424] border border-[#18243A] text-[#91A0B8] group-hover:border-[#39D9FF]/40 group-hover:text-[#39D9FF]'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="mt-2 text-center">
                <span
                  className={`block text-xs font-semibold tracking-wide transition-colors ${
                    isActive ? 'text-[#F4F7FB]' : 'text-[#91A0B8] group-hover:text-[#F4F7FB]'
                  }`}
                >
                  {stage.name}
                </span>
                <span className="block text-[11px] text-[#91A0B8]/60 mt-0.5 whitespace-nowrap">
                  {stage.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
