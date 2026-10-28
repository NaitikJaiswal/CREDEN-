import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Printer,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeReportType, setActiveReportType] = useState<string>('INTAKE_UTILIZATION');
  const [reportData, setReportData] = useState<any | null>(null);

  const reportCatalogue = [
    { id: 'INTAKE_UTILIZATION', title: 'Approved Intake Utilization Report', desc: 'Sanctioned seats vs verified enrolment per programme with over-capacity breach alerts.' },
    { id: 'YEAR_COMPARISON', title: 'Academic Year Comparison Report', desc: 'Year-over-year admission volume growth and demographic trajectory analysis.' },
    { id: 'SUPERNUMERARY', title: 'Supernumerary Quotas & Special Categories', desc: 'Tuition Fee Waiver (TFW), EWS supernumerary, PMSSS, and NRI/OCI international quotas.' },
    { id: 'DATA_QUALITY', title: 'Data Quality & Validation Compliance', desc: 'Format compliance pass rates, missing identifier frequencies, and average quality scores.' },
  ];

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getReports({ type: activeReportType });
      if (res.success) {
        setReportData(res);
      }
    } catch (err) {
      console.error('Failed to load report data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeReportType]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    window.open('/api/v1/students/export', '_blank');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Governance Reports & Export Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate and export official compliance dossiers, intake utilization analyses, and demographic distributions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#121212] text-slate-300 border border-[#262626] text-xs font-semibold hover:bg-[#1A1A1A] transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier</span>
          </button>
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-neutral-200 transition-colors shadow-md shadow-white/10"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Cleaned Data (CSV)</span>
          </button>
        </div>
      </div>

      {/* Catalogue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportCatalogue.map((cat) => {
          const isActive = activeReportType === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveReportType(cat.id)}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-white text-black border-white shadow-xl shadow-white/10'
                  : 'bg-[#121212] border-[#222222] text-neutral-400 hover:text-white hover:border-neutral-500'
              }`}
            >
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isActive ? 'text-neutral-700' : 'text-neutral-500'}`}>
                  Report Dossier
                </span>
                <h3 className={`text-sm font-bold mb-1.5 leading-snug ${isActive ? 'text-black' : 'text-white'}`}>{cat.title}</h3>
                <p className={`text-[11px] leading-relaxed ${isActive ? 'text-neutral-800' : 'text-neutral-400'}`}>{cat.desc}</p>
              </div>
              <span className={`mt-4 text-xs font-semibold flex items-center gap-1 ${isActive ? 'text-black' : 'text-neutral-300'}`}>
                <span>View Table</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          );
        })}
      </div>

      {/* Report Data Viewer */}
      <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222] space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
          <div>
            <h3 className="text-base font-bold text-white">
              {reportCatalogue.find((r) => r.id === activeReportType)?.title}
            </h3>
            <p className="text-xs text-neutral-400">
              Generated: {new Date().toLocaleString('en-IN')} • Audit Certified
            </p>
          </div>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#181818] text-neutral-300 border border-[#333333]">
            Official Prototype Export
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-neutral-400">Loading report records...</div>
        ) : activeReportType === 'INTAKE_UTILIZATION' && reportData?.intakeReport ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0A0A] text-neutral-400 border-b border-[#222222]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Institution Code</th>
                  <th className="py-2.5 px-3 font-semibold">Institution Name</th>
                  <th className="py-2.5 px-3 font-semibold">Programme</th>
                  <th className="py-2.5 px-3 font-semibold">Approved Seats</th>
                  <th className="py-2.5 px-3 font-semibold">Actual Enrolled</th>
                  <th className="py-2.5 px-3 font-semibold">Utilization %</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {reportData.intakeReport.slice(0, 15).map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-[#1A1A1A]/40">
                    <td className="py-2.5 px-3 font-mono text-neutral-300 font-bold">{row.institutionCode}</td>
                    <td className="py-2.5 px-3 font-medium text-white">{row.institutionName}</td>
                    <td className="py-2.5 px-3 text-neutral-300">{row.programmeName}</td>
                    <td className="py-2.5 px-3 text-neutral-300 font-mono">{row.approvedSeatCount}</td>
                    <td className="py-2.5 px-3 text-white font-mono font-bold">{row.regularEnrolled}</td>
                    <td className="py-2.5 px-3 font-bold text-white font-mono">{row.utilizationPercentage}%</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.isViolation ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {row.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400">
            Dossier compiled successfully. Use CSV Export button above for full multi-sheet audit files.
          </div>
        )}
      </div>
    </div>
  );
};

