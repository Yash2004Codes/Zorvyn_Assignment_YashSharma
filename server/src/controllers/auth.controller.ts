import { Request, Response } from 'express';
import * as AuthService from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const result = await AuthService.register(req.body);
    sendSuccess(res, result, 'User registered successfully', 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    sendError(res, message, 409);
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const result = await AuthService.login(req.body);
    sendSuccess(res, result, 'Login successful');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    sendError(res, message, 401);
  }
}

export function me(req: Request, res: Response): void {
  // req.user is populated by auth middleware
  sendSuccess(res, (req as any).user, 'Authenticated user');
}
