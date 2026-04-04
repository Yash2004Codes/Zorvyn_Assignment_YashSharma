import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { sendError } from '../utils/response';
import { JwtPayload } from '../models/types';
import pool from '../db/database';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Authorization token missing or malformed', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    
    // Fetch latest role and status from Database to handle real-time updates
    const result = await pool.query('SELECT role, is_active FROM users WHERE id = $1', [decoded.userId]);
    const user = result.rows[0];

    if (!user || !user.is_active) {
      sendError(res, 'User account is inactive or no longer exists', 401);
      return;
    }

    // Attach fresh database info to the request
    req.user = {
      ...decoded,
      role: user.role
    };

    next();
  } catch (error) {
    sendError(res, 'Invalid or expired token', 401);
  }
}

