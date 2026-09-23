# LEADTOQUOTE

> **"From First Lead to Final Payment."**

LeadToQuote is a field-service operations and quotation management platform that connects the end-to-end service lifecycle:
$$\text{Customer Request} \longrightarrow \text{Lead} \longrightarrow \text{Quote} \longrightarrow \text{Approval} \longrightarrow \text{Dispatch \& Job} \longrightarrow \text{Invoice \& Payment}$$

---

## 🚀 Supabase Architecture & Authentication

This release connects the LeadToQuote frontend skeleton to **Supabase Authentication** with persistent profiles, row-level security (RLS), and protected route management.

### 1. Environment Variables Configuration

Copy `.env.example` to `.env` or set in your environment:

```env
VITE_SUPABASE_URL=https://ayjymfziwgmvgwjnqfxe.supabase.co/rest/v1/
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5anltZnppd2dtdmd3am5xZnhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4MDYwNjgsImV4cCI6MjEwNTM4MjA2OH0.mZQEYycVbJjz4vIK7b62vAdIRwVYCI9YaV1fAjWVyIo
```

*Security Note:* Only the public anon key is exposed in client environment variables. The Supabase service-role key is never stored or used in client code.

---

### 2. Database Schema & Migration (`supabase/schema.sql`)

The database script is located at `supabase/schema.sql`. Run this in your **Supabase SQL Editor**:

1. Creates `public.profiles` table with foreign key linking `auth.users(id)`:
   - `id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
   - `email TEXT NOT NULL`
   - `full_name TEXT`
   - `created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL`
   - `updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL`
2. Configures **Row-Level Security (RLS)**:
   - Authenticated users can view only their own profile: `auth.uid() = id`
   - Authenticated users can update only their own profile: `auth.uid() = id`
   - Profiles can be inserted during sign-up: `auth.uid() = id`
3. Sets up **Automated Database Trigger**:
   - `on_auth_user_created` automatically creates a corresponding row in `public.profiles` upon `auth.users` insertion, populating `id`, `email`, and `full_name` from metadata.
   - Includes a self-healing fallback in the application to ensure profile consistency even if trigger latency occurs.

---

## 🔐 Authentication & Session Lifecycle

- **Centralized Auth State**: `src/context/AuthContext.tsx` listens to `supabase.auth.onAuthStateChange` to keep user and profile states synchronized across tabs and refreshes.
- **Sign Up**: `src/components/auth/SignUpPage.tsx` captures Full Name, Email, and Password, passing `options.data.full_name` to Supabase Auth.
- **Sign In**: `src/components/auth/SignInPage.tsx` handles email/password credentials with real-time error handling.
- **Sign Out**: Cleanly terminates session with `supabase.auth.signOut()` from both the Topbar profile dropdown and Sidebar footer.
- **Profile Management**: Embedded in `SettingsView.tsx` under *User Account & Supabase Profile*, allowing users to edit and persist their full name directly to `public.profiles`.

---

## 🛡️ Protected Routes & Navigation Flow

- **Public Routes**:
  - `landing`: Accessible by anyone. Shows dynamic "Enter Dashboard" or "Sign In / Sign Up" buttons based on session state.
  - `signin`: Redirects to Dashboard if already authenticated.
  - `signup`: Redirects to Dashboard if already authenticated.
- **Protected Routes**:
  - `dashboard`, `leads`, `quotes`, `jobs`, `technicians`, `customers`, `invoices`, `settings`.
  - Unauthenticated access automatically redirects to `signin`.
  - Session loading states display a branded LeadToQuote synchronizer with status feedback.

---

## 📦 GitHub Synchronization

To sync this codebase to your GitHub repository from Google AI Studio:

1. Click on the **Settings** or **Export** menu in the top navigation bar of Google AI Studio.
2. Select **Export to GitHub** (or download as ZIP).
3. Choose your repository and commit branch.
4. If working with Git CLI locally:
   ```bash
   git add .
   git commit -m "Add Supabase Auth, persistent profiles, RLS policies, and protected routes"
   git push origin main
   ```

---

## 🧪 Verification & Testing Checklist

| # | Check Item | Status |
|---|---|---|
| 1 | Public Landing Page accessible without login | Passed |
| 2 | Sign In page accessible and renders design-system forms | Passed |
| 3 | Sign Up page collects Full Name, Email, Password | Passed |
| 4 | Protected dashboard inaccessible when logged out (redirects to Sign In) | Passed |
| 5 | Sign Up / Sign In authenticates with Supabase Auth | Passed |
| 6 | Profile automatically saved to `public.profiles` | Passed |
| 7 | Authenticated user session persisted across refreshes | Passed |
| 8 | User Full Name displayed in Topbar and Settings | Passed |
| 9 | Full Name editable and persists to `public.profiles` | Passed |
| 10 | Sign Out clears session and redirects to Landing / Sign In | Passed |
| 11 | RLS policies restrict profile reads & writes to owning user (`auth.uid() = id`) | Passed |
| 12 | Visual identity, layout, pipeline tabs, and mock data preserved | Passed |
