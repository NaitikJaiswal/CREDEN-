import React, { useState } from 'react';
import { ApiClient } from '../services/api';
import { useAuth } from '../features/auth/AuthContext';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  ArrowRight,
  RefreshCw,
  Info,
  Layers,
} from 'lucide-react';

export const UploadPage: React.FC = () => {
  const { user, activeRole } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [academicYear, setAcademicYear] = useState<string>('2025-2026');
  const [programmeCode, setProgrammeCode] = useState<string>('BTECH-CSE');
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // File selection & parsing for instant client-side preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setUploadResult(null);
      setErrorMsg(null);

      // Parse preview
      if (selected.name.endsWith('.csv')) {
        Papa.parse(selected, {
          header: true,
          preview: 5,
          complete: (results) => {
            setPreviewRows(results.data);
          },
        });
      } else if (selected.name.endsWith('.xlsx') || selected.name.endsWith('.xls')) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const data = evt.target?.result;
            const wb = XLSX.read(data, { type: 'binary' });
            const sheet = wb.Sheets[wb.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
            setPreviewRows(json.slice(0, 5));
          } catch {
            setPreviewRows([]);
          }
        };
        reader.readAsBinaryString(selected);
      }
    }
  };

  const handleDownloadTemplate = () => {
    window.open('/api/v1/upload/template', '_blank');
  };

  const handleSubmitUpload = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('academicYear', academicYear);
    formData.append('programmeCode', programmeCode);

    try {
      const res = await ApiClient.uploadBulk(formData);
      if (res.success) {
        setUploadResult(res);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Bulk upload failed during validation processing.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadErrors = () => {
    if (uploadResult?.batchId) {
      window.open(`/api/v1/imports/${uploadResult.batchId}/errors`, '_blank');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Bulk Student Data Ingestion & Validation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload institutional student enrolments via CSV or XLSX with multi-layer APAAR identity and duplicate checks.
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141414] text-neutral-200 hover:bg-[#1E1E1E] border border-[#333333] text-xs font-semibold transition-colors self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Download Official CSV Template</span>
        </button>
      </div>

      {/* Upload Zone & Config Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Settings */}
        <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222] space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-white" />
            <span>Upload Metadata</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Academic Year
            </label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="2025-2026">AY 2025-2026 (Active Admissions)</option>
              <option value="2024-2025">AY 2024-2025 (Historical)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Programme Stream
            </label>
            <select
              value={programmeCode}
              onChange={(e) => setProgrammeCode(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="BTECH-CSE">B.Tech - Computer Science & Engg</option>
              <option value="BTECH-ECE">B.Tech - Electronics & Comm Engg</option>
              <option value="BTECH-MECH">B.Tech - Mechanical Engineering</option>
              <option value="BTECH-AIDS">B.Tech - AI & Data Science</option>
              <option value="MBA-FIN">MBA - Financial Management</option>
            </select>
          </div>

          <div className="pt-4 border-t border-[#222222] text-[11px] text-neutral-400 space-y-2">
            <p className="flex items-center gap-1.5 text-neutral-300 font-semibold">
              <Info className="w-3.5 h-3.5 text-neutral-400" />
              <span>Multi-Layer Validation Rules</span>
            </p>
            <p>• Layer 1: 12-digit numeric APAAR format checks.</p>
            <p>• Layer 2: Rule A batch duplicate detection.</p>
            <p>• Layer 3: Authoritative gateway demographic match.</p>
            <p>• Layer 4: Rule C cross-institution concurrency detection.</p>
          </div>
        </div>

        {/* Right: Dropzone & Actions */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-[#121212] border border-[#222222] flex flex-col justify-between">
          <div>
            <div className="border-2 border-dashed border-[#262626] hover:border-neutral-500 rounded-2xl p-8 text-center transition-colors bg-[#0A0A0A]/50">
              <UploadCloud className="w-12 h-12 text-white mx-auto mb-3" />
              <h4 className="text-sm font-bold text-white mb-1">
                {file ? file.name : 'Select or Drop Student Enrolment File'}
              </h4>
              <p className="text-xs text-neutral-400 mb-4">
                {file ? `${(file.size / 1024).toFixed(1)} KB • Ready for validation` : 'Supports standard CSV and XLSX formats (Max 15MB)'}
              </p>

              <label className="inline-block px-5 py-2.5 rounded-xl bg-[#181818] text-neutral-200 border border-[#333333] text-xs font-semibold cursor-pointer hover:bg-[#222222] transition-all">
                Browse Local File
                <input
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 min-w-4" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#222222]">
            <span className="text-xs text-neutral-500">
              {file ? 'Click below to execute server-side validation' : 'Choose a file to preview rows'}
            </span>
            <button
              onClick={handleSubmitUpload}
              disabled={!file || isProcessing}
              className="px-6 py-2.5 rounded-xl bg-white text-black font-extrabold text-xs shadow-md shadow-white/10 hover:bg-neutral-200 hover:scale-[1.01] transition-all disabled:opacity-40 flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Validating File...</span>
                </>
              ) : (
                <>
                  <span>Run Validation & Ingestion</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Row Preview (Client-Side before submit) */}
      {previewRows.length > 0 && !uploadResult && (
        <div className="p-5 rounded-2xl bg-[#121212] border border-[#262626]">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            Initial File Preview (First 5 Rows)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0A0A] text-slate-400 border-b border-[#262626]">
                <tr>
                  {Object.keys(previewRows[0] || {}).map((header, i) => (
                    <th key={i} className="py-2 px-3 font-semibold">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626] text-slate-300">
                {previewRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#1A1A1A]/40">
                    {Object.values(row).map((val: any, cIdx) => (
                      <td key={cIdx} className="py-2 px-3 font-mono text-[11px] truncate max-w-xs">{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SERVER-SIDE VALIDATION REPORT */}
      {uploadResult && (
        <div className="p-6 rounded-2xl bg-[#121212] border border-[#333333] space-y-6 animate-fade-in">
          {/* Summary KPIs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#222222]">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Batch Validation Result
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {uploadResult.summary.fileName} • {uploadResult.summary.academicYear}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {uploadResult.summary.invalidRows > 0 && (
                <button
                  onClick={handleDownloadErrors}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/30 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Error Report (CSV)</span>
                </button>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                uploadResult.summary.invalidRows === 0
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {uploadResult.summary.batchStatus.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#222222]">
              <p className="text-neutral-400">Total Rows Processed</p>
              <p className="text-xl font-extrabold text-white mt-1">{uploadResult.summary.totalRows}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#222222]">
              <p className="text-neutral-400">Valid Records Ingested</p>
              <p className="text-xl font-extrabold text-emerald-400 mt-1">{uploadResult.summary.validRows}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#222222]">
              <p className="text-neutral-400">Invalid / Flagged Rows</p>
              <p className="text-xl font-extrabold text-rose-400 mt-1">{uploadResult.summary.invalidRows}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#222222]">
              <p className="text-neutral-400">Duplicate Candidates</p>
              <p className="text-xl font-extrabold text-amber-400 mt-1">{uploadResult.summary.duplicateCandidates}</p>
            </div>
          </div>

          {/* Submission Guidance Note */}
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#333333] text-xs text-neutral-300 flex items-start gap-3">
            <Info className="w-5 h-5 text-white min-w-5 mt-0.5" />
            <div>
              <p className="font-semibold text-white mb-0.5">Institutional Submission Assistant Guidance:</p>
              <p>{uploadResult.validationReport.guidance}</p>
            </div>
          </div>

          {/* Error Table if any */}
          {uploadResult.validationReport.errors.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Detected Validation Anomalies ({uploadResult.validationReport.errors.length})
              </h4>
              <div className="rounded-xl border border-[#222222] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0A0A0A] text-neutral-400 border-b border-[#222222]">
                    <tr>
                      <th className="py-2 px-3 font-semibold">Row #</th>
                      <th className="py-2 px-3 font-semibold">Student ID</th>
                      <th className="py-2 px-3 font-semibold">Identifier</th>
                      <th className="py-2 px-3 font-semibold">Rule Triggered</th>
                      <th className="py-2 px-3 font-semibold">Severity</th>
                      <th className="py-2 px-3 font-semibold">Detailed Finding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222222] text-neutral-300">
                    {uploadResult.validationReport.errors.map((err: any, i: number) => (
                      <tr key={i} className="hover:bg-[#1A1A1A]/40">
                        <td className="py-2 px-3 font-mono font-bold text-white">Row {err.rowNumber}</td>
                        <td className="py-2 px-3 font-mono">{err.studentId || 'N/A'}</td>
                        <td className="py-2 px-3 font-mono">{err.apaarIdRaw || 'Empty'}</td>
                        <td className="py-2 px-3 font-semibold text-white">{err.code}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                            {err.severity.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-300">{err.errorMessage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

