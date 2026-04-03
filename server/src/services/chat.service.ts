import db from '../db/database';

interface ChatResponse {
  answer: string;
  data?: any;
}

export function processUserQuery(query: string): ChatResponse {
  const q = query.toLowerCase();

  // 1. Handle "Total Income"
  if (q.includes('total income') || (q.includes('how much') && q.includes('earned'))) {
    const row = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM financial_records WHERE type = 'income' AND is_deleted = 0").get() as { total: number };
    return {
      answer: `Your total income across all records is $${row.total.toLocaleString()}.`,
      data: row.total
    };
  }

  // 2. Handle "Total Expenses"
  if (q.includes('total expense') || q.includes('total spending') || (q.includes('how much') && q.includes('spent'))) {
    const row = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM financial_records WHERE type = 'expense' AND is_deleted = 0").get() as { total: number };
    return {
      answer: `Your total spending across all records is $${row.total.toLocaleString()}.`,
      data: row.total
    };
  }

  // 3. Handle "Net Balance" or "Profit"
  if (q.includes('net balance') || q.includes('profit') || q.includes('remaining')) {
    const inc = (db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM financial_records WHERE type = 'income' AND is_deleted = 0").get() as { total: number }).total;
    const exp = (db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM financial_records WHERE type = 'expense' AND is_deleted = 0").get() as { total: number }).total;
    const net = inc - exp;
    return {
      answer: `Your current net balance is $${net.toLocaleString()}.`,
      data: net
    };
  }

  // 4. Handle "How many users"
  if (q.includes('how many users') || q.includes('total users')) {
    const row = db.prepare("SELECT count(*) as count FROM users WHERE is_active = 1").get() as { count: number };
    return {
      answer: `There are currently ${row.count} active users registered in the system.`,
      data: row.count
    };
  }

  // 5. Handle "Category Specific" (e.g., "spent on Rent")
  const categories = ['rent', 'groceries', 'salary', 'starbucks', 'gym', 'internet', 'utilities'];
  for (const cat of categories) {
    if (q.includes(cat)) {
       const row = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM financial_records WHERE lower(category) = ? AND is_deleted = 0").get(cat) as { total: number };
       return {
         answer: `You have a total of $${row.total.toLocaleString()} recorded under the "${cat}" category.`,
         data: row.total
       };
    }
  }

  // Default Fallback
  return {
    answer: "I'm a Smart Financial Assistant. You can ask me about your total income, expenses, net balance, or specific categories like Rent and Groceries! (Try asking: 'What was my total profit?')"
  };
}
