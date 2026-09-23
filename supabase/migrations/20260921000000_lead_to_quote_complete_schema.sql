-- ==============================================================================
-- LEADTOQUOTE: Complete Production-Ready Supabase PostgreSQL Database Schema & RLS
--
-- Workflow:
--   Lead -> Quote -> Client Approval/Decline -> Technician Assignment ->
--   Work -> Completion -> Invoice -> Payment/Settlement
--
-- Tables:
--   1. profiles
--   2. leads
--   3. quotes
--   4. quote_items
--   5. technician_assignments
--   6. work_records
--   7. work_evidence
--   8. invoices
--   9. payments
--
-- Currency: Pakistani Rupee (PKR) stored as numeric/decimal values.
-- ==============================================================================

-- 0. Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 1. Helper Functions & Triggers
-- ==============================================================================

-- Trigger function to automatically maintain updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Secure helper function to fetch a user's role without triggering recursive RLS
create or replace function public.get_user_role(p_user_id uuid)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(role, 'customer') from public.profiles where id = p_user_id;
$$;

-- Helper to verify if the user has staff or owner administration privileges
create or replace function public.is_staff(p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = p_user_id and role in ('owner', 'staff')
  );
$$;

-- Helper to verify if the user has owner privileges
create or replace function public.is_owner(p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = p_user_id and role = 'owner'
  );
$$;

-- ==============================================================================
-- 2. Entity: PROFILES (Extends Supabase auth.users)
-- ==============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  phone text,
  role text not null default 'customer' check (role in ('owner', 'staff', 'technician', 'customer')),
  account_status text not null default 'active' check (account_status in ('active', 'suspended', 'pending')),
  technician_status text check (technician_status in ('pending', 'approved', 'rejected')),
  company text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_account_status on public.profiles(account_status);
create index if not exists idx_profiles_technician_status on public.profiles(technician_status);

-- Automatic user signup provisioning trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_tech_status text;
begin
  -- Enforce strict public registration roles: ONLY 'customer' or 'technician' allowed
  v_role := coalesce(new.raw_user_meta_data->>'role', 'customer');
  if v_role not in ('customer', 'technician') then
    v_role := 'customer';
  end if;

  if v_role = 'technician' then
    v_tech_status := 'pending';
  else
    v_tech_status := null;
  end if;

  insert into public.profiles (
    id,
    full_name,
    email,
    phone,
    role,
    account_status,
    technician_status
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    v_role,
    'active',
    v_tech_status
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = case when public.profiles.full_name = '' then excluded.full_name else public.profiles.full_name end,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- 3. Entity: LEADS (Inquiries & Opportunity Intake)
-- ==============================================================================
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  title text not null,
  customer_name text,
  customer_email text,
  customer_phone text,
  customer_address text,
  service_type text,
  description text,
  estimated_value numeric(12,2) not null default 0 check (estimated_value >= 0),
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'quoted', 'converted', 'closed', 'cancelled')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  customer_notes text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_leads_updated_at on public.leads;
create trigger set_leads_updated_at
  before update on public.leads
  for each row execute function public.handle_updated_at();

create index if not exists idx_leads_customer on public.leads(customer_id);
create index if not exists idx_leads_assigned on public.leads(assigned_to);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_created_at on public.leads(created_at desc);

-- ==============================================================================
-- 4. Entity: QUOTES (Cost Estimates & Client Approval Flow)
-- ==============================================================================
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  customer_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  quote_number text not null unique,
  service_title text,
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  tax numeric(12,2) not null default 0 check (tax >= 0),
  discount numeric(12,2) not null default 0 check (discount >= 0),
  total numeric(12,2) not null default 0 check (total >= 0),
  scope_notes text,
  status text not null default 'draft' check (status in ('draft', 'sent', 'awaiting_approval', 'approved', 'accepted', 'declined', 'expired', 'cancelled')),
  customer_response text check (customer_response is null or customer_response in ('accepted', 'declined')),
  customer_response_at timestamptz,
  client_notes text,
  client_signature text,
  approved_at timestamptz,
  declined_at timestamptz,
  decline_reason text,
  valid_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_quotes_updated_at on public.quotes;
