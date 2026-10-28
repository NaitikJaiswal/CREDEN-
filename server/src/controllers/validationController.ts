import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { dbStore } from '../db/store.js';
import { AuditService } from '../services/audit/auditService.js';
import { ReviewStatus } from '../types/index.js';

export class ValidationController {
  static async getIssues(req: AuthenticatedRequest, res: Response): Promise<void> {
    const {
      page = 1,
      limit = 15,
      severity,
      issueType,
      reviewStatus,
      institutionId,
      search,
    } = req.query;

    let issues = [...dbStore.validationIssues];

    // Role check: Institution admins only see their own issues
    if (req.user?.roles.includes('INSTITUTION_ADMIN') && !req.user?.roles.includes('AICTE_ADMIN')) {
      issues = issues.filter((iss) => iss.institutionId === req.user?.institutionId);
    } else if (institutionId) {
      issues = issues.filter((iss) => iss.institutionId === institutionId);
    }

    if (severity) {
      issues = issues.filter((iss) => iss.severity === severity);
    }
    if (issueType) {
      issues = issues.filter((iss) => iss.issueType === issueType);
    }
    if (reviewStatus) {
      issues = issues.filter((iss) => iss.reviewStatus === reviewStatus);
    }

    // Enrich with institution metadata
    let enriched = issues.map((iss) => {
      const institution = dbStore.institutions.find((i) => i.id === iss.institutionId);
      const conflictingInstitution = iss.affectedRecordReferences.conflictingInstitutionId
        ? dbStore.institutions.find((i) => i.id === iss.affectedRecordReferences.conflictingInstitutionId)
        : null;

      return {
        ...iss,
        institutionName: institution?.name || 'Institution',
        institutionCode: institution?.institutionCode || 'N/A',
        conflictingInstitutionName: conflictingInstitution?.name,
      };
    });

    if (search) {
      const q = String(search).toLowerCase();
      enriched = enriched.filter(
        (iss) =>
          iss.evidence.ruleCode.toLowerCase().includes(q) ||
          iss.evidence.details.toLowerCase().includes(q) ||
          iss.institutionName.toLowerCase().includes(q) ||
          iss.issueType.toLowerCase().includes(q)
      );
    }

    // Sort by risk score descending
    enriched.sort((a, b) => (b.evidence.riskScore || 0) - (a.evidence.riskScore || 0));

    const pageNum = parseInt(String(page), 10);
    const limitNum = parseInt(String(limit), 10);
    const total = enriched.length;
    const paginated = enriched.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    // Summary counts for review center tabs
    const summary = {
      total,
      pending: issues.filter((i) => i.reviewStatus === 'PENDING').length,
      underInvestigation: issues.filter((i) => i.reviewStatus === 'UNDER_INVESTIGATION').length,
      correctionRequested: issues.filter((i) => i.reviewStatus === 'CORRECTION_REQUESTED').length,
      resolved: issues.filter((i) => i.reviewStatus === 'RESOLVED' || i.reviewStatus === 'LEGITIMATE_EXCEPTION').length,
    };

    res.json({
      success: true,
      summary,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      issues: paginated,
    });
  }

  static async reviewIssue(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { action, resolutionNotes } = req.body;

    const issue = dbStore.validationIssues.find((iss) => iss.id === id);
    if (!issue) {
      res.status(404).json({ success: false, error: 'Validation issue not found.' });
      return;
    }

    // Map action to ReviewStatus
    const actionStatusMap: Record<string, ReviewStatus> = {
      INVESTIGATE: 'UNDER_INVESTIGATION',
      REQUEST_CORRECTION: 'CORRECTION_REQUESTED',
      MARK_LEGITIMATE: 'LEGITIMATE_EXCEPTION',
      RESOLVE_ERROR: 'RESOLVED',
    };

    const targetStatus = actionStatusMap[action] || 'UNDER_INVESTIGATION';
    issue.reviewStatus = targetStatus;
    issue.assignedReviewer = req.user?.email || 'officer@creden.gov.in';
    issue.resolutionNotes = resolutionNotes || `Action: ${action} processed by ${req.user?.name}.`;
    if (targetStatus === 'RESOLVED' || targetStatus === 'LEGITIMATE_EXCEPTION') {
      issue.resolvedAt = new Date();
    }
    issue.updatedAt = new Date();

    await AuditService.recordEvent({
      actorId: req.user?.id || 'SYSTEM',
      actorEmail: req.user?.email || 'admin@creden.local',
      actorRole: req.user?.roles[0] || 'AICTE_ADMIN',
      institutionId: issue.institutionId,
      action: `VALIDATION_ISSUE_${action}`,
      resourceType: 'VALIDATION_ISSUE',
      resourceId: issue.id,
      outcome: 'SUCCESS',
      metadata: {
        newStatus: targetStatus,
        ruleCode: issue.evidence.ruleCode,
        resolutionNotes,
      },
    });

    res.json({
      success: true,
      message: `Issue status updated to ${targetStatus}.`,
      issue,
    });
  }
}

