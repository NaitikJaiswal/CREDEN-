import mongoose, { Schema } from 'mongoose';

// 1. Institution Schema
const InstitutionSchema = new Schema({
  institutionCode: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  institutionType: { 
    type: String, 
    enum: ['CENTRAL_UNIVERSITY', 'STATE_TECHNICAL_UNIVERSITY', 'AUTONOMOUS_COLLEGE', 'AFFILIATED_INSTITUTE', 'PGDM_INSTITUTION'],
    required: true 
  },
  state: { type: String, required: true, index: true },
  city: { type: String, required: true },
  approvedYear: { type: Number, default: 2000 },
  contactEmail: { type: String, required: true },
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'PENDING_AUDIT'], default: 'ACTIVE' },
}, { timestamps: true });

export const Institution = mongoose.model('Institution', InstitutionSchema);

// 2. User Schema
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  roles: [{ type: String, enum: ['AICTE_ADMIN', 'INSTITUTION_ADMIN', 'STUDENT', 'VERIFIER'], required: true }],
  institutionId: { type: String, index: true },
  studentIdentityId: { type: String },
  accountStatus: { type: String, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
  lastLoginAt: { type: Date },
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);

// 3. StudentIdentity Schema
const StudentIdentitySchema = new Schema({
  protectedApaarIdentifier: { type: String, required: true },
  identifierFingerprint: { type: String, required: true, unique: true, index: true },
  permittedIdentityAttributes: {
    fullName: { type: String, required: true },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], default: 'OTHER' },
    dateOfBirthYearOnly: { type: Number },
  },
  identifierValidationStatus: { 
    type: String, 
    enum: ['VERIFIED', 'UNVERIFIED', 'INVALID', 'REQUIRES_MANUAL_REVIEW'], 
    default: 'UNVERIFIED' 
  },
}, { timestamps: true });

export const StudentIdentity = mongoose.model('StudentIdentity', StudentIdentitySchema);

// 4. Enrolment Schema
const EnrolmentSchema = new Schema({
  studentIdentityId: { type: String, required: true, index: true },
  institutionId: { type: String, required: true, index: true },
  institutionStudentId: { type: String, required: true, index: true },
  programmeCode: { type: String, required: true, index: true },
  programmeName: { type: String, required: true },
  academicYear: { type: String, required: true, index: true },
  admissionDate: { type: String, required: true },
  admissionCategory: { 
    type: String, 
    enum: ['GENERAL', 'OBC', 'SC', 'ST', 'EWS', 'MANAGEMENT'], 
    default: 'GENERAL' 
  },
  supernumeraryCategory: { 
    type: String, 
    enum: ['NONE', 'TFW', 'EWS_SUPERNUMERARY', 'JK_MIGRANT', 'PMSSS', 'SPORTS_QUOTA', 'DEFENCE'], 
    default: 'NONE' 
  },
  nriStatus: { type: Boolean, default: false },
  ociStatus: { type: Boolean, default: false },
  foreignNationalStatus: { type: Boolean, default: false },
  enrolmentStatus: { 
    type: String, 
    enum: ['ACTIVE', 'COMPLETED', 'DISCONTINUED', 'SUSPENDED', 'PROVISIONAL'], 
    default: 'ACTIVE',
    index: true 
  },
  validationStatus: { 
    type: String, 
    enum: ['VALID', 'MALFORMED', 'MISSING', 'DUPLICATE_CANDIDATE', 'CROSS_INSTITUTION_FLAG', 'EXCESS_INTAKE_FLAG', 'REQUIRES_MANUAL_REVIEW'], 
    default: 'VALID',
    index: true 
  },
  validationScore: { type: Number, default: 95 },
  sourceSystem: { type: String, default: 'PORTAL_SUBMISSION' },
  batchId: { type: String, index: true },
}, { timestamps: true });

// Compound index to ensure uniqueness within institution student ID
EnrolmentSchema.index({ institutionId: 1, institutionStudentId: 1 }, { unique: false });

export const Enrolment = mongoose.model('Enrolment', EnrolmentSchema);

// 5. ApprovedIntake Schema
const ApprovedIntakeSchema = new Schema({
  institutionId: { type: String, required: true, index: true },
  programmeCode: { type: String, required: true, index: true },
  programmeName: { type: String, required: true },
  academicYear: { type: String, required: true, index: true },
  approvedSeatCount: { type: Number, required: true },
  maxSupernumeraryPercent: { type: Number, default: 15 },
  nriQuotaMax: { type: Number, default: 5 },
  policyVersion: { type: String, default: 'AICTE-APH-2024-25' },
  effectiveFrom: { type: String, default: '2024-06-01' },
  sourceReference: { type: String, default: 'AICTE/F.No/Approval-2024' },
}, { timestamps: true });

ApprovedIntakeSchema.index({ institutionId: 1, programmeCode: 1, academicYear: 1 }, { unique: true });

