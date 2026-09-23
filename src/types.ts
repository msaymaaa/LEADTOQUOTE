export type NavigationTab = 
  | 'landing'
  | 'signin'
  | 'signup'
  | 'dashboard' 
  | 'leads' 
  | 'quotes' 
  | 'jobs' 
  | 'technicians' 
  | 'customers' 
  | 'invoices' 
  | 'settings';

export type UserRole = 'owner' | 'staff' | 'technician' | 'customer';

export type AccountStatus = 'active' | 'suspended' | 'pending';
export type TechnicianStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  account_status?: AccountStatus;
  technician_status?: TechnicianStatus | null;
  company?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

// -------------------------------------------------------------
// SUPABASE DATABASE MODELS (Assignment 3 Relational Schema)
// -------------------------------------------------------------

export interface DbLead {
  id: string;
  customer_id?: string | null;
  title: string;
  description?: string | null;
  service_type?: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'quoted' | 'converted' | 'closed' | 'cancelled';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  estimated_value?: number;
  customer_notes?: string | null;
  internal_notes?: string | null;
  created_at?: string;
  updated_at?: string;
  customer?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
}

export interface DbQuoteItem {
  id: string;
  quote_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at?: string;
  updated_at?: string;
}

export interface DbQuote {
  id: string;
  lead_id: string;
  created_by?: string | null;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  scope_notes?: string | null;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired' | 'cancelled';
  customer_response?: 'accepted' | 'declined' | null;
  customer_response_at?: string | null;
  valid_until?: string | null;
  created_at?: string;
  updated_at?: string;
  items?: DbQuoteItem[];
  lead?: DbLead;
}

export interface DbJob {
  id: string;
  lead_id: string;
  quote_id?: string | null;
  customer_id: string;
  assigned_technician_id?: string | null;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date?: string | null;
  completion_notes?: string | null;
  final_amount?: number | null;
  created_at?: string;
  updated_at?: string;
  technician?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
  customer?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
  lead?: DbLead;
  updates?: DbJobUpdate[];
}

export interface DbJobUpdate {
  id: string;
  job_id: string;
  technician_id?: string | null;
  update_type: 'progress' | 'completion' | 'note';
  description?: string | null;
  image_url?: string | null;
  created_at?: string;
  technician?: {
    id: string;
    full_name: string;
  };
}

export interface DbPayment {
  id: string;
  job_id: string;
  customer_id?: string | null;
  amount: number;
  status: 'pending' | 'paid' | 'partial' | 'cancelled';
  payment_method?: string | null;
  paid_at?: string | null;
  created_at?: string;
  updated_at?: string;
  job?: {
    id: string;
    lead_id: string;
  };
}

export interface DbActivityLog {
  id: string;
  user_id?: string | null;
  lead_id?: string | null;
  action: string;
  description?: string | null;
  created_at?: string;
  user?: {
    id: string;
    full_name: string;
    role?: string;
  };
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Quoted' | 'Converted' | 'Lost';

export interface Lead {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  serviceType: string;
  location: string;
  address: string;
  estimatedValue: number;
  status: LeadStatus;
  createdAt: string;
  preferredDate: string;
  description: string;
  timeline: { title: string; time: string; note: string }[];
}

export type QuoteStatus = 'Draft' | 'Sent' | 'Awaiting Approval' | 'Approved' | 'Declined' | 'Expired';

export interface QuoteLineItem {
  id: string;
  description: string;
  category: 'Labor' | 'Parts' | 'Travel' | 'Additional Services';
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string; // e.g. QT-1042
  leadId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceTitle: string;
  serviceDescription: string;
  location: string;
  createdAt: string;
  validUntil: string;
  status: QuoteStatus;
  lineItems: QuoteLineItem[];
  items?: QuoteLineItem[];
  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
  declineReason?: string;
  notes?: string;
}

export type JobStatus = 'Scheduled' | 'Assigned' | 'In Progress' | 'Awaiting Completion' | 'Completed';

export interface JobEvidence {
  id: string;
  title: string;
  url: string;
  timestamp: string;
  type: 'Before' | 'During' | 'After' | 'Sign-off';
}

export interface JobTimelineStep {
  stage: string;
  timestamp: string;
  completed: boolean;
  active?: boolean;
  assignee?: string;
}

export interface Job {
  id: string; // e.g. JOB-2048
  quoteId?: string;
  leadId?: string;
  customerId?: string;
  title: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  location: string;
  technicianId?: string;
  technicianName?: string;
  technicianPhone?: string;
  status: JobStatus;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: string;
  description: string;
  timeline: JobTimelineStep[];
  evidence: JobEvidence[];
  priority: 'Normal' | 'High' | 'Urgent';
}

export type TechAvailability = 'Available' | 'On Job' | 'Offline' | 'Off Duty';

export interface Technician {
  id: string;
  name: string;
  avatar: string;
  specialization: string;
  phone: string;
  email: string;
  availability: TechAvailability;
  currentJobId?: string;
  currentJobTitle?: string;
  currentJob?: string;
  jobsCompleted: number;
  rating: number;
  activeJobsCount: number;
  certification: string;
  skills?: string[];
  approvalStatus?: TechnicianStatus;
  accountStatus?: AccountStatus;
  technician_status?: TechnicianStatus;
  account_status?: AccountStatus;
}

export interface Customer {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  address: string;
  location: string;
  activeJobsCount: number;
  totalSpent: number;
  totalSpend?: number;
  totalJobs?: number;
  lastServiceDate: string;
  status: 'Active' | 'Vip' | 'Inactive';
  notes: string;
}

export type InvoiceStatus = 'Draft' | 'Sent' | 'Pending' | 'Paid' | 'Overdue';

export interface Invoice {
  id: string; // e.g. INV-3042
  quoteId?: string;
  jobId: string;
  customerName: string;
  customerEmail?: string;
  customerAddress?: string;
  issueDate?: string;
  issuedDate?: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  serviceDescription?: string;
  amount: number;
  status: InvoiceStatus;
  lineItems?: { description: string; quantity: number; unitPrice: number; total: number }[];
  items?: { description: string; quantity: number; unitPrice: number; total: number }[];
  subtotal?: number;
  tax?: number;
  total?: number;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp?: string;
}

export type ToastNotification = ToastMessage;

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'lead' | 'quote' | 'job' | 'invoice';
}
