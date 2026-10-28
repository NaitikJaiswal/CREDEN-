import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api';
import { useAuth } from '../features/auth/AuthContext';
import {
  Scale,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Filter,
  Building2,
  GraduationCap,
  Users,
  ShieldAlert,
} from 'lucide-react';

export const AdmissionsPage: React.FC = () => {
  const { user, activeRole } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [academicYear, setAcademicYear] = useState<string>('2025-2026');
  const [selectedState, setSelectedState] = useState<string>('');

  const fetchIntakeData = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { type: 'INTAKE_UTILIZATION' };
      if (academicYear) params.academicYear = academicYear;
      if (selectedState) params.state = selectedState;

      const res = await ApiClient.getReports(params);
      if (res.success) {
        setReports(res.intakeReport);
      }
    } catch (err) {
      console.error('Failed to load intake reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntakeData();
  }, [academicYear, selectedState]);

  // Violations & warnings
  const violations = reports.filter((r) => r.isViolation);
  const nearCapacity = reports.filter((r) => r.status === 'NEAR_CAPACITY');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Approved Intake & Admission Monitoring
            </h1>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#181818] text-neutral-300 border border-[#333333]">
              AICTE Sanction vs Actual Enrolment
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Supervisory monitoring comparing actual student enrolments against AICTE approved intake orders.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="bg-[#121212] border border-[#262626] text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer"
          >
            <option value="2025-2026">AY 2025-2026 (Active Intake)</option>
            <option value="2024-2025">AY 2024-2025 (Historical)</option>
          </select>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-[#121212] border border-[#262626] text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer"
          >
            <option value="">All States</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Delhi">Delhi</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
          </select>
        </div>
      </div>

      {/* Threshold Legend Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            &lt;80%
          </div>
          <div>
            <p className="font-bold text-emerald-400">Normal Monitoring (Within Limits)</p>
            <p className="text-slate-400 text-[11px]">Enrolment well within sanctioned intake quota.</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            80-100%
          </div>
          <div>
            <p className="font-bold text-amber-400">Near Approved Capacity</p>
            <p className="text-slate-400 text-[11px]">{nearCapacity.length} programme(s) nearing sanction limit.</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
            &gt;100%
          </div>
          <div>
            <p className="font-bold text-rose-400">Potential Excess Admission Alert</p>
            <p className="text-slate-400 text-[11px]">{violations.length} breach warning(s) flagged for review.</p>
          </div>
        </div>
      </div>

      {/* Over-Capacity Red Alert Notification (If any) */}
      {violations.length > 0 && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/40 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-bold text-rose-300">
              Supervisory Excess Admission Warnings ({violations.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {violations.map((v, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#0A0A0A] border border-rose-500/30 text-xs text-slate-300">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white">{v.institutionName}</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                    {v.utilizationPercentage}% Utilized
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">{v.programmeName} ({v.programmeCode})</p>
                <p className="text-rose-400 mt-1 font-semibold">{v.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Programme Intake Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-16 text-center text-slate-400">
            Loading intake calculations...
          </div>
        ) : (
          reports.map((prog, idx) => {
            const isExcess = prog.isViolation;
            const isNear = prog.status === 'NEAR_CAPACITY';

            const barColor = isExcess ? 'bg-rose-500' : isNear ? 'bg-amber-400' : 'bg-white';
            const badgeColor = isExcess
              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
              : isNear
              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';

            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#121212] border border-[#222222] hover:border-neutral-500 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[10px] font-bold text-neutral-300 tracking-wider">
                      {prog.institutionCode}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor}`}>
                      {prog.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-0.5 leading-snug">{prog.institutionName}</h3>
                  <p className="text-xs text-neutral-400 mb-4">{prog.programmeName}</p>

                  {/* Progress Bar Gauge */}
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-400">Capacity Gauge</span>
                      <span className="font-extrabold text-white">{prog.utilizationPercentage}%</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-[#0A0A0A] overflow-hidden p-0.5 border border-[#222222]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${Math.min(100, prog.utilizationPercentage)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Numbers Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs p-3 rounded-xl bg-[#0A0A0A] border border-[#222222]">
                    <div>
                      <p className="text-neutral-500 text-[10px]">Approved</p>
                      <p className="font-extrabold text-white mt-0.5">{prog.approvedSeatCount}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500 text-[10px]">Enrolled</p>
                      <p className="font-extrabold text-white mt-0.5">{prog.regularEnrolled}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500 text-[10px]">Remaining</p>
                      <p className={`font-extrabold mt-0.5 ${prog.remainingCapacity === 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {prog.remainingCapacity}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quotas & Supernumerary breakdown */}
                <div className="mt-4 pt-3 border-t border-[#222222] flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Supernumerary: <strong className="text-neutral-200">{prog.supernumeraryEnrolled}</strong></span>
                  <span>NRI/OCI: <strong className="text-neutral-200">{prog.nriEnrolled}</strong></span>
                  <span>Total: <strong className="text-white">{prog.totalEnrolled}</strong></span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

