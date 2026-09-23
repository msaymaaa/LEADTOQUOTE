import { supabase } from './supabase';
import {
  Lead,
  Quote,
  Job,
  Technician,
  Customer,
  Invoice,
  LeadStatus,
  QuoteStatus,
  JobStatus,
  InvoiceStatus,
  UserRole
} from '../types';

export interface DatabaseHealth {
  isConnected: boolean;
  tablesExist: boolean;
  checkedTables: { name: string; exists: boolean; count?: number }[];
  errorMessage?: string | null;
}

// The exact 9 tables required for the LeadToQuote schema
export const REQUIRED_TABLES = [
  'profiles',
  'leads',
  'quotes',
  'quote_items',
  'technician_assignments',
  'work_records',
  'work_evidence',
  'invoices',
  'payments'
] as const;

// -----------------------------------------------------------------------------
// HEALTH CHECK & SCHEMA DETECTION
// -----------------------------------------------------------------------------
export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const checkedTables: { name: string; exists: boolean; count?: number }[] = [];
  let allExist = true;
  let firstError: string | null = null;

  for (const tableName of REQUIRED_TABLES) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        allExist = false;
        if (!firstError) firstError = error.message || `Table ${tableName} unavailable`;
        checkedTables.push({ name: tableName, exists: false });
      } else {
        checkedTables.push({ name: tableName, exists: true, count: count ?? 0 });
      }
    } catch (err: any) {
      allExist = false;
      if (!firstError) firstError = err?.message || 'Connection failed';
      checkedTables.push({ name: tableName, exists: false });
    }
  }

  return {
    isConnected: true,
    tablesExist: allExist,
    checkedTables,
    errorMessage: allExist ? null : firstError
  };
}

// -----------------------------------------------------------------------------
// ADAPTERS: DB Models <-> UI Models
// -----------------------------------------------------------------------------

function mapDbLeadToUi(dbLead: any): Lead {
  const statusMap: Record<string, LeadStatus> = {
    new: 'New',
    contacted: 'Contacted',
    qualified: 'Qualified',
    quoted: 'Quoted',
    converted: 'Converted',
    closed: 'Converted',
    cancelled: 'Lost'
  };

  const customerName = dbLead.customer?.full_name || dbLead.customer_name || 'Customer';
  const customerEmail = dbLead.customer?.email || dbLead.customer_email || dbLead.email || '';
  const customerPhone = dbLead.customer?.phone || dbLead.customer_phone || dbLead.phone || '';

  return {
    id: dbLead.id,
    customerName,
    email: customerEmail,
    phone: customerPhone,
    serviceType: dbLead.service_type || 'General Service',
    location: dbLead.customer_address || dbLead.customer_notes?.split(' | Location: ')?.[1] || 'Lahore, Pakistan',
    address: dbLead.customer_address || dbLead.customer_notes?.split(' | Address: ')?.[1] || 'Main Location',
    estimatedValue: Number(dbLead.estimated_value) || 0,
    status: statusMap[dbLead.status] || 'New',
    createdAt: dbLead.created_at ? new Date(dbLead.created_at).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
    preferredDate: 'Flexible',
    description: dbLead.description || dbLead.title || '',
    timeline: [
      {
        title: 'Lead Ingested',
        time: dbLead.created_at ? new Date(dbLead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
        note: `Status: ${dbLead.status} | Priority: ${dbLead.priority || 'normal'}`
      }
    ]
  };
}

function mapDbQuoteToUi(dbQuote: any): Quote {
  const statusMap: Record<string, QuoteStatus> = {
    draft: 'Draft',
    sent: 'Sent',
    awaiting_approval: 'Awaiting Approval',
    approved: 'Approved',
    accepted: 'Approved',
    declined: 'Declined',
    expired: 'Expired',
    cancelled: 'Declined'
  };

  const items = Array.isArray(dbQuote.items) && dbQuote.items.length > 0
    ? dbQuote.items.map((it: any) => ({
        id: it.id,
        description: it.description,
        category: 'Labor' as const,
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unit_price) || 0,
        total: Number(it.total) || 0
      }))
    : [
        {
          id: 'item-1',
          description: dbQuote.scope_notes || dbQuote.service_title || 'Service Scope & Materials',
          category: 'Labor' as const,
          quantity: 1,
          unitPrice: Number(dbQuote.subtotal) || Number(dbQuote.total) || 0,
          total: Number(dbQuote.subtotal) || Number(dbQuote.total) || 0
        }
      ];

  const lead = dbQuote.lead || {};
  const customer = lead.customer || dbQuote.customer || {};

  return {
    id: dbQuote.quote_number || dbQuote.id,
    leadId: dbQuote.lead_id,
    customerName: customer.full_name || dbQuote.customer_name || lead.customer_name || 'Client',
    customerEmail: customer.email || dbQuote.customer_email || lead.customer_email || '',
    customerPhone: customer.phone || dbQuote.customer_phone || lead.customer_phone || '',
    serviceTitle: dbQuote.service_title || lead.service_type || 'Service Proposal',
    serviceDescription: dbQuote.scope_notes || lead.description || 'Custom Scope of Work',
    location: lead.customer_address || 'Pakistan Service Area',
    createdAt: dbQuote.created_at ? new Date(dbQuote.created_at).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
    validUntil: dbQuote.valid_until || 'In 14 Days',
    lineItems: items,
    items,
    subtotal: Number(dbQuote.subtotal) || Number(dbQuote.total) || 0,
    tax: Number(dbQuote.tax) || 0,
    discount: Number(dbQuote.discount) || 0,
    total: Number(dbQuote.total) || 0,
    status: (dbQuote.customer_response === 'accepted' ? 'Approved' : dbQuote.customer_response === 'declined' ? 'Declined' : statusMap[dbQuote.status]) || 'Draft',
    declineReason: dbQuote.decline_reason || (dbQuote.customer_response === 'declined' ? 'Customer opted out' : undefined),
    notes: dbQuote.client_notes || dbQuote.scope_notes || undefined
  };
}

