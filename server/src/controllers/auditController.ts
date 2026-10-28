import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AuditService } from '../services/audit/auditService.js';

export class AuditController {
  static async getLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { actorRole, action, resourceType, limit = 50 } = req.query;

    let institutionId: string | undefined = undefined;
    if (req.user?.roles.includes('INSTITUTION_ADMIN') && !req.user?.roles.includes('AICTE_ADMIN')) {
      institutionId = req.user.institutionId;
    } else if (req.query.institutionId) {
      institutionId = String(req.query.institutionId);
    }

    const logs = AuditService.getLogs({
      institutionId,
      actorRole: actorRole ? String(actorRole) : undefined,
      action: action ? String(action) : undefined,
      resourceType: resourceType ? String(resourceType) : undefined,
      limit: parseInt(String(limit), 10),
    });

    res.json({
      success: true,
      total: logs.length,
      logs,
    });
  }
}

