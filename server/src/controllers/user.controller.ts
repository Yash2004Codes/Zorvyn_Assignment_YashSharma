import { Request, Response } from 'express';
import * as UserService from '../services/user.service';
import { sendSuccess, sendError } from '../utils/response';

export function getAllUsers(_req: Request, res: Response): void {
  try {
    const users = UserService.getAllUsers();
    sendSuccess(res, users, 'Users fetched successfully');
  } catch (err: unknown) {
    sendError(res, 'Failed to fetch users', 500);
  }
}

export function getUserById(req: Request, res: Response): void {
  try {
    const user = UserService.getUserById(Number(req.params.id));
    sendSuccess(res, user);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Not found';
    sendError(res, message, 404);
  }
}

export function updateUser(req: Request, res: Response): void {
  try {
    const user = UserService.updateUser(Number(req.params.id), req.body);
    sendSuccess(res, user, 'User updated successfully');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Update failed';
    sendError(res, message, 400);
  }
}

export function deactivateUser(req: Request, res: Response): void {
  try {
    UserService.deleteUser(Number(req.params.id));
    sendSuccess(res, null, 'User deactivated successfully');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Deactivation failed';
    sendError(res, message, 400);
  }
}
