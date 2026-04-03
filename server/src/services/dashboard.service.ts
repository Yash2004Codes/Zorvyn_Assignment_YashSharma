import db from '../db/database';

interface SummaryRow { total: number }
interface CategoryRow { category: string; total: number; count: number }
interface MonthlyRow  { month: string; income: number; expense: number }
interface RecentRow   { id: number; amount: number; type: string; category: string; date: string; notes: string | null }

export function getDashboardSummary() {
  const totalIncome = (db.prepare(
    "SELECT COALESCE(SUM(amount), 0) as total FROM financial_records WHERE type = 'income' AND is_deleted = 0"
  ).get() as SummaryRow).total;

  const totalExpenses = (db.prepare(
    "SELECT COALESCE(SUM(amount), 0) as total FROM financial_records WHERE type = 'expense' AND is_deleted = 0"
  ).get() as SummaryRow).total;

  const netBalance = totalIncome - totalExpenses;

  const totalRecords = (db.prepare(
    'SELECT COUNT(*) as total FROM financial_records WHERE is_deleted = 0'
  ).get() as SummaryRow).total;

  return { totalIncome, totalExpenses, netBalance, totalRecords };
}

export function getCategoryBreakdown(type?: 'income' | 'expense') {
  const whereType = type ? `AND type = '${type}'` : '';
  return db.prepare(`
    SELECT category,
           SUM(amount) as total,
           COUNT(*)    as count
    FROM financial_records
    WHERE is_deleted = 0 ${whereType}
    GROUP BY category
    ORDER BY total DESC
  `).all() as CategoryRow[];
}

export function getMonthlyTrends(months = 12) {
  return db.prepare(`
    SELECT strftime('%Y-%m', date) as month,
           SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) as income,
           SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
    FROM financial_records
    WHERE is_deleted = 0
      AND date >= date('now', '-${months} months')
    GROUP BY month
    ORDER BY month ASC
  `).all() as MonthlyRow[];
}

export function getRecentActivity(limit = 10) {
  return db.prepare(`
    SELECT id, amount, type, category, date, notes
    FROM financial_records
    WHERE is_deleted = 0
    ORDER BY created_at DESC
    LIMIT ?
  `).all(limit) as RecentRow[];
}

export function getWeeklyTrends() {
  return db.prepare(`
    SELECT strftime('%Y-W%W', date) as week,
           SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) as income,
           SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
    FROM financial_records
    WHERE is_deleted = 0
      AND date >= date('now', '-12 weeks')
    GROUP BY week
    ORDER BY week ASC
  `).all() as MonthlyRow[];
}
