import { Router } from 'express';
import * as DashboardController from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAnalyst } from '../middleware/role.middleware';

const router = Router();

// All dashboard routes require auth
router.use(authenticate);

// GET /api/dashboard/summary - Viewers and up
router.get('/summary', DashboardController.getSummary);

// API Insights endpoints - Analysts and up
router.get('/insights', requireAnalyst, DashboardController.getInsights);
router.get('/categories', requireAnalyst, DashboardController.getCategoryBreakdown);
router.get('/trends/monthly', requireAnalyst, DashboardController.getMonthlyTrends);
router.get('/trends/weekly', requireAnalyst, DashboardController.getWeeklyTrends);
router.get('/recent', requireAnalyst, DashboardController.getRecentActivity);

export default router;
