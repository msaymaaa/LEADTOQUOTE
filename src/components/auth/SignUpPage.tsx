import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  Wrench,
  Building2,
  Clock
} from 'lucide-react';

interface SignUpPageProps {
  onNavigateToSignIn: () => void;
  onNavigateToLanding: () => void;
  onSuccessRedirect: () => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({
  onNavigateToSignIn,
  onNavigateToLanding,
  onSuccessRedirect
}) => {
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'customer' | 'technician'>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation checks
    if (!fullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (fullName.trim().length < 2) {
      setErrorMessage('Please enter your complete first and last name.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Email address is required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address format (e.g. name@company.com).');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Contact phone number is required for field operations.');
      return;
    }

    if (!password) {
      setErrorMessage('Password is required.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.');
      return;
    }

    if (!confirmPassword) {
      setErrorMessage('Please confirm your password.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(
        email.trim(),
        password,
        fullName.trim(),
        phone.trim(),
        selectedRole
      );

      if (error) {
        let msg = error.message;
        if (msg.toLowerCase().includes('user already registered')) {
          msg = 'An account with this email already exists. Please sign in instead.';
        }
        setErrorMessage(msg);
      } else {
        if (selectedRole === 'technician') {
          setSuccessMessage('Technician account created! Registered in pending review status. Entering portal...');
        } else {
          setSuccessMessage('Customer account created successfully! Entering service portal...');
        }
        setTimeout(() => {
          onSuccessRedirect();
        }, 800);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected registration error occurred. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#080D18] text-[#F4F7FB] flex flex-col justify-between overflow-hidden selection:bg-[#6C63FF]/30 selection:text-white">
      {/* Subtle Background Ambience */}
      <div className="absolute inset-0 bg-enterprise-grid opacity-30 pointer-events-none" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-[#6C63FF]/20 via-[#39D9FF]/10 to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 -left-32 w-80 h-80 bg-[#6C63FF]/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Top Bar Navigation */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 h-20 flex items-center justify-between border-b border-[#18243A]/60">
        <button
          onClick={onNavigateToLanding}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#39D9FF] flex items-center justify-center text-white font-black text-lg shadow-md shadow-[#6C63FF]/25 group-hover:scale-105 transition-transform">
            L
          </div>
          <div className="text-left">
            <span className="text-sm font-extrabold tracking-wider text-white block">
              LEADTOQUOTE
            </span>
            <span className="text-[10px] text-[#39D9FF] tracking-wider uppercase font-semibold block">
              Enterprise Field Ops
            </span>
          </div>
        </button>

        <button
          onClick={onNavigateToLanding}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#91A0B8] hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Welcome</span>
        </button>
      </header>

      {/* Center Auth Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-10">
        <div className="w-full max-w-lg bg-[#0D1424] border border-[#18243A] rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18243A] border border-[#39D9FF]/30 text-[11px] font-semibold text-[#39D9FF] mb-2.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Public Registration</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#F4F7FB]">
              Create Your Account
            </h1>
            <p className="text-xs text-[#91A0B8] mt-1">
              Select your account type to access the LeadToQuote field operations platform.
            </p>
          </div>

          {/* Role Selection Tabs (Only Customer and Technician) */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-[#91A0B8] mb-2">
              Register As (Public Roles)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Customer Option */}
              <button
                type="button"
                onClick={() => setSelectedRole('customer')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedRole === 'customer'
                    ? 'bg-[#18243A] border-[#6C63FF] shadow-md shadow-[#6C63FF]/20 ring-1 ring-[#6C63FF]'
                    : 'bg-[#151F33]/60 border-[#18243A] hover:bg-[#151F33] text-[#91A0B8]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`p-1.5 rounded-lg ${selectedRole === 'customer' ? 'bg-[#6C63FF] text-white' : 'bg-[#18243A] text-[#91A0B8]'}`}>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-bold ${selectedRole === 'customer' ? 'text-white' : 'text-[#F4F7FB]'}`}>
                    Customer
                  </span>
                </div>
                <p className="text-[10px] text-[#91A0B8] leading-relaxed">
                  Request quotations, approve service scopes, track work & manage invoices.
                </p>
              </button>

              {/* Technician Option */}
              <button
                type="button"
                onClick={() => setSelectedRole('technician')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedRole === 'technician'
                    ? 'bg-[#18243A] border-[#39D9FF] shadow-md shadow-[#39D9FF]/20 ring-1 ring-[#39D9FF]'
                    : 'bg-[#151F33]/60 border-[#18243A] hover:bg-[#151F33] text-[#91A0B8]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`p-1.5 rounded-lg ${selectedRole === 'technician' ? 'bg-[#39D9FF] text-[#080D18]' : 'bg-[#18243A] text-[#91A0B8]'}`}>
                    <Wrench className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-bold ${selectedRole === 'technician' ? 'text-white' : 'text-[#F4F7FB]'}`}>
                    Field Technician
                  </span>
                </div>
                <p className="text-[10px] text-[#91A0B8] leading-relaxed">
                  Receive assigned dispatch jobs, log stages, and upload photo evidence.
                </p>
              </button>
            </div>

            {selectedRole === 'technician' && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-[#39D9FF]/10 border border-[#39D9FF]/30 text-[#39D9FF] text-[11px] flex items-start gap-2 animate-in fade-in duration-150">
                <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  <strong>Verification Notice:</strong> New technician registrations start in <em>Pending</em> status and undergo review by dispatch operations before job dispatch is activated.
                </span>
              </div>
            )}
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#FF647C]/10 border border-[#FF647C]/30 text-[#FF647C] text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#35D07F]/10 border border-[#35D07F]/30 text-[#35D07F] text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#91A0B8] mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91A0B8]" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Tariq Mehmood"
                  disabled={isLoading}
                  autoComplete="name"
                  className="w-full bg-[#151F33] border border-[#18243A] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#F4F7FB] placeholder-[#91A0B8]/50 focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF]/30 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#91A0B8] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91A0B8]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    disabled={isLoading}
                    autoComplete="email"
                    className="w-full bg-[#151F33] border border-[#18243A] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#F4F7FB] placeholder-[#91A0B8]/50 focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF]/30 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#91A0B8] mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91A0B8]" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    disabled={isLoading}
                    autoComplete="tel"
                    className="w-full bg-[#151F33] border border-[#18243A] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#F4F7FB] placeholder-[#91A0B8]/50 focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF]/30 transition-all disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#91A0B8] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91A0B8]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    disabled={isLoading}
                    autoComplete="new-password"
                    className="w-full bg-[#151F33] border border-[#18243A] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#F4F7FB] placeholder-[#91A0B8]/50 focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF]/30 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#91A0B8] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91A0B8]" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    disabled={isLoading}
                    autoComplete="new-password"
                    className="w-full bg-[#151F33] border border-[#18243A] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#F4F7FB] placeholder-[#91A0B8]/50 focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF]/30 transition-all disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#6C63FF] to-[#4F46E5] hover:opacity-95 shadow-lg shadow-[#6C63FF]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>
                    Register as {selectedRole === 'technician' ? 'Technician' : 'Customer'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer switch to Sign In */}
          <div className="mt-5 pt-4 border-t border-[#18243A] text-center text-xs text-[#91A0B8]">
            Already have an account?{' '}
            <button
              onClick={onNavigateToSignIn}
              className="text-[#39D9FF] hover:underline font-semibold cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Brand Stamp */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-4 text-center text-[11px] text-[#91A0B8]/70 border-t border-[#18243A]/40">
        <div className="flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-[#35D07F]" />
          <span>LEADTOQUOTE</span>
          <span className="text-[#91A0B8]/40">•</span>
          <span className="italic">"From First Lead to Final Payment."</span>
        </div>
      </footer>
    </div>
  );
};
