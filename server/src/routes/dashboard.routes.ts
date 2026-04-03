import { Router } from 'express';
import * as DashboardController from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAnalyst } from '../middleware/role.middleware';

const router = Router();

// All dashboard routes require auth + analyst or admin
router.use(authenticate, requireAnalyst);

// GET /api/dashboard/summary
router.get('/summary', DashboardController.getSummary);

// GET /api/dashboard/categories?type=income|expense
router.get('/categories', DashboardController.getCategoryBreakdown);

// GET /api/dashboard/trends/monthly?months=12
router.get('/trends/monthly', DashboardController.getMonthlyTrends);

// GET /api/dashboard/trends/weekly
router.get('/trends/weekly', DashboardController.getWeeklyTrends);

// GET /api/dashboard/recent?limit=10
router.get('/recent', DashboardController.getRecentActivity);

export default router;
