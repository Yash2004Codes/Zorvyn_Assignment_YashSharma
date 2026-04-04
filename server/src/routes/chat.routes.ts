import { Router } from 'express';
import { handleChatQuery } from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Protect it with JWT + Internal Role-Based Check in the controller
router.post('/query', authenticate, handleChatQuery);

export default router;
