import { Request, Response } from 'express';
import * as DashboardService from '../services/dashboard.service';
import { sendSuccess, sendError } from '../utils/response';

export function getSummary(_req: Request, res: Response): void {
  try {
    const data = DashboardService.getDashboardSummary();
    sendSuccess(res, data, 'Dashboard summary');
  } catch {
    sendError(res, 'Failed to fetch summary', 500);
  }
}

export function getInsights(_req: Request, res: Response): void {
  try {
    const categories = DashboardService.getCategoryBreakdown();
    const monthlyTrends = DashboardService.getMonthlyTrends(12);
    sendSuccess(res, { categories, trends: monthlyTrends }, 'Dashboard insights');
  } catch {
    sendError(res, 'Failed to fetch insights', 500);
  }
}

export function getCategoryBreakdown(req: Request, res: Response): void {
  try {
    const type = req.query.type as 'income' | 'expense' | undefined;
    const data = DashboardService.getCategoryBreakdown(type);
    sendSuccess(res, data, 'Category breakdown');
  } catch {
    sendError(res, 'Failed to fetch category breakdown', 500);
  }
}

export function getMonthlyTrends(req: Request, res: Response): void {
  try {
    const months = req.query.months ? Number(req.query.months) : 12;
    const data = DashboardService.getMonthlyTrends(months);
    sendSuccess(res, data, 'Monthly trends');
  } catch {
    sendError(res, 'Failed to fetch monthly trends', 500);
  }
}

export function getWeeklyTrends(_req: Request, res: Response): void {
  try {
    const data = DashboardService.getWeeklyTrends();
    sendSuccess(res, data, 'Weekly trends');
  } catch {
    sendError(res, 'Failed to fetch weekly trends', 500);
  }
}

export function getRecentActivity(req: Request, res: Response): void {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const data = DashboardService.getRecentActivity(limit);
    sendSuccess(res, data, 'Recent activity');
  } catch {
    sendError(res, 'Failed to fetch recent activity', 500);
  }
}
