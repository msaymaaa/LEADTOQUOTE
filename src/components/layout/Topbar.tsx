import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  Sparkles,
  Menu,
  CheckCircle2,
  Clock,
  Check,
  LogOut,
  User,
  Settings,
  ChevronDown
} from 'lucide-react';
import { NavigationTab, AppNotification, Lead, Quote, Job } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  onOpenNewLead: () => void;
  onOpenNewQuote: () => void;
  onToggleMobileMenu: () => void;
  onOpenLanding?: () => void;
  onNavigateTab?: (tab: NavigationTab) => void;
  activeTab: NavigationTab;
  setActiveTab?: (tab: NavigationTab) => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  notifications?: AppNotification[];
  onMarkAllNotificationsRead?: () => void;
  leads?: Lead[];
  quotes?: Quote[];
  jobs?: Job[];
  onSelectLead?: (lead: Lead) => void;
  onSelectQuote?: (quote: Quote) => void;
  onSelectJob?: (job: Job) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenNewLead,
  onOpenNewQuote,
  onToggleMobileMenu,
  onOpenLanding,
  onNavigateTab,
  activeTab,
  setActiveTab,
  searchQuery = '',
  setSearchQuery,
  notifications = [],
  onMarkAllNotificationsRead,
  leads = [],
  quotes = [],
  jobs = [],
  onSelectLead,
  onSelectQuote,
  onSelectJob
}) => {
  const { user, profile, signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setShowUserMenu(false);
    await signOut();
    if (onNavigateTab) {
      onNavigateTab('landing');
    } else if (setActiveTab) {
      setActiveTab('landing');
    }
  };

  const displayName = profile?.full_name || (user?.user_metadata?.full_name as string) || user?.email?.split('@')[0] || 'Operations Lead';
  const displayEmail = user?.email || 'authenticated@leadtoquote.com';
  const userInitials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'LQ';
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchChange = (val: string) => {
    setLocalSearch(val);
    setShowSearchResults(val.trim().length > 0);
    if (setSearchQuery) setSearchQuery(val);
  };

  // Search matches across live data
  const searchResults = React.useMemo(() => {
    const q = localSearch.trim().toLowerCase();
    if (!q) return { matchingLeads: [], matchingQuotes: [], matchingJobs: [] };

    const matchingLeads = leads.filter(
      (l) =>
        l.customerName.toLowerCase().includes(q) ||
        l.serviceType.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q) ||
        (l.location && l.location.toLowerCase().includes(q)) ||
        (l.phone && l.phone.includes(q))
    ).slice(0, 4);

    const matchingQuotes = quotes.filter(
      (qt) =>
        qt.id.toLowerCase().includes(q) ||
        qt.customerName.toLowerCase().includes(q) ||
        qt.serviceTitle.toLowerCase().includes(q) ||
        (qt.customerEmail && qt.customerEmail.toLowerCase().includes(q))
    ).slice(0, 4);

    const matchingJobs = jobs.filter(
      (j) =>
        j.id.toLowerCase().includes(q) ||
        j.title.toLowerCase().includes(q) ||
        j.customerName.toLowerCase().includes(q) ||
        (j.technicianName && j.technicianName.toLowerCase().includes(q))
    ).slice(0, 4);

    return { matchingLeads, matchingQuotes, matchingJobs };
  }, [localSearch, leads, quotes, jobs]);

  const totalMatchesCount =
    searchResults.matchingLeads.length +
    searchResults.matchingQuotes.length +
    searchResults.matchingJobs.length;

  const handleLandingClick = () => {
    if (onOpenLanding) onOpenLanding();
    else if (onNavigateTab) onNavigateTab('landing');
    else if (setActiveTab) setActiveTab('landing');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-16 bg-[#080D18]/95 backdrop-blur-md border-b border-[#18243A] sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu + Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl" ref={searchContainerRef}>
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-xl text-[#91A0B8] hover:text-[#F4F7FB] hover:bg-[#151F33] md:hidden transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
          aria-label="Open navigation menu"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <label htmlFor="topbar-global-search" className="sr-only">
            Search leads, quotes, technicians, jobs, invoices
          </label>
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91A0B8] pointer-events-none" />
          <input
            id="topbar-global-search"
            type="search"
            role="searchbox"
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => {
              if (localSearch.trim().length > 0) setShowSearchResults(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowSearchResults(false);
              }
            }}
            placeholder="Search leads, quotes, technicians, jobs..."
            aria-label="Search leads, quotes, technicians, jobs"
            className="w-full bg-[#0D1424] border border-[#18243A] rounded-xl pl-9 pr-14 py-2 text-xs text-[#F4F7FB] placeholder-[#91A0B8]/60 focus:outline-none focus:border-[#6C63FF] focus-visible:ring-2 focus-visible:ring-[#6C63FF]/30 transition-all"
          />
          {localSearch && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#91A0B8] hover:text-white cursor-pointer px-1 py-0.5 rounded"
              aria-label="Clear global search"
            >
              Clear
            </button>
          )}

          {/* Quick-Jump Search Results Dropdown */}
          {showSearchResults && localSearch.trim().length > 0 && (
            <div
              className="absolute left-0 right-0 mt-2 bg-[#0D1424] border border-[#18243A] rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-96 overflow-y-auto"
              role="listbox"
              aria-label="Search suggestions"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#18243A] text-[11px] text-[#91A0B8]">
                <span>
                  Search results for "<strong className="text-[#39D9FF]">{localSearch}</strong>"
                </span>
                <span className="font-mono text-[10px] bg-[#18243A] px-2 py-0.5 rounded text-[#F4F7FB]">
                  {totalMatchesCount} matches
                </span>
              </div>

              {totalMatchesCount === 0 ? (
                <div className="py-6 text-center text-xs text-[#91A0B8]">
                  No matching leads, quotes, or jobs found in live database.
                </div>
              ) : (
                <div className="divide-y divide-[#18243A]/60 text-xs">
                  {/* Matching Leads */}
                  {searchResults.matchingLeads.length > 0 && (
                    <div className="py-2">
                      <div className="text-[10px] font-bold text-[#6C63FF] uppercase px-2 mb-1">
                        Leads ({searchResults.matchingLeads.length})
                      </div>
                      {searchResults.matchingLeads.map((lead) => (
                        <div
                          key={lead.id}
                          onClick={() => {
                            setShowSearchResults(false);
                            if (onSelectLead) onSelectLead(lead);
                            if (onNavigateTab) onNavigateTab('leads');
                            else if (setActiveTab) setActiveTab('leads');
                          }}
                          className="px-2.5 py-1.5 rounded-lg hover:bg-[#151F33] flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div>
                            <span className="font-semibold text-[#F4F7FB]">{lead.customerName}</span>
                            <span className="text-[#91A0B8] ml-2 text-[11px]">{lead.serviceType}</span>
                          </div>
                          <span className="font-mono text-[10px] text-[#39D9FF]">{lead.id}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Matching Quotes */}
                  {searchResults.matchingQuotes.length > 0 && (
                    <div className="py-2">
                      <div className="text-[10px] font-bold text-[#F5B942] uppercase px-2 mb-1">
                        Quotes ({searchResults.matchingQuotes.length})
                      </div>
                      {searchResults.matchingQuotes.map((q) => (
                        <div
                          key={q.id}
                          onClick={() => {
                            setShowSearchResults(false);
                            if (onSelectQuote) onSelectQuote(q);
                            if (onNavigateTab) onNavigateTab('quotes');
                            else if (setActiveTab) setActiveTab('quotes');
                          }}
                          className="px-2.5 py-1.5 rounded-lg hover:bg-[#151F33] flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div>
                            <span className="font-semibold text-[#F4F7FB]">{q.customerName}</span>
                            <span className="text-[#91A0B8] ml-2 text-[11px]">{q.serviceTitle}</span>
                          </div>
                          <span className="font-mono text-[10px] text-[#F5B942]">${q.total.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Matching Jobs */}
                  {searchResults.matchingJobs.length > 0 && (
                    <div className="py-2">
                      <div className="text-[10px] font-bold text-[#35D07F] uppercase px-2 mb-1">
                        Jobs & Dispatch ({searchResults.matchingJobs.length})
                      </div>
                      {searchResults.matchingJobs.map((j) => (
                        <div
                          key={j.id}
                          onClick={() => {
                            setShowSearchResults(false);
                            if (onSelectJob) onSelectJob(j);
                            if (onNavigateTab) onNavigateTab('jobs');
                            else if (setActiveTab) setActiveTab('jobs');
                          }}
                          className="px-2.5 py-1.5 rounded-lg hover:bg-[#151F33] flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div>
                            <span className="font-semibold text-[#F4F7FB]">{j.title}</span>
                            <span className="text-[#91A0B8] ml-2 text-[11px]">{j.customerName}</span>
                          </div>
                          <span className="font-mono text-[10px] text-[#35D07F]">{j.id}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Landing Page link */}
        <button
          onClick={handleLandingClick}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#91A0B8] hover:text-[#39D9FF] hover:bg-[#151F33] transition-colors border border-transparent hover:border-[#18243A] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39D9FF]"
          title="Switch to Welcome Overview"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#39D9FF]" />
          <span>Welcome Page</span>
        </button>

        {/* Quick Action: New Lead (Owner and Staff only) */}
        {(profile?.role === 'owner' || profile?.role === 'staff') && (
          <button
            onClick={onOpenNewLead}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6C63FF] hover:bg-[#6C63FF]/90 text-white text-xs font-semibold rounded-xl shadow-md shadow-[#6C63FF]/20 transition-all cursor-pointer min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Lead</span>
          </button>
        )}

        {/* Quick Action: New Quote (Owner and Staff only) */}
        {(profile?.role === 'owner' || profile?.role === 'staff') && (
          <button
            onClick={onOpenNewQuote}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#39D9FF]/15 hover:bg-[#39D9FF]/25 text-[#39D9FF] text-xs font-semibold rounded-xl border border-[#39D9FF]/30 transition-all cursor-pointer min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39D9FF]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Quote</span>
          </button>
        )}

        {/* Notifications Bell */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Operational Notifications"
            aria-expanded={showNotifications}
            className="p-2 rounded-xl text-[#91A0B8] hover:text-[#F4F7FB] hover:bg-[#151F33] transition-colors relative cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#39D9FF] animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0D1424] border border-[#18243A] rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#18243A]">
                <span className="text-xs font-bold text-[#F4F7FB]">Operational Alerts</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] text-[#39D9FF] font-semibold bg-[#39D9FF]/10 px-2 py-0.5 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <div className="space-y-2 mt-3 max-h-64 overflow-y-auto pr-1">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl transition-colors border ${
                        n.read
                          ? 'bg-[#151F33]/30 border-transparent text-[#91A0B8]'
                          : 'bg-[#151F33] border-[#18243A] text-[#F4F7FB]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold truncate mr-2">{n.title}</span>
                        <span className="text-[10px] text-[#91A0B8] shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-[#91A0B8] mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#91A0B8] text-center py-4">No operational alerts.</p>
                )}
              </div>
              {unreadCount > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[#18243A] text-center">
                  <button
                    onClick={() => {
                      if (onMarkAllNotificationsRead) onMarkAllNotificationsRead();
                    }}
                    className="text-[11px] text-[#6C63FF] hover:underline cursor-pointer font-medium flex items-center justify-center gap-1 mx-auto"
                  >
                    <Check className="w-3 h-3" />
                    <span>Mark all alerts read</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative pl-2 border-l border-[#18243A]" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User Account Menu"
            aria-expanded={showUserMenu}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#151F33] transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6C63FF]/30 to-[#39D9FF]/30 border border-[#6C63FF]/40 flex items-center justify-center text-xs font-bold text-[#39D9FF] shadow-xs">
              {userInitials}
            </div>
            <div className="hidden lg:block text-left max-w-[140px]">
              <span className="block text-xs font-semibold text-[#F4F7FB] leading-tight truncate">
                {displayName}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                  profile?.role === 'owner' ? 'bg-[#F5B942]/15 text-[#F5B942] border border-[#F5B942]/30' :
                  profile?.role === 'staff' ? 'bg-[#6C63FF]/15 text-[#6C63FF] border border-[#6C63FF]/30' :
                  profile?.role === 'technician' ? 'bg-[#39D9FF]/15 text-[#39D9FF] border border-[#39D9FF]/30' :
                  'bg-[#35D07F]/15 text-[#35D07F] border border-[#35D07F]/30'
                }`}>
                  {profile?.role || 'customer'}
                </span>
                {profile?.role === 'technician' && profile?.technician_status === 'pending' && (
                  <span className="text-[9px] bg-[#F5B942]/20 text-[#F5B942] px-1 rounded font-semibold">
                    Pending
                  </span>
                )}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#91A0B8] group-hover:text-white transition-transform duration-200" />
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 p-3 rounded-2xl bg-[#0D1424] border border-[#18243A] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Account Header */}
              <div className="pb-3 border-b border-[#18243A]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#18243A] border border-[#6C63FF]/30 flex items-center justify-center text-xs font-bold text-[#39D9FF]">
                    {userInitials}
                  </div>
                  <div className="truncate">
                    <span className="block text-xs font-bold text-[#F4F7FB] truncate">
                      {displayName}
                    </span>
                    <span className="block text-[11px] text-[#91A0B8] truncate">
                      {displayEmail}
                    </span>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] text-[#91A0B8]">Role:</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#39D9FF]">
                        {profile?.role || 'customer'}
                      </span>
                      {profile?.account_status && profile.account_status !== 'active' && (
                        <span className="text-[9px] text-[#FF647C] font-semibold uppercase">
                          ({profile.account_status})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="py-2 space-y-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    if (onNavigateTab) onNavigateTab('settings');
                    else if (setActiveTab) setActiveTab('settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[#F4F7FB] hover:bg-[#151F33] transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6C63FF]"
                >
                  <User className="w-3.5 h-3.5 text-[#39D9FF]" />
                  <span>Profile & Supabase Identity</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    if (onNavigateTab) onNavigateTab('settings');
                    else if (setActiveTab) setActiveTab('settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[#F4F7FB] hover:bg-[#151F33] transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6C63FF]"
                >
                  <Settings className="w-3.5 h-3.5 text-[#91A0B8]" />
                  <span>Platform Settings</span>
                </button>
              </div>

              {/* Sign Out Action */}
              <div className="pt-2 border-t border-[#18243A]">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-[#FF647C] hover:bg-[#FF647C]/10 transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF647C]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
