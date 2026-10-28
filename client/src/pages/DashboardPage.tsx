import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiClient } from '../services/api';
import { useAuth } from '../features/auth/AuthContext';
import { DashboardOverview } from '../types';
import {
  Building2,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  Filter,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  GraduationCap,
  QrCode,
  Search,
  Copy,
  Check,
  Award,
  FileText,
  Lock,
  Unlock,
  Download,
  Briefcase,
  Sparkles,
  BookOpen,
  ArrowRight,
  UserCheck,
  X,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface InspectedSlot {
  id?: string;
  title: string;
  value: string | number;
  trend: string;
  tooltip?: string;
  icon: any;
  color: string;
  bgColor: string;
  link?: string;
  details?: {
    breakdown?: Array<{ label: string; value: string | number; badge?: string; badgeColor?: string }>;
    calculation?: string;
    authority?: string;
    auditStandard?: string;
  };
}

const fallbackOverviewData: DashboardOverview = {
  kpis: {
    totalInstitutions: { value: 12, trend: '+2 from last cycle', tooltip: 'Approved technical institutes' },
    totalStudentRecords: { value: 1522, trend: '+12.4% vs 2024-25', tooltip: 'Verified student records' },
    submittedThisMonth: { value: 1522, trend: '+450 new submissions', tooltip: 'Records submitted this cycle' },
    validationPassRate: { value: '96.2%', trend: '+3.1% improved', tooltip: 'APAAR checksum and schema validation rate' },
    pendingSubmissions: { value: 0, trend: 'All batches ingested', tooltip: 'Batches awaiting processing' },
    duplicateEnrolments: { value: 2, trend: 'Active investigative review', tooltip: 'Cross-institution duplicate APAAR or identity clashes' },
    institutionsExceedingIntake: { value: 1, trend: 'COEP Computer Engineering flag', tooltip: 'Institutions with enrolled > sanctioned intake' },
    recordsRequiringReview: { value: 4, trend: 'Identity format discrepancy', tooltip: 'Flagged records requiring registrar review' },
  },
  intakeSummary: {
    totalApprovedCapacity: 1600,
    totalActualEnrolled: 1522,
    remainingCapacity: 78,
    nationalUtilizationRate: 95.1,
  },
  submissionStatusCounts: {
    'Accepted': 1478,
    'Flagged': 38,
    'Review Pending': 6,
  },
  issueDistribution: [
    { name: 'Over Intake Breach', count: 12, color: '#ef4444' },
    { name: 'Duplicate APAAR', count: 8, color: '#f59e0b' },
    { name: 'Format Discrepancy', count: 18, color: '#3b82f6' },
  ],
  regionalData: [
    { state: 'Maharashtra', institutions: 4, enrolled: 520, approved: 540, utilizationRate: 96.3 },
    { state: 'Karnataka', institutions: 3, enrolled: 410, approved: 420, utilizationRate: 97.6 },
    { state: 'Delhi NCR', institutions: 2, enrolled: 290, approved: 320, utilizationRate: 90.6 },
    { state: 'Tamil Nadu', institutions: 3, enrolled: 302, approved: 320, utilizationRate: 94.4 },
  ],
  institutionUtilization: [
    { name: 'COEP Technological University', code: 'COEP-PUNE', approved: 120, enrolled: 128, utilizationRate: 106.7 },
    { name: 'RV College of Engineering', code: 'RVCE-BLR', approved: 180, enrolled: 172, utilizationRate: 95.5 },
    { name: 'Delhi Technological University', code: 'DTU-DEL', approved: 200, enrolled: 194, utilizationRate: 97.0 },
    { name: 'VJTI Mumbai', code: 'VJTI-MUM', approved: 150, enrolled: 145, utilizationRate: 96.7 },
    { name: 'PSG College of Technology', code: 'PSG-CBE', approved: 160, enrolled: 152, utilizationRate: 95.0 },
  ],
  recentActivity: [
    { id: '1', action: 'Over-intake compliance alert generated for COEP Pune', actorEmail: 'system.governance@aicte-india.org', actorRole: 'SYSTEM_BOT', resourceType: 'INSTITUTION', outcome: 'WARNING', timestamp: new Date().toISOString() },
    { id: '2', action: 'Verified student credential token validated via employer portal', actorEmail: 'verifier@tcs.com', actorRole: 'VERIFIER', resourceType: 'VERIFICATION', outcome: 'SUCCESS', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: '3', action: 'Lateral entry student enrolment batch approved', actorEmail: 'registrar@coep.ac.in', actorRole: 'INSTITUTION_ADMIN', resourceType: 'ENROLMENT', outcome: 'SUCCESS', timestamp: new Date(Date.now() - 7200000).toISOString() },
  ],
};

export const DashboardPage: React.FC = () => {
  const { user, activeRole } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [academicYear, setAcademicYear] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Formal slot animation and inspection modal states
  const [inspectedSlot, setInspectedSlot] = useState<InspectedSlot | null>(null);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);

  // Student specific states
  const [showFullApaar, setShowFullApaar] = useState<boolean>(false);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);

  // Verifier specific states
  const [searchToken, setSearchToken] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      const params: Record<string, string> = {};
      if (academicYear) params.academicYear = academicYear;
      if (selectedState) params.state = selectedState;

      const res = await ApiClient.getDashboardOverview(params);
      if (res.success && res.kpis) {
        setData(res);
      } else {
        setData(fallbackOverviewData);
      }
    } catch {
      // Resilient fallback when offline or deployed on static/Vercel host
      setData(fallbackOverviewData);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [academicYear, selectedState, activeRole]);

  const handleCopyToken = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleInspectSlot = (slot: InspectedSlot, slotId: string) => {
    setActiveSlotId(slotId);
    // Subtle delay to showcase the ripple click wave on the slot card before opening the formal modal
    setTimeout(() => {
      setInspectedSlot(slot);
    }, 180);
  };

  const handleVerifySearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchToken.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setVerificationResult({
        candidateName: 'Aarav Sharma',
        apaarId: '2024 • 8839 • 9012',
        institution: 'College of Engineering Pune (COEP Tech University)',
        institutionCode: 'AICTE-MH-1029',
        degree: 'Bachelor of Technology (Computer Engineering)',
        enrolmentNumber: '2025-CSE-001',
        cgpa: '8.92 / 10.00',
        admissionStatus: 'Sanctioned AICTE Quota • AY 2025-2026',
        validationStatus: 'AUTHENTIC & ACCREDITED',
        tamperCheck: 'PASSED (SHA-256 Merkle Signature Verified)',
        blockchainProof: '0x9fa8e71b2d49c819a...55fc',
        verifiedAt: new Date().toISOString(),
      });
    }, 600);
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-neutral-400">Loading academic telemetry...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: INSTITUTION ADMIN (COEP)
  // ==========================================
  const renderInstitutionAdminDashboard = () => {
    const coepTotalEnrolled = 128;
    const coepApprovedCapacity = 120;
    const coepUtilization = Math.round((coepTotalEnrolled / coepApprovedCapacity) * 100);

    const departments = [
      { name: 'B.Tech Computer Engineering', enrolled: 128, approved: 120, status: 'EXCEEDED', flag: 'Over-Intake Breach (+8)' },
      { name: 'B.Tech Electronics & Telecommunication', enrolled: 98, approved: 120, status: 'NORMAL', flag: 'Within Sanction' },
      { name: 'B.Tech Mechanical Engineering', enrolled: 60, approved: 60, status: 'CAPACITY', flag: '100% Filled' },
      { name: 'M.Tech Artificial Intelligence', enrolled: 24, approved: 30, status: 'NORMAL', flag: '6 Seats Vacant' },
    ];

    const batches = [
      { id: 'BATCH-COEP-2025-01', name: 'AY 2025-2026 UG Regular Admission', records: 128, valid: 126, errors: 2, status: 'NEEDS_REVIEW', date: 'Oct 24, 2025' },
      { id: 'BATCH-COEP-2024-02', name: 'AY 2024-2025 Lateral Entry Ingestion', records: 18, valid: 18, errors: 0, status: 'VERIFIED', date: 'Jul 15, 2025' },
    ];

    const instSlots: InspectedSlot[] = [
      {
        id: 'coep-enrolled',
        title: 'Total Enrolled Students',
        value: coepTotalEnrolled,
        trend: '+12.4% Admissions',
        tooltip: 'Total students actively enrolled across all registered departments in COEP.',
        icon: Users,
        color: 'text-white',
        bgColor: 'bg-white/10 border-white/20',
        link: '/students',
        details: {
          authority: 'COEP Directorate of Academic Admittance',
          calculation: 'Aggregated active student records in AY 2025-26.',
          auditStandard: 'AICTE Institutional Registry Mandate',
          breakdown: [
            { label: 'B.Tech Computer Engineering', value: '128 Enrolled', badge: '106.7%', badgeColor: 'text-rose-400 bg-rose-500/10' },
            { label: 'B.Tech Electronics & Telecom', value: '98 Enrolled', badge: '81.7%', badgeColor: 'text-neutral-300 bg-neutral-800' },
            { label: 'B.Tech Mechanical Eng', value: '60 Enrolled', badge: '100%', badgeColor: 'text-amber-400 bg-amber-500/10' },
            { label: 'M.Tech Artificial Intelligence', value: '24 Enrolled', badge: '80%', badgeColor: 'text-emerald-400 bg-emerald-500/10' },
          ],
        },
      },
      {
        id: 'coep-capacity',
        title: 'Sanctioned Intake Capacity',
        value: `${coepApprovedCapacity} Seats`,
        trend: `${coepUtilization}% (Over Capacity)`,
        tooltip: 'Approved total seats sanctioned by AICTE Western Regional Office.',
        icon: Layers,
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10 border-amber-500/20',
        link: '/admissions',
        details: {
          authority: 'AICTE Western Regional Committee — Sanction Ref: APH-MH-1029',
          calculation: 'Sum of approved quota seats across accredited engineering programs.',
          auditStandard: 'Statutory Approved Seat Threshold',
          breakdown: [
            { label: 'Approved Annual Sanction', value: '120 Seats', badge: 'Sanctioned', badgeColor: 'text-white bg-white/10' },
            { label: 'Actual Active Enrolments', value: '128 Students', badge: 'Active', badgeColor: 'text-rose-400 bg-rose-500/10' },
            { label: 'Excess Capacity Breach', value: '+8 Admissions', badge: 'Action Required', badgeColor: 'text-rose-400 bg-rose-500/10' },
          ],
        },
      },
      {
        id: 'coep-passrate',
        title: 'APAAR Validation Pass Rate',
        value: '98.4%',
        trend: '126 / 128 Validated',
        tooltip: 'Percentage of student IDs verified with Verhoeff mathematical checksum.',
        icon: CheckCircle2,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10 border-emerald-500/20',
        link: '/validation',
        details: {
          authority: 'National Academic Depository (NAD) / APAAR National Service',
          calculation: 'Validated APAAR 12-Digit Identifiers / Total Ingested Records.',
          auditStandard: 'UIDAI Mathematical Verhoeff Checksum Standard',
          breakdown: [
            { label: 'Valid APAAR Digitally Linked', value: '126 Records', badge: '98.4%', badgeColor: 'text-emerald-400 bg-emerald-500/10' },
            { label: 'Checksum / Format Verified', value: '128 Records', badge: '100%', badgeColor: 'text-white bg-white/10' },
            { label: 'Identity Cross-Match Passed', value: '126 Records', badge: '98.4%', badgeColor: 'text-emerald-400 bg-emerald-500/10' },
          ],
        },
      },
      {
        id: 'coep-anomalies',
        title: 'Pending Anomaly Flags',
        value: '2 Records',
        trend: 'Officer Signoff Required',
        tooltip: 'Anomalies requiring COEP administrative explanation before term freeze.',
        icon: AlertCircle,
        color: 'text-rose-400',
        bgColor: 'bg-rose-500/10 border-rose-500/20',
        link: '/validation',
        details: {
          authority: 'AICTE Institutional Grievance & Anomaly Cell',
          calculation: 'Discrepancies identified during automated cross-check.',
          auditStandard: 'Automated Multi-Enrolment Prevention Matrix',
          breakdown: [
            { label: 'B.Tech CSE Excess Intake', value: '1 Case', badge: 'Critical Flag', badgeColor: 'text-rose-400 bg-rose-500/10' },
            { label: 'Cross-Institution Match Candidate', value: '1 Case', badge: 'Under Review', badgeColor: 'text-amber-400 bg-amber-500/10' },
          ],
        },
      },
    ];

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Institutional Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                College of Engineering Pune (COEP)
              </h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Institutional Admin Portal
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              AICTE Institution Code: <span className="font-mono text-neutral-200">AICTE-MH-1029</span> • Autonomous State University • Pune, Maharashtra
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/students/upload')}
              className="px-4 py-2 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 text-xs transition-all flex items-center gap-2 shadow-md shadow-white/10"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Bulk Ingest Students</span>
            </button>
            <button
              onClick={() => navigate('/students')}
              className="px-4 py-2 rounded-xl bg-[#121212] text-neutral-200 hover:text-white border border-[#262626] text-xs font-semibold hover:border-neutral-500 transition-all"
            >
              Manage Student Records
            </button>
          </div>
        </div>

        {/* Urgent AICTE Compliance Banner */}
        <div className="p-5 rounded-2xl bg-[#121212] border border-rose-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">Intake Capacity Breach Detected in B.Tech Computer Engineering</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                  Critical Flag
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Active student enrolments (128) exceed the AICTE sanctioned intake of 120. Institutional explanation must be submitted to the AICTE Western Regional Office before term finalization.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/validation')}
            className="px-3.5 py-1.5 rounded-lg bg-rose-500 text-white font-bold hover:bg-rose-600 text-xs transition-colors flex-shrink-0"
          >
            Review Flagged Records
          </button>
        </div>

        {/* COEP Institutional KPIs with Formal Animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {instSlots.map((slot, idx) => {
            const Icon = slot.icon;
            const isClicked = activeSlotId === slot.id;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.965 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                onClick={() => handleInspectSlot(slot, slot.id || `coep-${idx}`)}
                className={`formal-slot formal-sheen-effect p-5 rounded-2xl bg-[#121212] border cursor-pointer group flex flex-col justify-between relative ${
                  isClicked
                    ? 'formal-slot-active border-white shadow-xl shadow-white/10 ring-2 ring-white/20'
                    : 'border-[#222222] hover:border-neutral-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-neutral-400">{slot.title}</span>
                    <div className={`w-8 h-8 rounded-lg ${slot.bgColor} flex items-center justify-center ${slot.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-white">{slot.value}</div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#262626]/80 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">{slot.trend}</span>
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 font-medium">
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Department-wise Intake Breakdown & Batches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Breakdown */}
          <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Department Sanctioned Intake vs Actuals</h3>
                <p className="text-xs text-neutral-400">AY 2025-2026 Active Admissions</p>
              </div>
              <button
                onClick={() => navigate('/admissions')}
                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-semibold"
              >
                <span>Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {departments.map((dept, idx) => {
                const pct = Math.min(100, Math.round((dept.enrolled / dept.approved) * 100));
                const isOver = dept.enrolled > dept.approved;
                return (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#222222]">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-white">{dept.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isOver
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : dept.enrolled === dept.approved
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {dept.flag}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-[#1A1A1A] overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isOver ? 'bg-rose-500' : 'bg-white'}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-mono font-bold text-neutral-200">
                        {dept.enrolled} / {dept.approved}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Institutional Batches */}
          <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Recent Ingestion Batches</h3>
                  <p className="text-xs text-neutral-400">Institutional upload audit trail</p>
                </div>
                <button
                  onClick={() => navigate('/students/upload')}
                  className="text-xs text-neutral-300 hover:text-white font-semibold"
                >
                  Upload New →
                </button>
              </div>

              <div className="space-y-3">
                {batches.map((b) => (
                  <div key={b.id} className="p-4 rounded-xl bg-[#0A0A0A] border border-[#222222] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{b.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.status === 'VERIFIED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {b.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-neutral-400">
                      <span>Batch ID: <span className="font-mono text-neutral-300">{b.id}</span></span>
                      <span>{b.date}</span>
                    </div>
                    <div className="text-[11px] text-neutral-400 flex items-center gap-3 pt-1 border-t border-[#1C1C1C]">
                      <span>Total: <strong className="text-white">{b.records}</strong></span>
                      <span>Valid: <strong className="text-emerald-400">{b.valid}</strong></span>
                      {b.errors > 0 && <span>Flagged: <strong className="text-rose-400">{b.errors}</strong></span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#222222] flex items-center justify-between text-xs text-neutral-400">
              <span>Institution Affiliation: Autonomous / SPPU</span>
              <span className="font-mono text-neutral-300">Western Region</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // VIEW 2: STUDENT (Aarav Sharma)
  // ==========================================
  const renderStudentDashboard = () => {
    const student = {
      name: 'Aarav Sharma',
      apaarId: '202488399012',
      maskedApaar: '•••• •••• 9012',
      institution: 'College of Engineering Pune (COEP Tech University)',
      institutionCode: 'AICTE-MH-1029',
      course: 'Bachelor of Technology (B.Tech)',
      specialization: 'Computer Engineering',
      academicYear: '2025-2026',
      term: 'Semester 5 (3rd Year)',
      rollNo: '2025-CSE-001',
      enrolmentStatus: 'ACTIVE_SANCTIONED',
      abcId: 'ABC-MH-2022-774901',
      validationScore: 98,
      creditsAccumulated: 114,
      creditsRequired: 160,
      cgpa: '8.92',
      shareToken: 'CRD-VFY-AARAV-9012',
      lastVerified: 'October 27, 2025 by Infosys Campus Recruitment',
    };

    const studentSlots: InspectedSlot[] = [
      {
        id: 'stu-cgpa',
        title: 'Cumulative GPA (CGPA)',
        value: student.cgpa,
        trend: 'Top 5% of Batch',
        tooltip: 'Cumulative Grade Point Average across 5 completed engineering semesters.',
        icon: Award,
        color: 'text-white',
        bgColor: 'bg-white/10 border-white/20',
        details: {
          authority: 'COEP Examination & Evaluation Cell',
          calculation: 'Sum (Credits × Grade Points) / Total Earned Credits.',
          auditStandard: 'SPPU 10-Point Absolute Grading System',
          breakdown: [
            { label: 'Semester 1 & 2 (First Year)', value: '8.84 CGPA', badge: 'Distinction', badgeColor: 'text-white bg-white/10' },
            { label: 'Semester 3 & 4 (Second Year)', value: '8.96 CGPA', badge: 'Distinction', badgeColor: 'text-white bg-white/10' },
            { label: 'Semester 5 (Current Mid-Term)', value: '8.92 CGPA', badge: 'Active', badgeColor: 'text-emerald-400 bg-emerald-500/10' },
          ],
        },
      },
      {
        id: 'stu-credits',
        title: 'Credits Earned / Required',
        value: `${student.creditsAccumulated} / ${student.creditsRequired}`,
        trend: 'On Track for 2026',
        tooltip: 'Academic credits recognized and stored in Academic Bank of Credits (ABC).',
        icon: BookOpen,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10 border-emerald-500/20',
        details: {
          authority: 'National Academic Depository & Academic Bank of Credits',
          calculation: 'Total accredited core, elective, and laboratory credits recognized.',
          auditStandard: 'UGC National Credit Framework (NCrF)',
          breakdown: [
            { label: 'Core Engineering Credits', value: '78 Credits', badge: 'Completed', badgeColor: 'text-emerald-400 bg-emerald-500/10' },
            { label: 'Elective & Open Courses', value: '24 Credits', badge: 'Completed', badgeColor: 'text-emerald-400 bg-emerald-500/10' },
            { label: 'Capstone / Project Studio', value: '12 Credits', badge: 'In Progress', badgeColor: 'text-amber-400 bg-amber-500/10' },
          ],
        },
      },
      {
        id: 'stu-trust',
        title: 'Identity Trust Score',
        value: `${student.validationScore}%`,
        trend: 'Cryptographically Sealed',
        tooltip: 'Verification confidence score generated from APAAR and institutional records.',
        icon: ShieldCheck,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10 border-emerald-500/20',
        details: {
          authority: 'AICTE-CREDEN Identity Governance Engine',
          calculation: 'Verhoeff checksum valid + biometric ABC link + zero concurrent enrolments.',
          auditStandard: 'DPDP Act 2023 Tamper-Proof Cryptographic Signature',
          breakdown: [
            { label: 'APAAR Checksum Validation', value: '100% Passed', badge: 'Verhoeff', badgeColor: 'text-emerald-400 bg-emerald-500/10' },
            { label: 'Institution Admission Match', value: '100% Match', badge: 'AICTE-MH-1029', badgeColor: 'text-white bg-white/10' },
            { label: 'Cross-Institution Duplicate Check', value: 'Zero Flags', badge: 'Unique', badgeColor: 'text-emerald-400 bg-emerald-500/10' },
          ],
        },
      },
    ];

    return (
      <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
        {/* Student Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Student Academic Credential & Identity Portal
              </h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                AICTE Verified Identity
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Official Digital Academic Identity linked to APAAR / Academic Bank of Credits (ABC) National Registry
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopyToken(student.shareToken)}
              className="px-3.5 py-2 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 text-xs transition-all flex items-center gap-2 shadow-md shadow-white/10"
            >
              {copiedToken ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedToken ? 'Token Copied!' : 'Copy Employer Token'}</span>
            </button>
          </div>
        </div>

        {/* Digital Holographic APAAR ID Card & Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Holographic ID Card (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-neutral-700 via-neutral-400 to-neutral-700 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>

              <div className="relative p-6 rounded-2xl bg-[#0A0A0A] border border-[#2E2E2E] shadow-2xl flex flex-col justify-between aspect-[1.58/1] overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-neutral-400 tracking-wider uppercase block">
                        Academic Bank of Credits
                      </span>
                      <span className="text-[11px] font-extrabold text-white tracking-tight">
                        CREDEN National Academic Identity
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    VERIFIED
                  </span>
                </div>

                <div className="my-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-600 p-[1.5px] flex-shrink-0">
                    <div className="w-full h-full bg-[#121212] rounded-[10px] flex items-center justify-center font-extrabold text-xl text-white">
                      AS
                    </div>
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-base font-extrabold text-white leading-tight">{student.name}</h3>
                    <p className="text-[11px] text-neutral-300 font-medium leading-snug mt-0.5">{student.course}</p>
                    <p className="text-[10px] text-neutral-400 truncate mt-0.5">{student.institution}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#222222] flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block">
                      APAAR ID (Automated Permanent Academic Account Registry)
                    </span>
                    <span className="font-mono text-xs font-bold text-white tracking-wider">
                      {showFullApaar ? student.apaarId.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : student.maskedApaar}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowFullApaar(!showFullApaar)}
                    className="p-1.5 rounded-lg bg-[#181818] border border-[#2E2E2E] text-neutral-400 hover:text-white transition-colors"
                    title={showFullApaar ? 'Hide full APAAR ID' : 'Reveal full APAAR ID'}
                  >
                    {showFullApaar ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 mt-3 text-center">
              Secured with SHA-256 Merkle Proof • AICTE Institution Code: AICTE-MH-1029
            </p>
          </div>

          {/* Academic Profile & Verification Metrics (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Quick Stat Pill Cards with Formal Animation */}
            <div className="grid grid-cols-3 gap-3">
              {studentSlots.map((slot, idx) => {
                const isClicked = activeSlotId === slot.id;
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -3, scale: 1.01 }}
                    whileTap={{ scale: 0.965 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    onClick={() => handleInspectSlot(slot, slot.id || `stu-${idx}`)}
                    className={`formal-slot formal-sheen-effect p-4 rounded-xl bg-[#121212] border cursor-pointer relative ${
                      isClicked
                        ? 'formal-slot-active border-white shadow-xl shadow-white/10 ring-2 ring-white/20'
                        : 'border-[#222222] hover:border-neutral-400'
                    }`}
                  >
                    <span className="text-[11px] font-medium text-neutral-400">{slot.title}</span>
                    <div className="text-xl font-extrabold text-white mt-1">{slot.value}</div>
                    <span className="text-[10px] text-emerald-400 font-semibold">{slot.trend}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* Credential Details Card */}
            <div className="p-5 rounded-2xl bg-[#121212] border border-[#222222] space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Academic Enrolment Telemetry
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-neutral-500 block text-[11px]">Enrolment Number</span>
                  <span className="font-mono font-semibold text-neutral-200">{student.rollNo}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Academic Session</span>
                  <span className="font-semibold text-neutral-200">{student.academicYear} ({student.term})</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">ABC National ID</span>
                  <span className="font-mono font-semibold text-neutral-200">{student.abcId}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Admission Category</span>
                  <span className="font-semibold text-emerald-400">AICTE Sanctioned Merit Quota</span>
                </div>
              </div>
            </div>

            {/* Instant Employer Verification Box */}
            <div className="p-5 rounded-2xl bg-[#121212] border border-[#222222] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Employer & Third-Party Verification Token
                </span>
                <span className="font-mono text-sm font-bold text-white mt-0.5 block">
                  {student.shareToken}
                </span>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Last verified by: {student.lastVerified}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/verification')}
                  className="px-3.5 py-2 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#2E2E2E] text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Show Verifier QR</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // VIEW 3: AUTHORIZED VERIFIER (Infosys HR)
  // ==========================================
  const renderVerifierDashboard = () => {
    const verifiedHistory = [
      { id: 'INF-VFY-8812', name: 'Aarav Sharma', institution: 'College of Engineering Pune', degree: 'B.Tech CSE', apaarMasked: '•••• •••• 9012', date: 'Just now', status: 'GENUINE' },
      { id: 'INF-VFY-8810', name: 'Priya Patel', institution: 'Veermata Jijabai Tech Inst (VJTI)', degree: 'B.Tech IT', apaarMasked: '•••• •••• 4421', date: 'Yesterday', status: 'GENUINE' },
      { id: 'INF-VFY-8805', name: 'Rohan Verma', institution: 'Indian Institute of Tech Bombay', degree: 'B.Tech ECE', apaarMasked: '•••• •••• 1109', date: '2 days ago', status: 'GENUINE' },
      { id: 'INF-VFY-8799', name: 'Ananya Deshmukh', institution: 'COEP Technological University', degree: 'M.Tech AI', apaarMasked: '•••• •••• 3390', date: '3 days ago', status: 'GENUINE' },
    ];

    const verifierSlots: InspectedSlot[] = [
      {
        id: 'vfy-screened',
        title: 'Candidates Screened',
        value: 48,
        trend: 'Campus Placement Cycle',
        tooltip: 'Total candidate background checks processed through CREDEN APAAR engine.',
        icon: Users,
        color: 'text-white',
        bgColor: 'bg-white/10 border-white/20',
        details: {
          authority: 'Infosys Campus Talent Background Verification Directorate',
          calculation: 'Authenticated credentials verified against the AICTE national repository.',
          auditStandard: 'NASSCOM / AICTE National Skill & Credential Verification Protocol',
          breakdown: [
            { label: 'Engineering Candidates Screened', value: '42 Candidates', badge: 'Tier-1', badgeColor: 'text-white bg-white/10' },
            { label: 'Post-Graduate / MCA Candidates', value: '6 Candidates', badge: 'PG', badgeColor: 'text-neutral-300 bg-neutral-800' },
            { label: 'Average Verification Response Time', value: '0.4 seconds', badge: 'Instant', badgeColor: 'text-emerald-400 bg-emerald-500/10' },
          ],
        },
      },
      {
        id: 'vfy-authentic',
        title: 'Verified Authentic',
        value: '48 (100%)',
        trend: 'Zero Fraudulent Claims',
        tooltip: 'Candidates with validated AICTE accredited enrolment and matched APAAR identity.',
        icon: CheckCircle2,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10 border-emerald-500/20',
        details: {
          authority: 'National AICTE-APAAR Credential Registry',
          calculation: 'Candidates passing all cryptographic Merkle proofs and degree authenticity.',
          auditStandard: 'ISO 27001 Cryptographic Ledger Proof',
          breakdown: [
            { label: '100% Validated Real-Time Records', value: '48 Records', badge: 'Certified', badgeColor: 'text-emerald-400 bg-emerald-500/10' },
            { label: 'Accredited Institution Confirmation', value: '100% Matched', badge: 'Accredited', badgeColor: 'text-white bg-white/10' },
          ],
        },
      },
      {
        id: 'vfy-tamper',
        title: 'Tamper Alerts',
        value: '0 Flags',
        trend: 'All Records Merkle Matched',
        tooltip: 'Discrepancies where candidate submitted transcript does not match registry hash.',
        icon: ShieldCheck,
        color: 'text-neutral-300',
        bgColor: 'bg-neutral-800 border-neutral-700',
        details: {
          authority: 'CREDEN Cryptographic Tamper Detection Engine',
          calculation: 'SHA-256 Merkle root hash comparisons between issued credential and blockchain proof.',
          auditStandard: 'W3C Verifiable Credentials Standard',
          breakdown: [
            { label: 'Hash Match Integrity', value: '100.0% Exact Match', badge: 'Intact', badgeColor: 'text-emerald-400 bg-emerald-500/10' },
            { label: 'Forged / Modified Transcripts', value: '0 Detected', badge: 'Clean', badgeColor: 'text-emerald-400 bg-emerald-500/10' },
          ],
        },
      },
      {
        id: 'vfy-pending',
        title: 'Active Verification Requests',
        value: '3 Pending',
        trend: 'Awaiting Student Consent',
        tooltip: 'Requests waiting for one-time OTP student consent under DPDP Act 2023.',
        icon: Clock,
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10 border-amber-500/20',
        details: {
          authority: 'Digital Personal Data Protection Act (DPDP) 2023 Compliance',
          calculation: 'Requests queued pending explicit digital student consent receipt.',
          auditStandard: 'DPDP 2023 Consent Artifact Specification',
          breakdown: [
            { label: 'Consent Sent via SMS / Email', value: '3 Candidates', badge: 'Pending', badgeColor: 'text-amber-400 bg-amber-500/10' },
            { label: 'Consent Expiry Window', value: '48 Hours Remaining', badge: 'Active', badgeColor: 'text-neutral-300 bg-neutral-800' },
          ],
        },
      },
    ];

    return (
      <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
        {/* Verifier Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Authorized Verifier Workspace
              </h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-black">
                Infosys Campus Talent BGV
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Real-time APAAR verification, tamper-proof academic credentials validation & AICTE accreditation audit
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/verification')}
              className="px-4 py-2 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 text-xs transition-all flex items-center gap-2 shadow-md shadow-white/10"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Full Verification Engine</span>
            </button>
          </div>
        </div>

        {/* Verifier Search Bar */}
        <div className="p-6 rounded-2xl bg-[#121212] border border-[#2E2E2E] shadow-xl">
          <h3 className="text-sm font-bold text-white mb-1">Instant Candidate Credential Lookup</h3>
          <p className="text-xs text-neutral-400 mb-4">
            Verify academic credentials via 12-digit APAAR ID, student enrolment code, or verification share token.
          </p>

          <form onSubmit={handleVerifySearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchToken}
                onChange={(e) => setSearchToken(e.target.value)}
                placeholder="Enter APAAR ID (e.g. 202488399012) or Token (e.g. CRD-VFY-AARAV-9012)..."
                className="w-full bg-[#0A0A0A] border border-[#2E2E2E] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-5 py-2 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-white/10 flex-shrink-0"
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>Verify Candidate</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchToken('CRD-VFY-AARAV-9012');
                handleVerifySearch();
              }}
              className="px-3.5 py-2 rounded-xl bg-[#181818] text-neutral-300 hover:text-white border border-[#2E2E2E] text-xs font-semibold transition-colors flex-shrink-0"
            >
              Auto-fill Aarav Sharma
            </button>
          </form>

          {/* Verification Result Card */}
          {verificationResult && (
            <div className="mt-6 p-5 rounded-xl bg-[#0A0A0A] border border-emerald-500/30 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{verificationResult.candidateName}</h4>
                    <p className="text-[11px] text-neutral-400">APAAR: {verificationResult.apaarId}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {verificationResult.validationStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs mt-4">
                <div>
                  <span className="text-neutral-500 block text-[11px]">Degree & Discipline</span>
                  <span className="font-semibold text-white">{verificationResult.degree}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Accredited Institution</span>
                  <span className="font-semibold text-white">{verificationResult.institution}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Academic Performance</span>
                  <span className="font-semibold text-emerald-400">{verificationResult.cgpa} (Merit Distinction)</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Tamper Proof Check</span>
                  <span className="font-mono text-emerald-400 font-semibold">{verificationResult.tamperCheck}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Enrolment Admission</span>
                  <span className="text-neutral-300 font-semibold">{verificationResult.admissionStatus}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Cryptographic Merkle Proof</span>
                  <span className="font-mono text-neutral-400 text-[10px]">{verificationResult.blockchainProof}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Verifier Statistics with Formal Animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {verifierSlots.map((slot, idx) => {
            const Icon = slot.icon;
            const isClicked = activeSlotId === slot.id;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.965 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                onClick={() => handleInspectSlot(slot, slot.id || `vfy-${idx}`)}
                className={`formal-slot formal-sheen-effect p-5 rounded-2xl bg-[#121212] border cursor-pointer group flex flex-col justify-between relative ${
                  isClicked
                    ? 'formal-slot-active border-white shadow-xl shadow-white/10 ring-2 ring-white/20'
                    : 'border-[#222222] hover:border-neutral-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-neutral-400">{slot.title}</span>
                    <div className={`w-8 h-8 rounded-lg ${slot.bgColor} flex items-center justify-center ${slot.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-white">{slot.value}</div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#262626]/80 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">{slot.trend}</span>
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 font-medium">
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Recent Verification Audit History */}
        <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Recent Candidate Background Verifications</h3>
              <p className="text-xs text-neutral-400">Cryptographically logged verification requests</p>
            </div>
            <span className="text-xs text-neutral-400 font-semibold">ISO 27001 Certified Log</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0A0A] text-neutral-400 border-b border-[#222222]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Verification Token</th>
                  <th className="py-2.5 px-3 font-semibold">Candidate</th>
                  <th className="py-2.5 px-3 font-semibold">Institution</th>
                  <th className="py-2.5 px-3 font-semibold">Programme</th>
                  <th className="py-2.5 px-3 font-semibold">APAAR ID</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {verifiedHistory.map((row) => (
                  <tr key={row.id} className="hover:bg-[#1A1A1A]/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-neutral-300">{row.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">{row.name}</td>
                    <td className="py-2.5 px-3 text-neutral-300">{row.institution}</td>
                    <td className="py-2.5 px-3 text-neutral-400">{row.degree}</td>
                    <td className="py-2.5 px-3 font-mono text-neutral-400">{row.apaarMasked}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // VIEW 4: AICTE ADMIN (National Governance)
  // ==========================================
  const renderAicteAdminDashboard = () => {
    const { kpis, intakeSummary, issueDistribution, submissionStatusCounts, institutionUtilization, regionalData, recentActivity } = data;

    const getKpiDetails = (title: string): InspectedSlot['details'] => {
      switch (title) {
        case 'Total Institutions':
          return {
            authority: 'AICTE Approval Process Handbook (APH 2025-26)',
            calculation: 'Count of active AICTE-approved institutions with active student enrolment telemetry enabled.',
            auditStandard: 'National Institutional Regulatory Matrix (NIRF / AICTE Portal)',
            breakdown: [
              { label: 'Autonomous Technical Universities', value: '8 Institutions', badge: 'Tier-1', badgeColor: 'text-white bg-white/10' },
              { label: 'Affiliated Technical Colleges', value: '2 Institutions', badge: 'State University', badgeColor: 'text-neutral-300 bg-neutral-800' },
              { label: 'Approved PGDM / Management B-Schools', value: '2 Institutions', badge: 'Management', badgeColor: 'text-neutral-300 bg-neutral-800' },
              { label: 'Western / Northern / Southern Regional Oversight', value: '6 States Active', badge: 'National', badgeColor: 'text-emerald-400 bg-emerald-500/10' },
            ],
          };
        case 'Total Student Records':
          return {
            authority: 'Ministry of Education & AICTE Digital Identity Mandate',
            calculation: 'Sum of authenticated student enrolment profiles submitted through CSV and API integrations.',
            auditStandard: 'ISO 27001 / DPDP Act 2023 Student Data Isolation',
            breakdown: [
              { label: 'APAAR Digitally Validated & Linked', value: `${kpis.totalStudentRecords.value - 44} Records`, badge: '97.1%', badgeColor: 'text-emerald-400 bg-emerald-500/10' },
              { label: 'Validation Pipeline Ingestion', value: '26 Records', badge: 'Active Sync', badgeColor: 'text-white bg-white/10' },
              { label: 'Flagged for Institutional Correction', value: '18 Records', badge: 'Action Required', badgeColor: 'text-amber-400 bg-amber-500/10' },
              { label: 'Active Sanctioned Enrolment Status', value: '100% On-Roll', badge: 'AY 2025-26', badgeColor: 'text-white bg-white/10' },
            ],
          };
        case 'Submitted This Month':
          return {
            authority: 'AICTE Admissions & Enrolment Portal (AEP)',
            calculation: 'Number of student records ingested across all approved institutions within the past 30 days.',
            auditStandard: 'Rolling 30-Day Window (Audit Log Verified)',
            breakdown: [
              { label: 'Current Term Regular Admissions', value: `${kpis.submittedThisMonth.value} Records`, badge: 'AY 2025-26', badgeColor: 'text-emerald-400 bg-emerald-500/10' },
              { label: 'Processed via Bulk CSV Ingestion', value: '11 Batches', badge: 'CSV / XLS', badgeColor: 'text-white bg-white/10' },
              { label: 'Direct Institutional API Ingestions', value: '1 Live Stream', badge: 'REST API', badgeColor: 'text-white bg-white/10' },
              { label: 'Average Pipeline Validation Time', value: '1.2s per 500 rows', badge: 'Optimal', badgeColor: 'text-emerald-400 bg-emerald-500/10' },
            ],
          };
        case 'APAAR Pass Rate':
          return {
            authority: 'National Academic Depository (NAD) & Verhoeff Algorithm',
            calculation: '(Valid APAAR 12-Digit Checksums / Total Records Submitted) × 100',
            auditStandard: 'UIDAI Verhoeff Checksum & Format Specification',
            breakdown: [
              { label: 'Verhoeff Checksum Check', value: '99.4% Passed', badge: 'Mathematical Proof', badgeColor: 'text-emerald-400 bg-emerald-500/10' },
              { label: '12-Digit Numerical Format Validity', value: '99.8% Passed', badge: 'Format Compliant', badgeColor: 'text-emerald-400 bg-emerald-500/10' },
              { label: 'Name & DOB Identity Cross-Match', value: '98.2% Consistency', badge: 'Identity Trust', badgeColor: 'text-emerald-400 bg-emerald-500/10' },
              { label: 'Overall Quality Trust Index', value: 'Level 4 Enterprise', badge: 'Certified', badgeColor: 'text-white bg-white/10' },
            ],
          };
        case 'Pending Submissions':
          return {
            authority: 'AICTE Institutional Compliance Cell',
            calculation: 'Batches currently in draft, validation queue, or requiring correction before acceptance.',
            auditStandard: 'Automated Real-Time Batch State Machine',
            breakdown: [
              { label: 'Active Pipeline Queue', value: '0 Batches Pending', badge: 'Operational', badgeColor: 'text-emerald-400 bg-emerald-500/10' },
              { label: 'Institutional Correction Requests', value: '1 Batch In-Review', badge: 'COEP Batch 01', badgeColor: 'text-amber-400 bg-amber-500/10' },
              { label: 'Pipeline Throughput Rate', value: '10,000 records / min', badge: 'Hardware Accelerated', badgeColor: 'text-white bg-white/10' },
            ],
          };
        case 'Duplicate Enrolments':
          return {
            authority: 'AICTE Anomaly & Multi-Enrolment Prevention Engine',
            calculation: 'Identical APAAR IDs or high-confidence phonetic candidate duplicates across institutions.',
            auditStandard: 'Explainable AICTE Graph Matching & Cross-Institution Traversal',
            breakdown: [
              { label: 'Cross-Institution Concurrent Admissions', value: '1 Flagged Case', badge: 'Critical Flag', badgeColor: 'text-rose-400 bg-rose-500/10' },
              { label: 'Duplicate Intra-Campus Submissions', value: '1 Flagged Case', badge: 'Reviewing', badgeColor: 'text-amber-400 bg-amber-500/10' },
              { label: 'False Positive Tolerance', value: '< 0.05%', badge: 'Deterministic', badgeColor: 'text-white bg-white/10' },
              { label: 'Investigation Status', value: 'Pending Institutional Explanation', badge: 'Western Region', badgeColor: 'text-rose-400 bg-rose-500/10' },
            ],
          };
        case 'Exceeding Intake':
          return {
            authority: 'AICTE Approval Process Handbook — Section 7.2',
            calculation: 'Total Active Enrolled Students > AICTE Sanctioned Capacity for Academic Year.',
            auditStandard: 'Statutory Approved Seat Threshold',
            breakdown: [
              { label: 'Identified Institutional Breaches', value: '1 Institution (COEP)', badge: 'Action Required', badgeColor: 'text-rose-400 bg-rose-500/10' },
              { label: 'Affected Programme', value: 'B.Tech Computer Engineering', badge: '128 / 120 Seats', badgeColor: 'text-rose-400 bg-rose-500/10' },
              { label: 'Excess Enrolment Count', value: '+8 Students over sanction', badge: 'Over-Intake', badgeColor: 'text-rose-400 bg-rose-500/10' },
              { label: 'Regulatory Action', value: 'Explanation Notice Initiated', badge: 'Formal SLA', badgeColor: 'text-amber-400 bg-amber-500/10' },
            ],
          };
        case 'Requiring Review':
        default:
          return {
            authority: 'AICTE Regional Office Anomaly Resolution Taskforce',
            calculation: 'Validation findings with confidence < 0.95 or requiring manual administrative signoff.',
            auditStandard: 'Human-in-the-Loop Governance Workflow',
            breakdown: [
              { label: 'Pending Officer Review', value: '2 Cases in Queue', badge: 'Priority High', badgeColor: 'text-amber-400 bg-amber-500/10' },
              { label: 'Average Resolution Time', value: '18.4 Hours', badge: 'Within SLA', badgeColor: 'text-emerald-400 bg-emerald-500/10' },
              { label: 'Autonomous Dispute Mechanism', value: 'Institution Appeal Portal Active', badge: 'Transparent', badgeColor: 'text-white bg-white/10' },
            ],
          };
      }
    };

    const kpiItems: InspectedSlot[] = [
      {
        id: 'aicte-inst',
        title: 'Total Institutions',
        value: kpis.totalInstitutions.value,
        trend: kpis.totalInstitutions.trend,
        tooltip: kpis.totalInstitutions.tooltip,
        icon: Building2,
        color: 'text-white',
        bgColor: 'bg-white/10 border-white/20',
        link: '/institutions',
        details: getKpiDetails('Total Institutions'),
      },
      {
        id: 'aicte-students',
        title: 'Total Student Records',
        value: kpis.totalStudentRecords.value.toLocaleString('en-IN'),
        trend: kpis.totalStudentRecords.trend,
        tooltip: kpis.totalStudentRecords.tooltip,
        icon: Users,
        color: 'text-neutral-200',
        bgColor: 'bg-neutral-800 border-neutral-700',
        link: '/students',
        details: getKpiDetails('Total Student Records'),
      },
      {
        id: 'aicte-month',
        title: 'Submitted This Month',
        value: kpis.submittedThisMonth.value,
        trend: kpis.submittedThisMonth.trend,
        tooltip: kpis.submittedThisMonth.tooltip,
        icon: Calendar,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10 border-emerald-500/20',
        link: '/students/upload',
        details: getKpiDetails('Submitted This Month'),
      },
      {
        id: 'aicte-passrate',
        title: 'APAAR Pass Rate',
        value: kpis.validationPassRate.value,
        trend: kpis.validationPassRate.trend,
        tooltip: kpis.validationPassRate.tooltip,
        icon: CheckCircle2,
        color: 'text-white',
        bgColor: 'bg-white/10 border-white/20',
        link: '/validation',
        details: getKpiDetails('APAAR Pass Rate'),
      },
      {
        id: 'aicte-pending',
        title: 'Pending Submissions',
        value: kpis.pendingSubmissions.value,
        trend: kpis.pendingSubmissions.trend,
        tooltip: kpis.pendingSubmissions.tooltip,
        icon: Clock,
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10 border-amber-500/20',
        link: '/students/upload',
        details: getKpiDetails('Pending Submissions'),
      },
      {
        id: 'aicte-duplicates',
        title: 'Duplicate Enrolments',
        value: kpis.duplicateEnrolments.value,
        trend: kpis.duplicateEnrolments.trend,
        tooltip: kpis.duplicateEnrolments.tooltip,
        icon: Layers,
        color: 'text-rose-400',
        bgColor: 'bg-rose-500/10 border-rose-500/20',
        link: '/validation',
        details: getKpiDetails('Duplicate Enrolments'),
      },
      {
        id: 'aicte-exceeding',
        title: 'Exceeding Intake',
        value: kpis.institutionsExceedingIntake.value,
        trend: kpis.institutionsExceedingIntake.trend,
        tooltip: kpis.institutionsExceedingIntake.tooltip,
        icon: AlertTriangle,
        color: 'text-rose-400',
        bgColor: 'bg-rose-500/10 border-rose-500/20',
        link: '/admissions',
        details: getKpiDetails('Exceeding Intake'),
      },
      {
        id: 'aicte-review',
        title: 'Requiring Review',
        value: kpis.recordsRequiringReview.value,
        trend: kpis.recordsRequiringReview.trend,
        tooltip: kpis.recordsRequiringReview.tooltip,
        icon: AlertCircle,
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10 border-amber-500/20',
        link: '/validation',
        details: getKpiDetails('Requiring Review'),
      },
    ];

    const statusChartData = Object.entries(submissionStatusCounts).map(([name, value]) => ({
      name,
      value,
    }));
    const STATUS_COLORS = ['#36D399', '#FFFFFF', '#FBBF24', '#A1A1AA', '#FB7185'];

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Page Header with Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                AICTE National Academic Governance Dashboard
              </h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#181818] text-neutral-300 border border-[#333333]">
                Live National Telemetry
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Real-time APAAR validation, intake monitoring, and duplicate detection governance metrics across approved institutions.
            </p>
          </div>

          {/* Global Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#121212] border border-[#262626] rounded-xl px-3 py-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-neutral-400" />
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-[#121212]">All Academic Years</option>
                <option value="2025-2026" className="bg-[#121212]">AY 2025-2026 (Active)</option>
                <option value="2024-2025" className="bg-[#121212]">AY 2024-2025 (Previous)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-[#121212] border border-[#262626] rounded-xl px-3 py-1.5 text-xs">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-[#121212]">All States / UTs</option>
                <option value="Maharashtra" className="bg-[#121212]">Maharashtra</option>
                <option value="Delhi" className="bg-[#121212]">Delhi</option>
                <option value="Karnataka" className="bg-[#121212]">Karnataka</option>
                <option value="Tamil Nadu" className="bg-[#121212]">Tamil Nadu</option>
                <option value="West Bengal" className="bg-[#121212]">West Bengal</option>
                <option value="Punjab" className="bg-[#121212]">Punjab</option>
              </select>
            </div>

            <button
              onClick={fetchDashboardData}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-[#121212] text-neutral-400 hover:text-white hover:bg-[#1A1A1A] border border-[#262626] transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* KPI Cards Grid (8 Cards) with Formal Slot Animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiItems.map((kpi, idx) => {
            const Icon = kpi.icon;
            const isClicked = activeSlotId === kpi.id;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.965 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                onClick={() => handleInspectSlot(kpi, kpi.id || `aicte-${idx}`)}
                className={`formal-slot formal-sheen-effect p-5 rounded-2xl bg-[#121212] border cursor-pointer group flex flex-col justify-between relative ${
                  isClicked
                    ? 'formal-slot-active border-white shadow-xl shadow-white/10 ring-2 ring-white/20'
                    : 'border-[#222222] hover:border-neutral-400'
                }`}
                title={kpi.tooltip}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-neutral-400">{kpi.title}</span>
                    <div className={`w-8 h-8 rounded-lg ${kpi.bgColor} flex items-center justify-center ${kpi.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-white tracking-tight">
                    {kpi.value}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#262626]/80 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    <span>{kpi.trend}</span>
                  </span>
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 font-medium">
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Capacity Overview Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#141414] to-[#0A0A0A] border border-[#2E2E2E] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              National Intake Utilization
            </span>
            <h3 className="text-xl font-bold text-white mt-1">
              {intakeSummary.totalActualEnrolled.toLocaleString('en-IN')} Enrolled / {intakeSummary.totalApprovedCapacity.toLocaleString('en-IN')} Approved Capacity
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              {intakeSummary.remainingCapacity.toLocaleString('en-IN')} sanctioned seats remaining across technical programmes.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <span className="text-3xl font-extrabold text-white">
                {intakeSummary.nationalUtilizationRate}%
              </span>
              <p className="text-[11px] text-neutral-400 mt-0.5">National Utilization</p>
            </div>
            <button
              onClick={() => navigate('/admissions')}
              className="px-4 py-2 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 text-xs transition-all flex items-center gap-1.5 shadow-md shadow-white/10"
            >
              <span>Monitor Admissions</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Row 1: Charts (Enrolment vs Approved & Submission Status) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#121212] border border-[#222222]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-white">Intake Utilization by Top Institutions</h3>
                <p className="text-xs text-neutral-400">Approved Seats vs Actual Enrolled Students</p>
              </div>
              <span className="text-xs font-semibold text-neutral-400">Seat Comparison</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={institutionUtilization} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                  <XAxis dataKey="name" stroke="#737373" fontSize={11} tickLine={false} />
                  <YAxis stroke="#737373" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#121212', borderColor: '#333333', borderRadius: '8px', fontSize: '11px', color: '#FFFFFF' }}
                    itemStyle={{ color: '#FFFFFF', fontWeight: 600 }}
                    labelStyle={{ color: '#D4D4D8' }}
                  />
                  <Bar dataKey="approved" name="Approved Intake" fill="#2E2E2E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="enrolled" name="Actual Enrolled" fill="#FFFFFF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">Validation Status Health</h3>
                <span className="text-xs font-semibold text-emerald-400">Records Processed</span>
              </div>
              <p className="text-xs text-neutral-400 mb-4">Distribution across national validation pipeline stages</p>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#121212', borderColor: '#333333', borderRadius: '8px', fontSize: '11px', color: '#FFFFFF' }}
                      itemStyle={{ color: '#FFFFFF', fontWeight: 600 }}
                      labelStyle={{ color: '#D4D4D8' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-4 border-t border-[#222222]">
              {statusChartData.slice(0, 4).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[idx] }}></span>
                  <span className="text-neutral-400 truncate">{item.name}:</span>
                  <span className="font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Validation Issues Breakdown & Regional Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Validation Finding Distribution</h3>
                <p className="text-xs text-neutral-400">Prioritized by anomaly detection rules</p>
              </div>
              <button
                onClick={() => navigate('/validation')}
                className="text-xs font-semibold text-neutral-300 hover:text-white"
              >
                Open Queue →
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {issueDistribution.map((issue, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#0A0A0A] border border-[#222222] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: issue.color }}></span>
                    <span className="text-neutral-300 font-medium">{issue.name}</span>
                  </div>
                  <span className="font-bold text-white px-2 py-0.5 rounded bg-[#121212] border border-[#262626]">
                    {issue.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#121212] border border-[#222222]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Regional Governance Overview</h3>
                <p className="text-xs text-neutral-400">Institutional admissions and utilization by State / Region</p>
              </div>
              <span className="text-xs text-neutral-400 font-semibold">State Data</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0A0A0A] text-neutral-400 border-b border-[#222222]">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">State / Territory</th>
                    <th className="py-2.5 px-3 font-semibold">Institutions</th>
                    <th className="py-2.5 px-3 font-semibold">Approved Seats</th>
                    <th className="py-2.5 px-3 font-semibold">Enrolled</th>
                    <th className="py-2.5 px-3 font-semibold">Utilization Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {regionalData.slice(0, 5).map((reg, idx) => (
                    <tr key={idx} className="hover:bg-[#1A1A1A]/50 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-white">{reg.state}</td>
                      <td className="py-2.5 px-3 text-neutral-300">{reg.institutions}</td>
                      <td className="py-2.5 px-3 text-neutral-300">{reg.approved.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 text-white font-semibold">{reg.enrolled.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-[#0A0A0A] overflow-hidden">
                            <div
                              className="h-full bg-white rounded-full"
                              style={{ width: `${Math.min(100, reg.utilizationRate)}%` }}
                            ></div>
                          </div>
                          <span className="font-semibold text-neutral-200">{reg.utilizationRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Row 3: Live Application Events Activity Stream */}
        <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-white" />
              <h3 className="text-sm font-bold text-white">Live Platform Governance Activity Stream</h3>
            </div>
            <button
              onClick={() => navigate('/audit-logs')}
              className="text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1"
            >
              <span>Full Audit Log</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#222222] text-xs">
            {recentActivity.map((act) => (
              <div key={act.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#181818] text-neutral-200 border border-[#2E2E2E]">
                    {act.action?.replace(/_/g, ' ')}
                  </span>
                  <span className="text-neutral-300 font-medium">{act.actorEmail}</span>
                  <span className="text-neutral-500 hidden sm:inline">({act.actorRole?.replace(/_/g, ' ')})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-neutral-500">
                    {new Date(act.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    act.outcome === 'SUCCESS' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                  }`}>
                    {act.outcome?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Dynamic View rendering based on activeRole */}
      {activeRole === 'INSTITUTION_ADMIN' && renderInstitutionAdminDashboard()}
      {activeRole === 'STUDENT' && renderStudentDashboard()}
      {activeRole === 'VERIFIER' && renderVerifierDashboard()}
      {(activeRole === 'AICTE_ADMIN' || !activeRole) && renderAicteAdminDashboard()}

      {/* Formal Telemetry Slot Inspection Modal */}
      <AnimatePresence>
        {inspectedSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => {
              setInspectedSlot(null);
              setActiveSlotId(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ type: 'spring', damping: 28, stiffness: 380 }}
              className="relative w-full max-w-xl p-6 sm:p-7 rounded-3xl bg-[#0D0D0D] border border-[#2E2E2E] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Subtle Ambient Sheen */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#222222]">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl ${inspectedSlot.bgColor} flex items-center justify-center ${inspectedSlot.color} shadow-inner`}>
                    {React.createElement(inspectedSlot.icon, { className: 'w-5 h-5' })}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-black uppercase tracking-wider">
                        AICTE Telemetry Inspection
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">Live Slot</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white tracking-tight mt-0.5">
                      {inspectedSlot.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setInspectedSlot(null);
                    setActiveSlotId(null);
                  }}
                  className="p-2 rounded-xl bg-[#1A1A1A] text-neutral-400 hover:text-white hover:bg-[#262626] border border-[#2E2E2E] transition-colors"
                  title="Close Inspection"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Main Metric Value & Trend */}
              <div className="my-5 p-4 rounded-2xl bg-[#141414] border border-[#262626] flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-400 font-medium">Recorded Telemetry Value</span>
                  <div className="text-3xl font-extrabold text-white tracking-tight mt-0.5">
                    {inspectedSlot.value}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Trend Status</span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1 mt-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{inspectedSlot.trend}</span>
                  </span>
                </div>
              </div>

              {/* Detailed Breakdown Items */}
              {inspectedSlot.details?.breakdown && (
                <div className="mb-5 space-y-2">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Telemetry Distribution & Verification
                  </span>
                  <div className="space-y-1.5">
                    {inspectedSlot.details.breakdown.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-[#0A0A0A] border border-[#222222] flex items-center justify-between text-xs"
                      >
                        <span className="text-neutral-300 font-medium">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white font-mono">{item.value}</span>
                          {item.badge && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.badgeColor || 'bg-white/10 text-white'}`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Governance Methodology Grid */}
              <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#222222] text-[11px] space-y-1.5 mb-6 text-neutral-400">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Governance Authority:</span>
                  <span className="font-semibold text-neutral-200">{inspectedSlot.details?.authority || 'AICTE Regulatory Council'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Audit Compliance:</span>
                  <span className="font-semibold text-neutral-200">{inspectedSlot.details?.auditStandard || 'DPDP 2023 / ISO 27001'}</span>
                </div>
                <div className="pt-1 border-t border-[#1C1C1C]">
                  <span className="text-neutral-500 block">Calculation Logic:</span>
                  <span className="text-neutral-300 mt-0.5 block">{inspectedSlot.details?.calculation || inspectedSlot.tooltip}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#222222]">
                <button
                  type="button"
                  onClick={() => {
                    setInspectedSlot(null);
                    setActiveSlotId(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#262626] border border-[#2E2E2E] text-neutral-300 hover:text-white text-xs font-semibold transition-colors"
                >
                  Close
                </button>
                {inspectedSlot.link && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = inspectedSlot.link;
                      setInspectedSlot(null);
                      setActiveSlotId(null);
                      if (target) navigate(target);
                    }}
                    className="px-5 py-2 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 text-xs transition-all flex items-center gap-1.5 shadow-md shadow-white/10"
                  >
                    <span>Open Full Records Ledger</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
