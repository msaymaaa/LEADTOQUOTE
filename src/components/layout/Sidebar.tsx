import React from 'react';
import { NavigationTab } from '../../types';
import {
  LayoutDashboard,
  UserCheck,
  FileText,
  Truck,
  Users,
  Building2,
  Receipt,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange?: (tab: NavigationTab) => void;
  setActiveTab?: (tab: NavigationTab) => void;
  isCollapsed?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  setCollapsed?: (c: boolean) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  counts?: {
    leads?: number;
    quotesAwaiting?: number;
    activeJobs?: number;
    invoicesPending?: number;
  };
  onOpenLanding?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  setActiveTab,
  isCollapsed = false,
  collapsed = false,
  onToggleCollapse,
  setCollapsed,
  isMobileOpen = false,
  onCloseMobile,
  counts = { leads: 8, quotesAwaiting: 3, activeJobs: 6, invoicesPending: 2 },
  onOpenLanding
}) => {
  const { signOut, user, profile } = useAuth();
  const isCurrentlyCollapsed = isCollapsed || collapsed;
  const userRole = profile?.role || 'customer';

  const handleTabClick = (tab: NavigationTab) => {
    if (onTabChange) onTabChange(tab);
    if (setActiveTab) setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const toggleCollapse = () => {
    if (onToggleCollapse) onToggleCollapse();
    if (setCollapsed) setCollapsed(!isCurrentlyCollapsed);
  };

  // Grouped Navigation Structure
  interface NavGroup {
    title: string;
    items: {
      id: NavigationTab;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      badge?: number;
      highlight?: boolean;
      roles?: string[];
    }[];
  }

  const navGroups: NavGroup[] = [
    {
      title: 'MAIN',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner', 'staff'] },
        { id: 'leads', label: 'Leads', icon: UserCheck, badge: counts.leads, roles: ['owner', 'staff'] },
        { id: 'quotes', label: 'Quotes', icon: FileText, badge: counts.quotesAwaiting, highlight: true, roles: ['owner', 'staff', 'customer'] },
        { id: 'customers', label: 'Customers', icon: Building2, roles: ['owner', 'staff'] }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'jobs', label: userRole === 'technician' ? 'My Assigned Jobs' : userRole === 'customer' ? 'My Service Orders' : 'Jobs & Dispatch', icon: Truck, badge: counts.activeJobs, roles: ['owner', 'staff', 'technician', 'customer'] },
        { id: 'technicians', label: 'Technicians', icon: Users, roles: ['owner', 'staff'] },
        { id: 'invoices', label: userRole === 'customer' ? 'My Invoices' : 'Invoices', icon: Receipt, badge: counts.invoicesPending, roles: ['owner', 'staff', 'customer'] }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'settings', label: userRole === 'owner' ? 'Settings & Roles' : 'Settings', icon: Settings, roles: ['owner', 'staff', 'technician', 'customer'] }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="main-sidebar-nav"
        aria-label="Main Navigation"
        className={`fixed md:static inset-y-0 left-0 z-50 bg-[#080D18] border-r border-[#18243A] flex flex-col justify-between transition-all duration-300 shrink-0 ${
          isCurrentlyCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-[#18243A]">
            <div
              onClick={() => {
                if (onOpenLanding) onOpenLanding();
                else handleTabClick('landing');
              }}
              className="flex items-center gap-3 cursor-pointer group overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] rounded-xl"
              title="Return to Welcome Overview"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if (onOpenLanding) onOpenLanding();
                  else handleTabClick('landing');
                }
              }}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#39D9FF] flex items-center justify-center text-white font-black text-lg shadow-md shadow-[#6C63FF]/30 shrink-0 group-hover:scale-105 transition-transform">
                L
              </div>
              {!isCurrentlyCollapsed && (
                <div className="min-w-0">
                  <span className="text-sm font-extrabold tracking-wider text-[#F4F7FB] block truncate">
                    LEADTOQUOTE
                  </span>
                  <span className="text-[10px] text-[#39D9FF] tracking-wider uppercase font-semibold block truncate">
                    {userRole === 'technician' ? 'Field Tech Portal' : userRole === 'customer' ? 'Customer Portal' : 'Enterprise Ops'}
                  </span>
                </div>
              )}
            </div>

            {/* Collapse toggle button on desktop */}
            <button
              onClick={toggleCollapse}
              aria-label={isCurrentlyCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="p-1.5 rounded-lg text-[#91A0B8] hover:text-[#F4F7FB] hover:bg-[#151F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] transition-colors hidden md:block cursor-pointer"
              title={isCurrentlyCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCurrentlyCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Close button on mobile */}
            <button
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
              className="p-2 rounded-lg text-[#91A0B8] hover:text-[#F4F7FB] hover:bg-[#151F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] transition-colors md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Groups */}
          <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-14rem)]" aria-label="Sections">
            {navGroups.map((group) => {
              // Filter group items based on user role
              const accessibleItems = group.items.filter(
                (item) => !item.roles || item.roles.includes(userRole)
              );

              if (accessibleItems.length === 0) return null;

              return (
                <div key={group.title} className="space-y-1">
                  {!isCurrentlyCollapsed && (
                    <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#91A0B8]/60">
                      {group.title}
                    </div>
                  )}
                  {accessibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        id={`nav-item-${item.id}`}
                        onClick={() => handleTabClick(item.id)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] cursor-pointer ${
                          isActive
                            ? 'bg-[#18243A] text-[#F4F7FB] border border-[#6C63FF]/40 shadow-xs'
                            : 'text-[#91A0B8] hover:text-[#F4F7FB] hover:bg-[#0D1424]'
                        }`}
                        title={isCurrentlyCollapsed ? item.label : undefined}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-[#39D9FF]' : 'text-[#91A0B8] group-hover:text-[#F4F7FB]'
                          }`}
                        />

                        {!isCurrentlyCollapsed && (
                          <span className="flex-1 text-left truncate">{item.label}</span>
                        )}

                        {!isCurrentlyCollapsed && item.badge !== undefined && item.badge > 0 && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              item.highlight
                                ? 'bg-[#F5B942]/20 text-[#F5B942] border border-[#F5B942]/30'
                                : 'bg-[#151F33] text-[#91A0B8] border border-white/5'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}

                        {isCurrentlyCollapsed && item.badge !== undefined && item.badge > 0 && (
                          <span
                            className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                              item.highlight ? 'bg-[#F5B942]' : 'bg-[#6C63FF]'
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="p-3 border-t border-[#18243A] space-y-2">
          {/* Landing Page Quick Link */}
          <button
            onClick={() => {
              if (onOpenLanding) onOpenLanding();
              else handleTabClick('landing');
            }}
            aria-label="Open Welcome and pipeline overview page"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#39D9FF] bg-[#39D9FF]/10 hover:bg-[#39D9FF]/15 border border-[#39D9FF]/20 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39D9FF]"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            {!isCurrentlyCollapsed && <span className="truncate">Welcome & Pipeline</span>}
          </button>

          {/* Sign Out Action if Authenticated */}
          {user && (
            <button
              onClick={async () => {
                await signOut();
                handleTabClick('landing');
              }}
              aria-label="Sign out of your account"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#FF647C] bg-[#FF647C]/10 hover:bg-[#FF647C]/15 border border-[#FF647C]/20 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF647C]"
              title={isCurrentlyCollapsed ? 'Sign Out' : undefined}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isCurrentlyCollapsed && <span className="truncate">Sign Out</span>}
            </button>
          )}

          {/* Brand & Tagline */}
          {!isCurrentlyCollapsed ? (
            <div className="p-2.5 rounded-xl bg-[#0D1424] border border-[#18243A]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#F4F7FB] tracking-wide">
                <ShieldCheck className="w-4 h-4 text-[#35D07F]" />
                LEADTOQUOTE
              </div>
              <p className="text-[10px] text-[#91A0B8] mt-0.5 italic leading-tight">
                "From First Lead to Final Payment."
              </p>
            </div>
          ) : (
            <div className="text-center py-1 text-[10px] font-mono text-[#91A0B8]">
              L2Q
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
