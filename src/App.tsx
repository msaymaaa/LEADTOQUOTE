import React, { useState, useEffect } from 'react';
import {
  NavigationTab,
  Lead,
  Quote,
  Job,
  Technician,
  Customer,
  Invoice,
  AppNotification,
  ToastMessage,
  LeadStatus,
  QuoteStatus,
  JobStatus
} from './types';
import {
  INITIAL_LEADS,
  INITIAL_QUOTES,
  INITIAL_JOBS,
  INITIAL_TECHNICIANS,
  INITIAL_CUSTOMERS,
  INITIAL_INVOICES,
  INITIAL_NOTIFICATIONS
} from './mockData';

// Layout, Landing & Auth
import { LandingPage } from './components/landing/LandingPage';
import { SignInPage } from './components/auth/SignInPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Loader2, ShieldCheck, AlertOctagon, Clock, LogOut } from 'lucide-react';

// Live Supabase Database Layer
import { formatPKR, CURRENCY } from './lib/currency';
import {
  getLeads,
  createLead,
  updateLeadStatus,
  getQuotes,
  createQuote,
  updateQuoteStatus,
  getJobs,
  assignJobTechnician,
  updateJobStatus,
  addWorkEvidence,
  getTechnicians,
  updateTechnicianApprovalStatus,
  getInvoices,
  createInvoice,
  recordPayment,
  logActivity,
  subscribeToDatabaseChanges
} from './lib/database';
import { DatabaseStatusBanner } from './components/common/DatabaseStatusBanner';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { LeadsView } from './components/leads/LeadsView';
import { QuotesView } from './components/quotes/QuotesView';
import { JobsDispatchView } from './components/jobs/JobsDispatchView';
import { TechniciansView } from './components/technicians/TechniciansView';
import { CustomersView } from './components/customers/CustomersView';
import { InvoicesView } from './components/invoices/InvoicesView';
import { SettingsView } from './components/settings/SettingsView';

// Modals & Drawers
import { NewLeadModal } from './components/leads/NewLeadModal';
import { LeadDetailDrawer } from './components/leads/LeadDetailDrawer';
import { NewQuoteModal } from './components/quotes/NewQuoteModal';
import { QuoteDetailModal } from './components/quotes/QuoteDetailModal';
import { CustomerQuoteViewModal } from './components/quotes/CustomerQuoteViewModal';
import { QuoteDeclineModal } from './components/quotes/QuoteDeclineModal';
import { JobDetailModal } from './components/jobs/JobDetailModal';
import { AssignTechnicianModal } from './components/jobs/AssignTechnicianModal';
import { CustomerDetailDrawer } from './components/customers/CustomerDetailDrawer';
import { InvoiceDetailModal } from './components/invoices/InvoiceDetailModal';
import { RecordPaymentModal } from './components/invoices/RecordPaymentModal';
import { ConfirmationDialog } from './components/common/ConfirmationDialog';
import { ToastContainer } from './components/common/ToastContainer';

