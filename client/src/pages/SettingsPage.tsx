import React, { useState } from 'react';
import { ApiClient } from '../services/api';
import {
  Settings,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Database,
  ShieldCheck,
  Cpu,
  Lock,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [resetting, setResetting] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  const handleResetDatabase = async () => {
    if (!confirm('Are you sure you want to reset the demonstration database back to the initial ~1,500 records and 12 institutions?')) {
      return;
    }

    setResetting(true);
    setResetSuccess(false);
    try {
      const res = await ApiClient.resetDatabase();
      if (res.success) {
        setResetSuccess(true);
        setTimeout(() => setResetSuccess(false), 5000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to reset database');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in text-xs">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Platform Configuration & Prototype Environment
        </h1>
        <p className="text-slate-400 mt-1">
          System telemetry, demonstration gateway fixtures, and database lifecycle management.
        </p>
      </div>

      {/* System Status Panel */}
      <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222] space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-white" />
          <span>Core System Configuration</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#222222]">
            <p className="text-neutral-500 text-[11px]">Platform Identity</p>
            <p className="font-bold text-white mt-0.5">CREDEN Platform</p>
            <p className="text-neutral-400 text-[11px] mt-1">AICTE Student Identity, Data Verification & Academic Governance</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#222222]">
            <p className="text-neutral-500 text-[11px]">System Release</p>
            <p className="font-bold text-white mt-0.5">CREDEN v1.0 Production Release</p>
            <p className="text-neutral-400 text-[11px] mt-1">Academic Governance Engine</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#262626]">
            <p className="text-slate-500 text-[11px]">APAAR Authoritative Adapter</p>
            <p className="font-bold text-emerald-400 mt-0.5">Simulated Verification Gateway</p>
            <p className="text-slate-400 text-[11px] mt-1">Supports VERIFIED, INVALID, UNVERIFIED & NAME_MISMATCH</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#262626]">
            <p className="text-slate-500 text-[11px]">Cryptographic Identifier Security</p>
            <p className="font-bold text-violet-400 mt-0.5">Keyed Salted HMAC-SHA256</p>
            <p className="text-slate-400 text-[11px] mt-1">Deterministic duplicate detection without plaintext leakage</p>
          </div>
        </div>
      </div>

      {/* Database Reset Panel */}
      <div className="p-6 rounded-2xl bg-[#121212] border border-rose-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-rose-400" />
              <span>Reset Demonstration Database</span>
            </h3>
            <p className="text-slate-400 mt-1">
              Restores the synthetic database to its initial seeded state with 12 institutions, ~1,500 students, and sample validation findings.
            </p>
          </div>

          <button
            onClick={handleResetDatabase}
            disabled={resetting}
            className="px-5 py-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 font-bold transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Resetting DB...' : 'Reset to Fresh Seed'}</span>
          </button>
        </div>

        {resetSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 min-w-4" />
            <span>Database successfully re-seeded with pristine demonstration data.</span>
          </div>
        )}
      </div>
    </div>
  );
};