create trigger set_quotes_updated_at
  before update on public.quotes
  for each row execute function public.handle_updated_at();

create index if not exists idx_quotes_lead on public.quotes(lead_id);
create index if not exists idx_quotes_customer on public.quotes(customer_id);
create index if not exists idx_quotes_number on public.quotes(quote_number);
create index if not exists idx_quotes_status on public.quotes(status);

-- ==============================================================================
-- 5. Entity: QUOTE_ITEMS (Itemized Scope, Quantities, & Rates)
-- ==============================================================================
create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  item_type text default 'Labor' check (item_type in ('Labor', 'Material', 'Equipment', 'Service', 'Other')),
  description text not null,
  quantity numeric(10,2) not null default 1 check (quantity > 0),
  unit_price numeric(12,2) not null default 0 check (unit_price >= 0),
  total numeric(12,2) not null default 0 check (total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_quote_items_updated_at on public.quote_items;
create trigger set_quote_items_updated_at
  before update on public.quote_items
  for each row execute function public.handle_updated_at();

create index if not exists idx_quote_items_quote on public.quote_items(quote_id);

-- ==============================================================================
-- 6. Entity: TECHNICIAN_ASSIGNMENTS (Allocation of Field Specialists)
-- ==============================================================================
create table if not exists public.technician_assignments (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  technician_id uuid not null references public.profiles(id) on delete cascade,
  assigned_by uuid references public.profiles(id) on delete set null,
  status text not null default 'assigned' check (status in ('pending', 'assigned', 'accepted', 'in_progress', 'completed', 'declined', 'cancelled')),
  assigned_at timestamptz not null default now(),
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_tech_assignments_updated_at on public.technician_assignments;
create trigger set_tech_assignments_updated_at
  before update on public.technician_assignments
  for each row execute function public.handle_updated_at();

create index if not exists idx_assignments_technician on public.technician_assignments(technician_id);
create index if not exists idx_assignments_quote on public.technician_assignments(quote_id);
create index if not exists idx_assignments_lead on public.technician_assignments(lead_id);
create index if not exists idx_assignments_status on public.technician_assignments(status);

-- ==============================================================================
-- 7. Entity: WORK_RECORDS (Execution Tracking, Field Logs, & Signoffs)
-- ==============================================================================
create table if not exists public.work_records (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.technician_assignments(id) on delete cascade,
  technician_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'in_progress' check (status in ('scheduled', 'started', 'in_progress', 'paused', 'completed', 'inspected')),
  notes text,
  checklist_completed jsonb not null default '[]'::jsonb,
  customer_signoff boolean not null default false,
  client_signature text,
  started_at timestamptz default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_work_records_updated_at on public.work_records;
create trigger set_work_records_updated_at
  before update on public.work_records
  for each row execute function public.handle_updated_at();

create index if not exists idx_work_records_assignment on public.work_records(assignment_id);
create index if not exists idx_work_records_tech on public.work_records(technician_id);
create index if not exists idx_work_records_status on public.work_records(status);

-- ==============================================================================
-- 8. Entity: WORK_EVIDENCE (Field Photos, Diagnostic Logs, & Documents)
-- ==============================================================================
create table if not exists public.work_evidence (
  id uuid primary key default gen_random_uuid(),
  work_record_id uuid not null references public.work_records(id) on delete cascade,
  file_url text not null,
  file_type text not null default 'image',
  stage text not null default 'after' check (stage in ('before', 'during', 'after', 'completion')),
  description text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_work_evidence_updated_at on public.work_evidence;
create trigger set_work_evidence_updated_at
  before update on public.work_evidence
  for each row execute function public.handle_updated_at();

create index if not exists idx_work_evidence_record on public.work_evidence(work_record_id);
create index if not exists idx_work_evidence_stage on public.work_evidence(stage);

-- ==============================================================================
-- 9. Entity: INVOICES (Billing, Payment Schedules, & Receivables)
-- ==============================================================================
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid references public.quotes(id) on delete set null,
  customer_id uuid references public.profiles(id) on delete set null,
  invoice_number text not null unique,
  amount numeric(12,2) not null default 0 check (amount >= 0),
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  tax numeric(12,2) not null default 0 check (tax >= 0),
  discount numeric(12,2) not null default 0 check (discount >= 0),
  status text not null default 'pending' check (status in ('draft', 'sent', 'pending', 'paid', 'partial', 'overdue', 'cancelled')),
  issued_at timestamptz not null default now(),
  due_date date,
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_invoices_updated_at on public.invoices;
create trigger set_invoices_updated_at
  before update on public.invoices
  for each row execute function public.handle_updated_at();

create index if not exists idx_invoices_customer on public.invoices(customer_id);
create index if not exists idx_invoices_quote on public.invoices(quote_id);
create index if not exists idx_invoices_number on public.invoices(invoice_number);
create index if not exists idx_invoices_status on public.invoices(status);

-- ==============================================================================
-- 10. Entity: PAYMENTS (Settlement Records & Transaction Ledgers)
-- ==============================================================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  customer_id uuid references public.profiles(id) on delete set null,
  amount numeric(12,2) not null check (amount > 0),
  payment_method text not null default 'card',
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'paid', 'failed', 'refunded', 'cancelled')),
  transaction_reference text,
  notes text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at
  before update on public.payments
  for each row execute function public.handle_updated_at();

create index if not exists idx_payments_invoice on public.payments(invoice_id);
create index if not exists idx_payments_customer on public.payments(customer_id);
create index if not exists idx_payments_status on public.payments(status);

-- ==============================================================================
-- 11. Auth Trigger: Safe Profile Generation on User Signup
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  insert into public.profiles (id, full_name, email, role, created_at, updated_at)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1), 'User'),
    coalesce(new.email, ''),
    'customer', -- Default role is strictly 'customer'; privileged roles require explicit elevation
    now(),
    now()
  )
  on conflict (id) do update
  set
    full_name = coalesce(nullif(excluded.full_name, ''), profiles.full_name),
    email = coalesce(nullif(excluded.email, ''), profiles.email),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all 9 tables
alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.technician_assignments enable row level security;
alter table public.work_records enable row level security;
alter table public.work_evidence enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;

-- ------------------------------------------------------------------------------
-- A. PROFILES POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Users view own profile or staff" on public.profiles;
create policy "Users view own profile or staff"
  on public.profiles for select
  using (
    auth.uid() = id
    or public.is_staff(auth.uid())
    or role in ('technician', 'staff', 'owner')
  );

drop policy if exists "Users update own profile or owner" on public.profiles;
create policy "Users update own profile or owner"
  on public.profiles for update
  using (
    auth.uid() = id
    or public.is_owner(auth.uid())
  )
  with check (
    public.is_owner(auth.uid())
    or (
      auth.uid() = id
      and role = public.get_user_role(auth.uid())
      and account_status = (select p.account_status from public.profiles p where p.id = auth.uid())
      and technician_status is not distinct from (select p.technician_status from public.profiles p where p.id = auth.uid())
    )
  );

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
  on public.profiles for insert
  with check (
    (auth.uid() = id and role in ('customer', 'technician') and (role != 'technician' or technician_status = 'pending'))
    or public.is_owner(auth.uid())
  );

-- ------------------------------------------------------------------------------
-- B. LEADS POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Select leads based on role" on public.leads;
create policy "Select leads based on role"
  on public.leads for select
  using (
    public.is_staff(auth.uid())
    or customer_id = auth.uid()
    or exists (
      select 1 from public.technician_assignments ta
      where ta.lead_id = leads.id and ta.technician_id = auth.uid()
    )
  );

drop policy if exists "Insert leads" on public.leads;
create policy "Insert leads"
  on public.leads for insert
  with check (
    public.is_staff(auth.uid())
    or customer_id = auth.uid()
    or auth.uid() is not null
  );

drop policy if exists "Update leads based on role" on public.leads;
create policy "Update leads based on role"
  on public.leads for update
  using (
    public.is_staff(auth.uid())
    or (customer_id = auth.uid() and status = 'new')
  );

drop policy if exists "Delete leads for staff" on public.leads;
create policy "Delete leads for staff"
  on public.leads for delete
  using (public.is_staff(auth.uid()));

