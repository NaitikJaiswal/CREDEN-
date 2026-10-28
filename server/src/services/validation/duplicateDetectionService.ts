import { IEnrolment, IStudentIdentity, IValidationIssue } from '../../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export interface DuplicateDetectionResult {
  hasDuplicateOrConflict: boolean;
  issues: Partial<IValidationIssue>[];
  riskScore: number;
}

export class DuplicateDetectionService {
  /**
   * Evaluates Rules A, B, C, D, E for student enrolments
   */
  static evaluateEnrolment(
    newRecord: {
      apaarFingerprint: string;
      institutionId: string;
      institutionStudentId: string;
      studentName: string;
      academicYear: string;
      enrolmentStatus: string;
      programmeCode: string;
      batchId?: string;
    },
    existingEnrolments: IEnrolment[],
    existingIdentities: IStudentIdentity[]
  ): DuplicateDetectionResult {
    const issues: Partial<IValidationIssue>[] = [];
    let riskScore = 0;

    // Find all existing records sharing the same APAAR fingerprint
    const matchingIdentities = existingIdentities.filter(
      (id) => id.identifierFingerprint === newRecord.apaarFingerprint
    );

    const matchingIdentityIds = matchingIdentities.map((i) => i.id);

    const relatedEnrolments = existingEnrolments.filter(
      (e) => matchingIdentityIds.includes(e.studentIdentityId)
    );

    // Rule A: Same APAAR identifier and same institution student ID within the same batch or institution
    const duplicateSubmission = relatedEnrolments.find(
      (e) =>
        e.institutionId === newRecord.institutionId &&
        e.institutionStudentId === newRecord.institutionStudentId &&
        e.academicYear === newRecord.academicYear
    );

    if (duplicateSubmission) {
      riskScore = Math.max(riskScore, 85);
      issues.push({
        id: uuidv4(),
        issueType: 'DUPLICATE_SUBMISSION',
        severity: 'CONFIRMED_DATA_ERROR',
        institutionId: newRecord.institutionId,
        affectedRecordReferences: {
          enrolmentId: duplicateSubmission.id,
          institutionStudentId: newRecord.institutionStudentId,
          institutionId: newRecord.institutionId,
          batchId: newRecord.batchId,
        },
        evidence: {
          ruleCode: 'RULE_A',
          ruleDescription: 'Duplicate Submission Detection',
          details: `Same APAAR ID and Institution Student ID (${newRecord.institutionStudentId}) already submitted for ${newRecord.academicYear}.`,
          detectedValues: {
            existingRecordId: duplicateSubmission.id,
            institutionStudentId: newRecord.institutionStudentId,
            academicYear: newRecord.academicYear,
          },
          riskScore: 85,
        },
        reviewStatus: 'PENDING',
      });
    }

    // Rule B: Same APAAR identifier associated with conflicting identity attributes (e.g. conflicting names)
    for (const identity of matchingIdentities) {
      const existingName = identity.permittedIdentityAttributes.fullName.trim().toLowerCase();
      const currentName = newRecord.studentName.trim().toLowerCase();

      if (existingName && currentName && existingName !== currentName) {
        // Calculate basic difference
        riskScore = Math.max(riskScore, 65);
        issues.push({
          id: uuidv4(),
          issueType: 'IDENTITY_CONFLICT',
          severity: 'NEEDS_REVIEW',
          institutionId: newRecord.institutionId,
          affectedRecordReferences: {
            studentIdentityId: identity.id,
            institutionId: newRecord.institutionId,
            batchId: newRecord.batchId,
          },
          evidence: {
            ruleCode: 'RULE_B',
            ruleDescription: 'Conflicting Student Identity Details',
            details: `Identity conflict detected: Same APAAR ID linked to "${identity.permittedIdentityAttributes.fullName}" in prior registry, but submitted as "${newRecord.studentName}".`,
            detectedValues: {
              registeredName: identity.permittedIdentityAttributes.fullName,
              submittedName: newRecord.studentName,
            },
            riskScore: 65,
          },
          reviewStatus: 'UNDER_INVESTIGATION',
        });
      }
    }

    // Rule C: Same APAAR identifier associated with different institutions and overlapping active enrolment periods
    const concurrentActiveEnrolments = relatedEnrolments.filter(
      (e) =>
        e.institutionId !== newRecord.institutionId &&
        e.enrolmentStatus === 'ACTIVE' &&
        newRecord.enrolmentStatus === 'ACTIVE' &&
        e.academicYear === newRecord.academicYear
    );

    if (concurrentActiveEnrolments.length > 0) {
      riskScore = Math.max(riskScore, 75);
      const conflictingRecord = concurrentActiveEnrolments[0];
      issues.push({
        id: uuidv4(),
        issueType: 'CROSS_INSTITUTION_CONCURRENT',
        severity: 'NEEDS_REVIEW',
        institutionId: newRecord.institutionId,
        affectedRecordReferences: {
          enrolmentId: conflictingRecord.id,
          institutionId: newRecord.institutionId,
          conflictingInstitutionId: conflictingRecord.institutionId,
          batchId: newRecord.batchId,
        },
        evidence: {
          ruleCode: 'RULE_C',
          ruleDescription: 'Potential Concurrent Cross-Institution Enrolment',
          details: `Student holds concurrent ACTIVE enrolment in institution ${conflictingRecord.institutionId} for programme ${conflictingRecord.programmeCode} in academic year ${newRecord.academicYear}. Review required per UGC/AICTE dual-degree policy.`,
          detectedValues: {
            otherInstitutionId: conflictingRecord.institutionId,
            otherProgramme: conflictingRecord.programmeCode,
            academicYear: newRecord.academicYear,
          },
          riskScore: 75,
        },
        reviewStatus: 'UNDER_INVESTIGATION',
      });
    }

    // Rule D & E: Legitimate historical enrolment & multiple qualifications
    // Check if there are enrolments in DIFFERENT academic years or with COMPLETED status
    const legitimatePrior = relatedEnrolments.filter(
      (e) =>
        e.academicYear !== newRecord.academicYear ||
        e.enrolmentStatus === 'COMPLETED'
    );

    if (legitimatePrior.length > 0 && issues.length === 0) {
      // Legitimate progression - informational log only
      issues.push({
        id: uuidv4(),
        issueType: 'ACADEMIC_INCONSISTENCY',
        severity: 'INFORMATIONAL',
        institutionId: newRecord.institutionId,
        evidence: {
          ruleCode: 'RULE_D_E',
          ruleDescription: 'Verified Academic Progression Track',
          details: `Student has legitimate prior academic credentials on record (${legitimatePrior.length} past record/s). No fraud or concurrency detected.`,
          detectedValues: {
            priorQualificationsCount: legitimatePrior.length,
          },
          riskScore: 5,
        },
        reviewStatus: 'LEGITIMATE_EXCEPTION',
      });
    }

    return {
      hasDuplicateOrConflict: issues.some((i) => i.severity !== 'INFORMATIONAL'),
      issues,
      riskScore,
    };
  }
}

