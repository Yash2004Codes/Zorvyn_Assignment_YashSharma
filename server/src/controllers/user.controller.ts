import { Request, Response } from 'express';
import * as UserService from '../services/user.service';
import { sendSuccess, sendError } from '../utils/response';

export async function getAllUsers(_req: Request, res: Response): Promise<void> {
  try {
    const users = await UserService.getAllUsers();
    sendSuccess(res, users, 'Users fetched successfully');
  } catch (err: unknown) {
    sendError(res, 'Failed to fetch users', 500);
  }
}

export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const { register } = await import('../services/auth.service');
    const newUser = await register({ ...req.body, password: req.body.password || 'Temp@1234' });
    sendSuccess(res, newUser.user, 'User created successfully', 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'User creation failed';
    sendError(res, message, 400);
  }
}

export async function getUserById(req: Request, res: Response): Promise<void> {
  try {
    const user = await UserService.getUserById(Number(req.params.id));
    sendSuccess(res, user);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Not found';
    sendError(res, message, 404);
  }
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  try {
    const user = await UserService.updateUser(Number(req.params.id), req.body);
    sendSuccess(res, user, 'User updated successfully');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Update failed';
    sendError(res, message, 400);
  }
}

export async function deactivateUser(req: Request, res: Response): Promise<void> {
  try {
    await UserService.deleteUser(Number(req.params.id));
    sendSuccess(res, null, 'User deactivated successfully');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Deactivation failed';
    sendError(res, message, 400);
  }
}

