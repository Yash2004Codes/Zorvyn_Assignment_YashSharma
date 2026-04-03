import { Request, Response } from 'express';
import * as RecordService from '../services/record.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/response';

export function createRecord(req: AuthenticatedRequest, res: Response): void {
  try {
    const record = RecordService.createRecord(req.body, req.user!.userId);
    sendSuccess(res, record, 'Record created successfully', 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Create failed';
    sendError(res, message, 400);
  }
}

export function getRecords(req: Request, res: Response): void {
  try {
    const result = RecordService.getRecords(req.query as any);
    sendSuccess(res, result);
  } catch (err: unknown) {
    sendError(res, 'Failed to fetch records', 500);
  }
}

export function getRecordById(req: Request, res: Response): void {
  try {
    const record = RecordService.getRecordById(Number(req.params.id));
    sendSuccess(res, record);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Not found';
    sendError(res, message, 404);
  }
}

export function updateRecord(req: Request, res: Response): void {
  try {
    const record = RecordService.updateRecord(Number(req.params.id), req.body);
    sendSuccess(res, record, 'Record updated successfully');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Update failed';
    sendError(res, message, 400);
  }
}

export function deleteRecord(req: Request, res: Response): void {
  try {
    RecordService.deleteRecord(Number(req.params.id));
    sendSuccess(res, null, 'Record deleted successfully');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Delete failed';
    sendError(res, message, 400);
  }
}
