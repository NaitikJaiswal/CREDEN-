export type UserRole = 'AICTE_ADMIN' | 'INSTITUTION_ADMIN' | 'STUDENT' | 'VERIFIER';

export type InstitutionType = 'CENTRAL_UNIVERSITY' | 'STATE_TECHNICAL_UNIVERSITY' | 'AUTONOMOUS_COLLEGE' | 'AFFILIATED_INSTITUTE' | 'PGDM_INSTITUTION';

export type AdmissionCategory = 'GENERAL' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'MANAGEMENT';

export type SupernumeraryCategory = 'NONE' | 'TFW' | 'EWS_SUPERNUMERARY' | 'JK_MIGRANT' | 'PMSSS' | 'SPORTS_QUOTA' | 'DEFENCE';

export type EnrolmentStatus = 'ACTIVE' | 'COMPLETED' | 'DISCONTINUED' | 'SUSPENDED' | 'PROVISIONAL';

export type SubmissionStatus = 'DRAFT' | 'UPLOADED' | 'VALIDATING' | 'NEEDS_CORRECTION' | 'REVIEW_PENDING' | 'ACCEPTED';

export type ValidationStatus = 'VALID' | 'MALFORMED' | 'MISSING' | 'DUPLICATE_CANDIDATE' | 'CROSS_INSTITUTION_FLAG' | 'EXCESS_INTAKE_FLAG' | 'REQUIRES_MANUAL_REVIEW';

export type IssueSeverity = 'INFORMATIONAL' | 'WARNING' | 'NEEDS_REVIEW' | 'CONFIRMED_DATA_ERROR' | 'RESOLVED';

export type ReviewStatus = 'PENDING' | 'UNDER_INVESTIGATION' | 'CORRECTION_REQUESTED' | 'LEGITIMATE_EXCEPTION' | 'RESOLVED_DATA_ERROR' | 'RESOLVED';

export interface IUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  roles: UserRole[];
  institutionId?: string;
  studentIdentityId?: string;
  accountStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInstitution {
  id: string;
  institutionCode: string; // e.g. "AICTE-MH-1029"
  name: string;
  institutionType: InstitutionType;
  state: string;
  city: string;
  approvedYear: number;
  contactEmail: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_AUDIT';
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudentIdentity {
  id: string;
  protectedApaarIdentifier: string; // e.g. "APAAR-XXXX-XXXX-9142" (masked)
  identifierFingerprint: string; // HMAC-SHA256 hash of actual APAAR ID
  permittedIdentityAttributes: {
    fullName: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    dateOfBirthYearOnly?: number; // Minimization: only year stored by default
  };
  identifierValidationStatus: 'VERIFIED' | 'UNVERIFIED' | 'INVALID' | 'REQUIRES_MANUAL_REVIEW';
  createdAt: Date;
  updatedAt: Date;
}

export interface IEnrolment {
  id: string;
  studentIdentityId: string;
  institutionId: string;
  institutionStudentId: string; // e.g. "2024-CSE-045"
  programmeCode: string; // e.g. "BTECH-CSE", "PGDM-FIN", "MTECH-VLSI"
  programmeName: string;
  academicYear: string; // "2024-2025" or "2025-2026"
  admissionDate: string;
  admissionCategory: AdmissionCategory;
  supernumeraryCategory: SupernumeraryCategory;
  nriStatus: boolean;
  ociStatus: boolean;
  foreignNationalStatus: boolean;
  enrolmentStatus: EnrolmentStatus;
  validationStatus: ValidationStatus;
  validationScore: number; // 0 to 100 quality score
  sourceSystem: string;
  batchId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IApprovedIntake {
  id: string;
  institutionId: string;
  programmeCode: string;
  programmeName: string;
  academicYear: string;
  approvedSeatCount: number;
  maxSupernumeraryPercent: number; // e.g. 15% (for TFW/EWS)
  nriQuotaMax: number;
  policyVersion: string;
  effectiveFrom: string;
  sourceReference: string; // AICTE Approval Order Ref
}

export interface IImportBatch {
  id: string;
  institutionId: string;
  uploadedByUserId: string;
  fileName: string;
  academicYear: string;
  programmeCode?: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateCandidates: number;
  batchStatus: SubmissionStatus;
  validationErrors: Array<{
    rowNumber: number;
    apaarIdRaw?: string;
    studentId?: string;
    studentName?: string;
    errorMessage: string;
    severity: IssueSeverity;
    code: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IValidationIssue {
  id: string;
  issueType: 'MISSING_APAAR' | 'MALFORMED_APAAR' | 'DUPLICATE_SUBMISSION' | 'IDENTITY_CONFLICT' | 'CROSS_INSTITUTION_CONCURRENT' | 'INTAKE_VIOLATION' | 'ACADEMIC_INCONSISTENCY';
  severity: IssueSeverity;
  affectedRecordReferences: {
    enrolmentId?: string;
    studentIdentityId?: string;
    institutionStudentId?: string;
    batchId?: string;
    institutionId: string;
    conflictingInstitutionId?: string;
  };
  institutionId: string;
  evidence: {
    ruleCode: string; // e.g. "RULE_A", "RULE_C"
    ruleDescription: string;
    details: string;
    detectedValues: Record<string, any>;
    riskScore: number; // 0 - 100
  };
  ruleVersion: string;
  reviewStatus: ReviewStatus;
  assignedReviewer?: string;
  resolutionNotes?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVerificationRequest {
  id: string;
  tokenHash: string; // SHA-256 of random verification token
  verificationReference: string; // e.g. "CRDN-VRF-2026-98124"
  requesterId?: string;
  requesterOrgName: string;
  requesterEmail: string;
  studentReference: {
    studentIdentityId: string;
    enrolmentId: string;
  };
  requestedClaims: string[]; // ['ENROLMENT_STATUS', 'PROGRAMME_COMPLETION', 'INSTITUTION_AUTHENTICITY']
  authorizationBasis: 'CONSENT_GRANTED' | 'EMPLOYMENT_BACKGROUND_CHECK' | 'REGULATORY_COMPLIANCE';
  consentReference: string;
  verificationStatus: 'VERIFIED' | 'NOT_VERIFIED' | 'PENDING' | 'EXPIRED' | 'REVOKED';
  expiresAt: Date;
  accessedAt?: Date;
  qrPayloadUrl: string;
  createdAt: Date;
}

export interface IAuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  actorRole: UserRole;
  institutionId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  outcome: 'SUCCESS' | 'FAILURE' | 'WARNING';
  correlationId: string;
  sanitizedMetadata: Record<string, any>;
  timestamp: Date;
}

