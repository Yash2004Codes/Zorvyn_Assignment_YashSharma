import { ApiResponse } from '../models/types';
import { Response } from 'express';

export function sendSuccess<T>(res: Response, data: T, message = 'Success', statusCode = 200) {
  const response: ApiResponse<T> = { success: true, message, data };
  return res.status(statusCode).json(response);
}

export function sendError(res: Response, message: string, statusCode = 400, errors?: unknown) {
  const response: ApiResponse = { success: false, message, ...(errors && { errors }) };
  return res.status(statusCode).json(response);
}
