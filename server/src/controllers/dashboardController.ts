import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { dbStore } from '../db/store.js';
import { IntakeMonitoringService } from '../services/enrolment/intakeMonitoringService.js';

export class DashboardController {
  static async getOverview(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { academicYear, state, institutionId, programmeCode } = req.query;

    let enrolments = [...dbStore.enrolments];
    let institutions = [...dbStore.institutions];
    let intakes = [...dbStore.approvedIntakes];
    let issues = [...dbStore.validationIssues];

    // Role-based scoping: Institution Admins are strictly scoped to their institution
    const isInstitutionAdmin = req.user?.roles.includes('INSTITUTION_ADMIN');
    const effectiveInstId = isInstitutionAdmin && req.user?.institutionId
      ? req.user.institutionId
      : (institutionId ? String(institutionId) : undefined);

    if (effectiveInstId) {
      enrolments = enrolments.filter((e) => e.institutionId === effectiveInstId);
      institutions = institutions.filter((i) => i.id === effectiveInstId);
      intakes = intakes.filter((i) => i.institutionId === effectiveInstId);
      issues = issues.filter((iss) => iss.institutionId === effectiveInstId);
    }

    // Apply query filters
    if (academicYear) {
      enrolments = enrolments.filter((e) => e.academicYear === academicYear);
      intakes = intakes.filter((i) => i.academicYear === academicYear);
    }
    if (state && !effectiveInstId) {
      const stateInstIds = institutions
        .filter((i) => i.state.toLowerCase() === String(state).toLowerCase())
        .map((i) => i.id);
      enrolments = enrolments.filter((e) => stateInstIds.includes(e.institutionId));
      institutions = institutions.filter((i) => i.state.toLowerCase() === String(state).toLowerCase());
      intakes = intakes.filter((i) => stateInstIds.includes(i.institutionId));
      issues = issues.filter((iss) => stateInstIds.includes(iss.institutionId));
    }
    if (programmeCode) {
      enrolments = enrolments.filter((e) => e.programmeCode === programmeCode);
      intakes = intakes.filter((i) => i.programmeCode === programmeCode);
    }

    // 1. KPI Calculations
    const totalInstitutions = institutions.length;
    const totalStudentRecords = enrolments.length;

    // Records submitted in past 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const submittedThisMonth = enrolments.filter(
      (e) => new Date(e.createdAt).getTime() >= thirtyDaysAgo.getTime()
    ).length;

    // APAAR Validation Pass Rate
    const validRecords = enrolments.filter((e) => e.validationStatus === 'VALID').length;
    const passRate = totalStudentRecords > 0 
      ? Math.round((validRecords / totalStudentRecords) * 1000) / 10 
      : 0;

    // Pending institutional submissions (batches in VALIDATING or DRAFT)
    const pendingSubmissions = dbStore.importBatches.filter(
      (b) => b.batchStatus === 'VALIDATING' || b.batchStatus === 'DRAFT' || b.batchStatus === 'NEEDS_CORRECTION'
    ).length;

    // Potential duplicate enrolments
    const duplicateIssues = issues.filter(
      (iss) =>
        (iss.issueType === 'DUPLICATE_SUBMISSION' ||
         iss.issueType === 'CROSS_INSTITUTION_CONCURRENT' ||
         iss.issueType === 'IDENTITY_CONFLICT') &&
        iss.reviewStatus !== 'RESOLVED' &&
        iss.reviewStatus !== 'LEGITIMATE_EXCEPTION'
    ).length;

    // Institutions exceeding approved intake
    const intakeViolations: string[] = [];
    for (const intake of intakes) {
      const analysis = IntakeMonitoringService.calculateUtilization(intake, enrolments);
      if (analysis.isViolation && !intakeViolations.includes(intake.institutionId)) {
        intakeViolations.push(intake.institutionId);
      }
    }
    const institutionsExceedingIntake = intakeViolations.length;

    // Records requiring manual review
    const recordsRequiringReview = issues.filter(
      (iss) => iss.reviewStatus === 'PENDING' || iss.reviewStatus === 'UNDER_INVESTIGATION'
    ).length;

    // 2. Charts: Enrolment Overview (Approved vs Enrolled vs Remaining Capacity)
    let totalApprovedCapacity = 0;
    let totalActualEnrolled = 0;
    for (const intake of intakes) {
      totalApprovedCapacity += intake.approvedSeatCount;
    }
    totalActualEnrolled = enrolments.filter((e) => e.enrolmentStatus === 'ACTIVE').length;
    const remainingCapacity = Math.max(0, totalApprovedCapacity - totalActualEnrolled);

    // 3. Submission Status Distribution
    const statusCounts = {
      Accepted: enrolments.filter((e) => e.validationStatus === 'VALID').length,
      'Under Validation': enrolments.filter((e) => e.validationStatus === 'REQUIRES_MANUAL_REVIEW').length,
      'Needs Correction': enrolments.filter((e) => e.validationStatus === 'MALFORMED' || e.validationStatus === 'MISSING').length,
      'Duplicate Flagged': enrolments.filter((e) => e.validationStatus === 'DUPLICATE_CANDIDATE' || e.validationStatus === 'CROSS_INSTITUTION_FLAG').length,
      'Intake Violation': enrolments.filter((e) => e.validationStatus === 'EXCESS_INTAKE_FLAG').length,
    };

