import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
  ChevronLeft
} from 'lucide-react';

interface SignInPageProps {
  onNavigateToSignUp: () => void;
  onNavigateToLanding: () => void;
  onSuccessRedirect: () => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({
  onNavigateToSignUp,
  onNavigateToLanding,
  onSuccessRedirect
}) => {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Client validation
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please provide a valid email format (e.g. name@company.com).');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signIn(email.trim(), password);

      if (error) {
        let msg = error.message;
        if (msg.toLowerCase().includes('invalid login credentials')) {
          msg = 'Invalid email or password. Please check your credentials and try again.';
        } else if (msg.toLowerCase().includes('email not confirmed')) {
          msg = 'Email confirmation is currently enforced by your Supabase project. To disable it for testing: In your Supabase Dashboard, go to Authentication -> Providers -> Email and toggle OFF "Confirm email".';
        }
        setErrorMessage(msg);
      } else {
        setSuccessMessage('Signed in successfully! Redirecting to dashboard...');
        setTimeout(() => {
          onSuccessRedirect();
        }, 600);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected connection error occurred. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#080D18] text-[#F4F7FB] flex flex-col justify-between overflow-hidden selection:bg-[#6C63FF]/30 selection:text-white">
      {/* Subtle Background Ambience */}
      <div className="absolute inset-0 bg-enterprise-grid opacity-30 pointer-events-none" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-[#6C63FF]/20 via-[#39D9FF]/10 to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 -right-32 w-80 h-80 bg-[#39D9FF]/10 blur-[100px] pointer-events-none rounded-full" />

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
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-md bg-[#0D1424] border border-[#18243A] rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18243A] border border-[#39D9FF]/30 text-[11px] font-semibold text-[#39D9FF] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Secure Authentication</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#F4F7FB]">
              Sign in to LeadToQuote
            </h1>
            <p className="text-xs text-[#91A0B8] mt-1.5">
              Access your field operations command center, quotes, and dispatch orders.
            </p>
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#91A0B8] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91A0B8]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operations@company.com"
                  disabled={isLoading}
                  autoComplete="email"
                  className="w-full bg-[#151F33] border border-[#18243A] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#F4F7FB] placeholder-[#91A0B8]/50 focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF]/30 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#91A0B8]">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91A0B8]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="w-full bg-[#151F33] border border-[#18243A] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#F4F7FB] placeholder-[#91A0B8]/50 focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF]/30 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#6C63FF] to-[#4F46E5] hover:opacity-95 shadow-lg shadow-[#6C63FF]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer switch to Sign Up */}
          <div className="mt-6 pt-5 border-t border-[#18243A] text-center text-xs text-[#91A0B8]">
            Don't have an enterprise account?{' '}
            <button
              onClick={onNavigateToSignUp}
              className="text-[#39D9FF] hover:underline font-semibold cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Brand Stamp */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 text-center text-[11px] text-[#91A0B8]/70 border-t border-[#18243A]/40">
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
