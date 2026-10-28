import React, { useState, useEffect } from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import { UserRole } from '../../types';
import { Sparkles, ShieldCheck, UserCheck, GraduationCap, Building2, Zap } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { activeRole, demoLogin, isLoading } = useAuth();
  const [isLiteMode, setIsLiteMode] = useState<boolean>(() => {
    return localStorage.getItem('creden_lite_mode') === 'true';
  });

  const toggleLiteMode = () => {
    const next = !isLiteMode;
    setIsLiteMode(next);
    localStorage.setItem('creden_lite_mode', String(next));
    window.dispatchEvent(new CustomEvent('creden_perf_mode_change', { detail: { isLiteMode: next } }));
  };

  const roles: Array<{ role: UserRole; label: string; icon: any; color: string }> = [
    { role: 'AICTE_ADMIN', label: 'AICTE Admin', icon: ShieldCheck, color: 'text-white border-white/40' },
    { role: 'INSTITUTION_ADMIN', label: 'Inst Admin (COEP)', icon: Building2, color: 'text-neutral-300 border-neutral-600' },
    { role: 'STUDENT', label: 'Student (Aarav)', icon: GraduationCap, color: 'text-emerald-400 border-emerald-500/40' },
    { role: 'VERIFIER', label: 'Authorized Verifier', icon: UserCheck, color: 'text-amber-400 border-amber-500/40' },
  ];

  return (
    <div className="bg-[#050505] border-b border-[#222222] px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-3 text-neutral-300 z-50">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        <span className="font-bold text-white uppercase tracking-wider text-[11px]">
          Demo Environment
        </span>

        {/* Performance Mode Switch */}
        <button
          onClick={toggleLiteMode}
          className={`ml-2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
            isLiteMode
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-[#181818] text-neutral-200 border-[#333333] hover:bg-[#222222]'
          }`}
          title="Toggle High Performance / Lite GPU Mode"
        >
          <Zap className="w-3 h-3 text-neutral-300" />
          <span>{isLiteMode ? 'Lite Mode (Ultra Smooth)' : '3D Mode (Optimized)'}</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-neutral-500 mr-1 hidden md:inline text-[11px]">Quick Role Switch:</span>
        {roles.map(({ role, label, icon: Icon }) => {
          const isActive = activeRole === role;
          return (
            <button
              key={role}
              onClick={() => demoLogin(role)}
              disabled={isLoading || isActive}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${
                isActive
                  ? 'bg-white text-black border-white font-bold shadow-sm shadow-white/20'
                  : 'bg-[#121212] text-neutral-400 border-[#262626] hover:border-neutral-500 hover:text-white'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
