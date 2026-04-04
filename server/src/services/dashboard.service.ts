import pool from '../db/database';

interface SummaryRow { total: string | number }
interface CategoryRow { category: string; total: string | number; count: string | number }
interface MonthlyRow  { month: string; income: string | number; expense: string | number }
interface WeeklyRow   { week: string; income: string | number; expense: string | number }
interface RecentRow   { id: number; amount: number; type: string; category: string; date: string; notes: string | null }


export async function getDashboardSummary() {
  const incomeResult = await pool.query("SELECT COALESCE(SUM(amount), 0) as total FROM financial_records WHERE type = 'income' AND is_deleted = 0");
  const totalIncome = parseFloat(incomeResult.rows[0].total);

  const expenseResult = await pool.query("SELECT COALESCE(SUM(amount), 0) as total FROM financial_records WHERE type = 'expense' AND is_deleted = 0");
  const totalExpenses = parseFloat(expenseResult.rows[0].total);

  const netBalance = totalIncome - totalExpenses;

  const countResult = await pool.query('SELECT COUNT(*) as total FROM financial_records WHERE is_deleted = 0');
  const totalRecords = parseInt(countResult.rows[0].total);

  return { totalIncome, totalExpenses, netBalance, totalRecords };
}

export async function getCategoryBreakdown(type?: 'income' | 'expense') {
  const values = [];
  let query = `
    SELECT category,
           SUM(amount) as total,
           COUNT(*)    as count
    FROM financial_records
    WHERE is_deleted = 0
  `;
  
  if (type) {
    query += ' AND type = $1';
    values.push(type);
  }

  query += `
    GROUP BY category
    ORDER BY total DESC
  `;

  const result = await pool.query(query, values);
  return result.rows as CategoryRow[];
}

export async function getMonthlyTrends(months = 12) {
  // Postgres TO_CHAR handles string conversion. date is TEXT in our schema.
  const result = await pool.query(`
    SELECT SUBSTRING(date FROM 1 FOR 7) as month,
           SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) as income,
           SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
    FROM financial_records
    WHERE is_deleted = 0
      AND date >= TO_CHAR(CURRENT_DATE - ($1 || ' months')::INTERVAL, 'YYYY-MM-DD')
    GROUP BY month
    ORDER BY month ASC
  `, [months]);
  return result.rows as MonthlyRow[];
}

export async function getRecentActivity(limit = 10) {
  const result = await pool.query(`
    SELECT id, amount, type, category, date, notes
    FROM financial_records
    WHERE is_deleted = 0
    ORDER BY created_at DESC
    LIMIT $1
  `, [limit]);
  return result.rows as RecentRow[];
}

export async function getWeeklyTrends() {
  const result = await pool.query(`
    SELECT TO_CHAR(date::DATE, 'YYYY-"W"WW') as week,
           SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) as income,
           SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
    FROM financial_records
    WHERE is_deleted = 0
      AND date >= TO_CHAR(CURRENT_DATE - ('12 weeks')::INTERVAL, 'YYYY-MM-DD')
    GROUP BY week
    ORDER BY week ASC
  `);
  return result.rows as WeeklyRow[];
}

