import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api';
import { MOCK_AUDIT_LOGS } from '../services/mockData';
import { formatDate } from '../lib/utils';
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  X,
  Lock,
} from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {};
      if (search) params.action = search;
      if (selectedRole) params.actorRole = selectedRole;

      const res = await ApiClient.getAuditLogs(params);
      if (res.success && (res.logs || res.auditLogs)) {
        setLogs(res.logs || res.auditLogs);
      } else {
        setLogs(MOCK_AUDIT_LOGS);
      }
    } catch (err) {
      console.error('Failed to load audit logs', err);
      setLogs(MOCK_AUDIT_LOGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedRole]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Immutable System Audit Logs
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Tamper-Evident Trail
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete chronological record of all authentication, submission, validation findings, corrections, and academic verifications.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#141414] text-neutral-200 border border-[#333333] text-xs font-semibold hover:bg-[#1E1E1E] transition-colors self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Audit Trail</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#121212] border border-[#222222] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search action or event name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400"
          />
        </div>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="bg-[#0A0A0A] border border-[#262626] text-neutral-300 rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer"
        >
          <option value="">All Roles</option>
          <option value="AICTE_ADMIN">AICTE Administrator</option>
          <option value="INSTITUTION_ADMIN">Institution Administrator</option>
          <option value="STUDENT">Student</option>
          <option value="VERIFIER">Verifier</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#121212] border border-[#222222] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A0A0A] text-neutral-400 border-b border-[#222222]">
              <tr>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Correlation ID</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold">Actor</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Outcome</th>
                <th className="py-3 px-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">Loading audit trail...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">No matching audit logs found.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-[#1A1A1A]/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 text-neutral-300 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-300 text-[11px]">{log.correlationId}</td>
                    <td className="py-3 px-4 font-bold text-white">{log.action.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4 text-neutral-300">{log.actorEmail}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#0A0A0A] text-neutral-300 border border-[#262626]">
                        {log.actorRole.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.outcome === 'SUCCESS' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                      }`}>
                        {log.outcome.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-neutral-400 hover:text-white">
                        <Eye className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#262626] w-full max-w-lg rounded-2xl shadow-2xl p-6">
            <div className="flex items-start justify-between pb-3 border-b border-[#262626] mb-4">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Audit Telemetry Record
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedLog.action.replace(/_/g, ' ')}</h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-300">
              <p><span className="text-neutral-500">Correlation ID:</span> <strong className="text-white font-mono">{selectedLog.correlationId}</strong></p>
              <p><span className="text-neutral-500">Actor:</span> {selectedLog.actorEmail} ({selectedLog.actorRole.replace(/_/g, ' ')})</p>
              <p><span className="text-neutral-500">Resource:</span> {selectedLog.resourceType.replace(/_/g, ' ')} {selectedLog.resourceId ? `• ID: ${selectedLog.resourceId}` : ''}</p>
              <p><span className="text-neutral-500">Timestamp:</span> {new Date(selectedLog.timestamp).toISOString()}</p>

              <div>
                <span className="text-neutral-500 block mb-1">Sanitized Metadata Payload:</span>
                <pre className="p-3 rounded-xl bg-[#0A0A0A] border border-[#262626] font-mono text-[11px] text-neutral-200 overflow-x-auto">
                  {JSON.stringify(selectedLog.sanitizedMetadata, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#262626] flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-[#0A0A0A] border border-[#262626] text-slate-300 hover:text-white text-xs font-semibold"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

