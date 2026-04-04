// auth.middleware.ts — JWT verification middleware for all protected Express routes.
//
// Flow for every incoming request to a protected route:
//   1. Reads the "Authorization: Bearer <token>" header.
//   2. Decodes and verifies the JWT signature using the app's secret.
//   3. Re-fetches the user's current role and is_active status from the DB.
//      (This ensures that if an admin deactivates a user mid-session, the change
//       takes effect on the very next API request without waiting for token expiry.)
//   4. Attaches the fresh user data to req.user for downstream controllers to use.

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { sendError } from '../utils/response';
import { JwtPayload } from '../models/types';
import pool from '../db/database';

// Extend Express's Request type so TypeScript knows req.user exists on protected routes.
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];

  // Reject requests missing or malformed Authorization header immediately.
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Authorization token missing or malformed', 401);
    return;
  }

  // Extract the raw token string from "Bearer <token>".
  const token = authHeader.split(' ')[1];

  try {
    // Verify the JWT signature and decode the payload (userId, email, role).
    const decoded = verifyToken(token);
    
    // Re-query the database for the latest role and active status.
    // This is critical: if an admin has changed a user's role or deactivated them
    // since the token was issued, this lookup enforces those changes in real time.
    const result = await pool.query('SELECT role, is_active FROM users WHERE id = $1', [decoded.userId]);
    const user = result.rows[0];

    // Block deactivated users or users that no longer exist in the database.
    if (!user || !user.is_active) {
      sendError(res, 'User account is inactive or no longer exists', 401);
      return;
    }

    // Merge the decoded token payload with the fresh DB data and attach to the request.
    // Downstream middleware (requireAdmin/requireAnalyst) and controllers read from req.user.
    req.user = {
      ...decoded,
      role: user.role // Always use the DB role, not the potentially stale token role.
    };

    next();
  } catch (error) {
    // JWT is invalid, tampered with, or expired.
    sendError(res, 'Invalid or expired token', 401);
  }
}