    // 4. Issue Breakdown by Type
    const issueDistribution = [
      { name: 'Missing APAAR ID', count: issues.filter((i) => i.issueType === 'MISSING_APAAR').length, color: '#FB7185' },
      { name: 'Malformed Identifiers', count: issues.filter((i) => i.issueType === 'MALFORMED_APAAR').length, color: '#FBBF24' },
      { name: 'Duplicate Submissions', count: issues.filter((i) => i.issueType === 'DUPLICATE_SUBMISSION').length, color: '#FB7185' },
      { name: 'Cross-Institution Flags', count: issues.filter((i) => i.issueType === 'CROSS_INSTITUTION_CONCURRENT').length, color: '#8B7CFF' },
      { name: 'Identity Conflicts', count: issues.filter((i) => i.issueType === 'IDENTITY_CONFLICT').length, color: '#42D6FF' },
      { name: 'Intake Excesses', count: issues.filter((i) => i.issueType === 'INTAKE_VIOLATION').length, color: '#F43F5E' },
    ];

    // 5. Regional Overview by State
    const stateMap: Record<string, { institutions: number; enrolled: number; approved: number }> = {};
    for (const inst of institutions) {
      if (!stateMap[inst.state]) {
        stateMap[inst.state] = { institutions: 0, enrolled: 0, approved: 0 };
      }
      stateMap[inst.state].institutions += 1;
    }
    for (const e of enrolments) {
      const inst = dbStore.institutions.find((i) => i.id === e.institutionId);
      if (inst && stateMap[inst.state]) {
        stateMap[inst.state].enrolled += 1;
      }
    }
    for (const intake of intakes) {
      const inst = dbStore.institutions.find((i) => i.id === intake.institutionId);
      if (inst && stateMap[inst.state]) {
        stateMap[inst.state].approved += intake.approvedSeatCount;
      }
    }
    const regionalData = Object.entries(stateMap).map(([stateName, data]) => ({
      state: stateName,
      institutions: data.institutions,
      enrolled: data.enrolled,
      approved: data.approved,
      utilizationRate: data.approved > 0 ? Math.round((data.enrolled / data.approved) * 100) : 0,
    }));

    // 6. Recent Application Activity Logs
    const recentActivity = dbStore.auditLogs.slice(-8).reverse().map((log) => ({
      id: log.id,
      action: log.action,
      actorEmail: log.actorEmail,
      actorRole: log.actorRole,
      resourceType: log.resourceType,
      outcome: log.outcome,
      timestamp: log.timestamp,
    }));

    // 7. Intake Utilization by Institution (Top 6)
    const institutionUtilization = institutions.slice(0, 6).map((inst) => {
      const instIntakes = intakes.filter((i) => i.institutionId === inst.id);
      const approved = instIntakes.reduce((sum, i) => sum + i.approvedSeatCount, 0);
      const enrolled = enrolments.filter((e) => e.institutionId === inst.id && e.enrolmentStatus === 'ACTIVE').length;
      return {
        name: inst.name.replace(/College of Engineering|Technology|University/g, '').trim(),
        code: inst.institutionCode,
        approved,
        enrolled,
        utilizationRate: approved > 0 ? Math.round((enrolled / approved) * 100) : 0,
      };
    });

    res.json({
      success: true,
      kpis: {
        totalInstitutions: {
          value: totalInstitutions,
          trend: '+2 from last cycle',
          tooltip: 'Total AICTE approved technical & management institutions registered in CREDEN.',
        },
        totalStudentRecords: {
          value: totalStudentRecords,
          trend: '+12.4% vs 2024-25',
          tooltip: 'Verified student academic enrolment profiles tracked nationally.',
        },
        submittedThisMonth: {
          value: submittedThisMonth,
          trend: '+450 new submissions',
          tooltip: 'Student enrolment records uploaded by institutions within the last 30 days.',
        },
        validationPassRate: {
          value: `${passRate}%`,
          trend: passRate > 80 ? '+4.2% quality increase' : '-2.1%',
          tooltip: 'Percentage of student submissions passing all format, consistency, and identity checks.',
        },
        pendingSubmissions: {
          value: pendingSubmissions,
          trend: '3 batches awaiting correction',
          tooltip: 'Institutional submissions currently in validation or requiring correction before acceptance.',
        },
        duplicateEnrolments: {
          value: duplicateIssues,
          trend: 'Active investigative review',
          tooltip: 'Potential cross-institution concurrent enrolments or repeated APAAR records flagged.',
        },
        institutionsExceedingIntake: {
          value: institutionsExceedingIntake,
          trend: institutionsExceedingIntake > 0 ? 'Action required' : 'Compliance maintained',
          tooltip: 'Institutions where active student enrolment exceeds AICTE approved seat limits.',
        },
        recordsRequiringReview: {
          value: recordsRequiringReview,
          trend: 'Priority queue',
          tooltip: 'Discrepancies needing manual review by institution or AICTE administrative officers.',
        },
      },
      intakeSummary: {
        totalApprovedCapacity,
        totalActualEnrolled,
        remainingCapacity,
        nationalUtilizationRate: totalApprovedCapacity > 0 ? Math.round((totalActualEnrolled / totalApprovedCapacity) * 100) : 0,
      },
      submissionStatusCounts: statusCounts,
      issueDistribution,
      regionalData,
      institutionUtilization,
      recentActivity,
      institutionInfo: effectiveInstId ? institutions[0] : null,
      userRole: req.user?.roles[0] || 'AICTE_ADMIN',
    });
  }
}

