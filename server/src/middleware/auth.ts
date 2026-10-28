import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/security.js';
import { UserRole } from '../types/index.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: UserRole[];
    institutionId?: string;
    name: string;
  };
  correlationId?: string;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Authentication token missing or invalid format (Bearer token required).',
    });
    return;
  }

  const token = authHeader.substring(7);
  const payload = verifyJwt(token);

  if (!payload) {
    res.status(401).json({
      success: false,
      error: 'Invalid, tampered, or expired session token.',
    });
    return;
  }

  req.user = payload;
  next();
}

/**
 * Role-Based Access Control (RBAC) guard
 */
export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      res.status(403).json({
        success: false,
        error: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}].`,
      });
      return;
    }

    next();
  };
}

/**
 * Enforces institution data isolation
 * Institution admins may only view or modify records belonging to their own assigned institution.
 */
export function enforceInstitutionScope(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Unauthorized.' });
    return;
  }

  // AICTE administrators have national oversight scope
  if (req.user.roles.includes('AICTE_ADMIN')) {
    next();
    return;
  }

  // For Institution Administrators, ensure institutionId matches requested target
  const targetInstitutionId = req.params.institutionId || req.query.institutionId || req.body?.institutionId;
  
  if (req.user.roles.includes('INSTITUTION_ADMIN')) {
    if (targetInstitutionId && targetInstitutionId !== req.user.institutionId) {
      res.status(403).json({
        success: false,
        error: 'Data isolation policy violation: Cannot access or modify records of another institution.',
      });
      return;
    }
  }

  next();
}

