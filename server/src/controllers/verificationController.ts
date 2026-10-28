import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { dbStore } from '../db/store.js';
import { VerificationService } from '../services/verification/verificationService.js';
import { hashVerificationToken } from '../utils/security.js';
import { AuditService } from '../services/audit/auditService.js';

export class VerificationController {
  /**
   * Generates a new verification request with token & QR code
   */
  static async createRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { studentId, requesterOrg = 'Authorized Verifier Corp', requesterEmail = 'verify@partner.org' } = req.body;

    const enrolment = dbStore.enrolments.find(
      (e) => e.id === studentId || e.institutionStudentId === studentId
    );

    if (!enrolment) {
      res.status(404).json({ success: false, error: 'Student enrolment record not found.' });
      return;
    }

    const identity = dbStore.studentIdentities.find((i) => i.id === enrolment.studentIdentityId);
    const institution = dbStore.institutions.find((inst) => inst.id === enrolment.institutionId);

    if (!identity || !institution) {
      res.status(400).json({ success: false, error: 'Incomplete identity or institution records.' });
      return;
    }

    const { request, rawToken, qrCodeDataUrl } = await VerificationService.createVerificationRequest(
      identity,
      enrolment,
      institution,
      requesterOrg,
      requesterEmail
    );

    dbStore.insert(dbStore.verificationRequests, request);

    await AuditService.recordEvent({
      actorId: req.user?.id || 'SYSTEM',
      actorEmail: req.user?.email || requesterEmail,
      actorRole: req.user?.roles[0] || 'VERIFIER',
      institutionId: institution.id,
      action: 'VERIFICATION_TOKEN_ISSUED',
      resourceType: 'VERIFICATION_REQUEST',
      resourceId: request.id,
      outcome: 'SUCCESS',
      metadata: { verificationReference: request.verificationReference },
    });

    res.json({
      success: true,
      verificationReference: request.verificationReference,
      rawToken,
      verificationUrl: request.qrPayloadUrl,
      qrCodeDataUrl,
      expiresAt: request.expiresAt,
    });
  }

  /**
   * Public or authorized verification resolution by token or reference
   */
  static async verify(req: Request, res: Response): Promise<void> {
    const { token, ref } = req.query;

    if (!token && !ref) {
      res.status(400).json({
        success: false,
        error: 'Verification requires a valid token or verification reference.',
      });
      return;
    }

    let request = null;

    if (token) {
      const hashed = hashVerificationToken(String(token));
      request = dbStore.verificationRequests.find((r) => r.tokenHash === hashed);
    } else if (ref) {
      request = dbStore.verificationRequests.find((r) => r.verificationReference === String(ref));
    }

    if (!request) {
      res.status(404).json({
        success: false,
        verificationStatus: 'NOT_VERIFIED',
        error: 'No matching academic verification token or reference found.',
        disclaimer: 'DEMONSTRATION ONLY — CREDEN Platform',
      });
      return;
    }

    // Check expiration
    if (new Date(request.expiresAt).getTime() < Date.now()) {
      res.status(410).json({
        success: false,
        verificationStatus: 'EXPIRED',
        error: 'This verification token has expired. A new token must be requested.',
      });
      return;
    }

    const enrolment = dbStore.enrolments.find(
      (e) => e.id === request!.studentReference.enrolmentId
    );
    const identity = dbStore.studentIdentities.find(
      (i) => i.id === request!.studentReference.studentIdentityId
    );
    const institution = dbStore.institutions.find(
      (inst) => inst.id === enrolment?.institutionId
    );

    if (!enrolment || !identity || !institution) {
      res.status(404).json({
        success: false,
        verificationStatus: 'RECORD_UNAVAILABLE',
        error: 'Underlying academic record no longer available.',
      });
      return;
    }

    request.accessedAt = new Date();

    const summary = VerificationService.formatPublicVerificationSummary(
      request,
      identity,
      enrolment,
      institution
    );

    await AuditService.recordEvent({
      actorId: 'VERIFIER',
      actorEmail: request.requesterEmail,
      actorRole: 'VERIFIER',
      institutionId: institution.id,
      action: 'VERIFICATION_ACCESSED',
      resourceType: 'VERIFICATION_REQUEST',
      resourceId: request.id,
      outcome: 'SUCCESS',
      metadata: { verificationReference: request.verificationReference },
    });

    res.json({
      success: true,
      ...summary,
    });
  }
}

