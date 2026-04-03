import { Request, Response } from 'express';
import * as ChatService from '../services/chat.service';
import { sendSuccess, sendError } from '../utils/response';

export function handleChatQuery(req: Request, res: Response): void {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      sendError(res, 'A message must be provided.', 400);
      return;
    }

    const { user } = (req as any);
    // Secure it: Admins and Analysts can talk to the financial assistant
    if (user.role !== 'admin' && user.role !== 'analyst') {
      sendError(res, 'Access Denied. Only Admins and Analysts can use the internal Financial Assistant.', 403);
      return;
    }

    const result = ChatService.processUserQuery(message);
    sendSuccess(res, result, 'Assistant response');
  } catch (err) {
    sendError(res, 'Failed to process assistant query', 500);
  }
}
