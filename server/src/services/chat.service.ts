import pool from '../db/database';

interface ChatResponse {
  answer: string;
  data?: any;
}

export async function processUserQuery(query: string): Promise<ChatResponse> {
  const q = query.toLowerCase();

  // 0. Extract Date Filter if possible (e.g., "April", "May", "this month")
  const months: Record<string, string> = {
    'january': '01', 'february': '02', 'march': '03', 'april': '04', 
    'may': '05', 'june': '06', 'july': '07', 'august': '08', 
    'september': '09', 'october': '10', 'november': '11', 'december': '12'
  };

  let dateFilter = '';
  let dateText = 'across all records';
  
  for (const [name, num] of Object.entries(months)) {
    if (q.includes(name)) {
      dateFilter = `AND date LIKE '2026-${num}%'`; // Assuming current year
      dateText = `in ${name.charAt(0).toUpperCase() + name.slice(1)}`;
      break;
    }
  }

  // 1. Handle "Total Income"
  if (q.includes('total income') || q.includes('total gain') || (q.includes('how much') && q.includes('earned'))) {
    const result = await pool.query(`SELECT COALESCE(SUM(amount), 0) as total FROM financial_records WHERE type = 'income' AND is_deleted = 0 ${dateFilter}`);
    const total = parseFloat(result.rows[0].total);
    return {
      answer: `Your total income ${dateText} is $${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`,
      data: total
    };
  }

  // 2. Handle "Total Expenses"
  if (q.includes('total expense') || q.includes('total spending') || q.includes('total loss') || (q.includes('how much') && q.includes('spent'))) {
    const result = await pool.query(`SELECT COALESCE(SUM(amount), 0) as total FROM financial_records WHERE type = 'expense' AND is_deleted = 0 ${dateFilter}`);
    const total = parseFloat(result.rows[0].total);
    return {
      answer: `Your total spending ${dateText} is $${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`,
      data: total
    };
  }


  // 3. Handle "Net Balance" or "Profit"
  if (q.includes('net balance') || q.includes('profit') || q.includes('remaining')) {
    const incRes = await pool.query(`SELECT COALESCE(SUM(amount), 0) as total FROM financial_records WHERE type = 'income' AND is_deleted = 0 ${dateFilter}`);
    const expRes = await pool.query(`SELECT COALESCE(SUM(amount), 0) as total FROM financial_records WHERE type = 'expense' AND is_deleted = 0 ${dateFilter}`);
    const inc = parseFloat(incRes.rows[0].total);
    const exp = parseFloat(expRes.rows[0].total);
    const net = inc - exp;
    return {
      answer: `Your current net balance ${dateText} is $${net.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`,
      data: net
    };
  }


  // 4. Handle "How many" (Counts)
  if (q.includes('how many') || q.includes('total number of')) {
     const type = q.includes('income') ? 'income' : q.includes('expense') ? 'expense' : null;
     const whereClause = type ? `WHERE type = '${type}' AND is_deleted = 0 ${dateFilter}` : `WHERE is_deleted = 0 ${dateFilter}`;
     const result = await pool.query(`SELECT count(*) as count FROM financial_records ${whereClause}`);
     const count = parseInt(result.rows[0].count);
     const typeText = type ? type + 's' : 'records';
     return {
       answer: `You have ${count} ${typeText} recorded ${dateText}.`,
       data: count
     };
  }

  // 5. Handle "Highest" or "Lowest"
  if (q.includes('highest') || q.includes('largest') || q.includes('lowest') || q.includes('smallest')) {
     const order = (q.includes('highest') || q.includes('largest')) ? 'DESC' : 'ASC';
     const type = q.includes('income') ? 'income' : 'expense';
     const result = await pool.query(`
        SELECT amount, category, date 
        FROM financial_records 
        WHERE type = $1 AND is_deleted = 0 ${dateFilter} 
        ORDER BY amount ${order} 
        LIMIT 1
     `, [type]);

     if (result.rows.length > 0) {
        const row = result.rows[0];
        const label = order === 'DESC' ? 'highest' : 'lowest';
        return {
          answer: `Your ${label} ${type} ${dateText} was $${Number(row.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} for "${row.category}" on ${row.date}.`,
          data: row
        };
     }
  }

  // 6. Handle "Recent" or "Last X"
  if (q.includes('recent') || q.includes('last')) {
     const limitMatch = q.match(/\d+/);
     const limit = limitMatch ? parseInt(limitMatch[0]) : 3;
     const result = await pool.query(`
        SELECT amount, type, category, date 
        FROM financial_records 
        WHERE is_deleted = 0 
        ORDER BY date DESC, created_at DESC 
        LIMIT $1
     `, [limit]);

     if (result.rows.length > 0) {
        const list = result.rows.map(r => `${r.date}: $${Number(r.amount).toFixed(2)} (${r.category})`).join('\n');
        return {
          answer: `Here are your ${result.rows.length} most recent transactions:\n${list}`,
          data: result.rows
        };
     }
  }

  // 7. Handle "Average"
  if (q.includes('average')) {
     const type = q.includes('income') ? 'income' : 'expense';
     const result = await pool.query(`SELECT AVG(amount) as avg FROM financial_records WHERE type = $1 AND is_deleted = 0 ${dateFilter}`, [type]);
     const average = parseFloat(result.rows[0].avg || 0);
     return {
       answer: `Your average ${type} value ${dateText} is $${average.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`,
       data: average
     };
  }

  // 8. Handle "User Counts"
  if (q.includes('how many user') || q.includes('total user') || q.includes('how many admin')) {
    const role = q.includes('admin') ? 'admin' : q.includes('analyst') ? 'analyst' : null;
    const where = role ? `WHERE role = '${role}' AND is_active = 1` : "WHERE is_active = 1";
    const result = await pool.query(`SELECT count(*) as count FROM users ${where}`);
    const count = parseInt(result.rows[0].count);
    const roleText = role ? role + 's' : 'active users';
    return {
      answer: `There are currently ${count} ${roleText} registered in the system.`,
      data: count
    };
  }

  // 9. Handle "Category Specific" (e.g., "spent on Rent")

  const categories = ['rent', 'groceries', 'salary', 'starbucks', 'gym', 'internet', 'utilities'];
  for (const cat of categories) {
    if (q.includes(cat)) {
       const result = await pool.query(`SELECT COALESCE(SUM(amount), 0) as total FROM financial_records WHERE lower(category) = $1 AND is_deleted = 0 ${dateFilter}`, [cat]);
       const total = parseFloat(result.rows[0].total);
       return {
         answer: `You have a total of $${total.toLocaleString(undefined, { minimumFractionDigits: 2 })} recorded under the "${cat}" category ${dateText}.`,
         data: total
       };
    }
  }


  // Default Fallback
  return {
    answer: "I'm a Smart Financial Assistant. You can ask me about your total income, expenses, net balance, or specific categories like Rent and Groceries! (Try asking: 'What was my total profit?')"
  };
}

