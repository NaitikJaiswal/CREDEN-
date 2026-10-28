import { Request, Response } from 'express';
import { dbStore } from '../db/store.js';
import { comparePassword, generateJwt, generateCorrelationId } from '../utils/security.js';
import { AuditService } from '../services/audit/auditService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const correlationId = generateCorrelationId();

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required.' });
      return;
    }

    const user = dbStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      await AuditService.recordEvent({
        actorId: 'ANONYMOUS',
        actorEmail: email,
        actorRole: 'AICTE_ADMIN',
        action: 'USER_LOGIN_FAILED',
        resourceType: 'AUTH',
        outcome: 'FAILURE',
        correlationId,
        metadata: { reason: 'User not found' },
      });
      res.status(401).json({ success: false, error: 'Invalid credentials.' });
      return;
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      await AuditService.recordEvent({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.roles[0],
        action: 'USER_LOGIN_FAILED',
        resourceType: 'AUTH',
        outcome: 'FAILURE',
        correlationId,
        metadata: { reason: 'Password mismatch' },
      });
      res.status(401).json({ success: false, error: 'Invalid credentials.' });
      return;
    }

    user.lastLoginAt = new Date();
    const token = generateJwt(user);

    await AuditService.recordEvent({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.roles[0],
      institutionId: user.institutionId,
      action: 'USER_LOGIN_SUCCESS',
      resourceType: 'AUTH',
      outcome: 'SUCCESS',
      correlationId,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        institutionId: user.institutionId,
        studentIdentityId: user.studentIdentityId,
      },
    });
  }

  /**
   * Fast Demo Login for instant role switching during hackathon evaluations
   */
  static async demoLogin(req: Request, res: Response): Promise<void> {
    const { role } = req.body;
    const correlationId = generateCorrelationId();

    const roleMap: Record<string, string> = {
      AICTE_ADMIN: 'aicte.admin@creden.gov.in',
      INSTITUTION_ADMIN: 'admin@coep.ac.in',
      STUDENT: 'student.aarav@creden.demo',
      VERIFIER: 'verifier@infosys.demo',
    };

    const targetEmail = roleMap[role] || 'aicte.admin@creden.gov.in';
    const user = dbStore.users.find((u) => u.email === targetEmail);

    if (!user) {
      res.status(404).json({ success: false, error: `Demo account for role ${role} not found.` });
      return;
    }

    const token = generateJwt(user);

    await AuditService.recordEvent({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.roles[0],
      institutionId: user.institutionId,
      action: 'DEMO_LOGIN_SWITCH',
      resourceType: 'AUTH',
      outcome: 'SUCCESS',
      correlationId,
      metadata: { targetRole: role },
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        institutionId: user.institutionId,
        studentIdentityId: user.studentIdentityId,
      },
    });
  }

  static async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const user = dbStore.users.find((u) => u.id === req.user?.id);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    let institution = null;
    if (user.institutionId) {
      institution = dbStore.institutions.find((i) => i.id === user.institutionId);
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        institutionId: user.institutionId,
        institution,
        studentIdentityId: user.studentIdentityId,
        lastLoginAt: user.lastLoginAt,
      },
    });
  }

  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (req.user) {
      await AuditService.recordEvent({
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.roles[0],
        action: 'USER_LOGOUT',
        resourceType: 'AUTH',
        outcome: 'SUCCESS',
      });
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  }
}

