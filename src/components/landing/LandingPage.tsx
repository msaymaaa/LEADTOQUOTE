import React, { useState } from 'react';
import {
  UserCheck,
  FileText,
  CheckCircle,
  Truck,
  Wrench,
  Receipt,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
  Check,
  ExternalLink
} from 'lucide-react';
import { NavigationTab } from '../../types';
import { LaserAuroraBackground } from './LaserAuroraBackground';

interface LandingPageProps {
  onEnterDashboard: () => void;
  onNavigateTab: (tab: NavigationTab) => void;
  onSignIn?: () => void;
  onSignUp?: () => void;
  isAuthenticated?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterDashboard,
  onNavigateTab,
  onSignIn,
  onSignUp,
  isAuthenticated = false
}) => {
  const [activeHoverStage, setActiveHoverStage] = useState<number | null>(null);

  const workflowStages = [
    {
      id: 0,
      title: 'Customer Request & Lead',
      tab: 'leads' as NavigationTab,
      icon: UserCheck,
      color: '#8B5CF6',
      badgeColor: '#A855F7',
      summary: 'Automated triage of customer service tickets, geographic routing, and budget qualification.',
      metrics: 'Avg triage < 4 mins'
    },
    {
      id: 1,
      title: 'Precision Quotation',
      tab: 'quotes' as NavigationTab,
      icon: FileText,
      color: '#00E5FF',
      badgeColor: '#38BDF8',
      summary: 'Dynamic labor rates, inventory part lookups, travel surcharges, and instant digital estimation.',
      metrics: '3x faster drafting'
    },
    {
      id: 2,
      title: 'Customer Sign-off',
      tab: 'quotes' as NavigationTab,
      icon: CheckCircle,
      color: '#10B981',
      badgeColor: '#34D399',
      summary: 'One-click client approval portal with decline explanations and automatic purchase order capture.',
      metrics: '78% 24h approval rate'
    },
    {
      id: 3,
      title: 'Technician Dispatch',
      tab: 'jobs' as NavigationTab,
      icon: Truck,
      color: '#F59E0B',
      badgeColor: '#FBBF24',
      summary: 'Skill-matched scheduling, GPS dispatch tracking, automated customer notifications and job notes.',
      metrics: 'Zero route conflicts'
    },
    {
      id: 4,
      title: 'Field Execution & QA',
      tab: 'jobs' as NavigationTab,
      icon: Wrench,
      color: '#00E5FF',
      badgeColor: '#38BDF8',
      summary: 'Before/during/after photo evidence capture, customer sign-off, and milestone validation.',
      metrics: '100% evidence recorded'
    },
    {
      id: 5,
      title: 'Invoice & Final Settlement',
      tab: 'invoices' as NavigationTab,
      icon: Receipt,
      color: '#10B981',
      badgeColor: '#34D399',
      summary: 'Instant conversion of approved quotes and work completion logs into clean line-item invoices.',
      metrics: '4.2 days faster payout'
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#07080f] text-[#F4F7FB] selection:bg-[#00E5FF]/30 selection:text-[#00E5FF]">
      {/* 
        ========================================================================
        1. FIXED FULL-SCREEN BACKGROUND ANIMATION LAYER (Zaalima Style)
        - Deep charcoal/black base (#07080f)
        - Smooth, continuous, animated glowing laser light trails (electric blue & purple)
        - Soft cinematic blur/glow without distracting from the text
        ========================================================================
      */}
      <LaserAuroraBackground />

      {/* 
        ========================================================================
        2. CONTENT LAYER (LeadToQuote Branding & Layout from Image 2)
        ========================================================================
      */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-[#07080f]/65 border-b border-white/[0.08] transition-all duration-200">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            {/* Logo & Brand Name */}
            <div className="flex items-center gap-3.5 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="relative">
                {/* Glowing neon halo */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#00E5FF] opacity-60 blur-sm group-hover:opacity-100 transition-opacity" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] via-[#6366F1] to-[#00E5FF] flex items-center justify-center text-white font-black text-xl shadow-lg">
                  L
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-wider text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  LEADTOQUOTE
                </span>
                <span className="text-[10px] text-[#00E5FF] tracking-widest uppercase font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
                  ENTERPRISE FIELD OPERATIONS
                </span>
              </div>
            </div>

            {/* Right-Side Action Controls */}
            <div className="flex items-center gap-3">
              {!isAuthenticated && (
                <>
                  <button
                    onClick={onSignIn}
                    className="hidden sm:inline-flex px-4 py-2 rounded-xl text-xs font-semibold text-[#CBD5E1] hover:text-white backdrop-blur-md bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 transition-all cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={onSignUp}
                    className="hidden sm:inline-flex px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] hover:opacity-95 shadow-md shadow-[#8B5CF6]/25 transition-all items-center gap-1.5 cursor-pointer"
                  >
                    Get Started Free
                  </button>
                </>
              )}

              {/* Main "Open Dashboard" button as requested */}
              <button
                onClick={onEnterDashboard}
                className="relative group px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#00E5FF] hover:brightness-110 shadow-lg shadow-[#8B5CF6]/30 hover:shadow-[#00E5FF]/40 transition-all duration-300 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
          {/* Central Pill Tag: "The Unified Service Pipeline Architecture" */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full backdrop-blur-md bg-[#0e1322]/80 border border-[#00E5FF]/30 text-xs font-medium text-[#00E5FF] mb-6 shadow-[0_0_15px_-3px_rgba(0,229,255,0.25)] hover:border-[#00E5FF]/50 transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-[#00E5FF] animate-pulse" />
            <span className="tracking-wide">The Unified Service Pipeline Architecture</span>
          </div>

          {/* Main Heading: "LEADTOQUOTE" */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.05] drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
            LEADTOQUOTE
          </h1>

          {/* Subtitle: "From First Lead to Final Payment." */}
          <p className="text-2xl sm:text-3xl font-semibold text-[#00E5FF] mt-4 tracking-wide drop-shadow-[0_2px_12px_rgba(0,229,255,0.3)]">
            "From First Lead to Final Payment."
          </p>

          {/* Description */}
          <p className="text-base sm:text-lg text-[#94A3B8] max-w-2xl mx-auto mt-6 leading-relaxed font-normal drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
            Manage customer requests, create professional quotes, assign technicians,
            track jobs, and close the payment cycle from one intelligent workspace.
          </p>

          {/* Action Buttons: "Launch Command Center" (vibrant purple/blue glow) & "View Workflow" */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <button
              onClick={onEnterDashboard}
              className="relative group w-full sm:w-auto px-8 py-4 text-sm font-bold text-white rounded-xl shadow-xl shadow-[#8B5CF6]/35 hover:shadow-[#00E5FF]/45 transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #00E5FF 100%)'
              }}
            >
              {/* Subtle light shimmer highlight */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              <span className="relative z-10 flex items-center gap-2">
                Launch Command Center
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <a
              href="#workflow-section"
              className="w-full sm:w-auto px-7 py-4 text-sm font-semibold text-[#E2E8F0] hover:text-white backdrop-blur-md bg-white/[0.04] hover:bg-white/[0.08] rounded-xl border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <span>View Workflow</span>
              <Layers className="w-4 h-4 text-[#00E5FF]" />
            </a>
          </div>

          {/* Value Prop Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-3xl mx-auto mt-16 pt-10 border-t border-white/[0.08] text-left">
            <div className="p-4 rounded-xl backdrop-blur-md bg-[#0c101a]/75 border border-white/10 shadow-lg hover:border-[#8B5CF6]/40 transition-colors">
              <span className="text-xl font-bold text-white block">PKR 6.5M</span>
              <span className="text-xs text-[#94A3B8] mt-0.5 block">Mo. Pipeline Run-Rate</span>
            </div>
            <div className="p-4 rounded-xl backdrop-blur-md bg-[#0c101a]/75 border border-white/10 shadow-lg hover:border-[#10B981]/40 transition-colors">
              <span className="text-xl font-bold text-[#10B981] block">100% Traceable</span>
              <span className="text-xs text-[#94A3B8] mt-0.5 block">Audit & Evidence Log</span>
            </div>
            <div className="p-4 rounded-xl backdrop-blur-md bg-[#0c101a]/75 border border-white/10 shadow-lg hover:border-[#00E5FF]/40 transition-colors">
              <span className="text-xl font-bold text-[#00E5FF] block">5 Star Techs</span>
              <span className="text-xs text-[#94A3B8] mt-0.5 block">Real-time GPS Status</span>
            </div>
            <div className="p-4 rounded-xl backdrop-blur-md bg-[#0c101a]/75 border border-white/10 shadow-lg hover:border-white/20 transition-colors">
              <span className="text-xl font-bold text-white block">&lt; 48hr</span>
              <span className="text-xs text-[#94A3B8] mt-0.5 block">Average Close Cycle</span>
            </div>
          </div>

          {/* Section: The Operational Workflow */}
          <section id="workflow-section" className="mt-32 text-left">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-white/[0.08]">
              <div>
                <span className="text-xs font-bold text-[#8B5CF6] uppercase tracking-widest block mb-1">
                  The End-To-End Architecture
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Interactive Workflow Engine
                </h2>
                <p className="text-sm text-[#94A3B8] mt-1">
                  Hover each stage to inspect live operational interactions or click to jump into the module.
                </p>
              </div>
              <div className="text-xs text-[#94A3B8] mt-2 sm:mt-0 font-medium">
                Hover stage for details • Click to inspect
              </div>
            </div>

            {/* Interactive Stages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflowStages.map((stage) => {
                const Icon = stage.icon;
                const isHovered = activeHoverStage === stage.id;

                return (
                  <div
                    key={stage.id}
                    onMouseEnter={() => setActiveHoverStage(stage.id)}
                    onMouseLeave={() => setActiveHoverStage(null)}
                    onClick={() => {
                      onNavigateTab(stage.tab);
                    }}
                    className={`group relative p-6 rounded-2xl backdrop-blur-md transition-all duration-300 cursor-pointer overflow-hidden ${
                      isHovered
                        ? 'bg-[#0e1424]/90 border-[#00E5FF]/60 -translate-y-1.5 shadow-2xl shadow-[#00E5FF]/10'
                        : 'bg-[#0a0e18]/80 border-white/[0.08] hover:border-[#8B5CF6]/40 hover:bg-[#0c1120]/85'
                    }`}
                  >
                    {/* Corner badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-md"
                        style={{
                          backgroundColor: `${stage.color}15`,
                          color: stage.color,
                          border: `1px solid ${stage.color}35`
                        }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono text-[#94A3B8] font-bold px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.06]">
                        0{stage.id + 1}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-[#00E5FF] transition-colors">
                      {stage.title}
                    </h3>

                    <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed min-h-[40px]">
                      {stage.summary}
                    </p>

                    <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                      <span className="text-[11px] font-semibold text-[#10B981] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        {stage.metrics}
                      </span>
                      <span className="text-[11px] text-[#8B5CF6] group-hover:text-[#00E5FF] font-semibold group-hover:translate-x-1 transition-all flex items-center gap-1">
                        Explore View <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Linear Sequence Stepper Strip */}
            <div className="mt-8 p-5 rounded-2xl backdrop-blur-md bg-[#0a0e18]/80 border border-white/[0.08] shadow-lg">
              <div className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2.5">
                Linear Sequence
              </div>
              <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs font-semibold scrollbar-none">
                <span className="px-3 py-1.5 rounded-lg bg-[#8B5CF6]/20 text-[#C084FC] border border-[#8B5CF6]/40 whitespace-nowrap">
                  1. Customer Request
                </span>
                <span className="text-[#64748B]">→</span>
                <span className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-[#E2E8F0] border border-white/[0.08] whitespace-nowrap">
                  2. Lead
                </span>
                <span className="text-[#64748B]">→</span>
                <span className="px-3 py-1.5 rounded-lg bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 whitespace-nowrap">
                  3. Quote
                </span>
                <span className="text-[#64748B]">→</span>
                <span className="px-3 py-1.5 rounded-lg bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40 whitespace-nowrap">
                  4. Approval / Decline
                </span>
                <span className="text-[#64748B]">→</span>
                <span className="px-3 py-1.5 rounded-lg bg-[#F59E0B]/20 text-[#FBBF24] border border-[#F59E0B]/40 whitespace-nowrap">
                  5. Tech Assignment
                </span>
                <span className="text-[#64748B]">→</span>
                <span className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-[#E2E8F0] border border-white/[0.08] whitespace-nowrap">
                  6. Job & Evidence
                </span>
                <span className="text-[#64748B]">→</span>
                <span className="px-3 py-1.5 rounded-lg bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40 whitespace-nowrap">
                  7. Invoice & Payment
                </span>
              </div>
            </div>
          </section>

          {/* Footer Info Banner */}
          <footer className="mt-24 pt-8 border-t border-white/[0.08] text-center text-xs text-[#94A3B8]">
            <p className="font-semibold text-white">
              LEADTOQUOTE — Operations Platform for Modern Field Service
            </p>
            <p className="mt-1 text-[#64748B]">
              "From First Lead to Final Payment." • Unified Operations Architecture
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};
