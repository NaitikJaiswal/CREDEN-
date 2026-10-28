import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { dbStore } from '../db/store.js';
import { v4 as uuidv4 } from 'uuid';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ApaarValidationService } from '../services/apaar/apaarValidationService.js';
import { DuplicateDetectionService } from '../services/validation/duplicateDetectionService.js';
import { IntakeMonitoringService } from '../services/enrolment/intakeMonitoringService.js';
import { AuditService } from '../services/audit/auditService.js';
import { IImportBatch, IEnrolment, IStudentIdentity, IValidationIssue } from '../types/index.js';

export class UploadController {
  /**
   * Generates a downloadable CSV template with sample synthetic headers
   */
  static downloadTemplate(req: AuthenticatedRequest, res: Response): void {
    const headers = [
      'apaarId',
      'institutionStudentId',
      'studentName',
      'institutionCode',
      'programmeCode',
      'academicYear',
      'admissionDate',
      'admissionCategory',
      'enrolmentStatus',
      'supernumeraryCategory',
      'nriStatus',
      'ociStatus',
      'foreignNationalStatus'
    ];

    const sampleRow = [
      '987654321012',
      '2025-CSE-001',
      'Ananya Sharma',
      'AICTE-MH-1029',
      'BTECH-CSE',
      '2025-2026',
      '2025-08-01',
      'GENERAL',
      'ACTIVE',
      'NONE',
      'FALSE',
      'FALSE',
      'FALSE'
    ];

    const csv = `${headers.join(',')}\n${sampleRow.join(',')}`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="creden_student_upload_template.csv"');
    res.send(csv);
  }

  /**
   * Process uploaded CSV or XLSX file
   */
  static async processBulkUpload(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded. Please upload a CSV or XLSX file.' });
      return;
    }

    const { academicYear = '2025-2026', programmeCode } = req.body;
    let targetInstitutionId = req.user?.institutionId;

    if (req.user?.roles.includes('AICTE_ADMIN') && req.body.institutionId) {
      targetInstitutionId = req.body.institutionId;
    }

    if (!targetInstitutionId) {
      const firstInst = dbStore.institutions[0];
      targetInstitutionId = firstInst?.id || 'INST-001';
    }

    const institution = dbStore.institutions.find((i) => i.id === targetInstitutionId);
    let rows: any[] = [];

    // Parse file based on extension/mimetype
    try {
      if (req.file.originalname.endsWith('.xlsx') || req.file.originalname.endsWith('.xls')) {
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        rows = XLSX.utils.sheet_to_json(sheet);
      } else {
        const fileContent = req.file.buffer.toString('utf-8');
        const parsed = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
        rows = parsed.data;
      }
    } catch (parseErr: any) {
      res.status(400).json({
        success: false,
        error: `Failed to parse file: ${parseErr.message}`,
      });
      return;
    }

    if (rows.length === 0) {
      res.status(400).json({ success: false, error: 'Uploaded file contains no data rows.' });
      return;
    }

    const batchId = uuidv4();
    const batchErrors: Array<{
      rowNumber: number;
      apaarIdRaw?: string;
      studentId?: string;
      studentName?: string;
      errorMessage: string;
      severity: any;
      code: string;
    }> = [];

    let validRows = 0;
    let duplicateCandidates = 0;
    const newEnrolments: IEnrolment[] = [];
    const newIdentities: IStudentIdentity[] = [];
    const createdIssues: IValidationIssue[] = [];

    // Process each row
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const rowNum = index + 2; // +1 for 0-index, +1 for header

      const apaarIdRaw = row.apaarId || row.APAAR_ID || row['APAAR ID'] || '';
      const studentId = row.institutionStudentId || row.studentId || row['Student ID'] || `STU-${rowNum}`;
      const studentName = row.studentName || row.name || row['Student Name'] || 'Unknown Student';
      const progCode = row.programmeCode || programmeCode || 'BTECH-CSE';
      const year = row.academicYear || academicYear;
      const category = (row.admissionCategory || 'GENERAL').toUpperCase();
      const superCat = (row.supernumeraryCategory || 'NONE').toUpperCase();

      // 1. Layer 1: Format Validation
      const formatResult = ApaarValidationService.validateFormat(apaarIdRaw);
      if (!formatResult.isValidFormat) {
        batchErrors.push({
          rowNumber: rowNum,
          apaarIdRaw,
          studentId,
          studentName,
          errorMessage: formatResult.error || 'Invalid APAAR format',
          severity: 'CONFIRMED_DATA_ERROR',
          code: apaarIdRaw ? 'MALFORMED_APAAR' : 'MISSING_APAAR',
        });
        continue;
      }

      // 2. Layer 3: Authoritative Verification Adapter
      const authResult = await ApaarValidationService.validateWithAuthoritativeAdapter(
        formatResult.normalizedId!,
        studentName
      );

      // 3. Layer 2 & 4: Duplicate & Conflict Detection
      const duplicateResult = DuplicateDetectionService.evaluateEnrolment(
        {
          apaarFingerprint: formatResult.fingerprint,
          institutionId: targetInstitutionId,
          institutionStudentId: studentId,
          studentName,
          academicYear: year,
          enrolmentStatus: 'ACTIVE',
          programmeCode: progCode,
          batchId,
        },
        [...dbStore.enrolments, ...newEnrolments],
        [...dbStore.studentIdentities, ...newIdentities]
      );

