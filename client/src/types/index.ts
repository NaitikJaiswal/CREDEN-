export type UserRole = 'AICTE_ADMIN' | 'INSTITUTION_ADMIN' | 'STUDENT' | 'VERIFIER';

export interface User {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  institutionId?: string;
  institution?: {
    id: string;
    name: string;
    institutionCode: string;
    state: string;
  };
  studentIdentityId?: string;
  lastLoginAt?: string;
}

export interface Institution {
  id: string;
  institutionCode: string;
  name: string;
  institutionType: string;
  state: string;
  city: string;
  approvedYear: number;
  contactEmail: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_AUDIT';
}

export interface StudentRecord {
  id: string;
  studentIdentityId: string;
  studentName: string;
  gender: string;
  maskedApaarId: string;
  institutionId: string;
  institutionName: string;
  institutionCode: string;
  institutionStudentId: string;
  programmeCode: string;
  programmeName: string;
  academicYear: string;
  admissionDate: string;
  admissionCategory: string;
  supernumeraryCategory: string;
  nriStatus: boolean;
  ociStatus: boolean;
  foreignNationalStatus: boolean;
  enrolmentStatus: string;
  validationStatus: string;
  validationScore: number;
  sourceSystem: string;
  createdAt: string;
}

export interface ValidationIssue {
  id: string;
  issueType: string;
  severity: string;
  institutionId: string;
  institutionName: string;
  institutionCode: string;
  conflictingInstitutionName?: string;
  affectedRecordReferences: {
    enrolmentId?: string;
    studentIdentityId?: string;
    institutionStudentId?: string;
    batchId?: string;
    institutionId: string;
    conflictingInstitutionId?: string;
  };
  evidence: {
    ruleCode: string;
    ruleDescription: string;
    details: string;
    detectedValues: Record<string, any>;
    riskScore: number;
  };
  ruleVersion: string;
  reviewStatus: string;
  assignedReviewer?: string;
  resolutionNotes?: string;
  createdAt: string;
}

export interface DashboardOverview {
  kpis: {
    totalInstitutions: { value: number; trend: string; tooltip: string };
    totalStudentRecords: { value: number; trend: string; tooltip: string };
    submittedThisMonth: { value: number; trend: string; tooltip: string };
    validationPassRate: { value: string; trend: string; tooltip: string };
    pendingSubmissions: { value: number; trend: string; tooltip: string };
    duplicateEnrolments: { value: number; trend: string; tooltip: string };
    institutionsExceedingIntake: { value: number; trend: string; tooltip: string };
    recordsRequiringReview: { value: number; trend: string; tooltip: string };
  };
  intakeSummary: {
    totalApprovedCapacity: number;
    totalActualEnrolled: number;
    remainingCapacity: number;
    nationalUtilizationRate: number;
  };
  submissionStatusCounts: Record<string, number>;
  issueDistribution: Array<{ name: string; count: number; color: string }>;
  regionalData: Array<{ state: string; institutions: number; enrolled: number; approved: number; utilizationRate: number }>;
  institutionUtilization: Array<{ name: string; code: string; approved: number; enrolled: number; utilizationRate: number }>;
  recentActivity: Array<{
    id: string;
    action: string;
    actorEmail: string;
    actorRole: string;
    resourceType: string;
    outcome: string;
    timestamp: string;
  }>;
  institutionInfo?: any;
  userRole?: string;
}