function LeadToQuoteApp() {
  const { user, profile, isLoading, signOut } = useAuth();
  const userRole = profile?.role || 'customer';
  const isSuspended = profile?.account_status === 'suspended';

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavigationTab>('landing');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Role Access Rules
  const roleAllowedTabs: Record<string, NavigationTab[]> = {
    owner: ['dashboard', 'leads', 'quotes', 'jobs', 'technicians', 'customers', 'invoices', 'settings'],
    staff: ['dashboard', 'leads', 'quotes', 'jobs', 'technicians', 'customers', 'invoices', 'settings'],
    technician: ['jobs', 'settings'],
    customer: ['quotes', 'jobs', 'invoices', 'settings']
  };

  const roleDefaultTab: Record<string, NavigationTab> = {
    owner: 'dashboard',
    staff: 'dashboard',
    technician: 'jobs',
    customer: 'quotes'
  };

  // Route Protection & Automatic Redirection
  useEffect(() => {
    if (!isLoading) {
      // If user is not authenticated and is on a protected route, redirect to signin
      const isPublicTab = activeTab === 'landing' || activeTab === 'signin' || activeTab === 'signup';
      if (!user && !isPublicTab) {
        setActiveTab('signin');
        return;
      }
      // If user is authenticated and attempts to open signin/signup, redirect to role default
      if (user) {
        if (activeTab === 'signin' || activeTab === 'signup') {
          setActiveTab(roleDefaultTab[userRole] || 'dashboard');
          return;
        }

        // Enforce RBAC route access
        if (!isPublicTab) {
          const allowed = roleAllowedTabs[userRole] || ['quotes'];
          if (!allowed.includes(activeTab)) {
            const fallbackTab = roleDefaultTab[userRole] || 'quotes';
            setActiveTab(fallbackTab);
            addToast(
              'Restricted Workspace',
              `Access restricted for ${userRole.toUpperCase()} role. Redirected to ${fallbackTab}.`,
              'info'
            );
          }
        }
      }
    }
  }, [user, profile, activeTab, isLoading, userRole]);

  // Core Data States (Initialized from Live Supabase Database Layer with Resilient Fallback)
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [quotes, setQuotes] = useState<Quote[]>(INITIAL_QUOTES);
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [technicians, setTechnicians] = useState<Technician[]>(INITIAL_TECHNICIANS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isDataSyncing, setIsDataSyncing] = useState<boolean>(false);

  // Live Database Sync Loader
  const reloadAllData = async () => {
    setIsDataSyncing(true);
    try {
      const [liveLeads, liveQuotes, liveJobs, liveTechs] = await Promise.all([
        getLeads(),
        getQuotes(),
        getJobs(),
        getTechnicians()
      ]);
      if (liveLeads && liveLeads.length > 0) setLeads(liveLeads);
      if (liveQuotes && liveQuotes.length > 0) setQuotes(liveQuotes);
      if (liveJobs && liveJobs.length > 0) setJobs(liveJobs);
      if (liveTechs && liveTechs.length > 0) setTechnicians(liveTechs);
      const liveInvoices = await getInvoices(liveJobs && liveJobs.length > 0 ? liveJobs : jobs);
      if (liveInvoices && liveInvoices.length > 0) setInvoices(liveInvoices);
    } catch (err) {
      console.warn('Live data sync notice:', err);
    } finally {
      setIsDataSyncing(false);
    }
  };

  const handleUpdateTechStatus = async (techId: string, status: 'approved' | 'rejected') => {
    const { error } = await updateTechnicianApprovalStatus(techId, status);
    if (error) {
      addToast('Status Update Failed', error.message, 'error');
    } else {
      addToast(
        'Technician Status Updated',
        `Technician credentials have been marked as ${status}.`,
        'success'
      );
      reloadAllData();
    }
  };

  // Initial fetch and real-time subscription when authenticated user changes
  useEffect(() => {
    if (user) {
      reloadAllData();
      const unsubscribe = subscribeToDatabaseChanges(() => {
        reloadAllData();
      });
      return () => {
        unsubscribe();
      };
    }
  }, [user]);

  // Active Selected Entity States
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Modal Open States
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [isNewQuoteOpen, setIsNewQuoteOpen] = useState(false);
  const [quoteCustomerPreset, setQuoteCustomerPreset] = useState<any>(null);
  const [isCustomerQuotePreviewOpen, setIsCustomerQuotePreviewOpen] = useState(false);
  const [isQuoteDeclineModalOpen, setIsQuoteDeclineModalOpen] = useState(false);
  const [isAssignTechModalOpen, setIsAssignTechModalOpen] = useState(false);
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);

  // Confirmation Dialog States
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'approve' | 'decline' | 'assign' | 'complete' | 'payment' | 'danger';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {}
  });

  // Helper: Show Toast
  const addToast = (
    title: string,
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'success'
  ) => {
    const id = String(Date.now());
    setToasts((prev) => [...prev, { id, title, message, type, timestamp: 'Just now' }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper: Add Notification
  const addNotification = (title: string, message: string, type: 'lead' | 'quote' | 'job' | 'invoice') => {
    const newNotif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      title,
      message,
      time: 'Just now',
      read: false,
      type
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // -------------------------------------------------------------
  // LEAD HANDLERS (Live Supabase Connected)
  // -------------------------------------------------------------
  const handleCreateLead = async (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev]);
    addToast('Lead Created', `New lead for ${newLead.customerName} (${newLead.id}) has been logged.`, 'success');
    addNotification('New Lead Ingested', `${newLead.customerName} requested ${newLead.serviceType}`, 'lead');
    try {
      await createLead(newLead, user?.id);
      await logActivity('Lead Ingested', `Customer ${newLead.customerName} submitted request for ${newLead.serviceType}`, newLead.id, user?.id);
    } catch (err) {
      console.warn('Error saving lead to Supabase:', err);
    }
  };

  const handleLeadStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    addToast('Status Updated', `Lead ${leadId} status changed to ${newStatus}.`, 'info');
    try {
      await updateLeadStatus(leadId, newStatus);
      await logActivity('Lead Status Changed', `Lead ${leadId} moved to ${newStatus}`, leadId, user?.id);
    } catch (err) {
      console.warn('Error updating lead status in Supabase:', err);
    }
  };

  const handleContactCustomer = (lead: Lead) => {
    addToast(
      'Customer Contacted',
      `Simulated outreach sent to ${lead.customerName} via SMS & Email.`,
      'info'
    );
  };

  const handleCreateQuoteFromLead = (lead: Lead) => {
    setQuoteCustomerPreset({
      name: lead.customerName,
      email: lead.email,
      phone: lead.phone,
      service: lead.serviceType,
      location: lead.location
    });
    setIsNewQuoteOpen(true);
  };

  // -------------------------------------------------------------
  // QUOTE HANDLERS (Live Supabase Connected)
  // -------------------------------------------------------------
  const handleCreateQuote = async (newQuote: Quote) => {
    setQuotes((prev) => [newQuote, ...prev]);
    addToast('Quotation Dispatched', `Quote ${newQuote.id} created (${formatPKR(newQuote.total)}).`, 'success');
    addNotification('Quote Dispatched', `${newQuote.id} sent to ${newQuote.customerName}`, 'quote');
    try {
      await createQuote(newQuote, user?.id);
      await logActivity('Quote Created', `Quotation ${newQuote.id} created for ${newQuote.customerName} (${formatPKR(newQuote.total)})`, newQuote.leadId, user?.id);
    } catch (err) {
      console.warn('Error creating quote in Supabase:', err);
    }
  };

  const handleSendQuote = async (quote: Quote) => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === quote.id ? { ...q, status: 'Sent' } : q))
    );
    if (selectedQuote && selectedQuote.id === quote.id) {
      setSelectedQuote((prev) => (prev ? { ...prev, status: 'Sent' } : null));
    }
    addToast('Quote Sent', `Quotation ${quote.id} delivered to ${quote.customerEmail}.`, 'info');
    try {
      await updateQuoteStatus(quote.id, 'Sent');
      await logActivity('Quote Dispatched', `Quotation ${quote.id} delivered to ${quote.customerEmail}`, quote.leadId, user?.id);
    } catch (err) {
      console.warn('Error updating quote to sent in Supabase:', err);
    }
  };

  const handleApproveQuoteClick = (quote: Quote) => {
    setConfirmDialog({
      isOpen: true,
      title: `Approve Quotation ${quote.id}?`,
      description: `Customer confirmation will change the quotation status to Approved and automatically generate a scheduled Job Order for dispatch.`,
      confirmText: 'Approve & Create Job',
      type: 'approve',
      onConfirm: async () => {
        // Approve quote
        setQuotes((prev) =>
          prev.map((q) => (q.id === quote.id ? { ...q, status: 'Approved' } : q))
        );
        if (selectedQuote && selectedQuote.id === quote.id) {
          setSelectedQuote((prev) => (prev ? { ...prev, status: 'Approved' } : null));
        }

        // Auto-create a corresponding Job
        const newJobId = `JOB-${Math.floor(2050 + Math.random() * 50)}`;
        const autoJob: Job = {
          id: newJobId,
          quoteId: quote.id,
          customerId: 'CUST-01',
          customerName: quote.customerName,
          customerPhone: quote.customerPhone,
          title: quote.serviceTitle,
          location: quote.location,
          scheduledDate: '2026-09-24',
          scheduledTime: '09:00 AM',
          status: 'Scheduled',
          priority: 'High',
          estimatedDuration: '3.5 Hours',
          description: quote.serviceDescription,
          evidence: [],
          timeline: [
            { stage: 'Quote Approved', timestamp: 'Today', completed: true, active: false },
            { stage: 'Technician Assigned', timestamp: 'Pending', completed: false, active: true },
            { stage: 'Technician En Route', timestamp: 'Pending', completed: false, active: false },
            { stage: 'Work Started', timestamp: 'Pending', completed: false, active: false },
            { stage: 'Work Completed', timestamp: 'Pending', completed: false, active: false },
            { stage: 'Customer Confirmation', timestamp: 'Pending', completed: false, active: false },
            { stage: 'Invoice Generated', timestamp: 'Pending', completed: false, active: false }
          ]
        };

        setJobs((prev) => [autoJob, ...prev]);
        setConfirmDialog((c) => ({ ...c, isOpen: false }));
        setIsCustomerQuotePreviewOpen(false);
        addToast('Quotation Approved', `Quote ${quote.id} approved! Generated Job ${newJobId} in dispatch board.`, 'success');
        addNotification('Quote Approved by Client', `${quote.customerName} approved ${quote.id}. Dispatch ready.`, 'quote');

        try {
          await updateQuoteStatus(quote.id, 'Approved', 'accepted');
          await logActivity('Quote Approved', `Quote ${quote.id} approved by client; job ${newJobId} generated`, quote.leadId, user?.id);
        } catch (err) {
          console.warn('Error saving quote approval in Supabase:', err);
        }
      }
    });
  };

  const handleDeclineQuoteClick = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsQuoteDeclineModalOpen(true);
  };

  const handleConfirmQuoteDecline = async (quoteId: string, reason: string) => {
    setQuotes((prev) =>
      prev.map((q) =>
        q.id === quoteId ? { ...q, status: 'Declined', declineReason: reason } : q
      )
    );
    if (selectedQuote && selectedQuote.id === quoteId) {
      setSelectedQuote((prev) =>
        prev ? { ...prev, status: 'Declined', declineReason: reason } : null
      );
    }
    setIsCustomerQuotePreviewOpen(false);
    addToast('Quote Declined', `Quote ${quoteId} has been marked as Declined. Reason: ${reason}`, 'warning');
    addNotification('Quote Declined', `${quoteId} declined: ${reason}`, 'quote');
    try {
      await updateQuoteStatus(quoteId, 'Declined', 'declined');
      await logActivity('Quote Declined', `Quote ${quoteId} declined. Reason: ${reason}`, undefined, user?.id);
    } catch (err) {
      console.warn('Error updating decline status in Supabase:', err);
    }
  };

  // -------------------------------------------------------------
  // JOB & DISPATCH HANDLERS (Live Supabase Connected)
  // -------------------------------------------------------------
  const handleJobStatusChange = async (jobId: string, newStatus: JobStatus) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
    );
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    addToast('Work Order Updated', `Job ${jobId} status shifted to ${newStatus}.`, 'info');
    try {
      await updateJobStatus(jobId, newStatus);
      await logActivity('Job Status Changed', `Job ${jobId} status updated to ${newStatus}`, undefined, user?.id);
    } catch (err) {
      console.warn('Error updating job status in Supabase:', err);
    }
  };

  const handleAssignTechnician = async (jobId: string, tech: Technician) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              technicianId: tech.id,
              technicianName: tech.name,
              status: j.status === 'Scheduled' ? 'Assigned' : j.status
            }
          : j
      )
    );
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob((prev) =>
        prev
          ? {
              ...prev,
              technicianId: tech.id,
              technicianName: tech.name,
              status: prev.status === 'Scheduled' ? 'Assigned' : prev.status
            }
          : null
      );
    }

    // Update technician availability
    setTechnicians((prev) =>
      prev.map((t) =>
        t.id === tech.id
          ? { ...t, availability: 'On Job', currentJob: `${jobId} In Progress` }
          : t
      )
    );

    addToast('Technician Dispatched', `${tech.name} assigned to ${jobId}. Route sent to tech mobile view.`, 'success');
    addNotification('Tech Dispatched', `${tech.name} assigned to work order ${jobId}`, 'job');

    try {
      await assignJobTechnician(jobId, tech.id, tech.name, tech.phone);
      await logActivity('Technician Assigned', `Assigned ${tech.name} to job ${jobId}`, undefined, user?.id);
    } catch (err) {
      console.warn('Error assigning technician in Supabase:', err);
    }
  };

  const handleMarkJobCompleteClick = (job: Job) => {
    setConfirmDialog({
      isOpen: true,
      title: `Mark Work Complete for ${job.id}?`,
      description: `Confirming field completion verifies all diagnostics and work photos. This moves the job into the billing stage.`,
      confirmText: 'Mark Complete & Settle',
      type: 'complete',
      onConfirm: async () => {
        setJobs((prev) =>
          prev.map((j) => (j.id === job.id ? { ...j, status: 'Completed' } : j))
        );
        if (selectedJob && selectedJob.id === job.id) {
          setSelectedJob((prev) => (prev ? { ...prev, status: 'Completed' } : null));
        }
        setConfirmDialog((c) => ({ ...c, isOpen: false }));
        addToast('Work Completed', `Job ${job.id} marked complete. Ready for invoice generation.`, 'success');
        addNotification('Field Work Completed', `${job.customerName} - ${job.title} completed`, 'job');

        try {
          await updateJobStatus(job.id, 'Completed');
          await logActivity('Job Completed', `Field service for job ${job.id} marked completed`, undefined, user?.id);
        } catch (err) {
          console.warn('Error completing job in Supabase:', err);
        }
      }
    });
  };

  const handleUploadEvidence = async (jobId: string, title: string) => {
    const mockImageUrls = [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80'
    ];
    const randomUrl = mockImageUrls[Math.floor(Math.random() * mockImageUrls.length)];

    const newEvidence = {
      id: `EV-${Date.now()}`,
      title,
      url: randomUrl,
      timestamp: 'Today, 2:15 PM',
      type: 'After' as const
    };

    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, evidence: [...j.evidence, newEvidence] } : j
      )
    );
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob((prev) =>
        prev ? { ...prev, evidence: [...prev.evidence, newEvidence] } : null
      );
    }
    addToast('Evidence Logged', `Uploaded completion photo: "${title}".`, 'success');

    try {
      await addWorkEvidence(jobId, title, randomUrl, user?.id, 'after');
      await logActivity('Evidence Uploaded', `Work evidence "${title}" attached to job ${jobId}`, jobId, user?.id);
    } catch (err) {
      console.warn('Error saving work evidence to Supabase:', err);
    }
  };

  const handleGenerateInvoiceFromJob = async (job: Job) => {
    const newInvId = `INV-${Math.floor(4005 + Math.random() * 50)}`;
    const newInvoice: Invoice = {
      id: newInvId,
      quoteId: job.quoteId || 'QT-1042',
      jobId: job.id,
      customerName: job.customerName,
      customerEmail: 'billing@client.com',
      customerAddress: job.location,
      amount: 1450,
      status: 'Sent',
      issueDate: 'Sep 19, 2026',
      issuedDate: 'Sep 19, 2026',
      dueDate: 'Oct 03, 2026',
      serviceDescription: job.title
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    setSelectedJob(null);
    setSelectedInvoice(newInvoice);
    addToast('Invoice Created', `Generated ${newInvId} for ${job.customerName}.`, 'success');
    addNotification('Invoice Generated', `${newInvId} for ${job.customerName} (${formatPKR(newInvoice.amount)})`, 'invoice');

    try {
      await createInvoice(newInvoice, user?.id);
      await logActivity('Invoice Created', `Invoice ${newInvId} created for ${job.customerName} (${formatPKR(newInvoice.amount)})`, job.id, user?.id);
    } catch (err) {
      console.warn('Error saving invoice to Supabase:', err);
    }
  };

  // -------------------------------------------------------------
  // INVOICE & PAYMENT HANDLERS (Live Supabase Connected)
  // -------------------------------------------------------------
  const handleConfirmPayment = async (invoiceId: string, paymentMethod: string, amount: number) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status: 'Paid',
              paidDate: 'Sep 19, 2026',
              paymentMethod
            }
          : inv
      )
    );
    if (selectedInvoice && selectedInvoice.id === invoiceId) {
      setSelectedInvoice((prev) =>
        prev
          ? {
              ...prev,
              status: 'Paid',
              paidDate: 'Sep 19, 2026',
              paymentMethod
            }
          : null
      );
    }
    addToast(
      'Payment Recorded',
      `Payment of ${formatPKR(amount)} via ${paymentMethod} confirmed for ${invoiceId}.`,
      'success'
    );
    addNotification('Payment Settled', `${invoiceId} marked Paid (${formatPKR(amount)})`, 'invoice');

    try {
      const matchingJob = jobs.find((j) => j.id === selectedInvoice?.jobId);
      await recordPayment(invoiceId, amount, paymentMethod, matchingJob?.id);
      await logActivity('Payment Reconciled', `Settlement of ${formatPKR(amount)} received via ${paymentMethod} for invoice ${invoiceId}`, undefined, user?.id);
    } catch (err) {
      console.warn('Error recording payment in Supabase:', err);
    }
  };

  const handleSendReminder = (invoice: Invoice) => {
    addToast('Reminder Dispatched', `Automated payment reminder sent to ${invoice.customerName}.`, 'info');
  };

  // -------------------------------------------------------------
  // DEMO RESET HANDLER
  // -------------------------------------------------------------
  const handleResetDemoData = () => {
    setLeads(INITIAL_LEADS);
    setQuotes(INITIAL_QUOTES);
    setJobs(INITIAL_JOBS);
    setTechnicians(INITIAL_TECHNICIANS);
    setCustomers(INITIAL_CUSTOMERS);
    setInvoices(INITIAL_INVOICES);
    setNotifications(INITIAL_NOTIFICATIONS);
    addToast('Demo State Reset', 'Restored initial static operational mock dataset.', 'info');
  };

  // -------------------------------------------------------------
  // RENDER APP SHELL
  // Global Session Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080D18] flex flex-col items-center justify-center text-[#F4F7FB] px-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#39D9FF] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-[#6C63FF]/30 animate-pulse mb-6">
          L
        </div>
        <div className="flex items-center gap-2.5 text-sm font-semibold text-[#39D9FF]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Synchronizing Supabase Auth Session...</span>
        </div>
        <p className="text-xs text-[#91A0B8] mt-2 text-center max-w-sm">
          Securing LeadToQuote dispatch credentials and verifying row-level access rules.
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#080D18] text-[#F4F7FB] flex flex-col font-sans selection:bg-[#6C63FF]/30 selection:text-white">
      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog((c) => ({ ...c, isOpen: false }))}
      />

      {/* Screen Router */}
      {activeTab === 'landing' ? (
        <LandingPage
          isAuthenticated={!!user}
          onEnterDashboard={() => setActiveTab(user ? 'dashboard' : 'signin')}
          onSignIn={() => setActiveTab('signin')}
          onSignUp={() => setActiveTab('signup')}
          onNavigateTab={(tab: NavigationTab) => {
            if (!user && tab !== 'landing' && tab !== 'signin' && tab !== 'signup') {
              setActiveTab('signin');
            } else {
              setActiveTab(tab);
            }
          }}
        />
      ) : activeTab === 'signin' ? (
        <SignInPage
          onNavigateToSignUp={() => setActiveTab('signup')}
          onNavigateToLanding={() => setActiveTab('landing')}
          onSuccessRedirect={() => setActiveTab('dashboard')}
        />
      ) : activeTab === 'signup' ? (
        <SignUpPage
          onNavigateToSignIn={() => setActiveTab('signin')}
          onNavigateToLanding={() => setActiveTab('landing')}
          onSuccessRedirect={() => setActiveTab('dashboard')}
        />
      ) : !user ? (
        /* Protected Route Fallback for unauthenticated access */
        <SignInPage
          onNavigateToSignUp={() => setActiveTab('signup')}
          onNavigateToLanding={() => setActiveTab('landing')}
          onSuccessRedirect={() => setActiveTab('dashboard')}
        />
      ) : isSuspended ? (
        /* Suspended Account Gate */
        <div className="flex h-screen items-center justify-center p-6 bg-[#080D18]">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#0D1424] border border-[#FF4D4D]/30 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 flex items-center justify-center mx-auto text-[#FF6B6B]">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[#F4F7FB]">Account Access Suspended</h2>
              <p className="text-xs text-[#91A0B8] leading-relaxed">
                Your LeadToQuote account is currently suspended by business administration. Access to operational features, quotation tools, and dispatch services has been restricted.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#151F33] text-[11px] text-[#91A0B8] text-left space-y-1">
              <div className="font-semibold text-[#F4F7FB]">Need assistance?</div>
              <div>Contact dispatch operations at <span className="text-[#39D9FF]">dispatch@leadtoquote.pk</span> or speak directly with your system owner.</div>
            </div>
            <button
              onClick={() => signOut()}
              className="w-full py-2.5 rounded-xl bg-[#FF4D4D] hover:bg-[#FF4D4D]/90 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Platform</span>
            </button>
          </div>
        </div>
      ) : (
        /* Operations Application Shell for Authenticated Users */
        <div className="flex h-screen overflow-hidden">
          {/* Collapsible Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onTabChange={(tab: NavigationTab) => {
              setActiveTab(tab);
              setIsMobileMenuOpen(false);
            }}
            collapsed={isSidebarCollapsed}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            setCollapsed={setIsSidebarCollapsed}
            isMobileOpen={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
            counts={{
              leads: leads.filter((l) => l.status === 'New' || l.status === 'Quoted').length,
              quotesAwaiting: quotes.filter((q) => q.status === 'Awaiting Approval').length,
              activeJobs: jobs.filter((j) => j.status !== 'Completed').length,
              invoicesPending: invoices.filter((i) => i.status !== 'Paid').length
            }}
            onOpenLanding={() => setActiveTab('landing')}
          />

          {/* Main App Canvas */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Topbar Navigation & Actions */}
            <Topbar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onNavigateTab={(tab: NavigationTab) => setActiveTab(tab)}
              notifications={notifications}
              onOpenLanding={() => setActiveTab('landing')}
              onOpenNewLead={() => setIsNewLeadOpen(true)}
              onOpenNewQuote={() => {
                setQuoteCustomerPreset(null);
                setIsNewQuoteOpen(true);
              }}
              onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              onMarkAllNotificationsRead={() => {
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                addToast('Alerts Cleared', 'All notifications marked as read.', 'info');
              }}
              leads={leads}
              quotes={quotes}
              jobs={jobs}
              onSelectLead={(l) => setSelectedLead(l)}
              onSelectQuote={(q) => setSelectedQuote(q)}
              onSelectJob={(j) => setSelectedJob(j)}
            />

            {/* Scrollable View Area */}
            <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 bg-enterprise-grid">
              {/* Supabase Live Database Connection & Migration Status */}
              <DatabaseStatusBanner onRefreshData={reloadAllData} />

              {/* Technician Pending Onboarding Banner */}
              {profile?.role === 'technician' && (profile?.technician_status === 'pending' || !profile?.technician_status) && (
                <div className="mb-6 p-4 rounded-2xl bg-[#F5B942]/10 border border-[#F5B942]/30 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#F5B942] shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-[#F5B942]">Technician Verification Under Review</div>
                    <div className="text-[#91A0B8]">
                      Your field specialist registration has been submitted and is currently pending verification and approval by the business owner. Once approved, you will be cleared for active job dispatches.
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'dashboard' && (
                <DashboardView
                  leads={leads}
                  quotes={quotes}
                  jobs={jobs}
                  invoices={invoices}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onOpenLead={(lead) => setSelectedLead(lead)}
                  onOpenQuote={(quote) => setSelectedQuote(quote)}
                  onOpenJob={(job) => setSelectedJob(job)}
                  onOpenInvoice={(inv) => setSelectedInvoice(inv)}
                />
              )}

              {activeTab === 'leads' && (
                <LeadsView
                  leads={leads}
                  onOpenNewLead={() => setIsNewLeadOpen(true)}
                  onSelectLead={(lead) => setSelectedLead(lead)}
                  onCreateQuoteFromLead={(lead) => handleCreateQuoteFromLead(lead)}
                />
              )}

              {activeTab === 'quotes' && (
                <QuotesView
                  quotes={quotes}
                  onOpenNewQuote={() => {
                    setQuoteCustomerPreset(null);
                    setIsNewQuoteOpen(true);
                  }}
                  onSelectQuote={(quote) => setSelectedQuote(quote)}
                  onOpenCustomerPreview={(quote) => {
                    setSelectedQuote(quote);
                    setIsCustomerQuotePreviewOpen(true);
                  }}
                  onApproveQuoteClick={(quote) => handleApproveQuoteClick(quote)}
                  onDeclineQuoteClick={(quote) => handleDeclineQuoteClick(quote)}
                />
              )}

              {activeTab === 'jobs' && (
                <JobsDispatchView
                  jobs={jobs}
                  technicians={technicians}
                  onSelectJob={(job) => setSelectedJob(job)}
                  onStatusChange={handleJobStatusChange}
                  onOpenAssignTech={(job) => {
                    setSelectedJob(job);
                    setIsAssignTechModalOpen(true);
                  }}
                />
              )}

              {activeTab === 'technicians' && (
                <TechniciansView
                  technicians={technicians}
                  jobs={jobs}
                  onUpdateTechnicianStatus={handleUpdateTechStatus}
                  onSelectTechnician={(tech) => {
                    addToast(
                      `${tech.name} Profile`,
                      `Rating: ${tech.rating}★ | Completed: ${tech.jobsCompleted} work orders.`,
                      'info'
                    );
                  }}
                  onAssignTechToJob={(tech) => {
                    const unassignedJob = jobs.find((j) => !j.technicianName);
                    if (unassignedJob) {
                      handleAssignTechnician(unassignedJob.id, tech);
                    } else {
                      addToast(
                        'Dispatch Route Active',
                        `${tech.name} has been placed on high-priority standby dispatch.`,
                        'info'
                      );
                    }
                  }}
                />
              )}

              {activeTab === 'customers' && (
                <CustomersView
                  customers={customers}
                  onSelectCustomer={(cust) => setSelectedCustomer(cust)}
                  onCreateLeadForCustomer={(cust) => {
                    setIsNewLeadOpen(true);
                  }}
                />
              )}

              {activeTab === 'invoices' && (
                <InvoicesView
                  invoices={invoices}
                  onSelectInvoice={(inv) => setSelectedInvoice(inv)}
                  onRecordPaymentClick={(inv) => {
                    setSelectedInvoice(inv);
                    setIsRecordPaymentModalOpen(true);
                  }}
                  onSendReminderClick={handleSendReminder}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  onResetDemoData={handleResetDemoData}
                  onShowToast={addToast}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* GLOBAL MODALS & DRAWERS */}
      {/* ------------------------------------------------------------- */}

      {/* New Lead Modal */}
      <NewLeadModal
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
        onCreateLead={handleCreateLead}
      />

      {/* Lead Detail Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onStatusChange={handleLeadStatusChange}
        onContactCustomer={handleContactCustomer}
        onCreateQuoteFromLead={handleCreateQuoteFromLead}
      />

      {/* New Quote Modal */}
      <NewQuoteModal
        isOpen={isNewQuoteOpen}
        onClose={() => {
          setIsNewQuoteOpen(false);
          setQuoteCustomerPreset(null);
        }}
        onCreateQuote={handleCreateQuote}
        defaultCustomer={quoteCustomerPreset}
      />

      {/* Quote Detail Modal */}
      <QuoteDetailModal
        quote={selectedQuote}
        isOpen={!!selectedQuote && !isCustomerQuotePreviewOpen && !isQuoteDeclineModalOpen}
        onClose={() => setSelectedQuote(null)}
        onApproveClick={handleApproveQuoteClick}
        onDeclineClick={handleDeclineQuoteClick}
        onSendQuote={handleSendQuote}
        onOpenCustomerPreview={(quote) => {
          setSelectedQuote(quote);
          setIsCustomerQuotePreviewOpen(true);
        }}
        onPrintPdf={(quote) => {
          addToast('Printing Quote', `Generating PDF representation for ${quote.id}...`, 'info');
        }}
      />

      {/* Customer Portal Quote View (Prompt #12) */}
      <CustomerQuoteViewModal
        quote={selectedQuote}
        isOpen={isCustomerQuotePreviewOpen}
        onClose={() => setIsCustomerQuotePreviewOpen(false)}
        onApprove={handleApproveQuoteClick}
        onDecline={handleDeclineQuoteClick}
      />

      {/* Quote Decline Modal with Reason */}
      <QuoteDeclineModal
        quote={selectedQuote}
        isOpen={isQuoteDeclineModalOpen}
        onClose={() => setIsQuoteDeclineModalOpen(false)}
        onConfirmDecline={handleConfirmQuoteDecline}
      />

      {/* Job Detail Modal with Timeline & Evidence (Prompt #14) */}
      <JobDetailModal
        job={selectedJob}
        isOpen={!!selectedJob && !isAssignTechModalOpen}
        onClose={() => setSelectedJob(null)}
        technicians={technicians}
        onStatusChange={handleJobStatusChange}
        onMarkCompleteClick={handleMarkJobCompleteClick}
        onOpenAssignTech={(job) => {
          setSelectedJob(job);
          setIsAssignTechModalOpen(true);
        }}
        onUploadEvidenceMock={handleUploadEvidence}
        onGenerateInvoiceFromJob={handleGenerateInvoiceFromJob}
      />

      {/* Assign Technician Modal (Prompt #15) */}
      <AssignTechnicianModal
        job={selectedJob}
        technicians={technicians}
        isOpen={isAssignTechModalOpen}
        onClose={() => setIsAssignTechModalOpen(false)}
        onAssign={handleAssignTechnician}
      />

      {/* Customer Detail Drawer */}
      <CustomerDetailDrawer
        customer={selectedCustomer}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        jobs={jobs}
        quotes={quotes}
        onCreateLeadForCustomer={(cust) => {
          setSelectedCustomer(null);
          setIsNewLeadOpen(true);
        }}
        onGenerateQuoteForCustomer={(cust) => {
          setSelectedCustomer(null);
          setQuoteCustomerPreset({
            name: cust.name,
            email: cust.email,
            phone: cust.phone,
            service: 'General Service & Maintenance',
            location: cust.location
          });
          setIsNewQuoteOpen(true);
        }}
      />

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        isOpen={!!selectedInvoice && !isRecordPaymentModalOpen}
        onClose={() => setSelectedInvoice(null)}
        onRecordPaymentClick={(inv) => {
          setSelectedInvoice(inv);
          setIsRecordPaymentModalOpen(true);
        }}
        onSendReminderClick={handleSendReminder}
        onPrintInvoice={(inv) => {
          addToast('Printing Invoice', `Generating printable invoice statement for ${inv.id}...`, 'info');
        }}
      />

      {/* Record Payment Modal (Prompt #17) */}
      <RecordPaymentModal
        invoice={selectedInvoice}
        isOpen={isRecordPaymentModalOpen}
        onClose={() => setIsRecordPaymentModalOpen(false)}
        onConfirmPayment={handleConfirmPayment}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LeadToQuoteApp />
    </AuthProvider>
  );
}