      if (duplicateResult.hasDuplicateOrConflict) {
        duplicateCandidates++;
        for (const iss of duplicateResult.issues) {
          batchErrors.push({
            rowNumber: rowNum,
            apaarIdRaw: formatResult.maskedId,
            studentId,
            studentName,
            errorMessage: iss.evidence?.details || 'Duplicate or conflict detected',
            severity: iss.severity || 'NEEDS_REVIEW',
            code: iss.evidence?.ruleCode || 'DUPLICATE',
          });
          createdIssues.push(iss as IValidationIssue);
        }
      }

      // If no fatal errors, create identity and enrolment records
      let identity = dbStore.studentIdentities.find(
        (i) => i.identifierFingerprint === formatResult.fingerprint
      );

      if (!identity) {
        identity = {
          id: uuidv4(),
          protectedApaarIdentifier: formatResult.maskedId,
          identifierFingerprint: formatResult.fingerprint,
          permittedIdentityAttributes: {
            fullName: studentName,
            gender: 'OTHER',
            dateOfBirthYearOnly: 2004,
          },
          identifierValidationStatus: authResult.status as any,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        newIdentities.push(identity);
      }

      const enrolment: IEnrolment = {
        id: uuidv4(),
        studentIdentityId: identity.id,
        institutionId: targetInstitutionId,
        institutionStudentId: studentId,
        programmeCode: progCode,
        programmeName: progCode === 'BTECH-CSE' ? 'B.Tech in Computer Science & Engineering' : progCode,
        academicYear: year,
        admissionDate: row.admissionDate || '2025-08-01',
        admissionCategory: category as any,
        supernumeraryCategory: superCat as any,
        nriStatus: String(row.nriStatus).toLowerCase() === 'true',
        ociStatus: String(row.ociStatus).toLowerCase() === 'true',
        foreignNationalStatus: String(row.foreignNationalStatus).toLowerCase() === 'true',
        enrolmentStatus: 'ACTIVE',
        validationStatus: duplicateResult.hasDuplicateOrConflict ? 'DUPLICATE_CANDIDATE' : 'VALID',
        validationScore: Math.max(20, 100 - duplicateResult.riskScore),
        sourceSystem: 'CSV_BULK_UPLOAD',
        batchId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      newEnrolments.push(enrolment);
      validRows++;
    }

    // Persist to store
    for (const id of newIdentities) {
      dbStore.insert(dbStore.studentIdentities, id);
    }
    for (const e of newEnrolments) {
      dbStore.insert(dbStore.enrolments, e);
    }
    for (const iss of createdIssues) {
      dbStore.insert(dbStore.validationIssues, iss);
    }

    // Create batch record
    const batchRecord: IImportBatch = {
      id: batchId,
      institutionId: targetInstitutionId,
      uploadedByUserId: req.user?.id || 'USER-ADMIN',
      fileName: req.file.originalname,
      academicYear,
      programmeCode,
      totalRows: rows.length,
      validRows,
      invalidRows: batchErrors.length,
      duplicateCandidates,
      batchStatus: batchErrors.length > 0 ? 'NEEDS_CORRECTION' : 'ACCEPTED',
      validationErrors: batchErrors,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dbStore.insert(dbStore.importBatches, batchRecord);

    await AuditService.recordEvent({
      actorId: req.user?.id || 'SYSTEM',
      actorEmail: req.user?.email || 'admin@creden.local',
      actorRole: req.user?.roles[0] || 'INSTITUTION_ADMIN',
      institutionId: targetInstitutionId,
      action: 'BULK_STUDENT_UPLOAD_PROCESSED',
      resourceType: 'IMPORT_BATCH',
      resourceId: batchId,
      outcome: batchErrors.length === 0 ? 'SUCCESS' : 'WARNING',
      metadata: {
        totalRows: rows.length,
        validRows,
        invalidRows: batchErrors.length,
        duplicateCandidates,
      },
    });

    res.json({
      success: true,
      batchId,
      summary: {
        fileName: req.file.originalname,
        institutionName: institution?.name || 'Institution',
        academicYear,
        totalRows: rows.length,
        validRows,
        invalidRows: batchErrors.length,
        duplicateCandidates,
        batchStatus: batchRecord.batchStatus,
      },
      validationReport: {
        errors: batchErrors.slice(0, 50),
        guidance: batchErrors.length > 0
          ? `Your upload processed ${validRows} valid rows, but contains ${batchErrors.length} format/duplicate anomalies. Download error report, correct affected records, and resubmit.`
          : 'All records passed format, duplicate, and authoritative verification checks successfully!',
      },
    });
  }

  /**
   * Download CSV report of errors for a specific batch
   */
  static downloadErrorReport(req: AuthenticatedRequest, res: Response): void {
    const { batchId } = req.params;
    const batch = dbStore.importBatches.find((b) => b.id === batchId);

    if (!batch) {
      res.status(404).json({ success: false, error: 'Import batch not found.' });
      return;
    }

    const headers = ['Row Number', 'Student ID', 'Student Name', 'Raw Identifier', 'Error Code', 'Severity', 'Detailed Guidance'];
    const rows = batch.validationErrors.map((err) => [
      `"${err.rowNumber}"`,
      `"${err.studentId || 'N/A'}"`,
      `"${err.studentName || 'N/A'}"`,
      `"${err.apaarIdRaw || 'N/A'}"`,
      `"${err.code}"`,
      `"${err.severity}"`,
      `"${err.errorMessage.replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="creden_batch_errors_${String(batchId).substring(0, 8)}.csv"`);
    res.send(csv);
  }
}
