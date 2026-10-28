import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { UserRole } from '../types';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Building2,
  ShieldCheck,
  GraduationCap,
  UserCheck,
  Layers,
  Activity,
  QrCode,
  History,
  Edit3,
  ExternalLink,
} from 'lucide-react';

export const DemoGuidePage: React.FC = () => {
  const { demoLogin, activeRole } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);

  const steps = [
    {
      step: 1,
      title: 'Step 1: Institution Data Submission',
      role: 'INSTITUTION_ADMIN' as UserRole,
      roleName: 'Institution Admin (COEP Pune)',
      actionText: 'Switch to Institution Admin & Open Bulk Upload',
      route: '/students/upload',
      description: 'Sign in as an institution administrator. Download official CSV template, inspect sample row headers, and upload synthetic student admissions.',
      outcome: 'Multi-layer parser ingests file rows and records submission timestamp.',
      icon: Building2,
      color: 'text-violet-400 border-violet-500/30',
    },
    {
      step: 2,
      title: 'Step 2: APAAR Multi-Layer Validation',
      role: 'INSTITUTION_ADMIN' as UserRole,
      roleName: 'Validation Engine',
      actionText: 'View Ingestion Validation Report',
      route: '/students/upload',
      description: 'Engine executes Layer 1 (12-digit format check), Layer 2 (internal duplicate check), and Layer 3 (authoritative gateway match).',
      outcome: 'Generates salted HMAC-SHA256 fingerprints and masks APAAR IDs (•••• •••• 9012).',
      icon: CheckCircle2,
      color: 'text-white border-neutral-700',
    },
    {
      step: 3,
      title: 'Step 3: Detect Data Inconsistencies',
      role: 'INSTITUTION_ADMIN' as UserRole,
      roleName: 'Institution Officer',
      actionText: 'Inspect Flagged Records in Student Table',
      route: '/students?validationStatus=REQUIRES_MANUAL_REVIEW',
      description: 'Identify records flagged for missing identifiers, malformed digits, or slight name discrepancies with the authoritative gateway.',
      outcome: 'Records requiring manual review are highlighted without corrupting the central master repository.',
      icon: Layers,
      color: 'text-amber-400 border-amber-500/30',
    },
    {
      step: 4,
      title: 'Step 4: Monitor Approved Intake Capacity',
      role: 'INSTITUTION_ADMIN' as UserRole,
      roleName: 'Institution Administrator',
      actionText: 'Open Approved Intake Gauges',
      route: '/admissions',
      description: 'Review utilization percentages per programme. Notice how B.Tech CSE has exceeded its 120 approved capacity threshold.',
      outcome: 'Red breach alert triggers without counting supernumerary TFW/EWS seats into the base quota.',
      icon: Activity,
      color: 'text-rose-400 border-rose-500/30',
    },
    {
      step: 5,
      title: 'Step 5: Investigate Cross-Institution Concurrency',
      role: 'AICTE_ADMIN' as UserRole,
      roleName: 'AICTE Administrator',
      actionText: 'Switch to AICTE Admin & Open Review Queue',
      route: '/validation?issueType=CROSS_INSTITUTION_CONCURRENT',
      description: 'Examine Rule C finding: student Rohan Deshmukh is flagged for concurrent active full-time enrolment in COEP and VJTI.',
      outcome: 'Supervisor reviews evidence and opens official inquiry notes without prematurely declaring fraud.',
      icon: ShieldCheck,
      color: 'text-neutral-300 border-neutral-700',
    },
    {
      step: 6,
      title: 'Step 6: Correct Record at Source',
      role: 'INSTITUTION_ADMIN' as UserRole,
      roleName: 'Institution Administrator',
      actionText: 'Switch to Institution & Open Student Record',
      route: '/students',
      description: 'Institution clicks student row to open profile, enables correction mode, fixes typographic discrepancy, and saves.',
      outcome: 'System re-validates the record, raises quality score to 96%, and resolves the pending issue automatically.',
      icon: Edit3,
      color: 'text-emerald-400 border-emerald-500/30',
    },
    {
      step: 7,
      title: 'Step 7: Real-Time Governance Analytics Update',
      role: 'AICTE_ADMIN' as UserRole,
      roleName: 'AICTE Administrator',
      actionText: 'Switch to AICTE & Refresh Dashboard',
      route: '/dashboard',
      description: 'Inspect live KPI cards, national pass rate, and regional statistics to confirm numbers calculate dynamically from the database.',
      outcome: 'All cards, pie charts, and regional tables reflect live database updates.',
      icon: Sparkles,
      color: 'text-white border-neutral-700',
    },
    {
      step: 8,
      title: 'Step 8: Authorized Academic Verification Request',
      role: 'VERIFIER' as UserRole,
      roleName: 'Authorized Verifier (Infosys HR)',
      actionText: 'Switch to Verifier & Issue Token',
      route: '/verification',
      description: 'Authorized third-party background checker generates a secure, random high-entropy token and QR code for candidate degree claims.',
      outcome: 'Generates random token (SHA-256 hashed in DB) with 30-day expiration.',
      icon: QrCode,
      color: 'text-amber-400 border-amber-500/30',
    },
    {
      step: 9,
      title: 'Step 9: Controlled Verification Result Proof',
      role: 'VERIFIER' as UserRole,
      roleName: 'Authorized Verifier',
      actionText: 'Execute Verification Claim Lookup',
      route: '/verification?ref=CRDN-VRF-2026-98124',
      description: 'Verifier resolves academic claim. System returns verification status and issuing institution authenticity while preserving student privacy.',
      outcome: 'Candidate degree verified with cryptographic signature proof without leaking raw personal records.',
      icon: UserCheck,
      color: 'text-emerald-400 border-emerald-500/30',
    },
    {
      step: 10,
      title: 'Step 10: Review Immutable Audit Trail',
      role: 'AICTE_ADMIN' as UserRole,
      roleName: 'AICTE Auditor',
      actionText: 'Switch to AICTE Admin & Open Audit Logs',
      route: '/audit-logs',
      description: 'Trace the entire sequence of upload, validation finding, record correction, review action, and verification event.',
      outcome: 'Every transition is provably documented with actor identities and unique correlation IDs.',
      icon: History,
      color: 'text-violet-400 border-violet-500/30',
    },
  ];

  const handleExecuteStep = async (step: any) => {
    await demoLogin(step.role);
    navigate(step.route);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in text-xs">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181818] border border-[#333333] text-neutral-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Interactive Platform Guided Tour</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          "From Fragmented Records to Trusted Academic Data"
        </h1>
        <p className="text-neutral-400 mt-2 text-xs sm:text-sm">
          A guided 10-step end-to-end interactive journey demonstrating how CREDEN resolves AICTE student identity challenges.
        </p>
      </div>

      {/* Stepper Grid */}
      <div className="space-y-4">
        {steps.map((st) => {
          const Icon = st.icon;
          const isCurrent = currentStep === st.step;

          return (
            <div
              key={st.step}
              className={`p-6 rounded-2xl border transition-all ${
                isCurrent
                  ? 'bg-[#141414] border-white shadow-xl shadow-white/5'
                  : 'bg-[#121212]/80 border-[#222222] hover:border-neutral-500'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-10 h-10 rounded-xl bg-[#0A0A0A] border flex items-center justify-center font-bold text-sm ${st.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        {st.roleName}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">{st.title}</h3>
                    <p className="text-neutral-300 leading-relaxed text-xs">{st.description}</p>
                    <p className="text-[11px] text-emerald-400 font-semibold pt-1">
                      Expected Outcome: {st.outcome}
                    </p>
                  </div>
                </div>

                <div className="self-end md:self-center">
                  <button
                    onClick={() => {
                      setCurrentStep(st.step);
                      handleExecuteStep(st);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-white text-black font-extrabold text-xs shadow-md shadow-white/10 hover:bg-neutral-200 hover:scale-[1.02] transition-all flex items-center gap-2 whitespace-nowrap"
                  >
                    <span>{st.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