function mapDbAssignmentToUi(assignment: any): Job {
  const statusMap: Record<string, JobStatus> = {
    pending: 'Scheduled',
    assigned: 'Assigned',
    accepted: 'Assigned',
    in_progress: 'In Progress',
    completed: 'Completed',
    declined: 'Scheduled',
    cancelled: 'Completed'
  };

  const lead = assignment.lead || {};
  const quote = assignment.quote || {};
  const customer = lead.customer || quote.customer || {};
  const tech = assignment.technician || {};

  const workRecords = Array.isArray(assignment.work_records) ? assignment.work_records : [];
  const primaryRecord = workRecords[0];

  const timeline = workRecords.map((wr: any) => ({
    stage: wr.status === 'completed' ? 'Job Completed' : wr.status === 'started' ? 'Work Started' : 'Field Log Update',
    timestamp: wr.created_at ? new Date(wr.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Logged',
    completed: wr.status === 'completed',
    assignee: tech.full_name || 'Field Specialist'
  }));

  if (timeline.length === 0) {
    timeline.push({
      stage: 'Technician Assigned',
      timestamp: assignment.assigned_at ? new Date(assignment.assigned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Assigned',
      completed: true,
      assignee: tech.full_name || 'Dispatch Control'
    });
  }

  const evidenceList = (primaryRecord?.evidence || []).map((ev: any) => ({
    id: ev.id,
    title: ev.description || `${ev.stage || 'Work'} Evidence`,
    url: ev.file_url || '',
    timestamp: ev.created_at ? new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Uploaded',
    type: (ev.stage === 'before' ? 'Before' : ev.stage === 'during' ? 'During' : 'After') as any
  }));

  return {
    id: assignment.id,
    leadId: assignment.lead_id,
    quoteId: assignment.quote_id,
    title: quote.service_title || lead.title || lead.service_type || 'Field Service Assignment',
    customerName: customer.full_name || lead.customer_name || 'Client',
    customerEmail: customer.email || lead.customer_email || '',
    customerPhone: customer.phone || lead.customer_phone || '',
    location: lead.customer_address || 'On-site Service Location',
    status: statusMap[assignment.status] || 'Assigned',
    priority: (lead.priority === 'urgent' ? 'Urgent' : lead.priority === 'high' ? 'High' : 'Normal') as any,
    scheduledDate: assignment.scheduled_start ? new Date(assignment.scheduled_start).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Scheduled',
    scheduledTime: assignment.scheduled_start ? new Date(assignment.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:00 AM',
    estimatedDuration: '3 Hours',
    technicianId: assignment.technician_id,
    technicianName: tech.full_name || undefined,
    technicianPhone: tech.phone || undefined,
    description: assignment.notes || quote.scope_notes || lead.description || 'Assigned technician scope.',
    timeline,
    evidence: evidenceList
  };
}

function mapDbInvoiceToUi(dbInvoice: any): Invoice {
  const statusMap: Record<string, InvoiceStatus> = {
    draft: 'Draft',
    sent: 'Sent',
    pending: 'Pending',
    paid: 'Paid',
    partial: 'Pending',
    overdue: 'Overdue',
    cancelled: 'Paid'
  };

  const customer = dbInvoice.customer || {};
  const quote = dbInvoice.quote || {};

  return {
    id: dbInvoice.invoice_number || dbInvoice.id,
    quoteId: dbInvoice.quote_id,
    jobId: dbInvoice.quote_id || 'JOB-ACTIVE',
    customerName: customer.full_name || 'Valued Client',
    customerEmail: customer.email || undefined,
    customerAddress: customer.company || 'Service Site, Pakistan',
    amount: Number(dbInvoice.amount) || 0,
    status: statusMap[dbInvoice.status] || 'Pending',
    issueDate: dbInvoice.issued_at ? new Date(dbInvoice.issued_at).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
    issuedDate: dbInvoice.issued_at ? new Date(dbInvoice.issued_at).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
    dueDate: dbInvoice.due_date ? new Date(dbInvoice.due_date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Net 15 Days',
    paidDate: dbInvoice.paid_at ? new Date(dbInvoice.paid_at).toLocaleDateString('en-PK') : undefined,
    paymentMethod: 'Bank Wire Transfer / Online Transfer',
    subtotal: Number(dbInvoice.subtotal) || Number(dbInvoice.amount) || 0,
    tax: Number(dbInvoice.tax) || 0,
    total: Number(dbInvoice.amount) || 0,
    lineItems: [
      {
        description: quote.service_title || 'Settlement for Approved Quotation Services',
        quantity: 1,
        unitPrice: Number(dbInvoice.amount) || 0,
        total: Number(dbInvoice.amount) || 0
      }
    ]
  };
}

// -----------------------------------------------------------------------------
// LEADS CRUD
// -----------------------------------------------------------------------------

export async function getLeads(): Promise<Lead[]> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*, customer:profiles!customer_id(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase leads query notice:', error.message);
      return [];
    }

    if (data && data.length > 0) {
      return data.map(mapDbLeadToUi);
    }

    return [];
  } catch (err) {
    console.error('getLeads error:', err);
    return [];
  }
}

export async function createLead(leadData: Partial<Lead>, userId?: string): Promise<Lead> {
  const newId = `LD-${Math.floor(100 + Math.random() * 900)}`;
  const fullLead: Lead = {
    id: leadData.id || newId,
    customerName: leadData.customerName || 'New Client',
    email: leadData.email || '',
    phone: leadData.phone || '',
    serviceType: leadData.serviceType || 'Commercial Equipment Diagnostic',
    location: leadData.location || 'Lahore, Pakistan',
    address: leadData.address || 'Local site',
    estimatedValue: leadData.estimatedValue || 25000,
    status: leadData.status || 'New',
    createdAt: new Date().toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' }),
    preferredDate: leadData.preferredDate || 'Next available',
    description: leadData.description || '',
    timeline: [
      {
        title: 'Lead Intake',
        time: 'Just now',
        note: 'Customer inquiry recorded in LeadToQuote pipeline'
      }
    ]
  };

  try {
    const payload = {
      customer_id: userId || null,
      title: `${fullLead.serviceType} - ${fullLead.customerName}`,
      customer_name: fullLead.customerName,
      customer_email: fullLead.email,
      customer_phone: fullLead.phone,
      customer_address: fullLead.address,
      description: fullLead.description,
      service_type: fullLead.serviceType,
      status: 'new',
      priority: 'normal',
      estimated_value: fullLead.estimatedValue,
      customer_notes: `Customer: ${fullLead.customerName} | Phone: ${fullLead.phone} | Email: ${fullLead.email} | Address: ${fullLead.address}`,
      internal_notes: 'Created via Lead Intake Form'
    };

    const { data, error } = await supabase
      .from('leads')
      .insert([payload])
      .select('*, customer:profiles!customer_id(*)')
      .maybeSingle();

    if (!error && data) {
      return mapDbLeadToUi(data);
    } else if (error) {
      console.warn('Supabase lead insert notice:', error.message);
    }
  } catch (err) {
    console.warn('Supabase lead insert exception:', err);
  }

  return fullLead;
}

export async function updateLeadStatus(leadId: string, status: LeadStatus): Promise<void> {
  const dbStatusMap: Record<LeadStatus, string> = {
    New: 'new',
    Contacted: 'contacted',
    Qualified: 'qualified',
    Quoted: 'quoted',
    Converted: 'converted',
    Lost: 'cancelled'
  };

  try {
    const { error } = await supabase
      .from('leads')
      .update({ status: dbStatusMap[status] || 'new' })
      .eq('id', leadId);

    if (error) {
      console.warn('Supabase lead update warning:', error.message);
    }
  } catch (err) {
    console.warn('Supabase lead update error:', err);
  }
}

export async function deleteLead(leadId: string): Promise<void> {
  try {
    const { error } = await supabase.from('leads').delete().eq('id', leadId);
    if (error) console.warn('Supabase lead delete warning:', error.message);
  } catch (err) {
    console.warn('Supabase lead delete error:', err);
  }
}

// -----------------------------------------------------------------------------
// QUOTES CRUD
// -----------------------------------------------------------------------------

export async function getQuotes(): Promise<Quote[]> {
  try {
    const { data, error } = await supabase
      .from('quotes')
      .select('*, items:quote_items(*), lead:leads(*, customer:profiles!customer_id(*))')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase quotes query notice:', error.message);
      return [];
    }

    if (data && data.length > 0) {
      return data.map(mapDbQuoteToUi);
    }

    return [];
  } catch (err) {
    console.error('getQuotes error:', err);
    return [];
  }
}

export async function createQuote(quote: Quote, userId?: string): Promise<Quote> {
  try {
    let leadUuid: string | undefined = undefined;
    if (quote.leadId && quote.leadId.includes('-') && quote.leadId.length > 20) {
      leadUuid = quote.leadId;
    } else {
      // Find latest lead to associate or query
      const { data: latestLead } = await supabase
        .from('leads')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (latestLead?.id) {
        leadUuid = latestLead.id;
      }
    }

    const quotePayload: any = {
      lead_id: leadUuid || null,
      created_by: userId || null,
      quote_number: quote.id || `QT-${Math.floor(1000 + Math.random() * 9000)}`,
      service_title: quote.serviceTitle,
      subtotal: quote.subtotal,
      tax: quote.tax,
      discount: quote.discount || 0,
      total: quote.total,
      scope_notes: `${quote.serviceTitle}\n\n${quote.serviceDescription}`,
      status: quote.status === 'Sent' ? 'sent' : quote.status === 'Approved' ? 'accepted' : 'draft',
      valid_until: '2026-10-31'
    };

    const { data: newQuote, error } = await supabase
      .from('quotes')
      .insert([quotePayload])
      .select()
      .maybeSingle();

    if (error) {
      console.warn('Supabase quote creation error:', error.message);
    } else if (newQuote) {
      const itemsList = quote.lineItems || quote.items || [];
      if (itemsList.length > 0) {
        const itemsPayload = itemsList.map((it: any) => ({
          quote_id: newQuote.id,
          description: it.description,
          quantity: it.quantity,
          unit_price: it.unitPrice,
          total: it.total
        }));
        await supabase.from('quote_items').insert(itemsPayload);
      }
      return {
        ...quote,
        id: newQuote.quote_number || newQuote.id,
        leadId: newQuote.lead_id || quote.leadId
      };
    }
  } catch (err) {
    console.warn('Supabase quote creation error:', err);
  }

  return quote;
}

export async function updateQuoteStatus(
  quoteId: string,
  status: QuoteStatus,
  customerResponse?: 'accepted' | 'declined'
): Promise<void> {
  const dbStatus = status === 'Approved' ? 'accepted' : status === 'Declined' ? 'declined' : status.toLowerCase();

  try {
    const updatePayload: Record<string, any> = {
      status: dbStatus
    };
    if (customerResponse) {
      updatePayload.customer_response = customerResponse;
      updatePayload.customer_response_at = new Date().toISOString();
      if (customerResponse === 'accepted') {
        updatePayload.approved_at = new Date().toISOString();
      } else {
        updatePayload.declined_at = new Date().toISOString();
      }
    }

    await supabase.from('quotes').update(updatePayload).eq('id', quoteId);
  } catch (err) {
    console.warn('Supabase quote update error:', err);
  }
}

// -----------------------------------------------------------------------------
// TECHNICIAN ASSIGNMENTS & WORK RECORDS (JOBS)
// -----------------------------------------------------------------------------

export async function getJobs(): Promise<Job[]> {
  try {
    const { data, error } = await supabase
      .from('technician_assignments')
      .select('*, lead:leads(*, customer:profiles!customer_id(*)), quote:quotes(*), technician:profiles!technician_id(*), work_records(*, evidence:work_evidence(*))')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map(mapDbAssignmentToUi);
    }
  } catch (err) {
    console.warn('Supabase jobs/assignments query notice:', err);
  }

  return [];
}