-- ------------------------------------------------------------------------------
-- C. QUOTES POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Select quotes based on role" on public.quotes;
create policy "Select quotes based on role"
  on public.quotes for select
  using (
    public.is_staff(auth.uid())
    or customer_id = auth.uid()
    or exists (
      select 1 from public.leads l
      where l.id = quotes.lead_id and l.customer_id = auth.uid()
    )
    or exists (
      select 1 from public.technician_assignments ta
      where ta.quote_id = quotes.id and ta.technician_id = auth.uid()
    )
  );

drop policy if exists "Manage quotes for staff" on public.quotes;
create policy "Manage quotes for staff"
  on public.quotes for all
  using (public.is_staff(auth.uid()));

drop policy if exists "Customer approve or decline quotes" on public.quotes;
create policy "Customer approve or decline quotes"
  on public.quotes for update
  using (
    customer_id = auth.uid()
    or exists (
      select 1 from public.leads l
      where l.id = quotes.lead_id and l.customer_id = auth.uid()
    )
  )
  with check (
    status in ('accepted', 'approved', 'declined')
    or customer_response in ('accepted', 'declined')
  );

-- ------------------------------------------------------------------------------
-- D. QUOTE ITEMS POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Select quote items" on public.quote_items;
create policy "Select quote items"
  on public.quote_items for select
  using (
    public.is_staff(auth.uid())
    or exists (
      select 1 from public.quotes q
      left join public.leads l on l.id = q.lead_id
      where q.id = quote_items.quote_id
      and (q.customer_id = auth.uid() or l.customer_id = auth.uid())
    )
    or exists (
      select 1 from public.technician_assignments ta
      where ta.quote_id = quote_items.quote_id and ta.technician_id = auth.uid()
    )
  );

drop policy if exists "Manage quote items for staff" on public.quote_items;
create policy "Manage quote items for staff"
  on public.quote_items for all
  using (public.is_staff(auth.uid()));

-- ------------------------------------------------------------------------------
-- E. TECHNICIAN ASSIGNMENTS POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Select technician assignments" on public.technician_assignments;
create policy "Select technician assignments"
  on public.technician_assignments for select
  using (
    public.is_staff(auth.uid())
    or technician_id = auth.uid()
    or exists (
      select 1 from public.quotes q
      where q.id = technician_assignments.quote_id and q.customer_id = auth.uid()
    )
  );

drop policy if exists "Manage technician assignments for staff" on public.technician_assignments;
create policy "Manage technician assignments for staff"
  on public.technician_assignments for all
  using (public.is_staff(auth.uid()));

drop policy if exists "Technicians update assignment status" on public.technician_assignments;
create policy "Technicians update assignment status"
  on public.technician_assignments for update
  using (technician_id = auth.uid())
  with check (technician_id = auth.uid());

-- ------------------------------------------------------------------------------
-- F. WORK RECORDS POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Select work records" on public.work_records;
create policy "Select work records"
  on public.work_records for select
  using (
    public.is_staff(auth.uid())
    or technician_id = auth.uid()
    or exists (
      select 1 from public.technician_assignments ta
      where ta.id = work_records.assignment_id and ta.technician_id = auth.uid()
    )
    or exists (
      select 1 from public.technician_assignments ta
      join public.quotes q on q.id = ta.quote_id
      where ta.id = work_records.assignment_id and q.customer_id = auth.uid()
    )
  );

drop policy if exists "Insert work records" on public.work_records;
create policy "Insert work records"
  on public.work_records for insert
  with check (
    public.is_staff(auth.uid())
    or (
      technician_id = auth.uid()
      and exists (
        select 1 from public.technician_assignments ta
        where ta.id = work_records.assignment_id and ta.technician_id = auth.uid()
      )
    )
  );

drop policy if exists "Update work records" on public.work_records;
create policy "Update work records"
  on public.work_records for update
  using (
    public.is_staff(auth.uid())
    or (
      technician_id = auth.uid()
      and exists (
        select 1 from public.technician_assignments ta
        where ta.id = work_records.assignment_id and ta.technician_id = auth.uid()
      )
    )
    or exists (
      select 1 from public.technician_assignments ta
      join public.quotes q on q.id = ta.quote_id
      where ta.id = work_records.assignment_id and q.customer_id = auth.uid()
    )
  );

