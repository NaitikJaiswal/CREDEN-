import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api';
import { useAuth } from '../features/auth/AuthContext';
import { StudentRecord } from '../types';
import { getStatusBadgeColor, formatDate } from '../lib/utils';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  AlertTriangle,
  User,
  Building,
  GraduationCap,
  ShieldCheck,
  Edit3,
  X,
  History,
} from 'lucide-react';

export const StudentsPage: React.FC = () => {
  const { user, activeRole } = useAuth();
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [academicYear, setAcademicYear] = useState<string>('');
  const [validationStatus, setValidationStatus] = useState<string>('');
  const [admissionCategory, setAdmissionCategory] = useState<string>('');

  // Selected Student Profile Modal
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDetails, setStudentDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);

  // Edit / Correction Mode
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('');
  const [editSaving, setEditSaving] = useState<boolean>(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { page, limit: 12 };
      if (search) params.search = search;
      if (academicYear) params.academicYear = academicYear;
      if (validationStatus) params.validationStatus = validationStatus;
      if (admissionCategory) params.admissionCategory = admissionCategory;

      const res = await ApiClient.getStudents(params);
      if (res.success) {
        setStudents(res.students);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error('Failed to load students', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, academicYear, validationStatus, admissionCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleOpenStudent = async (id: string) => {
    setSelectedStudentId(id);
    setIsEditing(false);
    setDetailsLoading(true);
    try {
      const res = await ApiClient.getStudentById(id);
      if (res.success) {
        setStudentDetails(res.student);
        setEditName(res.student.identity.fullName);
        setEditCategory(res.student.enrolment.admissionCategory);
      }
    } catch (err) {
      console.error('Failed to load student details', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSaveCorrection = async () => {
    if (!selectedStudentId) return;
    setEditSaving(true);
    try {
      const res = await ApiClient.updateStudent(studentDetails.enrolment.id, {
        studentName: editName,
        admissionCategory: editCategory,
      });
      if (res.success) {
        setIsEditing(false);
        handleOpenStudent(selectedStudentId);
        fetchStudents();
      }
    } catch (err) {
      console.error('Failed to update student', err);
    } finally {
      setEditSaving(false);
    }
  };

  const handleExportCsv = () => {
    window.open('/api/v1/students/export', '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Student Academic Records
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Privacy-preserving student records table with masked APAAR identifiers, quality scores, and verification status.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141414] text-neutral-200 hover:bg-[#1E1E1E] border border-[#333333] font-semibold text-xs transition-colors self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Cleaned CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#121212] border border-[#222222] flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by student name, masked ID, college..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Academic Year */}
          <select
            value={academicYear}
            onChange={(e) => {
              setAcademicYear(e.target.value);
              setPage(1);
            }}
            className="bg-[#0A0A0A] border border-[#262626] text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer"
          >
            <option value="">All Academic Years</option>
            <option value="2025-2026">AY 2025-2026</option>
            <option value="2024-2025">AY 2024-2025</option>
          </select>

          {/* Validation Status */}
          <select
            value={validationStatus}
            onChange={(e) => {
              setValidationStatus(e.target.value);
              setPage(1);
            }}
            className="bg-[#0A0A0A] border border-[#262626] text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer"
          >
            <option value="">All Validation Statuses</option>
            <option value="VALID">Valid (Passed)</option>
            <option value="REQUIRES_MANUAL_REVIEW">Requires Review</option>
            <option value="CROSS_INSTITUTION_FLAG">Cross-Institution Flag</option>
            <option value="DUPLICATE_CANDIDATE">Duplicate Candidate</option>
            <option value="MALFORMED">Malformed Identifier</option>
            <option value="MISSING">Missing APAAR ID</option>
          </select>

          {/* Category */}
          <select
            value={admissionCategory}
            onChange={(e) => {
              setAdmissionCategory(e.target.value);
              setPage(1);
            }}
            className="bg-[#0A0A0A] border border-[#262626] text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="GENERAL">General</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="EWS">EWS</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#121212] border border-[#262626] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A0A0A] text-slate-400 border-b border-[#262626]">
              <tr>
                <th className="py-3 px-4 font-semibold">Student Name</th>
                <th className="py-3 px-4 font-semibold">Masked APAAR ID</th>
                <th className="py-3 px-4 font-semibold">Institution Code</th>
                <th className="py-3 px-4 font-semibold">Student ID</th>
                <th className="py-3 px-4 font-semibold">Programme</th>
                <th className="py-3 px-4 font-semibold">Year</th>
                <th className="py-3 px-4 font-semibold">Admission Cat</th>
                <th className="py-3 px-4 font-semibold">Validation Status</th>
                <th className="py-3 px-4 font-semibold">Score</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-neutral-400">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading student records...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-neutral-400">
                    No matching student records found.
                  </td>
                </tr>
              ) : (
                students.map((stu) => (
                  <tr
                    key={stu.id}
                    onClick={() => handleOpenStudent(stu.id)}
                    className="hover:bg-[#1A1A1A]/60 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-[10px] border border-[#2E2E2E]">
                        {stu.studentName.charAt(0)}
                      </div>
                      <span>{stu.studentName}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-300">{stu.maskedApaarId}</td>
                    <td className="py-3 px-4 text-neutral-300">{stu.institutionCode}</td>
                    <td className="py-3 px-4 font-mono text-neutral-400">{stu.institutionStudentId}</td>
                    <td className="py-3 px-4 text-neutral-200">{stu.programmeCode}</td>
                    <td className="py-3 px-4 text-neutral-300">{stu.academicYear}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#0A0A0A] text-neutral-300 border border-[#262626] text-[10px] font-semibold">
                        {stu.admissionCategory}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadgeColor(stu.validationStatus)}`}>
                        {stu.validationStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{stu.validationScore}%</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenStudent(stu.id);
                        }}
                        className="p-1 rounded text-neutral-400 hover:text-white"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-[#0A0A0A] border-t border-[#262626] flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing {(page - 1) * 12 + 1} to {Math.min(page * 12, total)} of {total.toLocaleString('en-IN')} students
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-[#262626] text-slate-300 hover:bg-[#121212] disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-white font-medium">Page {page} of {totalPages || 1}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg border border-[#262626] text-slate-300 hover:bg-[#121212] disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* STUDENT PROFILE MODAL */}
      {selectedStudentId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#262626] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Top Header */}
            <div className="p-5 border-b border-[#222222] flex items-center justify-between bg-[#0A0A0A]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] text-white border border-[#333333] flex items-center justify-center font-bold text-base">
                  {studentDetails?.identity?.fullName?.charAt(0) || 'S'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    {studentDetails?.identity?.fullName || 'Student Profile'}
                  </h3>
                  <p className="text-xs text-neutral-400 font-mono">
                    ID: {studentDetails?.enrolment?.institutionStudentId} • APAAR: {studentDetails?.identity?.maskedApaarId}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(activeRole === 'INSTITUTION_ADMIN' || activeRole === 'AICTE_ADMIN') && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black font-bold text-xs hover:bg-neutral-200"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Correct Record</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedStudentId(null)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1A1A1A]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              {detailsLoading ? (
                <div className="py-12 text-center text-neutral-400">Loading student dossier...</div>
              ) : !studentDetails ? (
                <div className="py-12 text-center text-rose-400">Failed to load details.</div>
              ) : (
                <>
                  {/* Correction Form if active */}
                  {isEditing && (
                    <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#333333] space-y-3">
                      <span className="text-xs font-bold text-white uppercase tracking-wider block">
                        Source Data Correction Mode
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-neutral-400 mb-1">Student Full Name</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-[#121212] border border-[#262626] rounded-lg p-2 text-white focus:outline-none focus:border-neutral-400"
                          />
                        </div>
                        <div>
                          <label className="block text-neutral-400 mb-1">Admission Category</label>
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="w-full bg-[#121212] border border-[#262626] rounded-lg p-2 text-white focus:outline-none"
                          >
                            <option value="GENERAL">GENERAL</option>
                            <option value="OBC">OBC</option>
                            <option value="SC">SC</option>
                            <option value="ST">ST</option>
                            <option value="EWS">EWS</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-3 py-1.5 rounded-lg border border-[#262626] text-neutral-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveCorrection}
                          disabled={editSaving}
                          className="px-4 py-1.5 rounded-lg bg-white text-black font-bold hover:bg-neutral-200"
                        >
                          {editSaving ? 'Saving...' : 'Apply Correction & Re-Validate'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Section 1: Academic Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#222222]">
                      <h4 className="font-bold text-white mb-2 flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-white" />
                        <span>Institution Profile</span>
                      </h4>
                      <div className="space-y-1.5 text-neutral-300">
                        <p><span className="text-neutral-500">Institution:</span> {studentDetails.institution.name}</p>
                        <p><span className="text-neutral-500">Code:</span> {studentDetails.institution.code}</p>
                        <p><span className="text-neutral-500">State:</span> {studentDetails.institution.state}</p>
                        <p><span className="text-neutral-500">Type:</span> {studentDetails.institution.type}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#222222]">
                      <h4 className="font-bold text-white mb-2 flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-neutral-300" />
                        <span>Enrolment & Programme</span>
                      </h4>
                      <div className="space-y-1.5 text-neutral-300">
                        <p><span className="text-neutral-500">Programme:</span> {studentDetails.enrolment.programmeName}</p>
                        <p><span className="text-neutral-500">Programme Code:</span> {studentDetails.enrolment.programmeCode}</p>
                        <p><span className="text-neutral-500">Academic Year:</span> {studentDetails.enrolment.academicYear}</p>
                        <p><span className="text-neutral-500">Admission Date:</span> {formatDate(studentDetails.enrolment.admissionDate)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Quota & Supernumerary Status */}
                  <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#222222]">
                    <h4 className="font-bold text-white mb-3">Admission Quota & Special Seat Category</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-2.5 rounded bg-[#121212]">
                        <p className="text-neutral-500 text-[11px]">Seat Category</p>
                        <p className="font-semibold text-white mt-0.5">{studentDetails.enrolment.admissionCategory}</p>
                      </div>
                      <div className="p-2.5 rounded bg-[#121212]">
                        <p className="text-neutral-500 text-[11px]">Supernumerary</p>
                        <p className="font-semibold text-white mt-0.5">{studentDetails.enrolment.supernumeraryCategory?.replace(/_/g, ' ')}</p>
                      </div>
                      <div className="p-2.5 rounded bg-[#121212]">
                        <p className="text-neutral-500 text-[11px]">NRI / OCI Status</p>
                        <p className="font-semibold text-white mt-0.5">{studentDetails.enrolment.nriStatus ? 'YES' : 'NO'}</p>
                      </div>
                      <div className="p-2.5 rounded bg-[#121212]">
                        <p className="text-neutral-500 text-[11px]">Data Quality Score</p>
                        <p className="font-bold text-emerald-400 mt-0.5">{studentDetails.enrolment.validationScore}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Validation Findings & Integrity */}
                  {studentDetails.validationDetails.issues.length > 0 && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
                      <h4 className="font-bold text-rose-400 mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Validation Findings ({studentDetails.validationDetails.issues.length})</span>
                      </h4>
                      <div className="space-y-2">
                        {studentDetails.validationDetails.issues.map((iss: any) => (
                          <div key={iss.id} className="p-2.5 rounded bg-[#0A0A0A] border border-[#222222] text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-white">{iss.evidence.ruleDescription} ({iss.evidence.ruleCode})</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                                {iss.severity.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <p className="text-neutral-300">{iss.evidence.details}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section 4: Audit History */}
                  <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#222222]">
                    <h4 className="font-bold text-white mb-2 flex items-center gap-1.5">
                      <History className="w-4 h-4 text-white" />
                      <span>Record Audit Trail</span>
                    </h4>
                    <div className="divide-y divide-[#262626] text-[11px]">
                      {studentDetails.auditHistory.length === 0 ? (
                        <p className="text-slate-500 py-2">No historical events recorded for this student.</p>
                      ) : (
                        studentDetails.auditHistory.map((item: any) => (
                          <div key={item.id} className="py-2 flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-slate-200">{item.action}</span>
                              <p className="text-slate-500">{item.actorEmail} ({item.actorRole})</p>
                            </div>
                            <span className="text-slate-500">{formatDate(item.timestamp)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