export async function updateJobStatus(
  jobId: string,
  status: JobStatus,
  completionNotes?: string
): Promise<void> {
  const dbStatusMap: Record<JobStatus, string> = {
    Scheduled: 'pending',
    Assigned: 'assigned',
    'In Progress': 'in_progress',
    'Awaiting Completion': 'in_progress',
    Completed: 'completed'
  };

  try {
    await supabase
      .from('technician_assignments')
      .update({ status: dbStatusMap[status] || 'in_progress' })
      .eq('id', jobId);

    // If completed or updating record, also update or create work_record
    if (status === 'Completed') {
      await supabase
        .from('work_records')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          notes: completionNotes || 'Work successfully completed on site'
        })
        .eq('assignment_id', jobId);
    }
  } catch (err) {
    console.warn('Supabase job update notice:', err);
  }
}

export async function addWorkEvidence(
  jobId: string,
  title: string,
  fileUrl: string,
  uploadedBy?: string,
  stage: 'before' | 'during' | 'after' = 'after'
): Promise<void> {
  try {
    // Find or create work_record for this assignment
    let workRecordId: string | undefined = undefined;
    const { data: existingRecord } = await supabase
      .from('work_records')
      .select('id')
      .eq('assignment_id', jobId)
      .limit(1)
      .maybeSingle();

    if (existingRecord?.id) {
      workRecordId = existingRecord.id;
    } else {
      const { data: newRecord } = await supabase
        .from('work_records')
        .insert([
          {
            assignment_id: jobId,
            status: 'started',
            notes: 'Field evidence intake'
          }
        ])
        .select()
        .maybeSingle();
      if (newRecord?.id) {
        workRecordId = newRecord.id;
      }
    }

    if (workRecordId) {
      await supabase.from('work_evidence').insert([
        {
          work_record_id: workRecordId,
          stage,
          file_url: fileUrl,
          description: title,
          uploaded_by: uploadedBy || null
        }
      ]);
    }
  } catch (err) {
    console.warn('Supabase addWorkEvidence notice:', err);
  }
}

