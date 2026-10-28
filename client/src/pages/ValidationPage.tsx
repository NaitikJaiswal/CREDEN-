import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api';
import { useAuth } from '../features/auth/AuthContext';
import { ValidationIssue } from '../types';
import { getStatusBadgeColor, formatDate } from '../lib/utils';
import {
  ShieldAlert,
  Search,
  Filter,
  AlertTriangle,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
  Building,
  RefreshCw,
  X,
  FileText,
} from 'lucide-react';

export const ValidationPage: React.FC = () => {
  const { user, activeRole } = useAuth();
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [summary, setSummary] = useState<any>({ total: 0, pending: 0, underInvestigation: 0, correctionRequested: 0, resolved: 0 });
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [severity, setSeverity] = useState<string>('');
  const [issueType, setIssueType] = useState<string>('');
  const [reviewStatus, setReviewStatus] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  // Review / Investigation Modal
  const [selectedIssue, setSelectedIssue] = useState<ValidationIssue | null>(null);
  const [actionChoice, setActionChoice] = useState<string>('INVESTIGATE');
  const [notes, setNotes] = useState<string>('');
  const [savingAction, setSavingAction] = useState<boolean>(false);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {};
      if (severity) params.severity = severity;
      if (issueType) params.issueType = issueType;
      if (reviewStatus) params.reviewStatus = reviewStatus;
      if (search) params.search = search;

      const res = await ApiClient.getValidationIssues(params);
      if (res.success) {
        setIssues(res.issues);
        setSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to load validation issues', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [severity, issueType, reviewStatus]);

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue) return;
    setSavingAction(true);
    try {
      const res = await ApiClient.reviewIssue(selectedIssue.id, actionChoice, notes);
      if (res.success) {
        setSelectedIssue(null);
        setNotes('');
        fetchIssues();
      }
    } catch (err) {
      console.error('Action failed', err);
    } finally {
      setSavingAction(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Validation Review Center
            </h1>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#181818] text-neutral-300 border border-[#333333]">
              Explainable Anomaly Prioritization
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Supervisory queue for potential duplicate enrolments, identity mismatches, and intake anomalies.
          </p>
        </div>

        <button
          onClick={fetchIssues}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141414] text-neutral-200 border border-[#333333] text-xs font-semibold hover:bg-[#1E1E1E] transition-colors self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <button
          onClick={() => { setReviewStatus(''); }}
          className={`p-3 rounded-xl border text-left transition-all ${
            reviewStatus === '' ? 'bg-white text-black border-white font-bold shadow-md shadow-white/10' : 'bg-[#121212] border-[#222222] text-neutral-400 hover:text-white'
          }`}
        >
          <p className={`text-[11px] ${reviewStatus === '' ? 'text-neutral-700' : 'text-neutral-400'}`}>Total Active Issues</p>
          <p className={`text-xl font-extrabold mt-0.5 ${reviewStatus === '' ? 'text-black' : 'text-white'}`}>{summary.total}</p>
        </button>

        <button
          onClick={() => { setReviewStatus('PENDING'); }}
          className={`p-3 rounded-xl border text-left transition-all ${
            reviewStatus === 'PENDING' ? 'bg-amber-500/15 border-amber-400 text-amber-300' : 'bg-[#121212] border-[#222222] text-neutral-400 hover:text-white'
          }`}
        >
          <p className="text-[11px]">Pending Review</p>
          <p className="text-xl font-extrabold text-amber-400 mt-0.5">{summary.pending}</p>
        </button>

        <button
          onClick={() => { setReviewStatus('UNDER_INVESTIGATION'); }}
          className={`p-3 rounded-xl border text-left transition-all ${
            reviewStatus === 'UNDER_INVESTIGATION' ? 'bg-white text-black border-white font-bold shadow-md shadow-white/10' : 'bg-[#121212] border-[#222222] text-neutral-400 hover:text-white'
          }`}
        >
          <p className={`text-[11px] ${reviewStatus === 'UNDER_INVESTIGATION' ? 'text-neutral-700' : 'text-neutral-400'}`}>Under Investigation</p>
          <p className={`text-xl font-extrabold mt-0.5 ${reviewStatus === 'UNDER_INVESTIGATION' ? 'text-black' : 'text-white'}`}>{summary.underInvestigation}</p>
        </button>

        <button
          onClick={() => { setReviewStatus('CORRECTION_REQUESTED'); }}
          className={`p-3 rounded-xl border text-left transition-all ${
            reviewStatus === 'CORRECTION_REQUESTED' ? 'bg-rose-500/15 border-rose-400 text-rose-300' : 'bg-[#121212] border-[#222222] text-neutral-400 hover:text-white'
          }`}
        >
          <p className="text-[11px]">Correction Requested</p>
          <p className="text-xl font-extrabold text-rose-400 mt-0.5">{summary.correctionRequested}</p>
        </button>

        <button
          onClick={() => { setReviewStatus('RESOLVED'); }}
          className={`p-3 rounded-xl border text-left transition-all ${
            reviewStatus === 'RESOLVED' ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300' : 'bg-[#121212] border-[#222222] text-neutral-400 hover:text-white'
          }`}
        >
          <p className="text-[11px]">Resolved / Legitimate</p>
          <p className="text-xl font-extrabold text-emerald-400 mt-0.5">{summary.resolved}</p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#121212] border border-[#222222] flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search rules, details, college code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Issue Type */}
          <select
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            className="bg-[#0A0A0A] border border-[#262626] text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer"
          >
            <option value="">All Anomaly Types</option>
            <option value="CROSS_INSTITUTION_CONCURRENT">Rule C: Cross-Institution Concurrent</option>
            <option value="DUPLICATE_SUBMISSION">Rule A: Duplicate Submission</option>
            <option value="IDENTITY_CONFLICT">Rule B: Conflicting Identity</option>
            <option value="INTAKE_VIOLATION">Rule Intake: Approved Intake Exceeded</option>
            <option value="MALFORMED_APAAR">Malformed APAAR Format</option>
            <option value="MISSING_APAAR">Missing Identifier</option>
          </select>

          {/* Severity */}
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="bg-[#0A0A0A] border border-[#262626] text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer"
          >
            <option value="">All Severities</option>
            <option value="NEEDS_REVIEW">Needs Review</option>
            <option value="CONFIRMED_DATA_ERROR">Confirmed Data Error</option>
            <option value="WARNING">Warning</option>
            <option value="INFORMATIONAL">Informational</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Issues Queue List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-slate-400">Loading validation issues...</div>
        ) : issues.length === 0 ? (
          <div className="p-12 text-center bg-[#121212] rounded-2xl border border-[#262626] text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <p className="font-bold text-white text-sm">No validation issues found.</p>
            <p className="text-xs text-slate-500 mt-1">All records comply with configured validation rules.</p>
          </div>
        ) : (
          issues.map((iss) => (
            <div
              key={iss.id}
              className="p-5 rounded-2xl bg-[#121212] border border-[#262626] hover:border-slate-500 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadgeColor(iss.severity)}`}>
                    {iss.severity.replace(/_/g, ' ')}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0A0A0A] text-neutral-300 border border-[#262626]">
                    {iss.evidence.ruleCode}
                  </span>
                  <span className="text-xs font-bold text-white">{iss.evidence.ruleDescription}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusBadgeColor(iss.reviewStatus)}`}>
                    {iss.reviewStatus.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed max-w-3xl">
                  {iss.evidence.details}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-neutral-400 pt-1">
                  <span>Institution: <strong className="text-white">{iss.institutionName}</strong> ({iss.institutionCode})</span>
                  {iss.conflictingInstitutionName && (
                    <span>Conflicting: <strong className="text-rose-300">{iss.conflictingInstitutionName}</strong></span>
                  )}
                  {iss.affectedRecordReferences.institutionStudentId && (
                    <span>Student ID: <strong className="text-white font-mono">{iss.affectedRecordReferences.institutionStudentId}</strong></span>
                  )}
                  <span>Created: {formatDate(iss.createdAt)}</span>
                </div>
              </div>

              {/* Action Button & Risk Score Badge */}
              <div className="flex md:flex-col items-end justify-between md:justify-center gap-3 border-t md:border-t-0 md:border-l border-[#222222] pt-3 md:pt-0 md:pl-6 min-w-36">
                <div className="text-right">
                  <span className="text-[10px] text-neutral-400 block">Anomaly Risk</span>
                  <span className={`text-lg font-extrabold ${
                    iss.evidence.riskScore >= 70 ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {iss.evidence.riskScore} / 100
                  </span>
                </div>

                <button
                  onClick={() => setSelectedIssue(iss)}
                  className="px-4 py-2 rounded-xl bg-white text-black font-extrabold hover:bg-neutral-200 text-xs transition-all flex items-center gap-1.5 shadow-md shadow-white/10"
                >
                  <span>Investigate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* INVESTIGATION & RESOLUTION ACTION MODAL */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#262626] w-full max-w-xl rounded-2xl shadow-2xl p-6">
            <div className="flex items-start justify-between pb-4 border-b border-[#222222] mb-4">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Investigative Review Protocol
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedIssue.evidence.ruleDescription} ({selectedIssue.evidence.ruleCode})
                </h3>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#222222] text-xs text-neutral-300 mb-4 leading-relaxed">
              <p className="font-semibold text-white mb-1">Evidence Summary:</p>
              <p>{selectedIssue.evidence.details}</p>
            </div>

            <form onSubmit={handleActionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1.5">
                  Select Administrative Action
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { action: 'INVESTIGATE', label: 'Open Investigation', desc: 'Mark issue as under active inquiry' },
                    { action: 'REQUEST_CORRECTION', label: 'Request Correction', desc: 'Notify institution to correct error' },
                    { action: 'MARK_LEGITIMATE', label: 'Legitimate Exception', desc: 'Permit dual pathway under policy' },
                    { action: 'RESOLVE_ERROR', label: 'Resolve as Corrected', desc: 'Close issue with documented reason' },
                  ].map((opt) => (
                    <button
                      key={opt.action}
                      type="button"
                      onClick={() => setActionChoice(opt.action)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        actionChoice === opt.action
                          ? 'bg-white text-black border-white font-bold shadow-md shadow-white/10'
                          : 'bg-[#0A0A0A] border-[#262626] text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span className={`font-bold block ${actionChoice === opt.action ? 'text-black' : 'text-white'}`}>{opt.label}</span>
                      <span className={`text-[10px] ${actionChoice === opt.action ? 'text-neutral-700' : 'text-neutral-400'}`}>{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Investigation & Resolution Notes (Mandatory for Audit Trail)
                </label>
                <textarea
                  required
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record the supervisory justification, reference inquiry number, or resolution evidence..."
                  className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl p-3 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#222222]">
                <button
                  type="button"
                  onClick={() => setSelectedIssue(null)}
                  className="px-4 py-2 rounded-xl border border-[#262626] text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAction}
                  className="px-5 py-2 rounded-xl bg-white text-black font-extrabold hover:bg-neutral-200 hover:scale-[1.01] transition-all"
                >
                  {savingAction ? 'Recording Action...' : 'Save & Append to Audit Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

