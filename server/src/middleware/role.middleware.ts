import { Response, NextFunction } from 'express';
import { Role } from '../models/types';
import { sendError } from '../utils/response';
import { AuthenticatedRequest } from './auth.middleware';

/**
 * Role hierarchy: admin > analyst > viewer
 * requireRole('analyst') allows analyst AND admin.
 */
const roleHierarchy: Record<Role, number> = {
  [Role.VIEWER]:  1,
  [Role.ANALYST]: 2,
  [Role.ADMIN]:   3,
};

export function requireRole(...roles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const userLevel = roleHierarchy[user.role] ?? 0;
    const requiredLevel = Math.min(...roles.map((r) => roleHierarchy[r]));

    if (userLevel < requiredLevel) {
      sendError(res, `Access denied. Required role: ${roles.join(' or ')}`, 403);
      return;
    }

    next();
  };
}

// Convenient shortcuts
export const requireAdmin   = requireRole(Role.ADMIN);
export const requireAnalyst = requireRole(Role.ANALYST);
export const requireViewer  = requireRole(Role.VIEWER);   // any authenticated user
