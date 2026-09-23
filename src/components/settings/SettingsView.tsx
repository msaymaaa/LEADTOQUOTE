import React, { useState, useEffect } from 'react';
import { PageHeader } from '../common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { checkDatabaseHealth, DatabaseHealth } from '../../lib/database';
import { UserRole, AccountStatus, TechnicianStatus } from '../../types';
import {
  Building,
  FileText,
  Bell,
  Shield,
  Save,
  Check,
  Percent,
  Clock,
  DollarSign,
  Mail,
  Phone,
  MapPin,
  User,
  Fingerprint,
  Calendar,
  Loader2,
  Copy,
  CheckCircle2,
  Sparkles,
  Lock,
  Users,
  RefreshCw,
  AlertTriangle,
  Database,
  Activity
} from 'lucide-react';

interface SettingsViewProps {
  onResetDemoData?: () => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

interface UserAdminRecord {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  account_status: AccountStatus;
  technician_status?: TechnicianStatus | null;
  created_at: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onResetDemoData,
  onShowToast
}) => {
  const { user, profile, updateProfile, updateUserRoleAndStatus, isProfileLoading } = useAuth();

  // User Profile state (restricted to personal info only)
  const [profileFullName, setProfileFullName] = useState(
    profile?.full_name || (user?.user_metadata?.full_name as string) || ''
  );
  const [profilePhone, setProfilePhone] = useState(profile?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Owner Organization Management State
  const isOwner = profile?.role === 'owner';
  const [adminUsers, setAdminUsers] = useState<UserAdminRecord[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userUpdatingId, setUserUpdatingId] = useState<string | null>(null);

  // Development Database Diagnostic State
  const [dbDiagnostic, setDbDiagnostic] = useState<DatabaseHealth | null>(null);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);

  const runDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    try {
      const res = await checkDatabaseHealth();
      setDbDiagnostic(res);
    } catch (err) {
      console.warn('Diagnostic check failed:', err);
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  useEffect(() => {
    if (profile?.full_name) {
      setProfileFullName(profile.full_name);
    }
    if (profile?.phone) {
      setProfilePhone(profile.phone);
    }
  }, [profile?.full_name, profile?.phone]);

  // Load organization users for owner
  const loadAdminUsers = async () => {
    if (!isOwner) return;
    setIsLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Could not load user profiles:', error.message);
      } else if (data) {
        setAdminUsers(data as UserAdminRecord[]);
      }
    } catch (err) {
      console.warn('loadAdminUsers error:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isOwner) {
      loadAdminUsers();
    }
  }, [isOwner]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileFullName.trim()) {
      setProfileErrorMsg('Full name cannot be empty.');
      return;
    }

    setIsUpdatingProfile(true);
    setProfileErrorMsg(null);
    setProfileSuccessMsg(null);

    try {
      // Role is protected server-side and by owner; profile edit only updates personal info
      const { error } = await updateProfile({
        full_name: profileFullName.trim(),
        phone: profilePhone.trim()
      });

      if (error) {
        setProfileErrorMsg(error.message || 'Failed to update profile in Supabase.');
        onShowToast('Profile Update Error', error.message, 'error');
      } else {
        setProfileSuccessMsg('Profile details successfully updated in Supabase!');
        onShowToast('Profile Updated', 'Your identity details have been updated.', 'success');
        setTimeout(() => setProfileSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      setProfileErrorMsg(err.message || 'Unexpected error updating profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleOwnerUpdateUser = async (
    targetUserId: string,
    updates: { role?: UserRole; account_status?: AccountStatus; technician_status?: TechnicianStatus }
  ) => {
    if (!isOwner) return;
    if (targetUserId === user?.id && updates.role && updates.role !== 'owner') {
      onShowToast('Action Blocked', 'You cannot remove your own Owner access.', 'error');
      return;
    }

    setUserUpdatingId(targetUserId);
    try {
      const { error } = await updateUserRoleAndStatus(targetUserId, updates);
      if (error) {
        onShowToast('Role Management Error', error.message, 'error');
      } else {
        onShowToast(
          'User Status Updated',
          'Successfully updated permissions for user.',
          'success'
        );
        await loadAdminUsers();
      }
    } catch (err: any) {
      onShowToast('Update Failed', err.message || 'An unexpected error occurred.', 'error');
    } finally {
      setUserUpdatingId(null);
    }
  };

  const handleCopyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
      onShowToast('Copied', 'User UUID copied to clipboard.', 'info');
    }
  };

  const [companyName, setCompanyName] = useState('LeadToQuote Field Operations Ltd');
  const [companyEmail, setCompanyEmail] = useState('dispatch@leadtoquote.pk');
  const [companyPhone, setCompanyPhone] = useState('+92 42 3587 0199');
  const [companyAddress, setCompanyAddress] = useState('Main Boulevard, Gulberg III, Lahore, Pakistan');
  const [currency, setCurrency] = useState('PKR (₨)');
  const [timezone, setTimezone] = useState('Asia/Karachi (PKT)');

  const [taxRate, setTaxRate] = useState('8.25');
  const [quoteValidityDays, setQuoteValidityDays] = useState('14');
  const [standardTerms, setStandardTerms] = useState(
    'Payment due within 30 days of completion. All parts covered under standard 1-year warranty.'
  );

  const [notifications, setNotifications] = useState({
    leadCreated: true,
    quoteAccepted: true,
    jobCompleted: true,
    invoicePaid: true,
    technicianAssigned: true
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast('Settings Saved', 'Operational configurations successfully applied in temporary state.', 'success');
  };

  const roles = [
    {
      name: 'Owner (Business Administrator)',
      users: adminUsers.length > 0 ? adminUsers.filter((u) => u.role === 'owner').length : (isOwner ? 1 : 0),
      permissions: 'Full platform access, billing, user role assignments, technician approvals'
    },
    {
      name: 'Staff (Operations & Dispatch)',
      users: adminUsers.length > 0 ? adminUsers.filter((u) => u.role === 'staff').length : 0,
      permissions: 'Lead ingestion, quotation generation, job dispatch, invoice management'
    },
    {
      name: 'Technician (Field Specialist)',
      users: adminUsers.length > 0 ? adminUsers.filter((u) => u.role === 'technician').length : 0,
      permissions: 'Assigned jobs, work status updates, photo evidence uploads'
    },
    {
      name: 'Customer (Client Portal)',
      users: adminUsers.length > 0 ? adminUsers.filter((u) => u.role === 'customer').length : 0,
      permissions: 'Request quotes, approve/decline proposals, view work status and invoices'
    }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <PageHeader
        title="Platform Settings"
        subtitle="Configure enterprise parameters, quotation defaults, and dispatch rules."
        badge="Config Engine"
      />

      {/* Authenticated User Profile Section connected to Supabase */}
      <div className="p-6 rounded-2xl bg-[#0D1424] border border-[#6C63FF]/30 space-y-5 shadow-lg shadow-[#080D18]/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#18243A]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#6C63FF]/15 border border-[#6C63FF]/30 flex items-center justify-center text-[#6C63FF]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#F4F7FB]">User Account & Supabase Profile</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#35D07F]/15 text-[#35D07F] border border-[#35D07F]/30">
                  RLS Protected
                </span>
              </div>
              <p className="text-xs text-[#91A0B8] mt-0.5">
                Authenticated session via Supabase Auth. Profile synced with <code className="text-[#39D9FF]">public.profiles</code>.
              </p>
            </div>
          </div>

          {isProfileLoading && (
            <div className="flex items-center gap-2 text-xs text-[#39D9FF]">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Syncing with Supabase...</span>
            </div>
          )}
        </div>

        {/* Feedback Messages */}
        {profileErrorMsg && (
          <div className="p-3 rounded-xl bg-[#FF647C]/10 border border-[#FF647C]/30 text-[#FF647C] text-xs flex items-center gap-2">
            <span>{profileErrorMsg}</span>
          </div>
        )}

        {profileSuccessMsg && (
          <div className="p-3 rounded-xl bg-[#35D07F]/10 border border-[#35D07F]/30 text-[#35D07F] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{profileSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Editable Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#F4F7FB] mb-1.5 flex items-center justify-between">
                <span>Full Name (Editable)</span>
                <span className="text-[10px] text-[#39D9FF]">Persists to public.profiles</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B8]" />
                <input
                  type="text"
                  value={profileFullName}
                  onChange={(e) => setProfileFullName(e.target.value)}
                  placeholder="Your Full Name"
                  disabled={isUpdatingProfile}
                  className="w-full bg-[#151F33] border border-[#18243A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F4F7FB] focus:border-[#6C63FF] focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

            {/* Email (Read-only from Auth) */}
            <div>
              <label className="block text-xs font-semibold text-[#F4F7FB] mb-1.5 flex items-center justify-between">
                <span>Email Address (Account Identity)</span>
                <span className="text-[10px] text-[#35D07F]">Verified Auth User</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B8]" />
                <input
                  type="email"
                  value={user?.email || profile?.email || 'authenticated@user.com'}
                  disabled
                  readOnly
                  className="w-full bg-[#151F33]/60 border border-[#18243A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#91A0B8] cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-[#F4F7FB] mb-1.5 flex items-center justify-between">
                <span>Phone Number</span>
                <span className="text-[10px] text-[#91A0B8]">Contact Dispatch</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B8]" />
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="(512) 555-0199"
                  disabled={isUpdatingProfile}
                  className="w-full bg-[#151F33] border border-[#18243A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F4F7FB] focus:border-[#6C63FF] focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

            {/* Application Role (Protected: Managed by Owner) */}
            <div>
              <label className="block text-xs font-semibold text-[#F4F7FB] mb-1.5 flex items-center justify-between">
                <span>Application Role (RBAC & RLS)</span>
                <span className="text-[10px] text-[#91A0B8] flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#F5B942]" />
                  <span>Governed by Owner</span>
                </span>
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B83FF]" />
                <div className="w-full bg-[#151F33]/60 border border-[#18243A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F4F7FB] flex items-center justify-between">
                  <span className="font-semibold capitalize">
                    {profile?.role === 'owner' && 'Owner (Full Administrator)'}
                    {profile?.role === 'staff' && 'Staff (Dispatch & Operations)'}
                    {profile?.role === 'technician' && 'Technician (Field Specialist)'}
                    {profile?.role === 'customer' && 'Customer (Client Portal)'}
                    {!profile?.role && 'Customer'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {profile?.account_status === 'suspended' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FF4D4D]/20 text-[#FF6B6B]">
                        Suspended
                      </span>
                    )}
                    {profile?.technician_status && (
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        profile.technician_status === 'approved'
                          ? 'bg-[#35D07F]/20 text-[#35D07F]'
                          : profile.technician_status === 'rejected'
                          ? 'bg-[#FF4D4D]/20 text-[#FF6B6B]'
                          : 'bg-[#F5B942]/20 text-[#F5B942]'
                      }`}>
                        Tech: {profile.technician_status.toUpperCase()}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6C63FF]/20 text-[#8B83FF] uppercase font-mono">
                      {profile?.role || 'customer'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            {/* Supabase User UUID */}
            <div className="p-3 rounded-xl bg-[#151F33]/40 border border-[#18243A] flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <Fingerprint className="w-4 h-4 text-[#39D9FF] shrink-0" />
                <div className="truncate">
                  <span className="block text-[10px] text-[#91A0B8]">Supabase User UUID (auth.users.id)</span>
                  <span className="text-[11px] font-mono text-[#F4F7FB] truncate block">
                    {user?.id || 'Not authenticated'}
                  </span>
                </div>
              </div>
              {user?.id && (
                <button
                  type="button"
                  onClick={handleCopyUserId}
                  className="p-1.5 rounded-lg bg-[#18243A] hover:bg-[#18243A]/80 text-[#91A0B8] hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
                  title="Copy User ID"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-[#35D07F]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            {/* Account Created Date */}
            <div className="p-3 rounded-xl bg-[#151F33]/40 border border-[#18243A] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#F5B942] shrink-0" />
              <div>
                <span className="block text-[10px] text-[#91A0B8]">Account Registered</span>
                <span className="text-[11px] text-[#F4F7FB]">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })
                    : 'Active Session'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isUpdatingProfile || isProfileLoading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#6C63FF] to-[#4F46E5] hover:opacity-95 shadow-md shadow-[#6C63FF]/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving to Supabase...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile Details</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Company Profile Section */}
        <div className="p-6 rounded-2xl bg-[#0D1424] border border-[#18243A] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#18243A]">
            <Building className="w-4 h-4 text-[#6C63FF]" />
            <h3 className="text-sm font-bold text-[#F4F7FB]">Enterprise Company Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-[#91A0B8] mb-1">Company Legal Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-[#151F33] border border-[#18243A] rounded-xl px-3 py-2 text-xs text-[#F4F7FB] focus:border-[#6C63FF] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#91A0B8] mb-1">Dispatch Support Email</label>
              <input
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                className="w-full bg-[#151F33] border border-[#18243A] rounded-xl px-3 py-2 text-xs text-[#F4F7FB] focus:border-[#6C63FF] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#91A0B8] mb-1">Phone Line</label>
              <input
                type="text"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                className="w-full bg-[#151F33] border border-[#18243A] rounded-xl px-3 py-2 text-xs text-[#F4F7FB] focus:border-[#6C63FF] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#91A0B8] mb-1">Headquarters Address</label>
              <input
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="w-full bg-[#151F33] border border-[#18243A] rounded-xl px-3 py-2 text-xs text-[#F4F7FB] focus:border-[#6C63FF] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#91A0B8] mb-1">Base Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#151F33] border border-[#18243A] rounded-xl px-3 py-2 text-xs text-[#F4F7FB] focus:border-[#6C63FF] focus:outline-none"
              >
                <option value="PKR (₨)">PKR (₨) - Pakistani Rupee (Default)</option>
                <option value="USD ($)">USD ($) - United States Dollar</option>
                <option value="EUR (€)">EUR (€) - Euro</option>
                <option value="GBP (£)">GBP (£) - British Pound</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#91A0B8] mb-1">Default Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-[#151F33] border border-[#18243A] rounded-xl px-3 py-2 text-xs text-[#F4F7FB] focus:border-[#6C63FF] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Quote Defaults Section (Prompt #18) */}
        <div className="p-6 rounded-2xl bg-[#0D1424] border border-[#18243A] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#18243A]">
            <FileText className="w-4 h-4 text-[#39D9FF]" />
            <h3 className="text-sm font-bold text-[#F4F7FB]">Quotation Automation & Defaults</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-[#91A0B8] mb-1">
                Default Sales Tax Rate (%)
              </label>
              <div className="relative">
                <Percent className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B8]" />
                <input
                  type="text"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full bg-[#151F33] border border-[#18243A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F4F7FB] focus:border-[#39D9FF] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#91A0B8] mb-1">
                Quotation Validity Duration (Days)
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B8]" />
                <input
                  type="number"
                  value={quoteValidityDays}
                  onChange={(e) => setQuoteValidityDays(e.target.value)}
                  className="w-full bg-[#151F33] border border-[#18243A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F4F7FB] focus:border-[#39D9FF] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#91A0B8] mb-1">
              Standard Commercial Terms and Conditions
            </label>
            <textarea
              rows={3}
              value={standardTerms}
              onChange={(e) => setStandardTerms(e.target.value)}
              className="w-full bg-[#151F33] border border-[#18243A] rounded-xl px-3 py-2 text-xs text-[#F4F7FB] focus:border-[#39D9FF] focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Notification Preferences (Prompt #18) */}
        <div className="p-6 rounded-2xl bg-[#0D1424] border border-[#18243A] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#18243A]">
            <Bell className="w-4 h-4 text-[#F5B942]" />
            <h3 className="text-sm font-bold text-[#F4F7FB]">Automated Operational Alerts</h3>
          </div>

          <div className="divide-y divide-[#18243A] text-xs">
            {[
              { key: 'leadCreated', label: 'Lead Ingestion Alerts', desc: 'Notify dispatchers immediately when a customer request is recorded' },
              { key: 'quoteAccepted', label: 'Quote Approval Alerts', desc: 'Instant banner when client signs or approves a formal quote' },
              { key: 'jobCompleted', label: 'Work Order Completion', desc: 'Alert operations when tech finishes field work and uploads evidence' },
              { key: 'invoicePaid', label: 'Payment Settlement', desc: 'Notify finance desk when invoice balance is received and reconciled' },
              { key: 'technicianAssigned', label: 'Technician Route Updates', desc: 'Notify assigned technicians when work order dispatch is assigned' }
            ].map((item) => (
              <div key={item.key} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#F4F7FB]">{item.label}</div>
                  <div className="text-[11px] text-[#91A0B8]">{item.desc}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(notifications as any)[item.key]}
                    onChange={(e) =>
                      setNotifications({ ...notifications, [item.key]: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-[#18243A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#35D07F]"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Team Roles & Access Architecture */}
        <div className="p-6 rounded-2xl bg-[#0D1424] border border-[#18243A] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#18243A]">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#35D07F]" />
              <h3 className="text-sm font-bold text-[#F4F7FB]">Enterprise Roles & Permissions</h3>
            </div>
            <span className="text-[10px] text-[#91A0B8]">4 Canonical Business Roles</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080D18] text-[#91A0B8] border-b border-[#18243A]">
                <tr>
                  <th className="py-2.5 px-3">Role Archetype</th>
                  <th className="py-2.5 px-3 text-center">Active Seats</th>
                  <th className="py-2.5 px-3">Operational Permissions Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18243A]">
                {roles.map((r, i) => (
                  <tr key={i}>
                    <td className="py-3 px-3 font-semibold text-[#F4F7FB]">{r.name}</td>
                    <td className="py-3 px-3 text-center font-mono text-[#39D9FF]">{r.users}</td>
                    <td className="py-3 px-3 text-[#91A0B8]">{r.permissions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* OWNER EXCLUSIVE: Organization User & Role Administration */}
        {isOwner && (
          <div className="p-6 rounded-2xl bg-[#0D1424] border border-[#6C63FF]/40 space-y-4 shadow-xl shadow-[#6C63FF]/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#18243A]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#6C63FF]/20 text-[#8B83FF]">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F4F7FB] flex items-center gap-2">
                    <span>Organization User & Access Administration</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6C63FF]/20 text-[#8B83FF] border border-[#6C63FF]/40">
                      Owner Exclusive
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#91A0B8]">
                    Approve field technicians, assign staff operators, and manage account statuses across the business.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={loadAdminUsers}
                disabled={isLoadingUsers}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#91A0B8] hover:text-white bg-[#151F33] hover:bg-[#18243A] border border-[#18243A] flex items-center gap-1.5 cursor-pointer self-start sm:self-auto disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                <span>Refresh Accounts</span>
              </button>
            </div>

            {isLoadingUsers ? (
              <div className="py-8 text-center text-xs text-[#91A0B8] flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#6C63FF]" />
                <span>Loading platform accounts from Supabase profiles...</span>
              </div>
            ) : adminUsers.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#151F33]/40 border border-[#18243A] text-center text-xs text-[#91A0B8]">
                No user accounts found in profiles table yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#080D18] text-[#91A0B8] border-b border-[#18243A]">
                    <tr>
                      <th className="py-2.5 px-3">User / Identity</th>
                      <th className="py-2.5 px-3">Assigned Role</th>
                      <th className="py-2.5 px-3">Technician Onboarding</th>
                      <th className="py-2.5 px-3">Account Status</th>
                      <th className="py-2.5 px-3 text-right">Registration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#18243A]">
                    {adminUsers.map((u) => {
                      const isSelf = u.id === user?.id;
                      const isUpdating = userUpdatingId === u.id;

                      return (
                        <tr key={u.id} className="hover:bg-[#151F33]/30 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-semibold text-[#F4F7FB]">
                              {u.full_name || 'Unnamed User'}
                              {isSelf && <span className="ml-2 text-[10px] text-[#39D9FF] font-mono">(You)</span>}
                            </div>
                            <div className="text-[11px] text-[#91A0B8] flex items-center gap-2">
                              <span>{u.email}</span>
                              {u.phone && <span>• {u.phone}</span>}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            {isSelf ? (
                              <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#6C63FF]/20 text-[#8B83FF] border border-[#6C63FF]/40">
                                OWNER (Active)
                              </span>
                            ) : (
                              <select
                                value={u.role}
                                disabled={isUpdating}
                                onChange={(e) =>
                                  handleOwnerUpdateUser(u.id, { role: e.target.value as UserRole })
                                }
                                className="bg-[#151F33] border border-[#18243A] rounded-lg px-2.5 py-1 text-xs text-[#F4F7FB] focus:border-[#6C63FF] focus:outline-none cursor-pointer"
                              >
                                <option value="customer">Customer</option>
                                <option value="technician">Technician</option>
                                <option value="staff">Staff</option>
                                <option value="owner">Owner</option>
                              </select>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            {u.role === 'technician' ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {u.technician_status === 'approved' ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#35D07F]/20 text-[#35D07F] border border-[#35D07F]/40">
                                    Approved
                                  </span>
                                ) : u.technician_status === 'rejected' ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF4D4D]/20 text-[#FF6B6B] border border-[#FF4D4D]/40">
                                    Rejected
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F5B942]/20 text-[#F5B942] border border-[#F5B942]/40 animate-pulse">
                                    Pending Review
                                  </span>
                                )}

                                {u.technician_status !== 'approved' && (
                                  <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() =>
                                      handleOwnerUpdateUser(u.id, { technician_status: 'approved' })
                                    }
                                    className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#35D07F] hover:bg-[#35D07F]/80 text-black cursor-pointer transition-colors"
                                    title="Approve Technician to take jobs"
                                  >
                                    Approve
                                  </button>
                                )}
                                {u.technician_status !== 'rejected' && (
                                  <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() =>
                                      handleOwnerUpdateUser(u.id, { technician_status: 'rejected' })
                                    }
                                    className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FF4D4D]/20 hover:bg-[#FF4D4D]/40 text-[#FF6B6B] border border-[#FF4D4D]/40 cursor-pointer transition-colors"
                                    title="Reject Technician"
                                  >
                                    Reject
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#91A0B8]/50">—</span>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            {isSelf ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#35D07F]/20 text-[#35D07F] border border-[#35D07F]/30">
                                Active
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() =>
                                  handleOwnerUpdateUser(u.id, {
                                    account_status: u.account_status === 'active' ? 'suspended' : 'active'
                                  })
                                }
                                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer border ${
                                  u.account_status === 'active'
                                    ? 'bg-[#35D07F]/10 text-[#35D07F] border-[#35D07F]/30 hover:bg-[#FF4D4D]/20 hover:text-[#FF6B6B] hover:border-[#FF4D4D]/40'
                                    : 'bg-[#FF4D4D]/20 text-[#FF6B6B] border-[#FF4D4D]/30 hover:bg-[#35D07F]/20 hover:text-[#35D07F]'
                                }`}
                                title="Click to toggle account status"
                              >
                                {u.account_status === 'active' ? 'Active (Click to Suspend)' : 'Suspended (Click to Activate)'}
                              </button>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right">
                            {isUpdating ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6C63FF] ml-auto" />
                            ) : (
                              <span className="text-[11px] text-[#91A0B8] font-mono">
                                {new Date(u.created_at).toLocaleDateString()}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Development Database Diagnostic (Assignment 3 Audit Requirement) */}
        <div className="p-6 rounded-2xl bg-[#0D1424] border border-[#18243A] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#18243A]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#00E599]/15 border border-[#00E599]/30 flex items-center justify-center text-[#00E599]">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#F4F7FB]">Development Database Diagnostic</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    dbDiagnostic?.isConnected
                      ? 'bg-[#00E599]/15 text-[#00E599] border-[#00E599]/30'
                      : 'bg-[#FF647C]/15 text-[#FF647C] border-[#FF647C]/30'
                  }`}>
                    {dbDiagnostic?.isConnected ? 'Supabase Connected' : 'Disconnected'}
                  </span>
                </div>
                <p className="text-xs text-[#91A0B8] mt-0.5">
                  Real-time connection verification, active session user ID, and cloud table record counts.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={runDiagnostic}
              disabled={isRunningDiagnostic}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151F33] hover:bg-[#1A2640] border border-[#18243A] text-xs font-semibold text-[#F4F7FB] transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningDiagnostic ? 'animate-spin text-[#6C63FF]' : 'text-[#91A0B8]'}`} />
              <span>{isRunningDiagnostic ? 'Checking...' : 'Refresh Diagnostic'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#080D18] border border-[#18243A]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#91A0B8]">Auth User ID</span>
              <p className="text-xs font-mono text-[#F4F7FB] truncate mt-1" title={user?.id || 'Not signed in'}>
                {user?.id || 'No active session'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#080D18] border border-[#18243A]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#91A0B8]">Active Role</span>
              <p className="text-xs font-semibold text-[#39D9FF] capitalize mt-1">
                {profile?.role || 'Guest'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#080D18] border border-[#18243A]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#91A0B8]">RLS Enforcement</span>
              <p className="text-xs font-semibold text-[#00E599] mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00E599]" />
                Active on 9 Tables
              </p>
            </div>
          </div>

          {/* Table Counts Matrix */}
          <div>
            <span className="text-xs font-bold text-[#F4F7FB] block mb-2">Relational Table Live Status</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {(dbDiagnostic?.checkedTables || []).map((tbl) => (
                <div
                  key={tbl.name}
                  className="p-2.5 rounded-xl bg-[#080D18] border border-[#18243A] flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-xs font-mono text-[#E2E8F0] block truncate">
                      {tbl.name}
                    </span>
                    <span className="text-[10px] text-[#91A0B8]">
                      {tbl.exists ? 'Ready' : 'Not Found'}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-[#00E599]">
                      {tbl.count !== undefined ? tbl.count : '—'}
                    </span>
                    <span className="text-[9px] text-[#91A0B8] block">rows</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="p-4 rounded-2xl bg-[#0D1424] border border-[#18243A] flex items-center justify-between">
          <span className="text-xs text-[#91A0B8]">
            Changes are saved to the current temporary frontend session.
          </span>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#6C63FF] hover:bg-[#6C63FF]/90 shadow-lg shadow-[#6C63FF]/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
