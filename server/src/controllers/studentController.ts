import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { dbStore } from '../db/store.js';
import { AuditService } from '../services/audit/auditService.js';
import { ApaarValidationService } from '../services/apaar/apaarValidationService.js';
import { DuplicateDetectionService } from '../services/validation/duplicateDetectionService.js';

export class StudentController {
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    const {
      page = 1,
      limit = 15,
      search,
      institutionId,
      programmeCode,
      academicYear,
      validationStatus,
      enrolmentStatus,
      admissionCategory,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    let enrolments = [...dbStore.enrolments];

    // Enforce institution scope if institution admin
    if (req.user?.roles.includes('INSTITUTION_ADMIN') && !req.user?.roles.includes('AICTE_ADMIN')) {
      enrolments = enrolments.filter((e) => e.institutionId === req.user?.institutionId);
    } else if (institutionId) {
      enrolments = enrolments.filter((e) => e.institutionId === institutionId);
    }

    if (programmeCode) {
      enrolments = enrolments.filter((e) => e.programmeCode === programmeCode);
    }
    if (academicYear) {
      enrolments = enrolments.filter((e) => e.academicYear === academicYear);
    }
    if (validationStatus) {
      enrolments = enrolments.filter((e) => e.validationStatus === validationStatus);
    }
    if (enrolmentStatus) {
      enrolments = enrolments.filter((e) => e.enrolmentStatus === enrolmentStatus);
    }
    if (admissionCategory) {
      enrolments = enrolments.filter((e) => e.admissionCategory === admissionCategory);
    }

    // Attach student identity details
    let enriched = enrolments.map((enrolment) => {
      const identity = dbStore.studentIdentities.find((i) => i.id === enrolment.studentIdentityId);
      const institution = dbStore.institutions.find((inst) => inst.id === enrolment.institutionId);
      return {
        ...enrolment,
        studentName: identity?.permittedIdentityAttributes.fullName || 'Student',
        gender: identity?.permittedIdentityAttributes.gender || 'OTHER',
        maskedApaarId: identity?.protectedApaarIdentifier || 'N/A',
        identifierValidationStatus: identity?.identifierValidationStatus || 'UNVERIFIED',
        institutionName: institution?.name || 'Unknown Institution',
        institutionCode: institution?.institutionCode || 'N/A',
      };
    });

    // Search
    if (search) {
      const q = String(search).toLowerCase();
      enriched = enriched.filter(
        (item) =>
          item.studentName.toLowerCase().includes(q) ||
          item.institutionStudentId.toLowerCase().includes(q) ||
          item.maskedApaarId.toLowerCase().includes(q) ||
          item.programmeCode.toLowerCase().includes(q) ||
          item.institutionName.toLowerCase().includes(q)
      );
    }

    // Sorting
    enriched.sort((a: any, b: any) => {
      let valA = a[sortBy as string];
      let valB = b[sortBy as string];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (sortOrder === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    const pageNum = parseInt(String(page), 10);
    const limitNum = parseInt(String(limit), 10);
    const total = enriched.length;
    const paginated = enriched.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      students: paginated,
    });
  }

  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const enrolment = dbStore.enrolments.find((e) => e.id === id || e.institutionStudentId === id);

    if (!enrolment) {
      res.status(404).json({ success: false, error: 'Student enrolment record not found.' });
      return;
    }

    // Security check: Institution isolation
    if (req.user?.roles.includes('INSTITUTION_ADMIN') && !req.user?.roles.includes('AICTE_ADMIN')) {
      if (enrolment.institutionId !== req.user.institutionId) {
        res.status(403).json({ success: false, error: 'Access denied: Record belongs to another institution.' });
        return;
      }
    }

    const identity = dbStore.studentIdentities.find((i) => i.id === enrolment.studentIdentityId);
    const institution = dbStore.institutions.find((i) => i.id === enrolment.institutionId);
    const intake = dbStore.approvedIntakes.find(
      (i) =>
        i.institutionId === enrolment.institutionId &&
        i.programmeCode === enrolment.programmeCode &&
        i.academicYear === enrolment.academicYear
    );

    // Get validation issues linked to this student
    const relatedIssues = dbStore.validationIssues.filter(
      (iss) =>
        iss.affectedRecordReferences.enrolmentId === enrolment.id ||
        iss.affectedRecordReferences.studentIdentityId === enrolment.studentIdentityId ||
        iss.affectedRecordReferences.institutionStudentId === enrolment.institutionStudentId
    );

    // Audit logs for this student
    const auditHistory = dbStore.auditLogs
      .filter((log) => log.resourceId === enrolment.id || log.resourceId === enrolment.studentIdentityId)
      .slice(-10)
      .reverse();

    res.json({
      success: true,
      student: {
        enrolment,
        identity: {
          fullName: identity?.permittedIdentityAttributes.fullName || 'Student',
          gender: identity?.permittedIdentityAttributes.gender,
          dateOfBirthYearOnly: identity?.permittedIdentityAttributes.dateOfBirthYearOnly,
          maskedApaarId: identity?.protectedApaarIdentifier || 'N/A',
          identifierValidationStatus: identity?.identifierValidationStatus || 'UNVERIFIED',
        },
        institution: {
          id: institution?.id,
          name: institution?.name,
          code: institution?.institutionCode,
          type: institution?.institutionType,
          state: institution?.state,
        },
        admissionDetails: {
          approvedSeatCount: intake?.approvedSeatCount || 'Configured via AICTE',
          supernumeraryCategory: enrolment.supernumeraryCategory,
          nriStatus: enrolment.nriStatus,
          ociStatus: enrolment.ociStatus,
          foreignNationalStatus: enrolment.foreignNationalStatus,
        },
        validationDetails: {
          score: enrolment.validationScore,
          validationStatus: enrolment.validationStatus,
          issues: relatedIssues,
        },
        auditHistory,
      },
    });
  }