export const ApprovedIntake = mongoose.model('ApprovedIntake', ApprovedIntakeSchema);

// 6. ImportBatch Schema
const ImportBatchSchema = new Schema({
  institutionId: { type: String, required: true, index: true },
  uploadedByUserId: { type: String, required: true },
  fileName: { type: String, required: true },
  academicYear: { type: String, required: true },
  programmeCode: { type: String },
  totalRows: { type: Number, default: 0 },
  validRows: { type: Number, default: 0 },
  invalidRows: { type: Number, default: 0 },
  duplicateCandidates: { type: Number, default: 0 },
  batchStatus: { 
    type: String, 
    enum: ['DRAFT', 'UPLOADED', 'VALIDATING', 'NEEDS_CORRECTION', 'REVIEW_PENDING', 'ACCEPTED'], 
    default: 'VALIDATING' 
  },
  validationErrors: [{
    rowNumber: Number,
    apaarIdRaw: String,
    studentId: String,
    studentName: String,
    errorMessage: String,
    severity: String,
    code: String,
  }],
}, { timestamps: true });

export const ImportBatch = mongoose.model('ImportBatch', ImportBatchSchema);

// 7. ValidationIssue Schema
const ValidationIssueSchema = new Schema({
  issueType: { 
    type: String, 
    enum: ['MISSING_APAAR', 'MALFORMED_APAAR', 'DUPLICATE_SUBMISSION', 'IDENTITY_CONFLICT', 'CROSS_INSTITUTION_CONCURRENT', 'INTAKE_VIOLATION', 'ACADEMIC_INCONSISTENCY'], 
    required: true,
    index: true 
  },
  severity: { 
    type: String, 
    enum: ['INFORMATIONAL', 'WARNING', 'NEEDS_REVIEW', 'CONFIRMED_DATA_ERROR', 'RESOLVED'], 
    default: 'NEEDS_REVIEW',
    index: true 
  },
  affectedRecordReferences: {
    enrolmentId: String,
    studentIdentityId: String,
    institutionStudentId: String,
    batchId: String,
    institutionId: String,
    conflictingInstitutionId: String,
  },
  institutionId: { type: String, required: true, index: true },
  evidence: {
    ruleCode: { type: String, required: true },
    ruleDescription: { type: String, required: true },
    details: { type: String, required: true },
    detectedValues: { type: Schema.Types.Mixed },
    riskScore: { type: Number, default: 50 },
  },
  ruleVersion: { type: String, default: '1.0' },
  reviewStatus: { 
    type: String, 
    enum: ['PENDING', 'UNDER_INVESTIGATION', 'CORRECTION_REQUESTED', 'LEGITIMATE_EXCEPTION', 'RESOLVED_DATA_ERROR', 'RESOLVED'], 
    default: 'PENDING',
    index: true 
  },
  assignedReviewer: { type: String },
  resolutionNotes: { type: String },
  resolvedAt: { type: Date },
}, { timestamps: true });

export const ValidationIssue = mongoose.model('ValidationIssue', ValidationIssueSchema);

// 8. VerificationRequest Schema
const VerificationRequestSchema = new Schema({
  tokenHash: { type: String, required: true, index: true },
  verificationReference: { type: String, required: true, unique: true, index: true },
  requesterId: { type: String },
  requesterOrgName: { type: String, required: true },
  requesterEmail: { type: String, required: true },
  studentReference: {
    studentIdentityId: { type: String, required: true },
    enrolmentId: { type: String, required: true },
  },
  requestedClaims: [{ type: String }],
  authorizationBasis: { 
    type: String, 
    enum: ['CONSENT_GRANTED', 'EMPLOYMENT_BACKGROUND_CHECK', 'REGULATORY_COMPLIANCE'], 
    default: 'CONSENT_GRANTED' 
  },
  consentReference: { type: String, required: true },
  verificationStatus: { 
    type: String, 
    enum: ['VERIFIED', 'NOT_VERIFIED', 'PENDING', 'EXPIRED', 'REVOKED'], 
    default: 'VERIFIED' 
  },
  expiresAt: { type: Date, required: true },
  accessedAt: { type: Date },
  qrPayloadUrl: { type: String, required: true },
}, { timestamps: true });

export const VerificationRequest = mongoose.model('VerificationRequest', VerificationRequestSchema);

// 9. AuditLog Schema
const AuditLogSchema = new Schema({
  actorId: { type: String, required: true, index: true },
  actorEmail: { type: String, required: true },
  actorRole: { type: String, required: true },
  institutionId: { type: String, index: true },
  action: { type: String, required: true, index: true },
  resourceType: { type: String, required: true },
  resourceId: { type: String },
  outcome: { type: String, enum: ['SUCCESS', 'FAILURE', 'WARNING'], default: 'SUCCESS' },
  correlationId: { type: String, required: true, index: true },
  sanitizedMetadata: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now, index: true },
});

export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