export async function assignJobTechnician(
  jobId: string,
  technicianId: string,
  _technicianName?: string,
  _technicianPhone?: string
): Promise<void> {
  try {
    if (technicianId && technicianId.length > 20) {
      await supabase
        .from('technician_assignments')
        .update({
          technician_id: technicianId,
          status: 'assigned',
          assigned_at: new Date().toISOString()
        })
        .eq('id', jobId);
    }
  } catch (err) {
    console.warn('Supabase tech assignment error:', err);
  }
}

export async function getTechnicians(): Promise<Technician[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'technician')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data.map((p) => {
        const isApproved = p.technician_status === 'approved';
        return {
          id: p.id,
          name: p.full_name || 'Field Specialist',
          specialization: p.company || 'Technical Operations Specialist',
          rating: 4.9,
          jobsCompleted: 0,
          activeJobsCount: 0,
          availability: isApproved ? 'Available' : 'Off Duty',
          phone: p.phone || '+92 300 0000000',
          email: p.email || '',
          avatar: p.avatar_url || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80`,
          certification: 'Certified Field Specialist (Level 2)',
          skills: ['Diagnostics', 'Preventive Maintenance', 'Field Installation'],
          approvalStatus: p.technician_status || 'pending',
          technician_status: p.technician_status || 'pending',
          accountStatus: p.account_status || 'active',
          account_status: p.account_status || 'active'
        };
      });
    }
  } catch (err) {
    console.warn('getTechnicians Supabase error:', err);
  }
  return [];
}

export async function getCustomers(): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'customer')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data.map((p) => ({
        id: p.id,
        name: p.full_name || 'Client Account',
        company: p.company || undefined,
        email: p.email || '',
        phone: p.phone || '',
        address: 'Pakistan Service Area',
        location: 'Pakistan',
        activeJobsCount: 0,
        totalSpent: 0,
        totalSpend: 0,
        totalJobs: 0,
        lastServiceDate: p.created_at ? new Date(p.created_at).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
        status: p.account_status === 'suspended' ? 'Inactive' : 'Active',
        notes: `Registered client profile`
      }));
    }
  } catch (err) {
    console.warn('getCustomers Supabase error:', err);
  }
  return [];
}

export async function updateTechnicianApprovalStatus(
  technicianId: string,
  status: 'pending' | 'approved' | 'rejected'
): Promise<{ error?: any }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        technician_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', technicianId);

    return { error };
  } catch (err) {
    return { error: err };
  }
}

// -----------------------------------------------------------------------------
// INVOICES & PAYMENTS
// -----------------------------------------------------------------------------

export async function createInvoice(invoice: Invoice, userId?: string): Promise<Invoice> {
  try {
    let quoteUuid: string | undefined = undefined;
    if (invoice.quoteId && invoice.quoteId.includes('-') && invoice.quoteId.length > 20) {
      quoteUuid = invoice.quoteId;
    } else {
      const { data: latestQuote } = await supabase
        .from('quotes')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (latestQuote?.id) {
        quoteUuid = latestQuote.id;
      }
    }

    const invoicePayload: any = {
      quote_id: quoteUuid || null,
      customer_id: userId || null,
      invoice_number: invoice.id || `INV-${Math.floor(4000 + Math.random() * 9000)}`,
      amount: invoice.amount || 0,
      subtotal: invoice.subtotal || invoice.amount || 0,
      tax: invoice.tax || 0,
      status: invoice.status === 'Paid' ? 'paid' : 'sent',
      issued_at: new Date().toISOString(),
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    };

    const { data: newInv, error } = await supabase
      .from('invoices')
      .insert([invoicePayload])
      .select()
      .maybeSingle();

    if (error) {
      console.warn('Supabase invoice creation warning:', error.message);
    } else if (newInv) {
      return {
        ...invoice,
        id: newInv.invoice_number || newInv.id
      };
    }
  } catch (err) {
    console.warn('createInvoice Supabase error:', err);
  }
  return invoice;
}

export async function getInvoices(_jobsList: Job[] = []): Promise<Invoice[]> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, customer:profiles!customer_id(*), quote:quotes(*), payments(*)')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map(mapDbInvoiceToUi);
    }
  } catch (err) {
    console.warn('getInvoices Supabase error:', err);
  }

  return [];
}

export async function recordPayment(
  invoiceId: string,
  amount: number,
  method: string,
  customerId?: string
): Promise<void> {
  try {
    // 1. Insert into payments table
    await supabase.from('payments').insert([
      {
        invoice_id: invoiceId,
        customer_id: customerId || null,
        amount,
        payment_method: method,
        status: 'paid',
        paid_at: new Date().toISOString(),
        notes: `Settled via ${method}`
      }
    ]);

    // 2. Mark invoice as paid
    await supabase.from('invoices').update({
      status: 'paid',
      paid_at: new Date().toISOString()
    }).eq('id', invoiceId);
  } catch (err) {
    console.warn('recordPayment Supabase notice:', err);
  }
}

// -----------------------------------------------------------------------------
// REALTIME SUBSCRIPTION
// -----------------------------------------------------------------------------

export function subscribeToDatabaseChanges(callback: () => void): () => void {
  try {
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => callback())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, () => callback())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'technician_assignments' }, () => callback())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'work_records' }, () => callback())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => callback())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => callback())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Realtime subscription error:', err);
    return () => {};
  }
}

// -----------------------------------------------------------------------------
// AUDIT & ACTIVITY LOGGING
// -----------------------------------------------------------------------------
export async function logActivity(
  action: string,
  details: string,
  entityId?: string,
  userId?: string
): Promise<void> {
  try {
    console.info(`[Audit Log] ${action}: ${details}`, {
      entityId,
      userId,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Failed to log activity:', err);
  }
}
