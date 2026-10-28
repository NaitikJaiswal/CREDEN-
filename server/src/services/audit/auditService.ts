import { v4 as uuidv4 } from 'uuid';
import { IAuditLog, UserRole } from '../../types/index.js';
import { dbStore } from '../../db/store.js';
import { AuditLog as AuditLogModel } from '../../models/index.js';

export class AuditService {
  /**
   * Secure audit logging with privacy redaction
   */
  static async recordEvent(params: {
    actorId: string;
    actorEmail: string;
    actorRole: UserRole;
    institutionId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    outcome?: 'SUCCESS' | 'FAILURE' | 'WARNING';
    correlationId?: string;
    metadata?: Record<string, any>;
  }): Promise<IAuditLog> {
    // Sanitize metadata to prevent sensitive leakages
    const sanitized: Record<string, any> = {};
    if (params.metadata) {
      for (const [key, value] of Object.entries(params.metadata)) {
        if (/password|token|secret|apaarRaw|apiKey/i.test(key)) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = value;
        }
      }
    }

    const logEntry: IAuditLog = {
      id: uuidv4(),
      actorId: params.actorId || 'SYSTEM',
      actorEmail: params.actorEmail || 'system@creden.local',
      actorRole: params.actorRole || 'AICTE_ADMIN',
      institutionId: params.institutionId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      outcome: params.outcome || 'SUCCESS',
      correlationId: params.correlationId || `CRDN-${uuidv4().substring(0, 8)}`,
      sanitizedMetadata: sanitized,
      timestamp: new Date(),
    };

    // Store in memory store
    dbStore.insert(dbStore.auditLogs, logEntry);

    // Also persist to MongoDB if active and connected
    if (dbStore.isConnected) {
      try {
        await AuditLogModel.create(logEntry);
      } catch (err) {
        // Silently preserve in memory if mongo fails
      }
    }

    return logEntry;
  }

  static getLogs(filters?: {
    actorRole?: string;
    institutionId?: string;
    action?: string;
    resourceType?: string;
    limit?: number;
  }): IAuditLog[] {
    let logs = [...dbStore.auditLogs];

    if (filters?.institutionId) {
      logs = logs.filter((l) => l.institutionId === filters.institutionId);
    }
    if (filters?.actorRole) {
      logs = logs.filter((l) => l.actorRole === filters.actorRole);
    }
    if (filters?.action) {
      logs = logs.filter((l) => l.action.toLowerCase().includes(filters.action!.toLowerCase()));
    }
    if (filters?.resourceType) {
      logs = logs.filter((l) => l.resourceType === filters.resourceType);
    }

    // Sort descending by timestamp
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return logs.slice(0, filters?.limit || 100);
  }
}