drop policy if exists "Delete work records for staff" on public.work_records;
create policy "Delete work records for staff"
  on public.work_records for delete
  using (public.is_staff(auth.uid()));

-- ------------------------------------------------------------------------------
-- G. WORK EVIDENCE POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Select work evidence" on public.work_evidence;
create policy "Select work evidence"
  on public.work_evidence for select
  using (
    public.is_staff(auth.uid())
    or uploaded_by = auth.uid()
    or exists (
      select 1 from public.work_records wr
      join public.technician_assignments ta on ta.id = wr.assignment_id
      where wr.id = work_evidence.work_record_id and ta.technician_id = auth.uid()
    )
    or exists (
      select 1 from public.work_records wr
      join public.technician_assignments ta on ta.id = wr.assignment_id
      join public.quotes q on q.id = ta.quote_id
      where wr.id = work_evidence.work_record_id and q.customer_id = auth.uid()
    )
  );

drop policy if exists "Insert work evidence" on public.work_evidence;
create policy "Insert work evidence"
  on public.work_evidence for insert
  with check (
    public.is_staff(auth.uid())
    or (
      uploaded_by = auth.uid()
      and exists (
        select 1 from public.work_records wr
        join public.technician_assignments ta on ta.id = wr.assignment_id
        where wr.id = work_evidence.work_record_id
        and (wr.technician_id = auth.uid() or ta.technician_id = auth.uid())
      )
    )
  );

drop policy if exists "Delete work evidence" on public.work_evidence;
create policy "Delete work evidence"
  on public.work_evidence for delete
  using (public.is_staff(auth.uid()) or uploaded_by = auth.uid());

-- ------------------------------------------------------------------------------
-- H. INVOICES POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Select invoices based on role" on public.invoices;
create policy "Select invoices based on role"
  on public.invoices for select
  using (
    public.is_staff(auth.uid())
    or customer_id = auth.uid()
    or exists (
      select 1 from public.quotes q
      where q.id = invoices.quote_id and q.customer_id = auth.uid()
    )
  );

drop policy if exists "Manage invoices for staff" on public.invoices;
create policy "Manage invoices for staff"
  on public.invoices for all
  using (public.is_staff(auth.uid()));

-- ------------------------------------------------------------------------------
-- I. PAYMENTS POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Select payments based on role" on public.payments;
create policy "Select payments based on role"
  on public.payments for select
  using (
    public.is_staff(auth.uid())
    or customer_id = auth.uid()
    or exists (
      select 1 from public.invoices inv
      where inv.id = payments.invoice_id and inv.customer_id = auth.uid()
    )
  );

drop policy if exists "Insert payments" on public.payments;
create policy "Insert payments"
  on public.payments for insert
  with check (
    public.is_staff(auth.uid())
    or customer_id = auth.uid()
    or exists (
      select 1 from public.invoices inv
      where inv.id = payments.invoice_id and inv.customer_id = auth.uid()
    )
  );

drop policy if exists "Manage payments for staff" on public.payments;
create policy "Manage payments for staff"
  on public.payments for update
  using (public.is_staff(auth.uid()));

drop policy if exists "Delete payments for staff" on public.payments;
create policy "Delete payments for staff"
  on public.payments for delete
  using (public.is_staff(auth.uid()));

-- ==============================================================================
-- 13. STORAGE BUCKET: WORK-EVIDENCE (Private Bucket & Access Policies)
-- ==============================================================================
do $$
begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public)
    values ('work-evidence', 'work-evidence', false)
    on conflict (id) do update set public = false;
  end if;
end $$;

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'storage' and table_name = 'objects') then
    drop policy if exists "Authenticated users upload work evidence" on storage.objects;
    create policy "Authenticated users upload work evidence"
      on storage.objects for insert
      to authenticated
      with check (bucket_id = 'work-evidence');

    drop policy if exists "Authenticated users view work evidence" on storage.objects;
    create policy "Authenticated users view work evidence"
      on storage.objects for select
      to authenticated
      using (bucket_id = 'work-evidence');
  end if;
end $$;
