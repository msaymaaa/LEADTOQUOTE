import React, { useState, useEffect } from 'react';
import { Database, Copy, Check, RefreshCw } from 'lucide-react';
import { checkDatabaseHealth, DatabaseHealth } from '../../lib/database';

export const DatabaseStatusBanner: React.FC<{
  onRefreshData?: () => void;
}> = ({ onRefreshData }) => {
  const [health, setHealth] = useState<DatabaseHealth | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  const runHealthCheck = async () => {
    setIsChecking(true);
    try {
      const res = await checkDatabaseHealth();
      setHealth(res);
      if (res.tablesExist && onRefreshData) {
        onRefreshData();
      }
    } catch (err) {
      console.warn('Database health check failed:', err);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const handleCopySql = async () => {
    try {
      // Fetch schema SQL from public folder or fallback
      let sqlText = '';
      const response = await fetch('/supabase-schema.sql');
      if (response.ok) {
        sqlText = await response.text();
      } else {
        const fallbackRes = await fetch('/supabase/schema.sql');
        if (fallbackRes.ok) {
          sqlText = await fallbackRes.text();
        } else {
          sqlText = '-- Please copy supabase/schema.sql from project root and run in Supabase SQL Editor';
        }
      }
      await navigator.clipboard.writeText(sqlText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  if (!health || isDismissed) return null;

  if (health.tablesExist) {
    return (
      <div className="mb-4 px-4 py-2 rounded-xl bg-[#00E599]/10 border border-[#00E599]/20 flex items-center justify-between text-xs text-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse" />
          <span className="font-semibold text-[#00E599]">Supabase Live Database Active:</span>
          <span className="text-[#91A0B8]">
            Connected with 9 relational tables & Row Level Security (RLS) enforcement.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDismissed(true)}
            className="text-[#91A0B8] hover:text-[#F4F7FB] transition-colors p-1"
            title="Dismiss notice"
            aria-label="Dismiss banner"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#18243A] to-[#121A2B] border border-[#6C63FF]/40 shadow-xl text-xs text-[#E2E8F0]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#6C63FF]/20 border border-[#6C63FF]/30 text-[#8B83FF] shrink-0 mt-0.5">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#F4F7FB]">Supabase Database Schema Setup</span>
              <span className="px-2 py-0.5 rounded-md bg-[#FFAE33]/20 border border-[#FFAE33]/30 text-[#FFAE33] text-[10px] font-semibold">
                Setup Required
              </span>
            </div>
            <p className="text-[#91A0B8] mt-1 max-w-2xl leading-relaxed">
              Your Supabase authentication client is connected. To activate persistent cloud tables (leads, quotes, jobs, payments, logs, and RLS policies), execute{' '}
              <code className="px-1.5 py-0.5 rounded bg-[#101726] text-[#8B83FF] font-mono text-[11px]">
                supabase/schema.sql
              </code>{' '}
              in your Supabase SQL Editor.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <button
            onClick={handleCopySql}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#6C63FF] hover:bg-[#5B52E0] text-[#FFFFFF] font-semibold transition-all shadow-md active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
            <span>{copied ? 'SQL Copied!' : 'Copy SQL Migration'}</span>
          </button>

          <button
            onClick={runHealthCheck}
            disabled={isChecking}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1F2D4A] hover:bg-[#2A3C62] text-[#F4F7FB] border border-[#2D3E64] transition-all active:scale-95"
            title="Check if tables are detected in Supabase"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin text-[#8B83FF]' : 'text-[#91A0B8]'}`} />
            <span>{isChecking ? 'Checking...' : 'Check Status'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
