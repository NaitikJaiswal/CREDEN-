import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ApiClient } from '../services/api';
import {
  Building2,
  MapPin,
  Mail,
  Scale,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  FileSpreadsheet,
} from 'lucide-react';

export const InstitutionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        setLoading(true);
        const res = await ApiClient.getInstitutionById(id);
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load institution profile', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading || !data) {
    return <div className="py-20 text-center text-slate-400">Loading institution dossier...</div>;
  }

  const { institution, metrics, programmeIntakes, recentBatches, activeIssues } = data;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <button
        onClick={() => navigate('/institutions')}
        className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Institutions Directory</span>
      </button>

      {/* Main Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#141414] to-[#0A0A0A] border border-[#2E2E2E] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs font-bold text-neutral-300 px-2 py-0.5 rounded bg-[#181818] border border-[#333333]">
              {institution.institutionCode}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {institution.status.replace(/_/g, ' ')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {institution.name}
          </h1>
          <p className="text-xs text-neutral-400 mt-1 flex items-center gap-3">
            <span>{institution.city}, {institution.state}</span>
            <span>•</span>
            <span>{institution.institutionType.replace(/_/g, ' ')}</span>
            <span>•</span>
            <span>Est. {institution.approvedYear}</span>
          </p>
        </div>

        <div className="text-right">
          <span className="text-3xl font-extrabold text-white">{metrics.submissionCompletionPercentage}%</span>
          <p className="text-xs text-neutral-400 mt-0.5">Validation Completion</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-[#121212] border border-[#222222]">
          <p className="text-neutral-400">Approved Total Intake</p>
          <p className="text-xl font-bold text-white mt-1">{metrics.approvedIntake} Seats</p>
        </div>
        <div className="p-4 rounded-xl bg-[#121212] border border-[#222222]">
          <p className="text-neutral-400">Actual Enrolled</p>
          <p className="text-xl font-bold text-white mt-1">{metrics.actualEnrolment} Students</p>
        </div>
        <div className="p-4 rounded-xl bg-[#121212] border border-[#222222]">
          <p className="text-neutral-400">Remaining Capacity</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">{metrics.remainingCapacity} Seats</p>
        </div>
        <div className="p-4 rounded-xl bg-[#121212] border border-[#222222]">
          <p className="text-neutral-400">Supernumerary Enrolled</p>
          <p className="text-xl font-bold text-neutral-300 mt-1">{metrics.supernumerary.total} Quota Seats</p>
        </div>
      </div>

      {/* Programme Intakes Breakdown */}
      <div className="p-6 rounded-2xl bg-[#121212] border border-[#262626] space-y-4">
        <h3 className="text-sm font-bold text-white">Programme-Specific Intake Utilization</h3>
        <div className="divide-y divide-[#262626] text-xs">
          {programmeIntakes.map((prog: any, idx: number) => (
            <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-white">{prog.programmeName} ({prog.programmeCode})</p>
                <p className="text-slate-400 text-[11px]">AY {prog.academicYear} • Supernumerary: {prog.supernumeraryEnrolled}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-mono font-bold text-white">{prog.regularEnrolled} / {prog.approvedSeatCount}</p>
                  <p className="text-[10px] text-slate-500">{prog.utilizationPercentage}% Capacity</p>
                </div>
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                  prog.isViolation ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {prog.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

