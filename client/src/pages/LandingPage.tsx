import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IdentityNetwork3D, NodeInfo } from '../components/three/IdentityNetwork3D';
import { Workflow3D, WORKFLOW_STAGES, WorkflowStage } from '../components/three/Workflow3D';
import { FallbackNetworkView } from '../components/three/FallbackView';
import { Navbar } from '../components/layout/Navbar';
import { useAuth } from '../features/auth/AuthContext';
import {
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  Database,
  FileCheck2,
  AlertTriangle,
  Lock,
  Layers,
  Network,
  CheckCircle2,
  Activity,
  Cpu,
  Eye,
  Building,
  UserCheck,
  QrCode,
  X,
  Scale,
  FileSpreadsheet,
  History as HistoryIcon,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<NodeInfo | null>(null);
  const [selectedStage, setSelectedStage] = useState<WorkflowStage>(WORKFLOW_STAGES[0]);
  const [workflowZoomMode, setWorkflowZoomMode] = useState<'focus' | 'overview'>('focus');
  const [isLiteMode, setIsLiteMode] = useState<boolean>(() => {
    return localStorage.getItem('creden_lite_mode') === 'true';
  });
  const { demoLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePerfChange = (e: any) => {
      setIsLiteMode(e.detail?.isLiteMode);
    };
    window.addEventListener('creden_perf_mode_change', handlePerfChange);
    return () => window.removeEventListener('creden_perf_mode_change', handlePerfChange);
  }, []);

  const handleLaunchDemo = async () => {
    await demoLogin('AICTE_ADMIN');
    navigate('/help');
  };

  const handleExploreDashboard = async () => {
    await demoLogin('AICTE_ADMIN');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-black text-[#F1F5F9] selection:bg-white selection:text-black">
      <Navbar />

      {/* SECTION A: HERO WITH 3D NETWORK */}
      <section id="hero" className="relative min-h-[92vh] flex items-center justify-center overflow-hidden border-b border-[#222222] bg-black">
        {/* Interactive 3D Canvas or Lite Fallback */}
        <div className="absolute inset-0 z-0">
          {isLiteMode ? (
            <FallbackNetworkView
              selectedNode={selectedNode}
              onSelectNode={(node) => setSelectedNode(node)}
            />
          ) : (
            <IdentityNetwork3D
              selectedNode={selectedNode}
              onSelectNode={(node) => setSelectedNode(node)}
            />
          )}
        </div>

        {/* Ambient Subtle Monochromatic Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl pointer-events-none"></div>

        {/* Hero Foreground Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pointer-events-none">
          <div className="max-w-2xl">
            {/* Environment Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121212]/90 border border-[#2E2E2E] text-neutral-300 text-xs font-semibold mb-6 shadow-lg shadow-black/50 pointer-events-auto backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Interactive Demonstration Environment</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
              Every Student.{' '}
              <span className="bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                One Trusted
              </span> Academic Identity.
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-neutral-300 leading-relaxed mb-8 pointer-events-auto">
              Connecting institutions, validating academic identities, detecting enrolment inconsistencies,
              and enabling secure verification through an intelligent student data ecosystem.
            </p>

            {/* Hero CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pointer-events-auto">
              <button
                onClick={handleExploreDashboard}
                className="px-6 py-3.5 rounded-xl bg-white text-black font-extrabold text-sm shadow-xl shadow-white/10 hover:bg-neutral-200 hover:scale-[1.02] transition-all flex items-center gap-2"
              >
                <span>Explore Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#workflow"
                className="px-6 py-3.5 rounded-xl bg-[#121212]/90 text-white border border-[#2E2E2E] hover:border-neutral-500 hover:bg-[#1A1A1A] font-semibold text-sm transition-all flex items-center gap-2"
              >
                <span>Discover How It Works</span>
              </a>

              <button
                onClick={handleLaunchDemo}
                className="px-5 py-3.5 rounded-xl bg-[#1A1A1A] text-neutral-200 border border-[#333333] hover:bg-[#262626] font-semibold text-sm transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Launch Interactive Demo</span>
              </button>
            </div>

            {/* Mini Trust Badges */}
            <div className="mt-12 flex flex-wrap items-center gap-6 text-xs text-neutral-400 border-t border-[#222222] pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>APAAR 12-Digit Format Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Explainable Duplicate Detection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-neutral-300" />
                <span>Approved Intake Monitoring</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating 3D Node Information Modal */}
        {selectedNode && (
          <div className="absolute bottom-8 right-8 z-20 max-w-sm w-full bg-[#121212]/95 backdrop-blur-xl border border-[#333333] p-5 rounded-2xl shadow-2xl shadow-black/80 animate-fade-in">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">
                  Institutional Node Telemetry
                </span>
                <h3 className="text-base font-bold text-white leading-snug">{selectedNode.name}</h3>
                <p className="text-xs text-neutral-400">{selectedNode.code}</p>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1A1A1A] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 my-4 text-xs">
              <div className="p-2.5 rounded-lg bg-[#0A0A0A] border border-[#222222]">
                <p className="text-neutral-400 text-[11px]">Records Submitted</p>
                <p className="text-sm font-bold text-white mt-0.5">{selectedNode.recordsSubmitted}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0A0A0A] border border-[#222222]">
                <p className="text-neutral-400 text-[11px]">Validation Pass Rate</p>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">{selectedNode.passRate}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-[#222222]">
              <span className="text-neutral-400">Current Status:</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {selectedNode.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-[10px] text-neutral-500 mt-3 text-center italic">
              Synthetic demonstration telemetry • Not official live AICTE statistics
            </p>
          </div>
        )}
      </section>

      {/* SECTION B: 3D WORKFLOW VISUALIZATION */}
      <section id="workflow" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#222222] bg-black">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121212] border border-[#262626] text-neutral-300 text-xs font-semibold mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Connected Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            The 6-Stage Governance Workflow
          </h2>
          <p className="text-neutral-400 text-sm mt-3">
            Click any 3D stage or step below to explore input criteria, automated processing, and verifiable outputs.
          </p>
        </div>

        {/* Interactive 3D Workflow Container with Direct Controls & Live Telemetry Card */}
        <div className="rounded-3xl bg-[#0A0A0A] border border-[#2E2E2E] p-4 sm:p-6 shadow-2xl mb-8 relative space-y-4">
          {/* Top Quick Stage Selector Pills */}
          <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-2 border-b border-[#222222]">
            {WORKFLOW_STAGES.map((stage) => {
              const isSelected = selectedStage.id === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => {
                    setSelectedStage(stage);
                    setWorkflowZoomMode('focus');
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-1 justify-center ${
                    isSelected
                      ? 'bg-white text-black font-bold shadow-lg shadow-white/10 ring-2 ring-white/30 scale-[1.02]'
                      : 'bg-[#121212] text-neutral-400 hover:text-white hover:bg-[#1A1A1A] border border-[#222222]'
                  }`}
                  style={isSelected ? { borderColor: stage.color } : {}}
                >
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      isSelected ? 'bg-black text-white' : 'bg-[#1F1F1F] text-neutral-300'
                    }`}
                    style={isSelected ? { color: stage.color } : {}}
                  >
                    {stage.id}
                  </span>
                  <span className="truncate">{stage.shortName}</span>
                </button>
              );
            })}
          </div>

          {/* 3D Workflow Canvas */}
          <div className="w-full relative rounded-2xl bg-black/60 border border-[#1A1A1A] overflow-hidden">
            <Workflow3D
              selectedStageId={selectedStage.id}
              onSelectStage={(stage) => {
                setSelectedStage(stage);
                setWorkflowZoomMode('focus');
              }}
              zoomMode={workflowZoomMode}
              onToggleZoomMode={() => setWorkflowZoomMode(workflowZoomMode === 'focus' ? 'overview' : 'focus')}
            />
            <div className="absolute top-3 left-4 pointer-events-none">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                Interactive 3D Engine
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: selectedStage.color }}></span>
                <span className="text-xs font-extrabold text-white">
                  Stage {selectedStage.id}: {selectedStage.shortName}
                </span>
              </div>
            </div>
          </div>

          {/* Live Stage Inspection Dossier (Immediate On-Screen Feedback) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#121212] border border-[#2A2A2A] shadow-xl animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222222]">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-white text-black font-extrabold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                  0{selectedStage.id}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Stage {selectedStage.id} of 6 Telemetry
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      ACTIVE STAGE
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white mt-0.5 tracking-tight">
                    {selectedStage.name}
                  </h3>
                </div>
              </div>

              {/* Prev / Next Stage Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const prevIndex = (selectedStage.id - 2 + WORKFLOW_STAGES.length) % WORKFLOW_STAGES.length;
                    setSelectedStage(WORKFLOW_STAGES[prevIndex]);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#181818] text-neutral-300 hover:text-white hover:bg-[#222222] border border-[#2E2E2E] text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous Stage</span>
                </button>
                <button
                  onClick={() => {
                    const nextIndex = selectedStage.id % WORKFLOW_STAGES.length;
                    setSelectedStage(WORKFLOW_STAGES[nextIndex]);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-white/10"
                >
                  <span>Next Stage</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Stage Purpose Statement */}
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mt-4 font-medium">
              {selectedStage.purpose}
            </p>

            {/* 3 Pillars: Input Criteria, Processing, Output Generated */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-5 text-xs">
              <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#222222]">
                <p className="font-bold text-white mb-1.5 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Input Criteria</span>
                </p>
                <p className="text-neutral-400 leading-relaxed text-[11px]">{selectedStage.inputData}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#222222]">
                <p className="font-bold text-white mb-1.5 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Automated Processing</span>
                </p>
                <p className="text-neutral-400 leading-relaxed text-[11px]">{selectedStage.processing}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#222222]">
                <p className="font-bold text-emerald-400 mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verifiable Output</span>
                </p>
                <p className="text-neutral-300 leading-relaxed text-[11px]">{selectedStage.outputGenerated}</p>
              </div>
            </div>

            <div className="pt-4 mt-5 border-t border-[#222222] flex items-center justify-between">
              <span className="text-xs text-neutral-500">
                Stage {selectedStage.id} of 6 • End-to-End Governance Protocol
              </span>
              <button
                onClick={handleLaunchDemo}
                className="text-xs font-semibold text-white hover:text-neutral-300 flex items-center gap-1"
              >
                <span>Test in Interactive Demo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION C: PROBLEM STATEMENT */}
      <section id="problem" className="py-24 bg-[#0A0A0A] border-b border-[#222222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold mb-3">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>National Governance Challenge</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Fragmented Records. Limited Visibility. A Need for Trust.
            </h2>
            <p className="text-neutral-400 text-sm mt-3">
              AICTE approved institutions provide data through disparate mechanisms—PGDM institutions submit annual records,
              while others submit statistical numbers. This creates structural governance bottlenecks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Inconsistent Data Submissions',
                desc: 'Colleges currently provide aggregated statistical summaries rather than verifiable student-level microdata.',
                icon: FileCheck2,
                color: 'text-amber-400',
              },
              {
                title: 'Missing & Malformed Identifiers',
                desc: 'Without automated format filters, invalid APAAR records slip through and impede national credit bank transfers.',
                icon: AlertTriangle,
                color: 'text-rose-400',
              },
              {
                title: 'Duplicate & Concurrent Enrolments',
                desc: 'Lack of cross-institution visibility prevents distinguishing concurrent active admissions from legitimate degree progression.',
                icon: Layers,
                color: 'text-neutral-300',
              },
              {
                title: 'Approved Intake Breaches',
                desc: 'Monitoring actual admissions against AICTE seat sanction orders is difficult without real-time utilization thresholds.',
                icon: Activity,
                color: 'text-rose-400',
              },
              {
                title: 'Limited Real-Time Visibility',
                desc: 'Governance authorities face latency between academic year admissions and data availability for policy interventions.',
                icon: Eye,
                color: 'text-white',
              },
              {
                title: 'Third-Party Verification Friction',
                desc: 'Employers and higher education regulators must navigate cumbersome manual channels to confirm degree claims.',
                icon: Lock,
                color: 'text-emerald-400',
              },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-[#121212] border border-[#222222] hover:border-neutral-500 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] border border-[#262626] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{card.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Synthetic Demo Statistics Notice */}
          <div className="mt-12 p-4 rounded-xl bg-[#121212]/60 border border-[#222222] text-center max-w-2xl mx-auto text-xs text-neutral-400">
            <span className="font-semibold text-neutral-300">Note: </span>
            All metrics displayed in this prototype reflect deterministic demonstration figures based on synthetic student data.
          </div>
        </div>
      </section>

      {/* SECTION D & E: SOLUTION & INNOVATIONS */}
      <section id="innovation" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#222222] bg-black">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121212] border border-[#2E2E2E] text-neutral-300 text-xs font-semibold mb-3">
            <Cpu className="w-3.5 h-3.5" />
            <span>Platform Innovations</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Introducing CREDEN
          </h2>
          <p className="text-neutral-400 text-sm mt-3">
            An intelligent student data management and governance ecosystem engineered with explainable validation logic,
            real-time intake analytics, and cryptographic verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Explainable Duplicate Detection',
              desc: 'Applies transparent Rules A through E to separate accidental re-submissions and legitimate dual qualifications from suspicious concurrency.',
              icon: Network,
              badge: 'Rules A-E',
            },
            {
              title: 'Approved Intake Monitoring',
              desc: 'Automatic capacity calculation with visual color codes: Normal (<80%), Near Capacity (80-100%), and Potential Excess (>100%).',
              icon: Scale,
              badge: 'Real-Time Capacity',
            },
            {
              title: 'Data Quality Scoring',
              desc: 'Computes a transparent 0-100% data quality score per record, clearly separating formatting completeness from identity authenticity.',
              icon: CheckCircle2,
              badge: '0-100 Quality Metric',
            },
            {
              title: 'Controlled Verification Portal',
              desc: 'Permits employers and verifiers to confirm credential claims via random high-entropy tokens & QR codes without exposing unmasked private data.',
              icon: QrCode,
              badge: 'Zero-Knowledge Proof',
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[#121212] border border-[#222222] hover:border-neutral-500 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] border border-[#262626] flex items-center justify-center text-white">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1A1A1A] text-neutral-300 border border-[#333333]">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {[
            {
              title: 'Multi-Format Bulk Ingestion',
              desc: 'High-throughput parsing of CSV and XLSX student datasets with column mapping, format validation, and downloadable error CSV logs.',
              icon: FileSpreadsheet,
              badge: 'CSV & XLSX Engine',
            },
            {
              title: 'HMAC Identifier Fingerprinting',
              desc: 'Uses keyed SHA-256 HMAC fingerprints for search and duplicate matching, keeping raw unmasked APAAR IDs out of query logs.',
              icon: Lock,
              badge: 'Keyed Salted Hash',
            },
            {
              title: 'Interactive Policy Simulator',
              desc: 'Empowers regulators to simulate the impact of adjusting intake warning thresholds before enacting administrative changes.',
              icon: Activity,
              badge: 'What-If Simulation',
            },
            {
              title: 'REST Integration Gateway',
              desc: 'Fully documented versioned RESTful endpoints (/api/v1) supporting role-scoped machine-to-machine academic data exchange.',
              icon: Database,
              badge: 'OpenAPI Ready',
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[#121212] border border-[#222222] hover:border-neutral-500 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] border border-[#262626] flex items-center justify-center text-white">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1A1A1A] text-neutral-300 border border-[#333333]">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION F: SECURITY & PRIVACY */}
      <section id="security" className="py-24 bg-[#0A0A0A] border-b border-[#222222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cybersecurity & Privacy by Design</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Enterprise Trust & Data Isolation
            </h2>
            <p className="text-neutral-400 text-sm mt-3">
              Built in alignment with Indian data protection principles, CREDEN ensures backend isolation and cryptographic integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222]">
              <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] border border-[#2E2E2E] flex items-center justify-center text-white mb-4">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Institution-Level Isolation</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Institution administrators are strictly partitioned on the backend. No institution can inspect, upload, or correct student records belonging to any other college.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222]">
              <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] border border-[#2E2E2E] flex items-center justify-center text-white mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Data Minimization</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Raw APAAR IDs are masked on display (•••• •••• 9012) and stored as salted HMAC fingerprints. Third-party verifiers receive only permitted claims with no private personal contact data.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222]">
              <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] border border-[#2E2E2E] flex items-center justify-center text-white mb-4">
                <HistoryIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Immutable Audit Trails</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Every login, data upload, validation finding, record correction, and verification check generates an immutable audit record tied to a correlation ID.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION G: FINAL CTA */}
      <section className="py-24 relative overflow-hidden bg-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="p-12 rounded-3xl bg-[#0A0A0A] border border-[#262626] shadow-2xl">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Building a More Trustworthy <br />
              <span className="bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                Academic Data Ecosystem.
              </span>
            </h2>
            <p className="text-neutral-300 text-sm sm:text-base max-w-2xl mx-auto mt-4 mb-8">
              Bring institutions, student records, and authorized verification into one connected platform.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={handleExploreDashboard}
                className="px-8 py-4 rounded-xl bg-white text-black font-extrabold text-sm shadow-xl shadow-white/10 hover:scale-105 transition-all flex items-center gap-2"
              >
                <span>Enter CREDEN</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleLaunchDemo}
                className="px-6 py-4 rounded-xl bg-[#141414] text-white border border-[#333333] hover:bg-[#1E1E1E] font-semibold text-sm transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Guided Hackathon Walkthrough</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#222222] py-8 text-xs text-neutral-500 text-center bg-black">
        <p className="text-neutral-400 font-semibold mb-1">
          CREDEN — Student Identity, Verification and Academic Governance Platform
        </p>
        <p className="text-neutral-600 text-[11px]">
          Academic Governance Platform • Developed for demonstration. Not an officially deployed AICTE product.
        </p>
      </footer>
    </div>
  );
};