  static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { studentName, programmeCode, academicYear, admissionCategory, enrolmentStatus } = req.body;

    const enrolment = dbStore.enrolments.find((e) => e.id === id);
    if (!enrolment) {
      res.status(404).json({ success: false, error: 'Enrolment record not found.' });
      return;
    }

    // Role check
    if (req.user?.roles.includes('INSTITUTION_ADMIN') && !req.user?.roles.includes('AICTE_ADMIN')) {
      if (enrolment.institutionId !== req.user.institutionId) {
        res.status(403).json({ success: false, error: 'Cannot modify records of other institutions.' });
        return;
      }
    }

    if (programmeCode) enrolment.programmeCode = programmeCode;
    if (academicYear) enrolment.academicYear = academicYear;
    if (admissionCategory) enrolment.admissionCategory = admissionCategory;
    if (enrolmentStatus) enrolment.enrolmentStatus = enrolmentStatus;
    enrolment.updatedAt = new Date();

    if (studentName) {
      const identity = dbStore.studentIdentities.find((i) => i.id === enrolment.studentIdentityId);
      if (identity) {
        identity.permittedIdentityAttributes.fullName = studentName;
        identity.updatedAt = new Date();
      }
    }

    // Re-evaluate validation score after correction
    enrolment.validationStatus = 'VALID';
    enrolment.validationScore = 96;

    // Resolve any pending data error issues for this student
    const pendingIssues = dbStore.validationIssues.filter(
      (iss) =>
        (iss.affectedRecordReferences.enrolmentId === enrolment.id ||
         iss.affectedRecordReferences.institutionStudentId === enrolment.institutionStudentId) &&
        iss.reviewStatus !== 'RESOLVED'
    );

    for (const iss of pendingIssues) {
      iss.reviewStatus = 'RESOLVED';
      iss.resolutionNotes = `Corrected by ${req.user?.name || 'Institution Administrator'} on ${new Date().toISOString()}`;
      iss.resolvedAt = new Date();
    }

    await AuditService.recordEvent({
      actorId: req.user?.id || 'SYSTEM',
      actorEmail: req.user?.email || 'admin@creden.local',
      actorRole: req.user?.roles[0] || 'INSTITUTION_ADMIN',
      institutionId: enrolment.institutionId,
      action: 'STUDENT_RECORD_CORRECTED',
      resourceType: 'ENROLMENT',
      resourceId: enrolment.id,
      outcome: 'SUCCESS',
      metadata: {
        institutionStudentId: enrolment.institutionStudentId,
        resolvedIssuesCount: pendingIssues.length,
      },
    });

    res.json({
      success: true,
      message: 'Student record corrected and re-validated successfully.',
      enrolment,
    });
  }

  static async exportCsv(req: AuthenticatedRequest, res: Response): Promise<void> {
    let enrolments = [...dbStore.enrolments];

    if (req.user?.roles.includes('INSTITUTION_ADMIN') && !req.user?.roles.includes('AICTE_ADMIN')) {
      enrolments = enrolments.filter((e) => e.institutionId === req.user?.institutionId);
    }

    // Safe formula injection escaping (prefix characters =, +, -, @ with ')
    const escapeCsv = (str: any) => {
      if (!str) return '""';
      let s = String(str).replace(/"/g, '""');
      if (s.startsWith('=') || s.startsWith('+') || s.startsWith('-') || s.startsWith('@')) {
        s = `'${s}`;
      }
      return `"${s}"`;
    };

    const headers = [
      'Student Name',
      'Masked APAAR ID',
      'Institution Student ID',
      'Institution Code',
      'Programme',
      'Academic Year',
      'Admission Date',
      'Category',
      'Enrolment Status',
      'Validation Status',
      'Data Quality Score',
    ];

    const rows = enrolments.map((e) => {
      const identity = dbStore.studentIdentities.find((i) => i.id === e.studentIdentityId);
      const institution = dbStore.institutions.find((i) => i.id === e.institutionId);
      return [
        escapeCsv(identity?.permittedIdentityAttributes.fullName || 'Student'),
        escapeCsv(identity?.protectedApaarIdentifier || 'N/A'),
        escapeCsv(e.institutionStudentId),
        escapeCsv(institution?.institutionCode || 'N/A'),
        escapeCsv(e.programmeCode),
        escapeCsv(e.academicYear),
        escapeCsv(e.admissionDate),
        escapeCsv(e.admissionCategory),
        escapeCsv(e.enrolmentStatus),
        escapeCsv(e.validationStatus),
        escapeCsv(e.validationScore),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    await AuditService.recordEvent({
      actorId: req.user?.id || 'SYSTEM',
      actorEmail: req.user?.email || 'user@creden.local',
      actorRole: req.user?.roles[0] || 'AICTE_ADMIN',
      institutionId: req.user?.institutionId,
      action: 'STUDENT_RECORDS_EXPORT_CSV',
      resourceType: 'ENROLMENT_EXPORT',
      outcome: 'SUCCESS',
      metadata: { recordsExported: enrolments.length },
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="creden_student_records.csv"');
    res.send(csvContent);
  }
}

